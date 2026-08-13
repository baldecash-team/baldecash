'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { TOKENS } from '@/app/prototipos/0.6/admision/_components/tokens';
import { API_BASE_URL } from '../_lib/pairing';
import { mensajeDeError, mensajeDeRed } from '../_lib/errores';

export interface EquipoCatalogo {
  record_id: string;
  serial: string;
  marca: string | null;
  modelo: string | null;
  procesador: string | null;
  ram_gb: number | null;
  almacenamiento: string | null;
  pantalla: number | null;
  grado: string | null;
  tipo: string | null;
  sku: string | null;
}

interface RespuestaSerial {
  encontrado: boolean;
  equipo: EquipoCatalogo | null;
  candidato: string | null;
  confianza: number | null;
  error: string | null;
}

interface Props {
  token: string;
  serial: string;
  onSerialChange: (s: string) => void;
  equipo: EquipoCatalogo | null;
  onEquipoChange: (e: EquipoCatalogo | null) => void;
  deshabilitado: boolean;
}

/**
 * Identificación del equipo antes de grabar (spec §5 y §5.1).
 *
 * Dos vías hacia el mismo lugar, porque las dos fallan en situaciones distintas:
 * escribir el serial a mano (siempre disponible, lento) y sacarle una foto a la
 * etiqueta (rápido, depende de la luz y del estado del sticker).
 *
 * Ninguna de las dos habilita grabar por sí sola. Lo que habilita es el MATCH
 * contra el catálogo, y por eso la ficha se muestra completa: el operador tiene
 * el equipo en la mano y confirma contra lo que ve, no contra lo que tipeó.
 *
 * El fallback es la parte que hace que el OCR se use en vez de ignorarse: si el
 * texto leído no matchea, se precarga igual en el input. El error típico medido
 * sobre fotos reales es de UN carácter (`GX3R7T4YPJ` leído `GX3R714YPJ`), así
 * que corregir uno es mucho más barato que tipear diez — y mucho más probable
 * que el operador lo haga.
 */
