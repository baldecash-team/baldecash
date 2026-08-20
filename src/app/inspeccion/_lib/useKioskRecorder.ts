'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

/**
 * Hook de captura de una CÁMARA de estación de inspección (kiosco).
 *
 * Deliberadamente NO es `useRecorder.ts` (admisión, `prototipos/0.6`): ese
 * hook sirve a una persona grabando su propio video, que libera la cámara al
 * terminar. Acá el stream lo vive el teléfono durante horas y la grabación
 * la comanda otro dispositivo (el escáner, por Pusher — eso llega en F3).
 * Forzar los dos usos en un solo hook lo vuelve ilegible; ver spec §9.1 y el
 * plan de F2, Task 1.
 *
 * Tres reglas no negociables (spec §7):
 *
 * 1. El stream de `getUserMedia` se pide UNA sola vez, en `armar()`, y nunca
 *    se libera (`track.stop()` no se llama jamás) MIENTRAS LA CÁMARA ESTÁ
 *    ARMADA Y EN USO. Por cada grabación se crea un `MediaRecorder` nuevo
 *    sobre el mismo stream. Liberar el stream fuerza un gesto humano para
 *    rearmar en cada equipo, que es justo lo que este diseño evita.
 *    (La excepción es el REARME desde "caída" — ver el comentario de C2
 *    dentro de `armar()`: ahí el stream viejo ya está muerto, no violar la
 *    regla es justamente lo que exige limpiarlo.)
 * 2. Tras `detener()` el estado vuelve a `armada`, no a `inactiva` — es el
 *    rearme automático: la cámara queda lista para la próxima orden sin que
 *    nadie la toque. Salvo que la cámara haya caído en el medio (ver C3):
 *    ahí "caída" no se pisa con una mentira de "armada".
 * 3. El `mimeType` se negocia con `MediaRecorder.isTypeSupported()`, nunca se
 *    hardcodea. Android/Chrome (plataforma primaria) graba WebM; iOS graba
 *    MP4. Asumir `video/mp4` rompe la grabación en Chrome. El valor negociado
 *    se expone en el retorno: F4 lo necesita para la extensión de la key en
 *    S3 y el `content_type`.
 *
 * Revisión de F2 (C1/C2/C3/I4): tres defectos Critical encontrados
 * ejecutando probes, no leyendo — documentados en cada punto del código
 * donde se corrigieron.
 */
export type EstadoCaptura = 'inactiva' | 'armando' | 'armada' | 'grabando' | 'caida';

export interface ResultadoDetener {
  blob: Blob;
  mimeType: string;
  duracionMs: number;
}

/**
 * Lo que la cámara entrega de verdad, leído de `track.getSettings()` al
 * armar, más el bitrate que se derivó de eso.
 *
 * Existe para poder VERIFICARLO en el teléfono real: pedir 1920 no garantiza
 * 1920 (medido: tres videos de producción salieron en 1280×1280, 1058×1280 y
 * 720×1280 pidiendo 1280), y sin esto la única forma de saber con qué se
 * grabó era bajar el video de S3 y parsearlo. La vista de cámara lo muestra
 * detrás de `?debug=1`.
 */
/** Lo que devuelve un disparo de foto: la imagen y su miniatura. */
export interface ResultadoFoto {
  blob: Blob;
  /**
   * Vista previa chica para el controlador. Sale del mismo canvas que la
   * foto, así que no cuesta un segundo disparo ni una decodificación
   * aparte — y va junta con la foto en el mismo par de PUT prefirmados.
   */
  thumbBlob: Blob;
  mimeType: string;
  ancho: number;
  alto: number;
}

export interface AjustesCaptura {
  ancho: number | null;
  alto: number | null;
  fps: number | null;
  /** Bits por segundo que se le van a pedir al `MediaRecorder`. */
  bitrate: number;
}

