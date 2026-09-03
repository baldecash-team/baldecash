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
 * - Mobile: bottom-sheet, como el diseño aprobado. El visor es CUADRADO (el
 *   medio se graba 1:1) y los controles del video van superpuestos: en una
 *   pantalla chica cada bloque que no es el equipo se paga en recorte.
 * - Desktop: diálogo centrado en dos columnas — el video grande a la
 *   izquierda, las fotos y el detalle a la derecha.
 *
 * SÍ hay daños estéticos por unidad (`DanosDeLaUnidad`), y son SOLO los daños:
 * quien llega acá ya eligió modelo, así que repetirle procesador y RAM le hace
 * scrollear por lo único que ya sabe. Lo que NO hay son marcas dibujadas sobre
 * la imagen: eso exigiría coordenadas, y lo que Airtable tiene es "qué parte y
 * qué tan fuerte", no dónde. Y NUNCA se muestra el serial — el cliente ve
 * "Unidad 01" (`display_number`), que es lo único que el backend manda.
 *
 * El video NO usa los controles nativos del navegador (ver `VideoControls`):
 * esos siempre traen volumen, y el audio de este video puede traer
 * conversaciones del equipo de trabajo del taller. Silenciarlo por defecto no
 * alcanzaba porque el volumen quedaba a un click — con controles propios el
 * volumen directamente no existe como opción. El botón de ver en grande
 * (`expandido`) es un overlay CSS propio, no el Fullscreen API: ese API no
 * existe para un `<div>` en iPhone, y colgar el botón de él lo dejaba
 * invisible justo en el dispositivo donde más falta hace. Donde el API sí
 * existe se pide además, best-effort, y SIEMPRE sobre el CONTENEDOR (visor +
 * controles), nunca sobre el `<video>`: pedirlo sobre el `<video>` es lo que
 * hace que varios navegadores móviles devuelvan sus controles nativos —con
 * volumen— por encima.
 *
 * Al reemplazar los controles nativos, esta pantalla también se quedó con la
 * responsabilidad de avisar cuando el video NO se puede reproducir (Sentry
 * BALDECASH3-57): todos los videos de inspección son WebM/VP9, y el soporte
 * de eso en Safari de iPhone es limitado — ahí es esperable que ninguno
 * reproduzca. `errorVideo`, más abajo, cubre las dos formas en que eso llega:
 * el rechazo de `play()` (capturado en `VideoControls`, vía
 * `onErrorReproduccion`) y el evento `error` nativo del `<video>` (que puede
 * disparar solo, sin que nadie haya tocado play). Ninguno de los dos
 * remonta el `<video>` — perdería el punto de reproducción de la unidad—: el
 * mensaje se superpone encima.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { EleccionDefecto, EleccionUnidad } from '../../services/eleccionEquipoApi';
import { etiquetaFoto, etiquetaGrado, nombreUnidad } from './formato';
import { VideoControls } from './VideoControls';
import { VisorZoom } from './VisorZoom';

/**
 * Ancho del visor en modo expandido.
 *
 * El medio es cuadrado, así que el lado no lo puede mandar solo el ancho de la
 * ventana: en un teléfono acostado `92vw` daría un cuadrado más alto que la
 * pantalla. Se toma el menor de los dos —ancho disponible y alto disponible—
 * y el `aspect-square` del marco hace el resto.
 */
