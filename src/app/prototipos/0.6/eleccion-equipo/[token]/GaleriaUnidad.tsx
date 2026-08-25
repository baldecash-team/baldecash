'use client';

/**
 * Galería de UNA unidad: el video y las fotos que le grabó la estación de
 * inspección, y el botón para quedársela.
 *
 * Es el corazón de la pantalla. El valor no es elegir un número: es VER el
 * equipo concreto antes de aceptarlo, así que el medio manda y el resto es
 * marco. Como los equipos son reacondicionados y lo que se busca son rayones y
 * marcas, el visor se puede acercar (`VisorZoom`) sin cortar el video, y desde
 * acá también se puede pasar a la unidad siguiente/anterior sin cerrar el
 * diálogo — comparar es la actividad central de esta pantalla.
 *
 * Dos formas según el ancho:
 * - Mobile: bottom-sheet, como el diseño aprobado.
 * - Desktop: diálogo centrado en dos columnas — el video grande a la
 *   izquierda, las fotos y el detalle a la derecha.
 *
 * NO hay bullets de "detalle estético" ni marcas dibujadas sobre la imagen: ese
 * dato no existe, nadie lo captura. Y NUNCA se muestra el serial — el cliente
 * ve "Unidad 01" (`display_number`), que es lo único que el backend manda.
 *
 * El video NO usa los controles nativos del navegador (ver `VideoControls`):
 * esos siempre traen volumen, y el audio de este video puede traer
 * conversaciones del equipo de trabajo del taller. Silenciarlo por defecto no
 * alcanzaba porque el volumen quedaba a un click — con controles propios el
 * volumen directamente no existe como opción. El botón de pantalla completa
 * (si el navegador lo soporta — no en iPhone, ver `soportaPantallaCompleta`)
 * pide el modo sobre el CONTENEDOR (visor + controles), nunca sobre el
 * `<video>`, por la misma razón: pedirlo sobre el `<video>` es lo que hace
 * que varios navegadores móviles devuelvan sus controles nativos por encima.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import type { EleccionUnidad } from '../../services/eleccionEquipoApi';
import { etiquetaFoto, etiquetaGrado, nombreUnidad } from './formato';
import { VideoControls } from './VideoControls';
import { VisorZoom } from './VisorZoom';

/** Qué se está viendo en el visor grande. */
type Medio = { tipo: 'video' } | { tipo: 'foto'; indice: number };

/** Lo que puede recibir foco adentro del diálogo, en orden del DOM. */
const FOCUSABLES = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export interface GaleriaUnidadProps {
  unidad: EleccionUnidad;
  /** Bloquea el CTA mientras el POST está en vuelo. */
  enviando: boolean;
  /** Error que NO cierra la galería (red o rechazo inesperado). */
  error: string | null;
  onCerrar: () => void;
  onElegir: () => void;
  /** Cambió de foto en la tira. `indice` es 0-based. */
  onCambiarFoto: (indice: number) => void;
  /** El video empezó a reproducirse. Se llama UNA vez por apertura. */
  onReproducirVideo: () => void;
  /** La unidad previa en la lista que recibió la pantalla, o `null`/`undefined` si esta es la primera. */
  unidadAnterior?: EleccionUnidad | null;
  /** La unidad siguiente en la lista, o `null`/`undefined` si esta es la última. */
  unidadSiguiente?: EleccionUnidad | null;
  /**
   * Navega a otra unidad SIN cerrar el diálogo. Si no se pasa, no se muestran
   * los botones de anterior/siguiente (así este componente sigue sirviendo
   * standalone, sin forzar a todo consumidor a resolver una lista).
   */
  onNavegar?: (unidad: EleccionUnidad) => void;
}