export interface UseKioskRecorderReturn {
  estado: EstadoCaptura;
  error: string | null;
  /** El mimeType negociado en `armar()`, p.ej. `'video/webm;codecs=vp9'`. */
  mimeType: string | null;
  /** Resolución/fps reales de la cámara y bitrate derivado. `null` sin armar. */
  ajustes: AjustesCaptura | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  /** Zoom actual de la cámara. */
  zoom: number;
  /** `null` si el hardware no expone zoom — ahí el control no se muestra. */
  zoomRango: { min: number; max: number; step: number } | null;
  /** Aplica zoom al sensor; se puede llamar mientras graba. */
  /** Mensaje si el hardware rechazó el zoom. `null` mientras funcione. */
  zoomError: string | null;
  aplicarZoom: (valor: number) => Promise<void>;
  /** Pide `getUserMedia`. El único gesto humano de todo el flujo. */
  armar: () => Promise<void>;
  grabar: () => void;
  /**
   * Saca una foto SIN interrumpir nada. Se puede llamar mientras graba: ahí
   * la imagen sale del canvas justamente para no tocar el `MediaRecorder`.
   */
  capturarFoto: () => Promise<ResultadoFoto>;
  detener: () => Promise<ResultadoDetener>;
}

/**
 * Relación de aspecto del encuadre: 1:1, cuadrado.
 *
 * Deliberadamente distinta de los defaults (16:9 = 1.78, 4:3 = 1.33) porque lo
 * que se encuadra es un equipo apoyado sobre una mesa, no una escena: un 16:9
 * gasta los costados en mesa vacía y obliga a alejar la cámara, que es justo lo
 * que hace ilegible una etiqueta o un rayón. El cuadrado le da el mismo margen
 * a lo ancho y a lo largo, así que sirve igual para una laptop abierta que para
 * un celular parado, sin girar el teléfono.
 *
 * Va como `ideal`, no `exact`: con `exact`, un dispositivo que no soporte esa
 * relación falla el `getUserMedia` entero y la cámara queda sin armar. Con
 * `ideal` el navegador se acerca lo que puede y, si no puede, entrega lo suyo
 * — degradar el encuadre es aceptable; no poder grabar, no.
 */
const ASPECT_RATIO = 1;

/**
 * Lado del encuadre pedido, en píxeles.
 *
 * Era 1280 (1.6 MP). Se subió a 1920 (3.7 MP en cuadrado, 2.1 MP si el
 * dispositivo degrada a 16:9) porque lo que hay que poder leer en la
 * evidencia es una etiqueta de serie o un rayón fino, y a 1280 el operador
 * tenía que acercar la cámara —o usar el zoom— para que se distinguieran.
 *
 * Sigue siendo `ideal`: lo que el dispositivo entregue de verdad puede ser
 * menos, y esa resolución REAL es la que manda el bitrate (ver
 * `calcularBitrate`). Medido sobre los videos de producción del 12 y 19 de
 * agosto: pidiendo 1280 los teléfonos devolvieron 1280×1280, 1058×1280 y
 * 720×1280 — o sea que ni el lado ni la relación 1:1 están garantizados y no
 * se puede asumir el valor pedido en ningún cálculo posterior.
 */
const VIDEO_LADO_IDEAL = 1920;

const VIDEO_CONSTRAINTS = {
  width: { ideal: VIDEO_LADO_IDEAL },
  height: { ideal: Math.round(VIDEO_LADO_IDEAL / ASPECT_RATIO) },
  aspectRatio: { ideal: ASPECT_RATIO },
  // La cámara de la estación queda fija mirando el equipo (pared/techo), no
  // a una persona: la trasera es la que sirve. "ideal" degrada en vez de
  // fallar en un desktop de prueba sin cámara trasera.
  facingMode: { ideal: 'environment' },
} as const;

/**
 * Bits por píxel y por frame con los que se calcula el bitrate.
 *
 * El valor viejo era un bitrate FIJO de 2 Mbps, y ahí estaba el techo real de
 * la calidad: medidos los videos de producción, los tres salieron en 2.23,
 * 2.35 y 2.57 Mbps — es decir, el encoder venía pegado contra la tapa que le
 * poníamos nosotros, no contra el límite del teléfono. Un iPhone grabando con
 * su app nativa usa 8-10 Mbps a 1080p: la diferencia que se ve a ojo es
 * principalmente esta.
 *
 * Se calcula en vez de fijarse porque las cámaras de las estaciones son
 * heterogéneas y ya se vio que degradan la resolución de formas distintas.
 * Un bitrate fijo alto sobre una cámara que entrega 720p infla el archivo sin
 * ganar nada (y el archivo se paga en tiempo de subida por equipo, que es
 * justo lo que la estación intenta ahorrar); uno fijo bajo desperdicia la
 * cámara buena. 0.12 bpp da calidad de evidencia en H.264 —el codec del
 * iPhone, que es la plataforma con la que se va a grabar— y de sobra en VP9.
 */
