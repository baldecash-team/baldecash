'use client';

/**
 * Controles PROPIOS del video de la unidad — reemplazan los controles nativos
 * del navegador (`<video controls>`).
 *
 * POR QUÉ EXISTEN: la estación de inspección graba este video EN EL TALLER, así
 * que el audio puede traer conversaciones del equipo de trabajo alrededor del
 * equipo — no es que moleste, es que no se le puede exponer al cliente lo que
 * se hablaba mientras filmaban SU equipo. "Silenciado por defecto" no alcanza:
 * los controles nativos siempre traen volumen, y ahí cualquier persona curiosa
 * lo reactiva en un toque. Con controles propios el volumen simplemente NO
 * EXISTE como opción: no hay botón, no hay slider, no hay forma de subirlo.
 *
 * Lo mínimo para revisar un equipo, nada más: reproducir/pausar, una barra de
 * progreso que se pueda arrastrar (para volver al rayón que se vio al pasar) y
 * el tiempo. SIN botón de pantalla completa acá adentro: ese botón vive en
 * `GaleriaUnidad`, sobre el CONTENEDOR (visor + estos controles), nunca sobre
 * el `<video>` — pedirle pantalla completa al `<video>` es lo que en varios
 * navegadores móviles hace que el sistema devuelva SUS controles nativos, con
 * volumen incluido, por encima de todo esto.
 *
 * Este componente NO toca el `<video>`: lo recibe ya montado (vía el nodo del
 * DOM, no una `key` ni una prop de React) y solo se suscribe a sus eventos
 * nativos (`play`, `pause`, `timeupdate`...) para reflejar su estado y a los
 * suyos (`play()`, `pause()`, `currentTime`) para controlarlo. Vive AFUERA del
 * `VisorZoom`: si viviera adentro, la barra se acercaría y se movería con el
 * zoom, que es exactamente lo que no tiene que pasar.
 *
 * `play()` devuelve una promesa que se puede rechazar (fuente no soportada,
 * política de autoplay, la persona navegó a otra unidad antes de que
 * cargara...) y acá SIEMPRE se captura: sin el `.catch()`, el rechazo escapa
 * como una promesa no manejada (así llegó a Sentry — BALDECASH3-57) y encima
 * la persona aprieta play y no pasa nada, en silencio. Un `AbortError` es una
 * interrupción benigna (se cambió de unidad, se cerró la galería, se llamó a
 * `pause()` antes de que la promesa resolviera) y no se avisa; cualquier otro
 * motivo sí, vía `onErrorReproduccion`.
 */
import { useEffect, useState } from 'react';
import { formatearDuracion } from './formato';

export interface VideoControlsProps {
  /** El nodo del `<video>` ya montado, o `null` si no hay video en pantalla. */
  video: HTMLVideoElement | null;
  /**
   * `play()` rechazó por un motivo real, no por una interrupción benigna
   * (`AbortError`). Quien lo recibe es responsable de avisarle a la persona —
   * acá no hay dónde mostrar ese mensaje.
   */
  onErrorReproduccion?: () => void;
}

export function VideoControls({ video, onErrorReproduccion }: VideoControlsProps) {
  const [reproduciendo, setReproduciendo] = useState(false);
  const [actual, setActual] = useState(0);
  const [duracion, setDuracion] = useState(0);

  // Se re-suscribe cada vez que el NODO cambia (no solo al montar): al navegar
  // a otra unidad el `<video>` se remonta (tiene `key` por unidad, en
  // `GaleriaUnidad`) para que arranque limpio, así que este efecto tiene que
  // volver a engancharse al nodo nuevo y no quedarse escuchando al viejo.
  useEffect(() => {
    if (!video) {
      setReproduciendo(false);
      setActual(0);
      setDuracion(0);
      return;
    }

    const alActualizarTiempo = () => setActual(video.currentTime);
    const alActualizarDuracion = () => setDuracion(video.duration);
    const alReproducir = () => setReproduciendo(true);
    const alPausar = () => setReproduciendo(false);

    video.addEventListener('timeupdate', alActualizarTiempo);
    video.addEventListener('loadedmetadata', alActualizarDuracion);
    video.addEventListener('durationchange', alActualizarDuracion);
    video.addEventListener('play', alReproducir);
    video.addEventListener('pause', alPausar);
    video.addEventListener('ended', alPausar);

    // Estado inicial: el nodo puede llegar con el metadata ya cargado (o no).
    setActual(video.currentTime);
    setDuracion(video.duration);
    setReproduciendo(!video.paused);

    return () => {
      video.removeEventListener('timeupdate', alActualizarTiempo);
      video.removeEventListener('loadedmetadata', alActualizarDuracion);
      video.removeEventListener('durationchange', alActualizarDuracion);
      video.removeEventListener('play', alReproducir);
      video.removeEventListener('pause', alPausar);
      video.removeEventListener('ended', alPausar);
    };
  }, [video]);

  if (!video) return null;

  const duracionValida = Number.isFinite(duracion) && duracion > 0 ? duracion : 0;

  const alTocarPlay = () => {
    if (video.paused) {
      // `?.` cubre el caso (raro, solo en entornos que no siguen la spec)
      // donde `play()` no devuelve una promesa. Cuando sí la devuelve —el caso
      // real, siempre en un navegador— el rechazo se captura acá mismo.
      video.play()?.catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        onErrorReproduccion?.();
      });
    } else {
      video.pause();
    }
  };

  const alMoverBarra = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value);
    video.currentTime = t;
    // Refleja el arrastre de una: esperar al `timeupdate` del navegador se
    // siente atrasado, sobre todo arrastrando con el mouse.
    setActual(t);
  };

  return (
    <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-[#151744] px-3 py-2 text-white">
      <button
        type="button"
        onClick={alTocarPlay}
        aria-label={reproduciendo ? 'Pausar video' : 'Reproducir video'}
        className="grid h-8 w-8 flex-none place-items-center rounded-full bg-white/12 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          {reproduciendo ? (
            <path d="M7 5h3v14H7zM14 5h3v14h-3z" />
          ) : (
            <path d="M8 5v14l11-7z" />
          )}
        </svg>
      </button>

      <span className="w-[34px] flex-none text-center text-[11px] tabular-nums text-white/80">
        {formatearDuracion(actual)}
      </span>

      {/* Sin control de volumen: a propósito, ver el comentario del archivo. */}
      <input
        type="range"
        aria-label="Progreso del video"
        min={0}
        max={duracionValida || 1}
        step={0.1}
        value={Math.min(actual, duracionValida || actual)}
        onChange={alMoverBarra}
        style={{ accentColor: '#03DBD0' }}
        className="h-1.5 flex-1"
      />

      <span className="w-[34px] flex-none text-center text-[11px] tabular-nums text-white/80">
        {formatearDuracion(duracionValida)}
      </span>
    </div>
  );
}

export default VideoControls;