export function GaleriaUnidad({
  unidad, enviando, error, onCerrar, onElegir, onCambiarFoto, onReproducirVideo,
  unidadAnterior = null, unidadSiguiente = null, onNavegar,
}: GaleriaUnidadProps) {
  const titulo = nombreUnidad(unidad.display_number);
  const grado = etiquetaGrado(unidad.grado, unidad.grado_label);
  const fotos = unidad.photos;

  const [medio, setMedio] = useState<Medio>(() =>
    unidad.video_url ? { tipo: 'video' } : { tipo: 'foto', indice: 0 },
  );
  // El `video_play` se emite una sola vez por apertura: el navegador dispara
  // `play` también al salir de una pausa, y contarlas todas convertiría la
  // métrica de "cuántos miran el video" en "cuántos manotean la barra".
  const videoYaContado = useRef(false);

  // Vuelve al video (o a la primera foto) cuando cambia de UNIDAD, aunque la
  // galería no se desmonte: navegar con los botones/flechas reusa este mismo
  // componente. Sin esto, `medio` seguiría apuntando al índice de foto de la
  // unidad anterior —que en la nueva puede no existir, o ser otra foto— y el
  // video quedaría mostrando el cuadro de la unidad vieja hasta que alguien
  // tocara la tira. Se ajusta DURANTE el render, mismo patrón que usa
  // `VisorZoom` para `reiniciarEn`: con un efecto habría un cuadro intermedio
  // mostrando el medio equivocado.
  const [unidadVista, setUnidadVista] = useState(unidad.unit_id);
  if (unidadVista !== unidad.unit_id) {
    setUnidadVista(unidad.unit_id);
    setMedio(unidad.video_url ? { tipo: 'video' } : { tipo: 'foto', indice: 0 });
    // Navegar a otra unidad es, para la analítica, abrir su galería: su
    // primer play tiene que volver a contar.
    videoYaContado.current = false;
  }

  const dialogoRef = useRef<HTMLDivElement>(null);

  // Contenedor que entra a pantalla completa: el visor + sus botones + los
  // controles del video, NUNCA el `<video>` solo. Pedirle pantalla completa
  // al `<video>` es lo que el navegador (sobre todo en varios móviles) usa
  // como gancho para devolver SUS controles nativos —con volumen— por
  // encima de todo esto, así que el pedido va siempre sobre este `<div>`.
  const contenedorRef = useRef<HTMLDivElement>(null);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);
  // Existe (`Element.requestFullscreen`) en desktop y en iPad, pero NO en
  // iPhone: Safari en iPhone solo deja entrar a pantalla completa a un
  // `<video>` (`webkitEnterFullscreen`), nunca a un `<div>` — que es
  // justamente lo que se necesita evitar (ver el comentario de arriba). Se
  // detecta una sola vez y, si no hay soporte, directamente no se muestra el
  // botón: uno que no hace nada sería el mismo bug que se está arreglando.
  const [soportaPantallaCompleta] = useState(
    () => typeof document !== 'undefined' && document.fullscreenEnabled === true,
  );

  useEffect(() => {
    const alCambiar = () => {
      setPantallaCompleta(document.fullscreenElement === contenedorRef.current);
    };
    document.addEventListener('fullscreenchange', alCambiar);
    return () => document.removeEventListener('fullscreenchange', alCambiar);
  }, []);

  const alternarPantallaCompleta = () => {
    const el = contenedorRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      // Puede rechazar (poco frecuente) si algo más ya está saliendo: no hay
      // nada más que hacer que dejarlo, no es un error que romper la UI.
      void document.exitFullscreen().catch(() => {});
    } else {
      void el.requestFullscreen?.().catch(() => {});
    }
  };

  // `onCerrar` llega como arrow inline, así que su identidad cambia en cada
  // render del padre. Se guarda en un ref para que el efecto de foco corra UNA
  // vez por apertura: si dependiera de `onCerrar`, cada render volvería a
  // guardar "el elemento previo" (que para entonces ya es el propio diálogo) y
  // el foco nunca volvería a la card.
  const cerrarRef = useRef(onCerrar);
  useEffect(() => { cerrarRef.current = onCerrar; }, [onCerrar]);

  // El nodo real del `<video>` montado ahora mismo (o `null` si se está
  // mirando una foto). `VideoControls` vive AFUERA de `VisorZoom` —si viviera
  // adentro, la barra de progreso se acercaría y se movería con el zoom— así
  // que necesita el nodo por acá, no como `children`.
  const [videoNode, setVideoNode] = useState<HTMLVideoElement | null>(null);
  const asignarVideo = (nodo: HTMLVideoElement | null) => {
    if (nodo) {
      // Fuerza la PROPIEDAD del DOM, no solo el atributo declarativo `muted`
      // de más abajo: React no siempre refleja `muted` en el HTML que sale
      // del servidor (bug conocido de React con `<video>`/`<audio>`), así que
      // sin esto el video podría arrancar audible antes de que React termine
      // de hidratar. El callback ref corre en el commit, antes del pintado.
      nodo.muted = true;
      nodo.defaultMuted = true;
    }
    setVideoNode(nodo);
  };

  // Refs con los últimos valores de navegación, para que el handler de
  // teclado (registrado UNA vez al abrir, más abajo) no quede leyendo props
  // viejas de cuando se montó.
  const navegacionRef = useRef({ unidadAnterior, unidadSiguiente, onNavegar });
  useEffect(() => {
    navegacionRef.current = { unidadAnterior, unidadSiguiente, onNavegar };
  });

  /**
   * Navega a otra unidad SIN cerrar el diálogo.
   *
   * Antes de disparar la navegación se lleva el foco al propio diálogo: los
   * controles del video se REMONTAN al cambiar de unidad (arrancan limpios,
   * sin arrastrar el cuadro ni el punto de reproducción de la unidad
   * anterior — ver el `key` del `<video>` más abajo), así que si el foco
   * seguía en el botón de play o en la barra de progreso, el remount lo tira
   * al `body` y rompe la trampa de foco del diálogo. Asegurarlo ACÁ, antes de
   * que React procese el cambio, lo evita sin importar qué control lo tenía.
   */
  const navegarA = (destino: EleccionUnidad) => {
    if (!onNavegar) return;
    dialogoRef.current?.focus();
    onNavegar(destino);
  };

  // Foco y scroll mientras el diálogo está abierto.
  //
  // Declarar `aria-modal` sin manejar el foco es PEOR que no declararlo: le
  // dice a la tecnología asistiva que lo de atrás está inerte mientras un
  // usuario de teclado sigue tabulando por las cards de la lista. Acá se cierra
  // el círculo entero: foco adentro al abrir, atrapado mientras está abierto,
  // devuelto a la card al cerrar, y el body sin scroll de fondo.
  useEffect(() => {
    const dialogo = dialogoRef.current;
    const previo = document.activeElement as HTMLElement | null;
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogo?.focus();

    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // El propio navegador YA sale de pantalla completa con Escape (es
        // comportamiento nativo del Fullscreen API, nada que programar acá).
        // Si se dejara pasar este Escape además, cerraría TODA la galería de
        // un solo toque —la persona solo pidió salir de la pantalla
        // completa—. Se cierra recién en un Escape posterior, ya afuera.
        if (document.fullscreenElement === contenedorRef.current) return;
        return cerrarRef.current();
      }

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        // El input[type=range] de la barra de progreso del video YA usa las
        // flechas para mover el punto de reproducción cuando tiene el foco:
        // se respeta ese uso y acá no se navega de unidad, para que una
        // flecha no haga dos cosas a la vez.
        const activo = document.activeElement;
        const enBarraDeVideo = activo instanceof HTMLInputElement && activo.type === 'range';
        if (!enBarraDeVideo) {
          const { unidadAnterior: prev, unidadSiguiente: next } = navegacionRef.current;
          if (e.key === 'ArrowLeft' && prev) { e.preventDefault(); navegarA(prev); }
          if (e.key === 'ArrowRight' && next) { e.preventDefault(); navegarA(next); }
        }
        return;
      }

      if (e.key !== 'Tab' || !dialogo) return;

      const focusables = Array.from(dialogo.querySelectorAll<HTMLElement>(FOCUSABLES));
      if (focusables.length === 0) {
        // Sin nada que enfocar adentro, el Tab igual no puede salir.
        e.preventDefault();
        return;
      }
      const primero = focusables[0];
      const ultimo = focusables[focusables.length - 1];
      const activo = document.activeElement;

      // El propio diálogo cuenta como "antes del primero": es donde arranca el
      // foco al abrir, así que un Shift+Tab desde ahí tiene que ir al último.
      if (e.shiftKey && (activo === primero || activo === dialogo)) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && activo === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener('keydown', alTeclear);
    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.body.style.overflow = overflowPrevio;
      // Puede ser un nodo ya desmontado (el refresco tras un 409 rehace la
      // lista): enfocar un nodo suelto es un no-op, no un error.
      previo?.focus?.();
    };
  }, []);

  const verFoto = (indice: number) => {
    // Tocar la foto que ya está en el visor no es un cambio: contarlo infla la
    // métrica de "cuántas fotos mira la gente".
    if (medio.tipo === 'foto' && medio.indice === indice) return;
    setMedio({ tipo: 'foto', indice });
    onCambiarFoto(indice);
  };

  const fotoActual = medio.tipo === 'foto' ? fotos[medio.indice] : undefined;
  // Índice de la foto en pantalla, para el rótulo genérico ("Foto 1", "Foto
  // 2"...). Nunca el `label` del API: ver el comentario de `EleccionFoto`.
  const fotoActualIndice = medio.tipo === 'foto' ? medio.indice : 0;
  const sinMedios = !unidad.video_url && fotos.length === 0;

  const tira = useMemo(
    () => fotos.map((f, i) => ({ ...f, indice: i })),
    [fotos],
  );

  // Qué se está mirando, como una sola cadena. El visor la usa para volver a
  // tamaño original cuando cambia la unidad o el medio: quedarse acercado
  // sobre otra foto deja a la persona mirando un recorte que no pidió.
  //
  // Va como PROP del visor, nunca como `key`: una `key` remontaría el `<video>`
  // y el navegador reiniciaría la reproducción desde cero.
  const claveMedio =
    medio.tipo === 'video'
      ? `${unidad.unit_id}:video`
      : `${unidad.unit_id}:foto:${medio.indice}`;

  return (
    <>
      <div
        onClick={onCerrar}
        aria-hidden="true"
        className="fixed inset-0 z-[9998] bg-[rgba(10,12,30,.5)]"
      />

      <div
        ref={dialogoRef}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        // Enfocable por código (no por Tab): es donde aterriza el foco al abrir
        // (y al navegar a otra unidad, ver `navegarA`).
        tabIndex={-1}
        className="fixed z-[9999] flex flex-col bg-white focus:outline-none text-[#151744] shadow-[0_-10px_40px_rgba(0,0,0,.2)] bottom-0 left-1/2 max-h-[92vh] w-full max-w-[480px] -translate-x-1/2 overflow-y-auto rounded-t-[22px] md:bottom-auto md:top-1/2 md:max-h-[88vh] md:max-w-[1000px] md:-translate-y-1/2 md:rounded-[22px]"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e9e9ef] bg-white px-5 pb-3 pt-[18px]">
          <div className="flex items-center gap-2 text-[19px] font-extrabold">
            {titulo}
            {grado && (
              <span className="rounded-xl bg-[#03DBD0] px-2 py-[3px] text-[10px] font-bold text-[#04413e]">
                {grado}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="h-8 w-8 rounded-full bg-[#f1f1f5] text-[15px] text-[#7a7a88]"
          >
            &#10005;
          </button>
        </div>

        <div className="px-5 pb-6 pt-4 md:grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:gap-6 md:px-6 md:pb-7">
          {/* Columna del medio: el visor grande (con el zoom, los botones de
              anterior/siguiente y el de pantalla completa, todos
              superpuestos) y, debajo, los controles propios del video cuando
              corresponde. `contenedorRef` es lo que entra a pantalla
              completa: incluye los controles del video a propósito, para que
              sigan operables ahí adentro. */}
          <div
            ref={contenedorRef}
            data-testid="visor-contenedor"
            className={
              pantallaCompleta
                ? 'flex h-full w-full flex-col items-center justify-center gap-2 bg-black p-4'
                : undefined
            }
          >
            <div className={`relative w-full ${pantallaCompleta ? 'max-w-4xl' : ''}`}>
              {/* Visor grande: el video por defecto, o la foto que se toque.
                  El zoom vive en `VisorZoom` y es una transformación CSS sobre la
                  capa que envuelve al medio: acá adentro no se toca el `<video>`,
                  porque remontarlo lo reiniciaría desde cero (salvo al cambiar de
                  UNIDAD, que sí lo remonta a propósito — ver su `key`). */}
              <VisorZoom
                activo={!sinMedios}
                reiniciarEn={claveMedio}
                className={
                  pantallaCompleta
                    ? 'h-[70vh] w-full rounded-2xl bg-gradient-to-br from-[#eef0fc] to-[#e6f9f8]'
                    : 'h-[210px] rounded-2xl bg-gradient-to-br from-[#eef0fc] to-[#e6f9f8] md:h-[420px]'
                }
              >
                {medio.tipo === 'video' && unidad.video_url ? (
                  <video
                    // Sí se remonta al cambiar de UNIDAD (no al hacer zoom ni al
                    // cambiar de medio dentro de la misma unidad): es un video
                    // distinto y tiene que arrancar limpio, no seguir reproduciendo
                    // el de la unidad anterior ni mostrar su último cuadro.
                    key={`video:${unidad.unit_id}`}
                    ref={asignarVideo}
                    src={unidad.video_url}
                    // Obligatorio: sin esto, iOS abre el reproductor nativo a
                    // pantalla completa, que trae SUS propios controles —con
                    // volumen incluido— y se pierde todo lo de `VideoControls`.
                    playsInline
                    preload="metadata"
                    // Silenciado a propósito, y SIN control de volumen (ver
                    // `VideoControls`, debajo): la estación de inspección graba
                    // este video EN EL TALLER, y el audio puede traer
                    // conversaciones del equipo de trabajo alrededor del equipo.
                    // No es un descuido si lo ves sin sonido y sin forma de
                    // subirlo: es a propósito, por privacidad.
                    muted
                    aria-label={`Video de la ${titulo}`}
                    onPlay={() => {
                      if (videoYaContado.current) return;
                      videoYaContado.current = true;
                      onReproducirVideo();
                    }}
                    className="h-full w-full object-cover object-[50%_60%]"
                  />
                ) : fotoActual ? (
                  // eslint-disable-next-line @next/next/no-img-element -- URL firmada de S3, sin host fijo para next/image
                  <img
                    src={fotoActual.url}
                    alt={`${titulo} — ${etiquetaFoto(fotoActualIndice)}`}
                    // Mismo criterio de encuadre que la tira de miniaturas de acá
                    // abajo y que la card de la lista (`UnidadCard`): las
                    // grabaciones de la estación de inspección traen pared vacía
                    // arriba y el equipo cae hacia la mitad inferior del cuadro.
                    // `object-cover` (en vez de `object-contain`, que dejaba el
                    // equipo chico y con bandas) hace que el medio grande
                    // acompañe a la tira, que ya recorta; lo que quede fuera del
                    // recuadro se alcanza con el zoom, que es justo para eso.
                    className="h-full w-full object-cover object-[50%_60%]"
                  />
                ) : (
                  <p className="px-6 text-center text-[13px] text-[#5b5c6b]">
                    Todavía no subimos las fotos de esta unidad.
                  </p>
                )}
              </VisorZoom>

              {soportaPantallaCompleta && (
                <button
                  type="button"
                  onClick={alternarPantallaCompleta}
                  aria-label={pantallaCompleta ? 'Salir de pantalla completa' : 'Ver en pantalla completa'}
                  className="absolute left-2 top-2 z-20 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-[#3a3c52] shadow-[0_2px_10px_rgba(10,12,30,.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4654CD]"
                >
                  <svg
                    width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                  >
                    {pantallaCompleta ? (
                      // Achicar: cuatro flechas hacia ADENTRO.
                      <path d="M8 3v3a2 2 0 0 1-2 2H3M16 3v3a2 2 0 0 0 2 2h3M21 16h-3a2 2 0 0 0-2 2v3M3 16h3a2 2 0 0 1 2 2v3" />
                    ) : (
                      // Agrandar: cuatro flechas hacia AFUERA.
                      <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3" />
                    )}
                  </svg>
                </button>
              )}

              {onNavegar && (
                // Comparar es la actividad central de esta pantalla: ir a la
                // unidad siguiente/anterior sin cerrar el diálogo evita perder
                // el hilo —y el zoom, y el punto del video— en cada
                // comparación. NUNCA `disabled` en los extremos, mismo motivo
                // que los botones de zoom de `VisorZoom`: deshabilitar el que
                // tiene el foco lo saca del diálogo. En el límite, el botón no
                // hace nada (`aria-disabled` lo informa igual).
                <>
                  <button
                    type="button"
                    onClick={() => unidadAnterior && navegarA(unidadAnterior)}
                    aria-label="Unidad anterior"
                    aria-disabled={!unidadAnterior}
                    className={`absolute left-2 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[#3a3c52] shadow-[0_2px_10px_rgba(10,12,30,.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4654CD] ${
                      unidadAnterior ? '' : 'opacity-40'
                    }`}
                  >
                    <svg
                      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                    >
                      <path d="M15 6l-6 6 6 6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => unidadSiguiente && navegarA(unidadSiguiente)}
                    aria-label="Unidad siguiente"
                    aria-disabled={!unidadSiguiente}
                    className={`absolute right-2 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[#3a3c52] shadow-[0_2px_10px_rgba(10,12,30,.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4654CD] ${
                      unidadSiguiente ? '' : 'opacity-40'
                    }`}
                  >
                    <svg
                      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                    >
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            <div className={`w-full ${pantallaCompleta ? 'max-w-4xl' : ''}`}>
              <VideoControls video={videoNode} />
            </div>
          </div>

          <div className="md:flex md:flex-col">
            {/* Tira: el video primero (si hay) y después cada foto. */}
            {!sinMedios && (
              <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mt-0 md:flex-wrap md:overflow-visible">
                {unidad.video_url && (
                  <button
                    type="button"
                    onClick={() => setMedio({ tipo: 'video' })}
                    aria-pressed={medio.tipo === 'video'}
                    className={`w-[110px] flex-none rounded-xl border-2 p-1 text-center md:w-[104px] ${
                      medio.tipo === 'video' ? 'border-[#4654CD]' : 'border-transparent'
                    }`}
                  >
                    <span className="grid h-[74px] w-full place-items-center rounded-lg bg-gradient-to-br from-[#eef0fc] to-[#e6f9f8] text-[#4654CD]">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                    <span className="mt-1 block text-[11px] font-semibold text-[#9a9aa8]">Video</span>
                  </button>
                )}

                {tira.map((foto) => (
                  <button
                    key={foto.indice}
                    type="button"
                    onClick={() => verFoto(foto.indice)}
                    aria-pressed={medio.tipo === 'foto' && medio.indice === foto.indice}
                    className={`w-[110px] flex-none rounded-xl border-2 p-1 text-center md:w-[104px] ${
                      medio.tipo === 'foto' && medio.indice === foto.indice
                        ? 'border-[#4654CD]'
                        : 'border-transparent'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- URL firmada de S3, sin host fijo para next/image */}
                    <img
                      src={foto.url}
                      alt={etiquetaFoto(foto.indice)}
                      loading="lazy"
                      className="h-[74px] w-full rounded-lg bg-[#f7f7fb] object-cover"
                    />
                    <span className="mt-1 block truncate text-[11px] font-semibold text-[#9a9aa8]">
                      {etiquetaFoto(foto.indice)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 rounded-2xl bg-[#f7f8fc] p-4 text-[13px] leading-[1.5] text-[#3a3c52]">
              Estas fotos y este video son de <b>esta unidad exacta</b>, no de una
              foto de catálogo. Míralas con calma antes de decidir.
              {!sinMedios && (
                <>
                  {' '}
                  Puedes <b>acercar</b> con los botones del visor, con la rueda del
                  mouse o juntando dos dedos, para revisar los detalles.
                </>
              )}
            </div>

            {error && (
              <p
                role="alert"
                className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-[13px] text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={onElegir}
              disabled={enviando}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4654CD] p-4 text-base font-extrabold text-white shadow-[0_10px_24px_rgba(70,84,205,.35)] disabled:opacity-60 md:mt-auto"
            >
              {!enviando && (
                <svg
                  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
              {enviando ? 'Reservando...' : 'Elegir esta unidad'}
            </button>
            <p className="mt-2.5 text-center text-xs text-[#9a9aa8]">
              Al elegir, reservamos esta unidad para ti.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default GaleriaUnidad;
