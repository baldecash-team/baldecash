'use client';

import * as Sentry from '@sentry/nextjs';

/**
 * Diagnóstico de las tomas NEGRAS de la estación de inspección.
 *
 * El 2026-09-23 un iPhone subió dos tomas seguidas en negro (1,1 MB en 33s y
 * 50 KB en 1s, contra 31,1 MB en 32s de la toma sana de minutos antes). La
 * vista previa del teléfono se veía bien todo el tiempo; lo negro era lo que
 * se CODIFICA del track: la grabación y el visor del escáner. Recargar la
 * página lo arreglaba. No se pudo reproducir fuera de la estación, así que la
 * transmisión volvió a prenderse con esto adentro para que la próxima vez
 * deje evidencia.
 *
 * Cómo funciona: cada dispositivo lleva una BITÁCORA en memoria (ciclo de
 * vida de la cámara, de cada peer y de cada toma, más muestras de brillo y de
 * bytes por segundo). Solo cuando se detecta una anomalía se manda UN evento
 * a Sentry con la bitácora entera y las estadísticas de WebRTC de ese
 * instante. Una estación sana no manda nada: la cuota de Sentry ya está
 * excedida.
 *
 * Qué contesta cada anomalía:
 *   - `grabacion_casi_sin_bytes` (cámara, en plena toma): el MediaRecorder
 *     está produciendo casi nada. Con `luma` de la vista previa alta, la
 *     cámara ve bien y el ENCODER sale negro; con `luma` ~0, el track mismo
 *     entrega negro.
 *   - `preview_negro` (cámara): la vista previa, que no pasa por ningún
 *     encoder, está negra — contradice lo que se vio el 23.
 *   - `visor_negro` (escáner): llegan cuadros negros por WebRTC. Las stats del
 *     receptor dicen si llegan bytes y cuadros decodificados (el emisor manda
 *     negro) o si no llega nada (red).
 *   - `toma_sin_imagen` (cámara, al cerrar la toma): el bitrate promedio de la
 *     toma entera quedó bajo el umbral.
 *
 * REGLA: nada de acá puede tocar la grabación. Todo va envuelto; un fallo del
 * diagnóstico se traga en silencio.
 */

/** Bitrate por debajo del cual la grabación se considera sin imagen. La toma
 * negra del 23 iba a ~270 kbps; la sana del mismo teléfono, a ~7,8 Mbps. */
export const KBPS_SIN_IMAGEN = 500;

/** Brillo medio (0–255) por debajo del cual un cuadro se considera negro. Una
 * toma normal tiene el fondo blanco de la estación, muy por encima. */
export const LUMA_NEGRO = 12;

/** Muestras negras seguidas antes de reportar (una muestra cada ~2s). */
export const MUESTRAS_NEGRAS_PARA_REPORTAR = 3;

/** Entradas que guarda la bitácora: a una cada ~2s en plena toma, alcanza
 * para varias tomas hacia atrás — la comparación sana/negra es la que
 * importa. */
const MAX_ENTRADAS = 300;

/** Cuánto se espera a las stats de WebRTC antes de mandar el evento igual. */
const ESPERA_STATS_MS = 2_000;

export interface EntradaBitacora {
  /** ms desde epoch. */
  t: number;
  tipo: string;
  datos?: Record<string, unknown>;
}

type ProveedorStats = () => Promise<unknown>;

let entradas: EntradaBitacora[] = [];
let contexto: Record<string, unknown> = {};
const proveedores = new Map<string, ProveedorStats>();
const reportados = new Set<string>();

/** Anota un hecho en la bitácora. Nunca lanza. */
export function anotar(tipo: string, datos?: Record<string, unknown>): void {
  try {
    entradas.push({ t: Date.now(), tipo, ...(datos ? { datos } : {}) });
    if (entradas.length > MAX_ENTRADAS) entradas = entradas.slice(-MAX_ENTRADAS);
  } catch {
    // El diagnóstico nunca rompe a quien lo llama.
  }
}

/** Suma datos al contexto que viaja con cada reporte (estación, cámara,
 * inspección, toma). */
export function fijarContexto(parcial: Record<string, unknown>): void {
  contexto = { ...contexto, ...parcial };
}

/**
 * Registra quién sabe dar las stats de WebRTC en el momento del reporte (el
 * emisor o el receptor). Devuelve la función para desregistrarlo.
 */
export function registrarStats(nombre: string, proveedor: ProveedorStats): () => void {
  proveedores.set(nombre, proveedor);
  return () => {
    if (proveedores.get(nombre) === proveedor) proveedores.delete(nombre);
  };
}

/**
 * Brillo del cuadro que muestra `video` ahora: media y máximo de la luma
 * (0–255) sobre una miniatura de 16×16. `null` si no hay cuadro todavía o si
 * el navegador no deja leerlo.
 */