const BITS_POR_PIXEL_POR_FRAME = 0.12;
/** Piso: por debajo de esto la evidencia deja de servir aunque la cámara sea mala. */
const BITRATE_MIN = 2_500_000;
/** Techo: 1 min ≈ 60 MB por cámara. Más que esto lo paga la subida, no la vista. */
const BITRATE_MAX = 8_000_000;
/** Sin `frameRate` en los settings, asumir 30 (lo típico de `getUserMedia`). */
const FPS_ASUMIDO = 30;
/** Si el dispositivo no informa resolución, no se puede calcular: valor medio. */
const BITRATE_FALLBACK = 6_000_000;

/**
 * Bitrate a partir de lo que la cámara entrega DE VERDAD (`getSettings()`),
 * nunca de lo que se pidió en las constraints — ver `VIDEO_LADO_IDEAL`.
 */
export function calcularBitrate(settings: MediaTrackSettings | null | undefined): number {
  const ancho = settings?.width;
  const alto = settings?.height;
  if (!ancho || !alto) return BITRATE_FALLBACK;
  const fps = settings?.frameRate && settings.frameRate > 0 ? settings.frameRate : FPS_ASUMIDO;
  const bruto = ancho * alto * fps * BITS_POR_PIXEL_POR_FRAME;
  return Math.round(Math.min(BITRATE_MAX, Math.max(BITRATE_MIN, bruto)));
}

/**
 * C3: cuánto esperar a que `onstop`/`onerror` disparen tras `recorder.stop()`
 * antes de rendirse. Un `MediaRecorder` real flushea en milisegundos; si a
 * los 5s no dijo nada es un encoder trabado, no una encodeada lenta. Sin
 * este timeout, la promesa de `detener()` queda colgada para siempre — y F4
 * la va a esperar para subir el video.
 */
/**
 * Calidad del JPEG de la foto. 0.92 es alto a propósito: lo que se
 * fotografía es una etiqueta de serial o un rayón fino, y el artefacto de
 * compresión se come exactamente ese detalle — que es la única razón por la
 * que existe la foto.
 */
const FOTO_CALIDAD = 0.92;
/** Calidad de la miniatura: se mira a 200px en el controlador, no necesita más. */
const THUMB_CALIDAD = 0.7;
/** Lado máximo de la miniatura. Suficiente para decidir repetir/destacar. */
const THUMB_LADO = 320;
const FOTO_MIME = 'image/jpeg';

const DETENER_TIMEOUT_MS = 5_000;

/**
 * Candidatos de mimeType en orden de preferencia. WebM primero porque
 * Android/Chrome es la plataforma primaria (spec §7); los MP4 quedan de
 * fallback para iOS/Safari. `null` si ninguno matchea: el `MediaRecorder` se
 * crea sin `mimeType` y el navegador elige — nunca se fuerza un default.
 *
 * El orden NO hay que tocarlo para grabar en iPhone: Safari devuelve `false`
 * para todos los WebM (no los sabe grabar) y cae solo en `video/mp4`, que es
 * H.264 con encoder por hardware — el mejor camino en iOS, y la razón por la
 * que subir bitrate y resolución ahí no cuesta batería como costaría un VP9
 * por software. Los videos de producción medidos hasta hoy son todos
 * VP9/WebM, o sea que las cámaras que se usaron fueron Android/Chrome pese a
 * que alguna estuviera etiquetada "iphone".
 */
const MIME_CANDIDATES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
  'video/mp4;codecs=h264,aac',
  'video/mp4',
] as const;