export function IdentificarEquipo({
  token,
  serial,
  onSerialChange,
  equipo,
  onEquipoChange,
  deshabilitado,
}: Props) {
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avisoOcr, setAvisoOcr] = useState<string | null>(null);
  const [camaraAbierta, setCamaraAbierta] = useState(false);
  const inputFotoRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const aplicar = useCallback(
    (data: RespuestaSerial, desdeOcr: boolean) => {
      if (data.encontrado && data.equipo) {
        onEquipoChange(data.equipo);
        onSerialChange(data.equipo.serial);
        setError(null);
        setAvisoOcr(
          desdeOcr && data.confianza != null
            ? `Leído por foto con ${data.confianza.toFixed(0)}% de confianza. Verificá que coincida con el equipo.`
            : null
        );
        return;
      }
      // No matcheó: se limpia el equipo (nada habilitado) pero se conserva el
      // texto leído para que se corrija a mano.
      onEquipoChange(null);
      if (data.candidato) onSerialChange(data.candidato);
      setError(data.error ?? 'No se encontró el equipo.');
      setAvisoOcr(null);
    },
    [onEquipoChange, onSerialChange]
  );

  const buscarPorSerial = useCallback(async () => {
    const s = serial.trim();
    if (!s || buscando) return;
    setBuscando(true);
    setError(null);
    setAvisoOcr(null);
    try {
      const r = await fetch(`${API_BASE_URL}/inspections/catalog/${encodeURIComponent(s)}`, {
        headers: { 'X-Device-Token': token },
      });
      if (!r.ok) {
        onEquipoChange(null);
        setError(await mensajeDeError(r, 'consultar el catálogo'));
        return;
      }
      aplicar((await r.json()) as RespuestaSerial, false);
    } catch {
      onEquipoChange(null);
      setError(mensajeDeRed('consultar el catálogo'));
    } finally {
      setBuscando(false);
    }
  }, [serial, buscando, token, aplicar, onEquipoChange]);

  /** Manda una imagen ya en dataURL al OCR. Comparte camino entre la foto
   * tomada con la webcam y el archivo subido: el backend recibe lo mismo. */
  const enviarAlOcr = useCallback(
    async (imagen: string) => {
      setBuscando(true);
      setError(null);
      setAvisoOcr(null);
      try {
        const r = await fetch(`${API_BASE_URL}/inspections/read-serial`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Device-Token': token },
          body: JSON.stringify({ imagen }),
        });
        if (!r.ok) {
          setError(await mensajeDeError(r, 'leer la foto'));
          return;
        }
        aplicar((await r.json()) as RespuestaSerial, true);
      } catch {
        setError(mensajeDeRed('leer la foto'));
      } finally {
        setBuscando(false);
      }
    },
    [token, aplicar]
  );

  const leerFoto = useCallback(
    async (file: File) => {
      setBuscando(true);
      try {
        const imagen = await new Promise<string>((resolve, reject) => {
          const fr = new FileReader();
          fr.onload = () => resolve(String(fr.result));
          fr.onerror = () => reject(new Error('read'));
          fr.readAsDataURL(file);
        });
        await enviarAlOcr(imagen);
      } catch {
        setError('No se pudo leer el archivo de imagen.');
        setBuscando(false);
      }
    },
    [enviarAlOcr]
  );

  /**
   * Abre la webcam del controlador para sacar la foto ahí mismo.
   *
   * El `<input capture>` de abajo abre la cámara en un teléfono, pero en
   * laptop cae al selector de archivos — y el controlador de la estación ES
   * una laptop. Sin esto, "leer con una foto" obligaba a sacar la foto con
   * otro aparato, pasarla a la laptop y recién ahí subirla.
   *
   * A diferencia de la cámara de grabación, acá SÍ se llama `track.stop()` al
   * cerrar: este stream vive segundos, no horas, y dejarlo abierto mantiene la
   * luz de la webcam prendida — que en una laptop compartida se lee como que
   * la aplicación está grabando cuando no lo está.
   */
  const abrirCamara = useCallback(async () => {
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 } },
      });
      streamRef.current = s;
      setCamaraAbierta(true);
      // El <video> se monta recién ahora, así que el srcObject se asigna en el
      // efecto de abajo, no acá.
    } catch {
      setError(
        'No se pudo abrir la cámara. Revisá el permiso en el candado de la barra de direcciones, o subí una foto.'
      );
    }
  }, []);

  const cerrarCamara = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamaraAbierta(false);
  }, []);

  const capturar = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    // JPEG con calidad alta: el OCR trabaja sobre texto chico y un JPEG muy
    // comprimido se come justo los trazos finos que distinguen un 1 de una T.
    const imagen = canvas.toDataURL('image/jpeg', 0.92);
    cerrarCamara();
    await enviarAlOcr(imagen);
  }, [cerrarCamara, enviarAlOcr]);

  // Asigna el stream al <video> cuando se monta, y libera la cámara si el
  // componente se desmonta con el visor abierto.
  useEffect(() => {
    if (camaraAbierta && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play?.().catch(() => {});
    }
  }, [camaraAbierta]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div>
      <label
        htmlFor="inspeccion-serial"
        className="mt-4 block text-xs font-semibold"
        style={{ color: TOKENS.slate }}
      >
        Serial del equipo
      </label>

      <div className="mt-1 flex gap-2">
        <input
          id="inspeccion-serial"
          type="text"
          value={serial}
          onChange={(e) => {
            onSerialChange(e.target.value);
            // Cualquier edición invalida la ficha: lo confirmado dejó de
            // corresponder al texto que hay en pantalla.
            if (equipo) onEquipoChange(null);
          }}
          onKeyDown={(e) => {
            // Enter busca. Un lector de código de barras USB se comporta como
            // un teclado y termina con Enter, así que con esto la estación fija
            // funciona sin tocar nada más (spec §5).
            if (e.key === 'Enter') {
              e.preventDefault();
              void buscarPorSerial();
            }
          }}
          disabled={deshabilitado || buscando}
          placeholder="Escribí o escaneá el serial"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: TOKENS.line, color: TOKENS.ink }}
        />
        <button
          type="button"
          onClick={() => void buscarPorSerial()}
          disabled={deshabilitado || buscando || !serial.trim()}
          className="shrink-0 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors hover:bg-[color:var(--hover-primary)] disabled:opacity-40 disabled:hover:bg-transparent"
          style={
            {
              borderColor: TOKENS.primary,
              color: TOKENS.primary,
              // El controlador corre en laptop, con mouse: sin hover no hay
              // ninguna señal de que algo es clickeable hasta apretarlo.
              '--hover-primary': `${TOKENS.primary}14`,
            } as React.CSSProperties
          }
        >
          {buscando ? '…' : 'Buscar'}
        </button>
      </div>

      {/* Visor de la webcam del controlador. Solo mientras está abierto. */}
      {camaraAbierta && (
        <div className="mt-3 rounded-xl border p-3" style={{ borderColor: TOKENS.line }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full rounded-lg bg-black"
          />
          <p className="mt-2 text-center text-xs" style={{ color: TOKENS.slate }}>
            Acercá la etiqueta del serial hasta que se lea nítida.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => void capturar()}
              className="flex-1 rounded-lg px-4 py-2 text-sm font-bold text-white transition-[filter,transform] hover:brightness-110 active:scale-[0.99]"
              style={{ background: TOKENS.primary }}
            >
              Tomar foto
            </button>
            <button
              type="button"
              onClick={cerrarCamara}
              className="rounded-lg border px-4 py-2 text-sm font-semibold transition-colors hover:bg-black/[0.04]"
              style={{ borderColor: TOKENS.line, color: TOKENS.ink }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {!camaraAbierta && (
        <button
          type="button"
          onClick={() => void abrirCamara()}
          disabled={deshabilitado || buscando}
          className="mt-2 w-full rounded-lg border px-4 py-2 text-sm font-semibold transition-colors hover:border-[color:var(--hover-border)] hover:bg-black/[0.04] disabled:opacity-40 disabled:hover:border-[color:var(--rest-border)] disabled:hover:bg-transparent"
          style={
            {
              borderColor: TOKENS.line,
              color: TOKENS.ink,
              '--hover-border': TOKENS.primary,
              '--rest-border': TOKENS.line,
            } as React.CSSProperties
          }
        >
          📷 Tomar foto del serial
        </button>
      )}

      {/*
        Subir un archivo queda como alternativa: sirve para una foto sacada con
        otro aparato, o cuando la webcam del controlador no enfoca de cerca —
        que es lo normal en las webcams de laptop, pensadas para una cara a
        medio metro y no para una etiqueta a diez centímetros.
      */}
      <input
        ref={inputFotoRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (f) void leerFoto(f);
        }}
      />
      <button
        type="button"
        onClick={() => inputFotoRef.current?.click()}
        disabled={deshabilitado || buscando || camaraAbierta}
        className="mt-2 w-full rounded-lg border px-4 py-2 text-sm font-semibold transition-colors hover:border-[color:var(--hover-border)] hover:bg-black/[0.04] disabled:opacity-40 disabled:hover:border-[color:var(--rest-border)] disabled:hover:bg-transparent"
        style={
          {
            borderColor: TOKENS.line,
            color: TOKENS.ink,
            '--hover-border': TOKENS.primary,
            '--rest-border': TOKENS.line,
          } as React.CSSProperties
        }
      >
        🖼️ Subir una imagen
      </button>

      {/*
        Loader. El OCR va a Textract y consulta Airtable: son un par de segundos
        en los que la pantalla no cambiaba en nada, y sin señal el operador
        vuelve a apretar y dispara una segunda lectura.
      */}
      {buscando && (
        <div
          className="mt-3 flex items-center justify-center gap-3 rounded-xl border p-4"
          style={{ borderColor: TOKENS.line }}
          aria-live="polite"
        >
          <span
            className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"
            style={{ color: TOKENS.primary }}
            aria-hidden
          />
          <span className="text-sm font-semibold" style={{ color: TOKENS.ink }}>
            Leyendo el serial y buscando el equipo…
          </span>
        </div>
      )}

      {equipo && !buscando && (
        <div
          className="mt-3 rounded-xl border p-3"
          style={{ borderColor: TOKENS.primary, background: '#f8fafc' }}
        >
          <p className="text-base font-bold" style={{ color: TOKENS.ink }}>
            {equipo.marca ? `${equipo.marca} ` : ''}
            {equipo.modelo ?? 'Equipo sin modelo'}
          </p>
          <p className="mt-1 font-mono text-sm" style={{ color: TOKENS.slate }}>
            {equipo.serial}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: TOKENS.slate }}>
            {equipo.procesador && <span>{equipo.procesador}</span>}
            {equipo.ram_gb != null && <span>{equipo.ram_gb} GB RAM</span>}
            {equipo.almacenamiento && <span>{equipo.almacenamiento}</span>}
            {equipo.pantalla != null && <span>{equipo.pantalla}&quot;</span>}
            {equipo.grado && <span>Grado {equipo.grado}</span>}
          </div>
          {avisoOcr && (
            <p className="mt-2 text-xs font-semibold" style={{ color: TOKENS.slate }}>
              {avisoOcr}
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm font-semibold" style={{ color: TOKENS.red }}>
          {error}
        </p>
      )}
    </div>
  );
}