export function medirLuma(video: HTMLVideoElement | null): { media: number; max: number } | null {
  try {
    if (!video || !video.videoWidth || !video.videoHeight) return null;
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d', { willReadFrequently: true } as CanvasRenderingContext2DSettings);
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, 16, 16);
    const { data } = ctx.getImageData(0, 0, 16, 16);
    let suma = 0;
    let max = 0;
    for (let i = 0; i < data.length; i += 4) {
      const y = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      suma += y;
      if (y > max) max = y;
    }
    return { media: Math.round(suma / (data.length / 4)), max: Math.round(max) };
  } catch {
    return null;
  }
}

export function esNegro(luma: { media: number } | null): boolean {
  return luma !== null && luma.media < LUMA_NEGRO;
}

async function juntarStats(): Promise<Record<string, unknown>> {
  const resultado: Record<string, unknown> = {};
  await Promise.all(
    [...proveedores.entries()].map(async ([nombre, proveedor]) => {
      try {
        resultado[nombre] = await Promise.race([
          proveedor(),
          new Promise((resolve) => setTimeout(() => resolve('timeout'), ESPERA_STATS_MS)),
        ]);
      } catch (e) {
        resultado[nombre] = `error: ${e instanceof Error ? e.message : String(e)}`;
      }
    })
  );
  return resultado;
}

/**
 * Manda UN evento a Sentry con la bitácora y las stats del momento.
 *
 * `clave` evita repetir el mismo reporte (p.ej. una vez por toma y motivo):
 * una toma negra de un minuto no puede mandar treinta eventos. Nunca lanza.
 */
export async function reportar(
  motivo: string,
  clave: string,
  datos?: Record<string, unknown>
): Promise<void> {
  try {
    const id = `${motivo}:${clave}`;
    if (reportados.has(id)) return;
    reportados.add(id);

    anotar(`reporte:${motivo}`, datos);
    const stats = await juntarStats();

    Sentry.withScope((scope) => {
      scope.setLevel('warning');
      scope.setTag('modulo', 'inspeccion-transmision');
      scope.setTag('motivo', motivo);
      if (typeof contexto.rol === 'string') scope.setTag('rol', contexto.rol);
      if (typeof contexto.camara === 'string') scope.setTag('camara', contexto.camara);
      if (typeof contexto.estacion === 'string') scope.setTag('estacion', contexto.estacion);
      scope.setContext('diagnostico', {
        ...contexto,
        ...(datos ?? {}),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      });
      // Como ADJUNTO y no como `extra`: Sentry normaliza los `extra` a
      // profundidad 3 y la bitácora (arreglo → entrada → datos → campo) se
      // leería como "[Object]". El adjunto viaja entero.
      scope.addAttachment({
        filename: 'diagnostico-transmision.json',
        contentType: 'application/json',
        data: JSON.stringify({ contexto, datos, stats, bitacora: entradas }, null, 1),
      });
      Sentry.captureMessage(`inspeccion: ${motivo}`);
    });
  } catch {
    // El diagnóstico nunca rompe a quien lo llama.
  }
}

/** Solo para tests. */
export function _reiniciarDiagnostico(): void {
  entradas = [];
  contexto = {};
  proveedores.clear();
  reportados.clear();
}

/** Solo para tests. */
export function _bitacora(): EntradaBitacora[] {
  return entradas;
}

/**
 * Las stats de WebRTC que importan para esto, aplanadas. Recorre el reporte
 * de `getStats()` y se queda con el RTP de video (entrante o saliente) y su
 * codec, más el par ICE elegido.
 */
export async function resumirStats(pc: RTCPeerConnection): Promise<Record<string, unknown>> {
  const reporte = await pc.getStats();
  const porId = new Map<string, Record<string, unknown>>();
  reporte.forEach((r: Record<string, unknown>) => porId.set(r.id as string, r));

  const resumen: Record<string, unknown> = {
    connectionState: pc.connectionState,
    iceConnectionState: pc.iceConnectionState,
  };
  const CAMPOS = [
    'bytesSent',
    'bytesReceived',
    'framesEncoded',
    'framesSent',
    'framesReceived',
    'framesDecoded',
    'framesDropped',
    'keyFramesEncoded',
    'keyFramesDecoded',
    'frameWidth',
    'frameHeight',
    'framesPerSecond',
    'encoderImplementation',
    'decoderImplementation',
    'powerEfficientEncoder',
    'powerEfficientDecoder',
    'qualityLimitationReason',
    'qualityLimitationDurations',
    'freezeCount',
    'totalFreezesDuration',
    'packetsLost',
  ];
  porId.forEach((r) => {
    if ((r.type === 'outbound-rtp' || r.type === 'inbound-rtp') && r.kind === 'video') {
      const rtp: Record<string, unknown> = {};
      CAMPOS.forEach((c) => {
        if (r[c] !== undefined) rtp[c] = r[c];
      });
      const codec = porId.get(r.codecId as string);
      if (codec) rtp.codec = codec.mimeType;
      resumen[r.type as string] = rtp;
    }
    if (r.type === 'candidate-pair' && r.nominated && r.state === 'succeeded') {
      const local = porId.get(r.localCandidateId as string);
      const remoto = porId.get(r.remoteCandidateId as string);
      resumen.parIce = {
        local: local?.candidateType,
        remoto: remoto?.candidateType,
        rtt: r.currentRoundTripTime,
      };
    }
  });
  return resumen;
}