function negotiateMimeType(): string | null {
  if (typeof MediaRecorder === 'undefined') return null;
  for (const candidate of MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(candidate)) return candidate;
  }
  return null;
}

/** Nombres de error de `getUserMedia` que indican un problema puntual del
 * micrófono (no encontrado / en uso / restringido). Mismo criterio que
 * `useRecorder.ts`: se reintenta solo con video para no bloquear el armado
 * por un mic que falta o está ocupado. Bloqueos de permiso o de seguridad se
 * propagan tal cual. */
const MIC_FAILURE_ERROR_NAMES = new Set([
  'NotFoundError',
  'DevicesNotFoundError',
  'NotReadableError',
  'TrackStartError',
  'OverconstrainedError',
  'ConstraintNotSatisfiedError',
]);

/**
 * Una grabación activa: el `MediaRecorder` y SU PROPIO array de chunks,
 * capturado en el closure de `grabar()` — no un ref compartido a nivel de
 * hook. Ver C1: con un `chunksRef` único, dos `MediaRecorder` creados por
 * error terminan escribiendo chunks en el mismo array y el blob final queda
 * contaminado con datos de una grabación huérfana.
 */
interface ActiveRecording {
  recorder: MediaRecorder;
  chunks: Blob[];
}

export function useKioskRecorder(): UseKioskRecorderReturn {
  const [estado, setEstado] = useState<EstadoCaptura>('inactiva');
  const [error, setError] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  // Zoom ÓPTICO/DIGITAL DE LA CÁMARA, no un `transform: scale()` sobre el
  // preview. La diferencia es todo el punto: el CSS agranda lo que se ve en
  // pantalla y el video sube igual de lejos, así que la etiqueta seguiría
  // siendo ilegible en la evidencia. `applyConstraints` cambia lo que el
  // sensor entrega, y eso sí queda grabado.
  const [zoomRango, setZoomRango] = useState<{ min: number; max: number; step: number } | null>(
    null
  );
  const [zoom, setZoom] = useState<number>(1);
  const [zoomError, setZoomError] = useState<string | null>(null);
  const [ajustes, setAjustes] = useState<AjustesCaptura | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const activeRecordingRef = useRef<ActiveRecording | null>(null);
  // Mientras `detener()` está esperando a que termine el `MediaRecorder`
  // activo (`onstop`/`onerror`), guarda acá su callback de resolución. El
  // `onerror` que vive en el recorder desde `grabar()` (necesario para I4:
  // un fallo del encoder A MITAD de una grabación, no solo al detener) lo
  // consulta para no dejar la promesa de `detener()` colgada si el error
  // ocurre justo mientras se está deteniendo.
  const pendingStopRef = useRef<{ recorder: MediaRecorder; finalize: (err?: Error) => void } | null>(
    null
  );
  const startedAtRef = useRef<number>(0);
  const mimeTypeRef = useRef<string | null>(null);
  // Se calcula UNA vez, al armar, y se lee en cada `grabar()`. Va en un ref y
  // no en el estado por el mismo motivo que `mimeTypeRef`: F3 llama a
  // `grabar()` desde un handler de Pusher, donde el estado de React puede
  // estar una render atrás.
  const bitrateRef = useRef<number>(BITRATE_FALLBACK);

  // Se dispara con un `track.ended` real (llamada entrante, otra app
  // tomando la cámara, Siri) — nunca lo llama este hook. Es la señal de que
  // el stream murió por fuera de nuestro control: pasa a "caída" sea cual
  // sea el estado de captura en ese momento (armada o grabando).
  const onTrackEnded = useCallback(() => {
    setEstado('caida');
  }, []);

  const armar = useCallback(async () => {
    setError(null);
    setEstado('armando');

    // C2 — rearme tras "caída": un `MediaRecorder` viejo puede seguir en
    // `'recording'` y el `stream` viejo puede tener tracks todavía `'live'`
    // (p.ej. entró una llamada a mitad de una grabación: el track de VIDEO
    // murió y disparó "caída", pero el track de AUDIO del mismo stream
    // puede seguir vivo). Sin esta limpieza quedan dos daños medidos: una
    // sesión de captura fantasma consumiendo batería/calor — y en varios
    // Android el siguiente `getUserMedia` empieza a fallar por eso — y
    // evidencia corrupta, porque el próximo blob se arma intercalando
    // chunks de dos streams (un WebM que no reproduce).
    //
    // Esto NO viola la regla 1 del doc-comment del módulo ("nunca
    // `track.stop()` mientras la cámara está armada y en uso"): esa regla
    // protege un stream VIVO y en servicio. Acá el stream ya está muerto
    // (por eso se llegó a "caída") y este `armar()` ES el gesto humano que
    // la regla exige para volver a pedir permiso — no es "entre
    // grabaciones", es un rearme completo. Si alguien "arregla" esto
    // quitando el `track.stop()` de abajo, vuelve el bug de C2.
    const staleRecording = activeRecordingRef.current;
    if (staleRecording) {
      activeRecordingRef.current = null;
      pendingStopRef.current = null;
      try {
        if (staleRecording.recorder.state !== 'inactive') staleRecording.recorder.stop();
      } catch {
        // El recorder puede quedar en un estado raro tras la caída — no hay
        // nada accionable si `stop()` tira acá, ya lo estamos descartando.
      }
    }
    const staleStream = streamRef.current;
    if (staleStream) {
      staleStream.getTracks().forEach((track) => {
        track.removeEventListener('ended', onTrackEnded);
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: VIDEO_CONSTRAINTS,
          audio: true,
        });
      } catch (e) {
        const name = (e as { name?: string } | null)?.name ?? '';
        if (MIC_FAILURE_ERROR_NAMES.has(name)) {
          stream = await navigator.mediaDevices.getUserMedia({ video: VIDEO_CONSTRAINTS });
        } else {
          throw e;
        }
      }

      streamRef.current = stream;
      stream.getTracks().forEach((track) => {
        track.addEventListener('ended', onTrackEnded);
      });

      // Resolución REAL entregada — nunca la pedida. De acá sale el bitrate:
      // ver `calcularBitrate` y el doc de `VIDEO_LADO_IDEAL`. Envuelto por el
      // mismo motivo que el bloque de zoom de abajo: `getSettings` es
      // best-effort y **grabar es la función**; si esto falla se graba igual
      // con el bitrate de fallback.
      try {
        const [videoTrack] = stream.getVideoTracks?.() ?? [];
        const settings =
          typeof videoTrack?.getSettings === 'function' ? videoTrack.getSettings() : null;
        const bitrate = calcularBitrate(settings);
        bitrateRef.current = bitrate;
        setAjustes({
          ancho: settings?.width ?? null,
          alto: settings?.height ?? null,
          fps: settings?.frameRate ?? null,
          bitrate,
        });
      } catch {
        bitrateRef.current = BITRATE_FALLBACK;
        setAjustes({ ancho: null, alto: null, fps: null, bitrate: BITRATE_FALLBACK });
      }

      // Capacidades de zoom del hardware. TODO este bloque es best-effort y va
      // envuelto: `getCapabilities` no existe en todos los navegadores (Safari,
      // Firefox hasta hace poco), y donde existe puede no traer `zoom` — una
      // webcam de laptop normalmente no tiene.
      //
      // El try/catch no es defensivo por si acaso: el zoom es una comodidad y
      // **grabar es la función**. Si leer las capacidades falla por cualquier
      // motivo, la cámara tiene que quedar armada igual, sin control de zoom.
      // Al revés —una excepción acá abortando `armar()`— dejaría la estación
      // sin poder grabar por un accesorio.
      try {
        const [videoTrack] = stream.getVideoTracks?.() ?? [];
        const caps =
          typeof videoTrack?.getCapabilities === 'function' ? videoTrack.getCapabilities() : null;
        // `DoubleRange` de lib.dom no declara `step`, pero la spec de Media
        // Capture lo define para `zoom` y Chrome lo devuelve.
        const zoomCap = (
          caps as MediaTrackCapabilities & {
            zoom?: { min?: number; max?: number; step?: number };
          }
        )?.zoom;
        if (zoomCap && typeof zoomCap.min === 'number' && typeof zoomCap.max === 'number') {
          setZoomRango({ min: zoomCap.min, max: zoomCap.max, step: zoomCap.step ?? 0.1 });
          const actual = (
            videoTrack.getSettings?.() as MediaTrackSettings & { zoom?: number }
          )?.zoom;
          setZoom(typeof actual === 'number' ? actual : zoomCap.min);
        } else {
          setZoomRango(null);
        }
      } catch {
        setZoomRango(null);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play?.().catch(() => {});
      }

      const negotiated = negotiateMimeType();
      mimeTypeRef.current = negotiated;
      setMimeType(negotiated);
      setEstado('armada');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No se pudo acceder a la cámara.';
      setError(message);
      setEstado('inactiva');
    }
  }, [onTrackEnded]);

  /**
   * Cambia el zoom de la cámara. Se puede llamar MIENTRAS graba: eso es lo
   * normal en una inspección — el operador arranca con el equipo entero y se
   * acerca a un detalle sin cortar la toma, que además es lo que hace útil el
   * video como evidencia de un rayón puntual.
   *
   * `applyConstraints` puede rechazar (valor fuera de rango, o el track ya
   * terminado). Si falla, el zoom mostrado NO se mueve —mostrar un zoom que la
   * cámara no aplicó es peor que no moverlo, porque el operador cree que
   * encuadró— pero sí se avisa: un control que no responde y tampoco explica
   * por qué se lee como que la app está colgada, y el operador lo sigue
   * arrastrando esperando que reaccione.
   *
   * Se prueba primero con `advanced` (lo que soporta Chrome/Android) y, si
   * rechaza, en el nivel superior de las constraints. Algunas
   * implementaciones aceptan una forma y no la otra.
   */
  const aplicarZoom = useCallback(async (valor: number) => {
    const [track] = streamRef.current?.getVideoTracks() ?? [];
    if (!track || !zoomRango) return;
    const acotado = Math.min(zoomRango.max, Math.max(zoomRango.min, valor));

    setZoomError(null);
    try {
      await track.applyConstraints({
        advanced: [{ zoom: acotado } as MediaTrackConstraintSet & { zoom: number }],
      });
      setZoom(acotado);
      return;
    } catch {
      // Segundo intento con la forma plana antes de darlo por perdido.
    }
    try {
      await track.applyConstraints({ zoom: acotado } as MediaTrackConstraints & { zoom: number });
      setZoom(acotado);
    } catch {
      setZoomError('Esta cámara no acepta el zoom por software.');
    }
  }, [zoomRango]);

  const grabar = useCallback(() => {
    const stream = streamRef.current;
    // C1 — guardia por REF, no por `estado` capturado en el closure: dos
    // llamadas a `grabar()` en el mismo tick (batch de React, sin re-render
    // entre medio) ven el MISMO `estado` capturado — ambas pasaban el
    // chequeo viejo (`estado !== 'armada'`) y creaban dos `MediaRecorder`
    // sobre el mismo stream. El primero quedaba huérfano (nadie lo detiene
    // nunca) y, en la versión vieja de este hook, sus chunks caían en un
    // `chunksRef` compartido a nivel de hook — contaminando el blob de la
    // grabación buena. Medido: 2 recorders creados, blob de 11 bytes en vez
    // de 3 limpios.
    //
    // Hoy la UI no lo dispara (React repinta entre clicks) pero F3 va a
    // llamar `grabar()` desde un handler de Pusher, donde dos entregas en
    // el mismo tick sí se batchean — y Pusher entrega duplicados al
    // reconectar. `activeRecordingRef` se muta SINCRÓNICAMENTE más abajo,
    // así que la segunda llamada en el mismo tick ya lo ve seteado.
    if (!stream || activeRecordingRef.current) return;

    // Chunks propios de ESTA grabación, capturados en el closure de
    // `ondataavailable` — no un ref a nivel de hook. Ver interfaz
    // `ActiveRecording` arriba.
    const chunks: Blob[] = [];
    const options: MediaRecorderOptions = { videoBitsPerSecond: bitrateRef.current };
    if (mimeTypeRef.current) options.mimeType = mimeTypeRef.current;

    // Nuevo `MediaRecorder` por grabación, SIEMPRE sobre el mismo `stream` —
    // ver regla 1 del doc-comment del módulo. Nunca se toca `streamRef` acá.
    const recorder = new MediaRecorder(stream, options);
    recorder.ondataavailable = (e: BlobEvent) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onerror = () => {
      // Si `detener()` está esperando a que ESTE recorder termine, que sea
      // su propio callback el que resuelva/rechace (ver C3 y
      // `pendingStopRef` más abajo) — no hacemos doble trabajo acá.
      if (pendingStopRef.current?.recorder === recorder) {
        pendingStopRef.current.finalize(new Error('Error del grabador.'));
        return;
      }
      // I4: un fallo del encoder A MITAD de una grabación (nadie llamó a
      // `detener()` todavía) dejaba la UI clavada en "GRABANDO" para
      // siempre — en un teléfono atornillado a una pared, la única salida
      // era recargar la página. Se corta la grabación acá mismo.
      if (activeRecordingRef.current?.recorder === recorder) {
        activeRecordingRef.current = null;
      }
      // C3: nunca pisar "caída" con "armada" — ver detener() más abajo.
      setEstado((prev) => (prev === 'caida' ? 'caida' : 'armada'));
    };

    activeRecordingRef.current = { recorder, chunks };
    recorder.start(200);
    startedAtRef.current = Date.now();
    setEstado('grabando');
  }, []);

  /**
   * Dibuja el frame actual del `<video>` en un canvas y lo devuelve como
   * JPEG. Es el camino SEGURO: no toca el track ni el `MediaRecorder`, así
   * que se puede usar con el video grabando.
   */
  const capturarPorCanvas = useCallback(
    (ladoMaximo?: number, calidad: number = FOTO_CALIDAD): Promise<Blob> => {
      const video = videoRef.current;
      const anchoNativo = video?.videoWidth ?? 0;
      const altoNativo = video?.videoHeight ?? 0;
      if (!video || !anchoNativo || !altoNativo) {
        return Promise.reject(new Error('La cámara no está entregando imagen.'));
      }

      const escala = ladoMaximo
        ? Math.min(1, ladoMaximo / Math.max(anchoNativo, altoNativo))
        : 1;
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(anchoNativo * escala);
      canvas.height = Math.round(altoNativo * escala);
      const ctx = canvas.getContext('2d');
      if (!ctx) return Promise.reject(new Error('No se pudo preparar la imagen.'));
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo generar la imagen.'))),
          FOTO_MIME,
          calidad
        );
      });
    },
    []
  );

  const capturarFoto = useCallback(async (): Promise<ResultadoFoto> => {
    const video = videoRef.current;
    const ancho = video?.videoWidth ?? 0;
    const alto = video?.videoHeight ?? 0;

    // La miniatura SIEMPRE sale del canvas, tanto si la foto vino del sensor
    // como si no: es una reducción del mismo encuadre y cuesta un `drawImage`.
    // Se pide primero para que un fallo acá no deje una foto grande subida
    // sin vista previa — el backend no la da por verificada sin miniatura.
    const thumbBlob = await capturarPorCanvas(THUMB_LADO, THUMB_CALIDAD);

    // `ImageCapture` da la resolución del sensor (varios MP), que es la
    // diferencia entre leer o no leer una etiqueta de serial. Pero
    // reconfigura el track: mientras el `MediaRecorder` corre, eso glitchea
    // un video que después nadie puede volver a grabar. Con el video
    // grabando, el canvas no se negocia.
    const grabando = estado === 'grabando';
    const ImageCaptureCtor = (
      globalThis as unknown as { ImageCapture?: new (track: MediaStreamTrack) => { takePhoto: () => Promise<Blob> } }
    ).ImageCapture;
    const [videoTrack] = streamRef.current?.getVideoTracks?.() ?? [];

    if (!grabando && ImageCaptureCtor && videoTrack) {
      try {
        const blob = await new ImageCaptureCtor(videoTrack).takePhoto();
        return { blob, thumbBlob, mimeType: blob.type || FOTO_MIME, ancho, alto };
      } catch {
        // iOS Safari no lo tiene y Android puede rechazarlo. Una foto
        // degradada es aceptable; quedarse sin foto, no — el operador ya
        // gastó el gesto y el equipo ya está en posición.
      }
    }

    const blob = await capturarPorCanvas();
    return { blob, thumbBlob, mimeType: blob.type || FOTO_MIME, ancho, alto };
  }, [capturarPorCanvas, estado]);

  const detener = useCallback((): Promise<ResultadoDetener> => {
    return new Promise((resolve, reject) => {
      const active = activeRecordingRef.current;
      if (!active || active.recorder.state === 'inactive') {
        reject(new Error('No hay una grabación en curso.'));
        return;
      }
      const { recorder, chunks } = active;
      const duracionMs = Date.now() - startedAtRef.current;

      let settled = false;
      const finalize = (err?: Error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        if (activeRecordingRef.current?.recorder === recorder) {
          activeRecordingRef.current = null;
        }
        if (pendingStopRef.current?.recorder === recorder) {
          pendingStopRef.current = null;
        }
        // C3: `setEstado('armada')` incondicional acá pisaba una cámara ya
        // "caída" (p.ej. entró una llamada JUSTO mientras se detenía). El
        // teléfono en la pared terminaba mostrando "ARMADA" en tipografía
        // enorme sobre un preview congelado con la cámara muerta — la
        // siguiente orden no graba nada, y recién se descubre en F4 por un
        // video ausente. El rearme automático (regla 2) sigue aplicando
        // para el camino feliz; "caída" es la única excepción.
        setEstado((prev) => (prev === 'caida' ? 'caida' : 'armada'));
        if (err) {
          reject(err);
          return;
        }
        const usedMimeType = recorder.mimeType || mimeTypeRef.current || 'video/webm';
        const blob = new Blob(chunks, { type: usedMimeType });
        resolve({ blob, mimeType: usedMimeType, duracionMs });
      };

      // C3 — salida por error/timeout: sin esto, si `onstop` nunca dispara
      // (encoder trabado — poco común pero posible) la promesa queda
      // colgada para siempre, y F4 la va a esperar para subir el video.
      const timeoutId = setTimeout(() => {
        finalize(new Error('La grabación no terminó a tiempo (posible falla del encoder).'));
      }, DETENER_TIMEOUT_MS);

      pendingStopRef.current = { recorder, finalize };
      recorder.onstop = () => finalize();
      // `onerror` ya está asignado desde `grabar()` y consulta
      // `pendingStopRef` — no hace falta reasignarlo acá.

      // Deliberadamente solo `recorder.stop()`. Jamás
      // `streamRef.current?.getTracks().forEach(t => t.stop())` acá: eso es
      // exactamente lo que este hook existe para evitar (regla 1).
      recorder.stop();
    });
  }, []);

  // I6 — limpieza al desmontar: este hook vive en una vista de kiosco que
  // en operación normal NUNCA se desmonta, pero puede pasar igual (hot
  // reload en dev, navegación de emergencia, un error boundary). Que el
  // STREAM sobreviva al desmontaje es la regla 1 y está bien — el gesto
  // humano de `armar()` es caro, no hay por qué pedirlo de nuevo. Que el
  // ENCODER (el `MediaRecorder` activo) siga corriendo es otra cosa: sigue
  // escribiendo chunks en el `chunks` de un closure que ya nadie va a leer
  // — trabajo de CPU/batería tirado, y ese blob nunca lo va a levantar
  // nadie. Se detiene el recorder sin tocar `streamRef`.
  useEffect(() => {
    return () => {
      const active = activeRecordingRef.current;
      if (active && active.recorder.state !== 'inactive') {
        try {
          active.recorder.stop();
        } catch {
          // Nada accionable si `stop()` tira acá — el hook ya se está yendo.
        }
      }
      activeRecordingRef.current = null;
      pendingStopRef.current = null;
    };
  }, []);

  return {
    estado,
    error,
    mimeType,
    ajustes,
    videoRef,
    armar,
    grabar,
    capturarFoto,
    detener,
    zoom,
    zoomRango,
    zoomError,
    aplicarZoom,
  };
}