const ANCHO_EXPANDIDO = 'max-w-[min(92vw,72vh)]';

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
  /**
   * Pinta el grado al lado del título. `false` cuando TODAS las unidades del
   * link comparten grado (lo normal: en ws2 cada grado es un producto
   * distinto, y el link cuelga del producto de la solicitud) — ahí el grado ya
   * encabeza la página y repetirlo por unidad sugiere una diferencia que no
   * existe.
   */
  mostrarGrado?: boolean;
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
  unidadAnterior = null, unidadSiguiente = null, onNavegar, mostrarGrado = true,
}: GaleriaUnidadProps) {
  const titulo = nombreUnidad(unidad.display_number);
  const grado = mostrarGrado
    ? etiquetaGrado(unidad.grado, unidad.grado_label)
    : '';
  const fotos = unidad.photos;

  const [medio, setMedio] = useState<Medio>(() =>
    unidad.video_url ? { tipo: 'video' } : { tipo: 'foto', indice: 0 },
  );
  // El `video_play` se emite una sola vez por apertura: el navegador dispara
  // `play` también al salir de una pausa, y contarlas todas convertiría la
  // métrica de "cuántos miran el video" en "cuántos manotean la barra".
  const videoYaContado = useRef(false);

  // El video no se pudo reproducir: fuente no soportada (VP9/WebM en Safari
  // de iPhone es el caso real — ver Sentry BALDECASH3-57), rechazo de
  // `play()` que no fue un `AbortError` benigno, o el evento `error` nativo
  // del elemento (una fuente inválida puede fallar sin que nadie haya
  // apretado play, p. ej. al resolver el `preload="metadata"`). Antes esto lo
  // cubrían los controles nativos del navegador, que muestran su propio
  // estado de error; al reemplazarlos por los propios (`VideoControls`) esa
  // responsabilidad quedó acá.
  const [errorVideo, setErrorVideo] = useState(false);

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
    // El error es de ESTA unidad: la de al lado puede reproducir perfecto.
    setErrorVideo(false);
  }

  const dialogoRef = useRef<HTMLDivElement>(null);

  // Contenedor que se expande: el visor + sus botones + los controles del
  // video, NUNCA el `<video>` solo. Pedirle pantalla completa al `<video>` es
  // lo que el navegador (sobre todo en varios móviles) usa como gancho para
  // devolver SUS controles nativos —con volumen— por encima de todo esto.
  const contenedorRef = useRef<HTMLDivElement>(null);

  // Expandir es un ESTADO NUESTRO, no el Fullscreen API.
  //
  // Antes colgaba de `document.fullscreenEnabled`, y en iPhone eso es SIEMPRE
  // `false`: Safari de iPhone solo deja entrar a pantalla completa a un
  // `<video>` (`webkitEnterFullscreen`), nunca a un `<div>` — que es
  // justamente lo que hay que evitar. Resultado: en el dispositivo donde más
  // falta hace (pantalla chica, hay que encontrar un rayón) el botón ni
  // siquiera se dibujaba, y así llegó el reporte de "no funciona en mobile".
  //
  // Ahora el modo expandido es un overlay CSS (`fixed inset-0`), que funciona
  // en TODOS los navegadores, y el Fullscreen API queda como un extra
  // best-effort donde existe: en desktop además esconde el chrome del
  // navegador; donde no existe, no se pierde nada.
  const [expandido, setExpandido] = useState(false);
  // Si el pedido nativo fue aceptado. Sin esto, el `fullscreenchange` de
  // cualquier OTRO elemento de la página apagaría nuestro overlay.
  const fullscreenPedido = useRef(false);

  const salirDeExpandido = useCallback(() => {
    setExpandido(false);
    if (fullscreenPedido.current) {
      fullscreenPedido.current = false;
      // Puede rechazar (poco frecuente) si algo más ya está saliendo: no hay
      // nada más que hacer, y el overlay ya se apagó igual.
      void document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const alCambiar = () => {
      // El navegador salió por su cuenta (Escape, F11, gesto del sistema): el
      // overlay tiene que acompañar, o queda un modo expandido que la persona
      // ya pidió cerrar.
      if (fullscreenPedido.current && document.fullscreenElement == null) {
        fullscreenPedido.current = false;
        setExpandido(false);
      }
    };
    document.addEventListener('fullscreenchange', alCambiar);
    return () => document.removeEventListener('fullscreenchange', alCambiar);
  }, []);

  const alternarExpandido = () => {
    if (expandido) {
      salirDeExpandido();
      return;
    }
    setExpandido(true);
    const el = contenedorRef.current;
    // Best-effort: donde el Fullscreen API existe se gana, además, esconder el
    // chrome del navegador. Donde no (iPhone), el overlay ya hizo el trabajo.
    if (el?.requestFullscreen) {
      void el
        .requestFullscreen()
        .then(() => {
          fullscreenPedido.current = true;
        })
        .catch(() => {});
    }
  };

  // `onCerrar` llega como arrow inline, así que su identidad cambia en cada
  // render del padre. Se guarda en un ref para que el efecto de foco corra UNA
  // vez por apertura: si dependiera de `onCerrar`, cada render volvería a
  // guardar "el elemento previo" (que para entonces ya es el propio diálogo) y
  // el foco nunca volvería a la card.
  const cerrarRef = useRef(onCerrar);
  useEffect(() => { cerrarRef.current = onCerrar; }, [onCerrar]);

  // Mismo motivo que `cerrarRef`: el handler de teclado se registra una sola
  // vez al abrir, así que no puede leer `expandido` del closure.
  const expandidoRef = useRef(expandido);
  useEffect(() => { expandidoRef.current = expandido; });

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
        // Estando expandido, el Escape sale del visor grande y NO cierra toda
        // la galería: la persona solo pidió volver del visor, no perder la
        // unidad que estaba mirando. Se cierra recién en un Escape posterior.
        // (Cuando además hubo pantalla completa nativa, el navegador ya salió
        // por su cuenta con este mismo Escape; `salirDeExpandido` es
        // idempotente, así que no hay doble salida.)
        if (expandidoRef.current) {
          salirDeExpandido();
          return;
        }
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
    // `salirDeExpandido` es estable (`useCallback` sin dependencias): está acá
    // para el lint, no cambia que este efecto corra UNA vez por apertura.
  }, [salirDeExpandido]);

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
              expandido
                ? 'fixed inset-0 z-[10000] flex flex-col items-center justify-center gap-2 bg-black p-3'
                : undefined
            }
          >
            <div className={`relative w-full ${expandido ? ANCHO_EXPANDIDO : ''}`}>
              {/* Visor grande: el video por defecto, o la foto que se toque.
                  El zoom vive en `VisorZoom` y es una transformación CSS sobre la
                  capa que envuelve al medio: acá adentro no se toca el `<video>`,
                  porque remontarlo lo reiniciaría desde cero (salvo al cambiar de
                  UNIDAD, que sí lo remonta a propósito — ver su `key`). */}
              <VisorZoom
                activo={!sinMedios}
                reiniciarEn={claveMedio}
                // CUADRADO en mobile, y no por gusto: la estación de
                // inspección graba 1:1 a propósito (`ASPECT_RATIO = 1` en
                // `useKioskRecorder`), así que un marco de alto fijo recorta
                // el equipo. Los 210px de antes daban ~1.7:1 en un teléfono
                // —se veía el 60% del cuadro, cortado arriba y abajo— y en
                // desktop ~1.3:1, que es lo que hacía que el mismo medio se
                // viera bien en una pantalla y recortado en la otra. De paso,
                // acercar dentro de una franja de 210px no servía de nada.
                className={
                  expandido
                    ? 'aspect-square rounded-2xl bg-gradient-to-br from-[#eef0fc] to-[#e6f9f8]'
                    : 'aspect-square rounded-2xl bg-gradient-to-br from-[#eef0fc] to-[#e6f9f8] md:aspect-auto md:h-[420px]'
                }
              >
                {medio.tipo === 'video' && unidad.video_url ? (
                  // El `div` envolvente es SOLO para poder superponer el
                  // mensaje de error sobre el video sin tocarlo: no es un
                  // remontaje ni cambia el árbol del `<video>` en sí (sigue
                  // siendo el mismo nodo, con el mismo `key`), así que no
                  // reinicia la reproducción.
                  <div className="relative h-full w-full">
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
                        // Si venía de un error (p. ej. reintentó y esta vez sí
                        // cargó), el mensaje ya no aplica.
                        setErrorVideo(false);
                        if (videoYaContado.current) return;
                        videoYaContado.current = true;
                        onReproducirVideo();
                      }}
                      // El evento `error` nativo es la OTRA mitad de este bug
                      // (ver Sentry BALDECASH3-57): una fuente inválida puede
                      // fallar sin que nadie haya llamado a `play()` —al
                      // resolver el `preload="metadata"`, por ejemplo—, así
                      // que capturar solo el rechazo de `play()` (en
                      // `VideoControls`) no alcanza.
                      onError={() => setErrorVideo(true)}
                      // Centrado, igual que las fotos: la estación graba el
                      // equipo en el medio del cuadro 1:1.
                      className="h-full w-full object-cover object-center"
                    />
                    {errorVideo && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-[#151744]/92 px-6 text-center">
                        <p className="text-[13px] leading-[1.5] text-white">
                          Este video no se puede reproducir en tu dispositivo.
                          {fotos.length > 0 && (
                            <>
                              {' '}
                              Puedes revisar las <b>fotos</b> de esta unidad para
                              ver el equipo.
                            </>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                ) : fotoActual ? (
                  // eslint-disable-next-line @next/next/no-img-element -- URL firmada de S3, sin host fijo para next/image
                  <img
                    src={fotoActual.url}
                    alt={`${titulo} — ${etiquetaFoto(fotoActualIndice)}`}
                    // Mismo criterio de encuadre que la tira de miniaturas de acá
                    // abajo y que la card de la lista (`UnidadCard`): CENTRADO.
                    // El equipo viene centrado en el cuadro 1:1 de la estación,
                    // así que el 60% vertical de antes cortaba el borde de
                    // arriba de la pantalla y mostraba la base del plato.
                    // `object-cover` (en vez de `object-contain`, que dejaba el
                    // equipo chico y con bandas) hace que el medio grande
                    // acompañe a la tira, que ya recorta; lo que quede fuera del
                    // recuadro se alcanza con el zoom, que es justo para eso.
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <p className="px-6 text-center text-[13px] text-[#5b5c6b]">
                    Todavía no subimos las fotos de esta unidad.
                  </p>
                )}
              </VisorZoom>

              {/* SIEMPRE visible: ya no cuelga de `document.fullscreenEnabled`
                  (ver el comentario de `expandido`), que en iPhone es false y
                  dejaba la pantalla sin el botón justo donde más falta hace. */}
              {(
                <button
                  type="button"
                  onClick={alternarExpandido}
                  aria-label={expandido ? 'Salir de pantalla completa' : 'Ver en pantalla completa'}
                  className="absolute left-2 top-2 z-20 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-[#3a3c52] shadow-[0_2px_10px_rgba(10,12,30,.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4654CD]"
                >
                  <svg
                    width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                  >
                    {expandido ? (
                      // Achicar: cuatro flechas hacia ADENTRO.
                      <path d="M8 3v3a2 2 0 0 1-2 2H3M16 3v3a2 2 0 0 0 2 2h3M21 16h-3a2 2 0 0 0-2 2v3M3 16h3a2 2 0 0 1 2 2v3" />
                    ) : (
                      // Agrandar: cuatro flechas hacia AFUERA.
                      <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3" />
                    )}
                  </svg>
                </button>
              )}

              {/* Controles del video, SUPERPUESTOS abajo del visor en mobile.
                  Como bloque aparte se comían ~58px (barra + margen) de una
                  pantalla donde el visor es lo único que importa; encima
                  quedaban lejos del video, separados por el borde del marco.
                  En desktop, donde el espacio sobra, siguen debajo del visor
                  como bloque propio (`md:static`), que se lee mejor.

                  Siguen siendo los controles PROPIOS: la barra se mueve de
                  lugar, no vuelve a `<video controls>` — el volumen no puede
                  existir (ver `VideoControls`). */}
              {medio.tipo === 'video' && unidad.video_url && (
                <div className="absolute inset-x-0 bottom-0 z-20 px-2 pb-2 md:static md:mt-2.5 md:px-0 md:pb-0">
                  <VideoControls
                    video={videoNode}
                    onErrorReproduccion={() => setErrorVideo(true)}
                  />
                </div>
              )}
            </div>

            {onNavegar && (
              // Comparar es la actividad central de esta pantalla, pero con
              // chevrons flotando SOBRE el visor —el mismo dibujo y el mismo
              // lugar que los de un carrusel de fotos— nadie entendía que
              // estaba cambiando de UNIDAD (feedback de la demo). Acá la
              // navegación es una fila propia, afuera del visor, que dice a
              // dónde va cada botón ("Unidad 01") y en cuál se está parado.
              // De paso el visor se descongestiona: en mobile llegaron a
              // convivir seis botones flotantes sobre 350px de ancho.
              //
              // NUNCA `disabled` en los extremos, mismo motivo que los botones
              // de zoom de `VisorZoom`: deshabilitar el que tiene el foco lo
              // saca del diálogo. En el límite el botón no hace nada
              // (`aria-disabled` lo informa igual).
              <div
                className={`mt-2.5 flex w-full items-center justify-between gap-2 ${
                  expandido ? ANCHO_EXPANDIDO : ''
                }`}
              >
                <BotonUnidad
                  hacia="anterior"
                  destino={unidadAnterior}
                  onClick={() => unidadAnterior && navegarA(unidadAnterior)}
                />
                <span
                  className={`flex-none rounded-full px-3 py-1 text-[12px] font-extrabold ${
                    expandido ? 'bg-white/12 text-white' : 'bg-[#EEF0FC] text-[#4654CD]'
                  }`}
                >
                  {titulo}
                </span>
                <BotonUnidad
                  hacia="siguiente"
                  destino={unidadSiguiente}
                  onClick={() => unidadSiguiente && navegarA(unidadSiguiente)}
                />
              </div>
            )}
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
                    <span className="grid aspect-square w-full place-items-center rounded-lg bg-gradient-to-br from-[#eef0fc] to-[#e6f9f8] text-[#4654CD]">
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
                      // Cuadrada, igual que el visor grande y por el mismo
                      // motivo: el medio se graba 1:1 y un recuadro apaisado
                      // le corta la mitad al equipo.
                      className="aspect-square w-full rounded-lg bg-[#f7f7fb] object-cover"
                    />
                    <span className="mt-1 block truncate text-[11px] font-semibold text-[#9a9aa8]">
                      {etiquetaFoto(foto.indice)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <DanosDeLaUnidad defectos={unidad.defectos} />

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

/**
 * Los daños estéticos de ESTA unidad.
 *
 * Lo que se muestra son los daños, NO las especificaciones: quien llega a esta
 * pantalla ya eligió modelo, y repetirle procesador y RAM le hace scrollear por
 * lo único que ya sabe. Lo que no sabe —y lo único que distingue una unidad de
 * la de al lado, que es de su mismo modelo y su mismo grado— es dónde tiene las
 * marcas.
 *
 * Los tres estados del dato son distintos y ninguno se puede aplanar:
 *
 * - `undefined`/`null` — nadie lo evaluó (Airtable no respondió cuando se creó
 *   la inspección, o la inspección es anterior al snapshot). NO se dibuja nada:
 *   "sin daños" sería una afirmación que no se puede sostener, y sobre un
 *   equipo reacondicionado es exactamente la afirmación equivocada.
 * - `[]` — se evaluó y está limpio. Eso SÍ se afirma, y es lo que hace que
 *   alguien se decida entre dos unidades del mismo grado.
 * - con elementos — la lista, con el nivel tal como lo cargó logística.
 *
 * El nivel se pinta en un chip NEUTRO a propósito. Colorearlo (rojo "grave",
 * ámbar "leve") exigiría conocer el vocabulario completo de Airtable, y un
 * valor nuevo caería en el color del default — diciéndole al cliente algo que
 * nadie decidió.
 *
 * La lista va PLEGADA, porque una unidad con las nueve casillas cargadas
 * empujaba el botón de elegir fuera de pantalla. Plegar no puede volverse
 * esconder: la cabecera —lo único visible sin abrir— dice cuántas marcas hay
 * y cuántas son severas, así que la existencia y la gravedad se leen sin
 * tocar nada, y lo que queda adentro es el detalle de cada una. El caso "sin
 * daños" NO se pliega: es una sola línea y es justamente la que conviene
 * leer de una.
 */
function DanosDeLaUnidad({ defectos }: { defectos?: EleccionDefecto[] | null }) {
  if (defectos == null) return null;

  if (defectos.length === 0) {
    return (
      <div className="mt-4 flex items-start gap-2 rounded-2xl bg-[#e7faf3] p-4 text-[13px] leading-[1.5] text-[#0a8a5a]">
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
          className="mt-[2px] flex-none"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
        <span>
          Revisamos esta unidad y <b>no le encontramos daños estéticos</b>.
        </span>
      </div>
    );
  }

  // El RESUMEN va en la cabecera, y no es decorativo: este bloque arranca
  // plegado, así que lo único que se lee sin abrirlo es esta línea. Tiene que
  // alcanzar para saber que la unidad TIENE marcas y qué tan serias son —si
  // dijera solo "Marcas de esta unidad", plegarlo sería esconderle al cliente
  // justo el dato que distingue una unidad de la de al lado.
  //
  // `startsWith('sever')` cubre "Severa"/"Severo" sin castillos: el
  // vocabulario de Airtable es abierto y un valor nuevo simplemente no suma
  // al conteo de severas, en vez de romper. Mismo criterio que el chip
  // neutro de cada fila: no se colorea lo que no se conoce entero.
  const severas = defectos.filter((d) =>
    (d.nivel ?? '').trim().toLowerCase().startsWith('sever'),
  ).length;
  const resumen = [
    `${defectos.length} ${defectos.length === 1 ? 'marca' : 'marcas'}`,
    severas ? `${severas} ${severas === 1 ? 'severa' : 'severas'}` : '',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    // `<details>` nativo, no un `useState`: se abre con teclado y con lector
    // de pantalla sin que haya que cablear `aria-expanded`, y el contenido
    // sigue en el DOM plegado (los tests lo encuentran igual).
    <details className="group mt-4 rounded-2xl border border-[#ffe0b2] bg-[#fff8ef] p-4 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4654CD]">
        <span className="text-[13px] font-extrabold text-[#151744]">
          Marcas de esta unidad
        </span>
        <span className="flex flex-none items-center gap-2">
          <span className="rounded-full bg-white px-2 py-[3px] text-[11px] font-bold text-[#8a6a3a]">
            {resumen}
          </span>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
            className="text-[#8a6a3a] transition-transform group-open:rotate-180 motion-reduce:transition-none"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </summary>
      <ul className="mt-3 flex flex-col gap-1.5">
        {defectos.map((d, i) => (
          <li
            key={`${d.etiqueta}-${i}`}
            className="flex items-center justify-between gap-3 text-[13px] leading-[1.4] text-[#3a3c52]"
          >
            <span className="min-w-0">{d.etiqueta}</span>
            {d.nivel && (
              <span className="flex-none rounded-full bg-white px-2 py-[3px] text-[11px] font-bold text-[#8a6a3a]">
                {d.nivel}
              </span>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-2.5 text-[12px] leading-[1.4] text-[#8a6a3a]">
        Míralas en el video y las fotos de arriba: son de esta unidad.
      </p>
    </details>
  );
}

/**
 * Un paso de la navegación entre unidades.
 *
 * Lleva el NOMBRE de la unidad de destino, no una flecha muda: el reporte de
 * la demo fue que con chevrons no se entendía que se estaba cambiando de
 * unidad. En el extremo (sin destino) queda con la palabra genérica y
 * `aria-disabled`, nunca `disabled` — ver el comentario de arriba.
 */
function BotonUnidad({
  hacia,
  destino,
  onClick,
}: {
  hacia: 'anterior' | 'siguiente';
  destino: EleccionUnidad | null;
  onClick: () => void;
}) {
  const esAnterior = hacia === 'anterior';
  const flecha = (
    <svg
      width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      className="flex-none"
    >
      <path d={esAnterior ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
    </svg>
  );

  return (
    <button
      type="button"
      onClick={onClick}
      // El `aria-label` no cambia con el destino: es la ACCIÓN, y las pruebas
      // y la tecnología asistiva la nombran así.
      aria-label={esAnterior ? 'Unidad anterior' : 'Unidad siguiente'}
      aria-disabled={!destino}
      className={`flex min-w-0 flex-1 items-center gap-1.5 rounded-xl border border-[#e9e9ef] bg-white px-2.5 py-2 text-[12px] font-bold text-[#3a3c52] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4654CD] ${
        esAnterior ? 'justify-start' : 'justify-end'
      } ${destino ? '' : 'opacity-40'}`}
    >
      {esAnterior && flecha}
      <span className="truncate">
        {destino ? nombreUnidad(destino.display_number) : esAnterior ? 'Anterior' : 'Siguiente'}
      </span>
      {!esAnterior && flecha}
    </button>
  );
}

export default GaleriaUnidad;
