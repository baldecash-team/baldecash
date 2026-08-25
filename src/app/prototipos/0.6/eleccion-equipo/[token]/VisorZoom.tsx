'use client';

/**
 * Visor con zoom para el medio grande de la galería (el video y las fotos de
 * la unidad).
 *
 * POR QUÉ EXISTE: los equipos son reacondicionados y la promesa de la pantalla
 * es "mirá el equipo que te vas a llevar antes de aceptarlo". En el recuadro
 * del video un rayón fino simplemente no se ve, así que sin acercar la persona
 * elige a ciegas igual. Esto es la diferencia entre ver y revisar.
 *
 * LA REGLA QUE MANDA SOBRE TODO LO DEMÁS: el video NO se puede reiniciar ni
 * pausar al hacer zoom. Por eso acá NO se toca el elemento de medio: el zoom es
 * una transformación CSS sobre una capa que lo envuelve. Consecuencias
 * concretas de esa regla en el diseño de este componente:
 *
 * 1. El estado del zoom vive ACÁ, no en la galería. Así la galería no
 *    re-renderiza al acercar y el `children` que le pasa (el `<video>`) llega
 *    como el MISMO elemento de React entre renders: React ni siquiera lo
 *    recorre. Si el estado viviera arriba, cada zoom re-crearía ese elemento.
 * 2. El marco y la capa transformada se renderizan SIEMPRE, nunca dentro de un
 *    condicional. Un `{zoom > 1 && <div>...}` alrededor del medio lo cambiaría
 *    de padre al acercar y el navegador reiniciaría la reproducción desde cero.
 * 3. `reiniciarEn` es una PROP, no una `key`. Volver a 1x es un efecto, no un
 *    remontaje: usarla como `key` sería exactamente el bug que se quiere
 *    evitar.
 *
 * SOBRE EL VIDEO: el `<video>` NO tiene controles nativos (ver
 * `VideoControls`, afuera de este componente) — así que acá no hay que
 * repartirse el click con el navegador. En tamaño original el gesto de un
 * dedo pasa de largo (nada que capturar: los controles propios viven afuera
 * del marco); recién acercado el marco se queda con el puntero para
 * desplazar. El doble click SÍ acerca sobre el video, igual que sobre una
 * foto — antes se ignoraba ahí porque los controles nativos ya usaban ese
 * gesto (pantalla completa) y el click suelto pausaba; sin controles nativos
 * ese conflicto ya no existe.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';

/** Tamaño original: por debajo no se baja (no es un visor de "alejar"). */
const ESCALA_MIN = 1;
/** Más que esto ya es pixelar por pixelar: el detalle no aparece, el ruido sí. */
const ESCALA_MAX = 4;
/** Salto de los botones. Tres toques llegan al máximo. */
const ESCALA_PASO = 1.6;
/** A dónde lleva el doble click: cerca, pero todavía con contexto alrededor. */
const ESCALA_DOBLE_CLICK = 2.5;

interface Transformacion {
  escala: number;
  /** Desplazamiento en px de la capa, ya aplicado el zoom. */
  x: number;
  y: number;
}

const INICIAL: Transformacion = { escala: 1, x: 0, y: 0 };

interface Punto {
  x: number;
  y: number;
}

const distancia = (a: Punto, b: Punto) => Math.hypot(a.x - b.x, a.y - b.y);

export interface VisorZoomProps {
  /** El medio a mirar: el `<video>` o la `<img>`. Nunca se lo toca. */
  children: ReactNode;
  /**
   * Cuando este valor cambia, el visor vuelve a 1x. Sirve para "cambió la
   * unidad" o "cambió el medio". Es una prop y NO una `key`: pasarla como
   * `key` remontaría el medio y reiniciaría el video.
   */
  reiniciarEn?: string | number;
  /** `false` cuando no hay nada que mirar: sin controles y sin gestos. */
  activo?: boolean;
  /** Clases del marco (alto, fondo, bordes). El marco recorta el zoom. */
  className?: string;
}

export function VisorZoom({
  children,
  reiniciarEn,
  activo = true,
  className = '',
}: VisorZoomProps) {
  const marcoRef = useRef<HTMLDivElement>(null);
  const capaRef = useRef<HTMLDivElement>(null);
  const [transformacion, setTransformacion] = useState<Transformacion>(INICIAL);

  // Espejo síncrono del estado. Los handlers de puntero llegan muchas veces por
  // segundo y encadenan un cálculo sobre el anterior; leer del `useState` les
  // daría el valor del render pasado a mitad de un pinch.
  const actual = useRef<Transformacion>(INICIAL);

  const fijar = useCallback((next: Transformacion) => {
    actual.current = next;
    setTransformacion(next);
  }, []);

  // Hay una sincronización con React pedida para el próximo cuadro (ver
  // `pintar`). Evita apilar un `requestAnimationFrame` por cada evento del
  // gesto: con esto se pide como mucho uno por cuadro.
  const sincronizacionPedida = useRef(false);

  const sincronizarConReact = useCallback(() => {
    sincronizacionPedida.current = false;
    setTransformacion(actual.current);
  }, []);

  /**
   * Pinta la transformación DIRECTO sobre el nodo del DOM, sin pasar por
   * `setState` en cada evento.
   *
   * POR QUÉ: la rueda y el pinch disparan decenas de eventos por segundo: si
   * cada uno provocara un render de React (reconciliación completa de este
   * componente), el trabajo se acumula cuadro a cuadro y el gesto se siente
   * pegado al dedo, con retraso — es la causa real de que el zoom se sintiera
   * "poco responsivo": no había ninguna `transition` de CSS de por medio (se
   * buscó y no hay), era puramente esto. Acá se escribe el estilo YA (lo que
   * se ve responde en el mismo cuadro del evento) y se pide UNA sola
   * sincronización de React por cuadro, para que el estado — usado por el
   * indicador de escala y por el estilo `cursor-grab` — no se quede atrás más
   * de un frame. Los gestos DISCRETOS (botones, doble click) siguen usando
   * `fijar` de una: no hay ráfaga de eventos que batchear ahí.
   */
  const pintar = useCallback((next: Transformacion) => {
    actual.current = next;
    const capa = capaRef.current;
    if (capa) {
      capa.style.transform = `translate(${next.x}px, ${next.y}px) scale(${next.escala})`;
    }
    if (!sincronizacionPedida.current) {
      sincronizacionPedida.current = true;
      requestAnimationFrame(sincronizarConReact);
    }
  }, [sincronizarConReact]);

  /**
   * Encierra la transformación dentro de lo razonable: la escala entre sus
   * límites y el desplazamiento tal que la capa NUNCA deje un hueco dentro del
   * marco. A escala `e` la capa mide `e` veces el marco, así que sobra
   * `(e-1)/2` de cada lado y ese es todo el desplazamiento que se permite.
   */
  const limitar = useCallback((escala: number, x: number, y: number): Transformacion => {
    const e = Math.min(ESCALA_MAX, Math.max(ESCALA_MIN, escala));
    const marco = marcoRef.current;
    const maxX = ((marco?.clientWidth ?? 0) * (e - 1)) / 2;
    const maxY = ((marco?.clientHeight ?? 0) * (e - 1)) / 2;
    return {
      escala: e,
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    };
  }, []);

  /** Pasa una coordenada de pantalla a un offset desde el centro del marco. */
  const desdeElCentro = useCallback((clientX: number, clientY: number): Punto => {
    const caja = marcoRef.current?.getBoundingClientRect();
    if (!caja) return { x: 0, y: 0 };
    return {
      x: clientX - (caja.left + caja.width / 2),
      y: clientY - (caja.top + caja.height / 2),
    };
  }, []);

  /**
   * Acerca o aleja dejando quieto el punto (cx, cy) —el del cursor o el del
   * medio entre los dos dedos—. Sin esto, el zoom siempre saldría del centro y
   * el rayón que la persona está mirando se le escapa del marco.
   *
   * El punto de la imagen que hoy está bajo (cx, cy) es `(cx - x) / escala`;
   * para que siga ahí con la escala nueva, el desplazamiento tiene que pasar a
   * `cx - f * (cx - x)`, con `f` la razón entre la escala nueva y la vieja.
   */
  const acercarHacia = useCallback(
    (
      escalaPedida: number,
      cx: number,
      cy: number,
      // 'gesto': viene de un evento que se repite muchas veces por segundo
      // (rueda, pinch) y usa `pintar` (directo al DOM). 'inmediato' (default):
      // acción discreta (botones, doble click), pasa por React de una.
      modo: 'inmediato' | 'gesto' = 'inmediato',
    ) => {
      const previa = actual.current;
      const escala = Math.min(ESCALA_MAX, Math.max(ESCALA_MIN, escalaPedida));
      const f = escala / previa.escala;
      const next = limitar(escala, cx - f * (cx - previa.x), cy - f * (cy - previa.y));
      if (modo === 'gesto') pintar(next); else fijar(next);
    },
    [fijar, pintar, limitar],
  );

  const acercar = useCallback(
    () => acercarHacia(actual.current.escala * ESCALA_PASO, 0, 0),
    [acercarHacia],
  );
  const alejar = useCallback(
    () => acercarHacia(actual.current.escala / ESCALA_PASO, 0, 0),
    [acercarHacia],
  );
  const restablecer = useCallback(() => fijar(INICIAL), [fijar]);

  // Volver a 1x cuando cambia la unidad o el medio.
  //
  // Se ajusta DURANTE el render (el patrón de React para "cambió un prop") y no
  // en un efecto: con un efecto habría un cuadro intermedio mostrando la foto
  // nueva todavía acercada y desplazada. Al cerrar la galería el componente se
  // desmonta, así que ese caso se resuelve solo.
  const [claveVista, setClaveVista] = useState(reiniciarEn);
  if (claveVista !== reiniciarEn) {
    setClaveVista(reiniciarEn);
    setTransformacion(INICIAL);
  }

  // El espejo síncrono no se puede escribir durante el render, así que se
  // sincroniza acá. Entre ese render y este efecto no corre ningún gesto, y los
  // gestos escriben el espejo ellos mismos (por `fijar`) para no depender de
  // este ciclo.
  useEffect(() => {
    actual.current = transformacion;
  }, [transformacion]);

  // Rueda del mouse / trackpad.
  //
  // Va como listener nativo y no como `onWheel` porque React registra `wheel`
  // en modo pasivo: el `preventDefault()` de un handler de React sería un no-op
  // y la página de atrás scrollearía igual mientras la persona acerca.
  useEffect(() => {
    const marco = marcoRef.current;
    if (!marco || !activo) return;

    const alRodar = (e: WheelEvent) => {
      e.preventDefault();
      const centro = desdeElCentro(e.clientX, e.clientY);
      // Exponencial: cada paso multiplica, así que acercar y alejar el mismo
      // tramo devuelve exactamente al mismo lugar. El factor subió de 0.0016 a
      // 0.0026 (antes se sentía "que no hace nada" con una sola muesca del
      // mouse); 'gesto' porque la rueda dispara muchos eventos seguidos.
      acercarHacia(actual.current.escala * Math.exp(-e.deltaY * 0.0026), centro.x, centro.y, 'gesto');
    };

    marco.addEventListener('wheel', alRodar, { passive: false });
    return () => marco.removeEventListener('wheel', alRodar);
  }, [activo, acercarHacia, desdeElCentro]);

  // ── Gestos de puntero (dedo, mouse y lápiz por la misma puerta) ────────────

  /** Punteros apoyados ahora mismo, para distinguir arrastre de pinch. */
  const punteros = useRef(new Map<number, Punto>());
  /** Distancia entre los dos dedos en el cuadro anterior del pinch. */
  const pinchPrevio = useRef<number | null>(null);
  /** Última posición del dedo que arrastra (`null` = no se está arrastrando). */
  const arrastre = useRef<Punto | null>(null);
  /**
   * Hubo un gesto que movió algo. Sirve para tragarse el `click` que el
   * navegador dispara al soltar: sin esto, terminar un arrastre o un pinch se
   * contaría como un tap suelto sobre el marco (o el arranque de un doble
   * click de zoom que la persona no pidió).
   */
  const huboGesto = useRef(false);

  const alBajarPuntero = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!activo) return;
    if (punteros.current.size === 0) huboGesto.current = false;
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (punteros.current.size === 2) {
      // Empieza un pinch: se abandona cualquier arrastre en curso.
      arrastre.current = null;
      const [a, b] = Array.from(punteros.current.values());
      pinchPrevio.current = distancia(a, b);
      e.preventDefault();
      return;
    }

    // Un dedo: solo se secuestra si ya está acercado. En tamaño original el
    // gesto pasa de largo: no hay nada que capturar ahí (los controles
    // propios del video viven AFUERA del marco, en `VideoControls`).
    if (punteros.current.size === 1 && actual.current.escala > ESCALA_MIN) {
      arrastre.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
      e.currentTarget.setPointerCapture?.(e.pointerId);
    }
  };

  const alMoverPuntero = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!punteros.current.has(e.pointerId)) return;
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (punteros.current.size >= 2 && pinchPrevio.current !== null) {
      const [a, b] = Array.from(punteros.current.values());
      const ahora = distancia(a, b);
      if (pinchPrevio.current > 0 && ahora > 0) {
        const centro = desdeElCentro((a.x + b.x) / 2, (a.y + b.y) / 2);
        // 'gesto': el pinch dispara un `pointermove` por cada micro-cambio de
        // distancia entre los dos dedos — pintar directo, no por React.
        acercarHacia(actual.current.escala * (ahora / pinchPrevio.current), centro.x, centro.y, 'gesto');
        huboGesto.current = true;
      }
      pinchPrevio.current = ahora;
      return;
    }

    if (arrastre.current) {
      const dx = e.clientX - arrastre.current.x;
      const dy = e.clientY - arrastre.current.y;
      if (dx === 0 && dy === 0) return;
      arrastre.current = { x: e.clientX, y: e.clientY };
      const previa = actual.current;
      // Mismo motivo que el pinch: un `pointermove` de arrastre dispara
      // muchas veces por segundo, así que se pinta directo (`pintar`) y no se
      // pasa por `setState` en cada uno.
      pintar(limitar(previa.escala, previa.x + dx, previa.y + dy));
      huboGesto.current = true;
    }
  };

  const alSoltarPuntero = (e: ReactPointerEvent<HTMLDivElement>) => {
    punteros.current.delete(e.pointerId);
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (punteros.current.size < 2) pinchPrevio.current = null;
    if (punteros.current.size === 0) {
      arrastre.current = null;
      // Cierra el gesto: el estado de React se pone al día YA, sin esperar el
      // próximo cuadro — para que un click inmediato después (el propio
      // `click` fantasma que se traga `alHacerClickCaptura`, o un toque a los
      // botones de zoom) vea la escala real y no una desactualizada.
      setTransformacion(actual.current);
    }
  };

  /**
   * Se traga el click con el que el navegador cierra un arrastre o un pinch.
   * Va en fase de captura para que no llegue a los hijos: sin esto, soltar el
   * dedo después de mover la imagen se leería como un tap suelto.
   */
  const alHacerClickCaptura = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!huboGesto.current) return;
    huboGesto.current = false;
    e.preventDefault();
    e.stopPropagation();
  };

  const alDobleClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!activo) return;
    // Antes acá se ignoraba el doble click sobre el `<video>` porque los
    // controles NATIVOS del navegador ya usaban ese gesto (pantalla completa)
    // y el click suelto pausaba. Con controles propios (`VideoControls`,
    // afuera de este marco) el `<video>` no tiene ningún comportamiento propio
    // de click: el doble click queda libre para acercar, igual que en una foto.

    if (actual.current.escala > ESCALA_MIN) {
      restablecer();
      return;
    }
    const centro = desdeElCentro(e.clientX, e.clientY);
    acercarHacia(ESCALA_DOBLE_CLICK, centro.x, centro.y);
  };

  const acercado = transformacion.escala > ESCALA_MIN;

  return (
    <div
      ref={marcoRef}
      data-testid="visor-marco"
      // `touch-none` (touch-action: none) es lo que evita que el pinch scrollee
      // o haga zoom a la página de atrás en vez de acercar el equipo. Solo
      // mientras hay medio: si no, el bloque quedaría inerte al tacto sin motivo.
      className={`relative overflow-hidden ${activo ? 'touch-none' : ''} ${
        acercado ? 'cursor-grab' : ''
      } ${className}`}
      onPointerDown={alBajarPuntero}
      onPointerMove={alMoverPuntero}
      onPointerUp={alSoltarPuntero}
      onPointerCancel={alSoltarPuntero}
      onPointerLeave={alSoltarPuntero}
      onClickCapture={alHacerClickCaptura}
      onDoubleClick={alDobleClick}
    >
      <div
        ref={capaRef}
        data-testid="visor-capa"
        data-escala={transformacion.escala.toFixed(2)}
        className="grid h-full w-full place-items-center will-change-transform"
        style={{
          transform: `translate(${transformacion.x}px, ${transformacion.y}px) scale(${transformacion.escala})`,
        }}
      >
        {children}
      </div>

      {activo && (
        // Los gestos no alcanzan: no todo el mundo puede hacer pinch, y con
        // teclado no hay gesto ninguno. Estos botones son la única forma en que
        // el zoom existe para esas personas.
        <div
          role="group"
          aria-label="Zoom del equipo"
          className="absolute right-2 top-2 z-10 flex items-center gap-0.5 rounded-full bg-white/95 p-1 shadow-[0_2px_10px_rgba(10,12,30,.18)]"
        >
          {acercado && (
            <span aria-hidden="true" className="px-1.5 text-[11px] font-bold text-[#4654CD]">
              {transformacion.escala.toFixed(1)}&times;
            </span>
          )}
          <BotonZoom etiqueta="Alejar" onClick={alejar}>
            <path d="M5 12h14" />
          </BotonZoom>
          <BotonZoom etiqueta="Acercar" onClick={acercar}>
            <path d="M12 5v14M5 12h14" />
          </BotonZoom>
          <BotonZoom etiqueta="Ver en tamaño original" onClick={restablecer}>
            <path d="M9 4H5a1 1 0 0 0-1 1v4M15 4h4a1 1 0 0 1 1 1v4M9 20H5a1 1 0 0 1-1-1v-4M15 20h4a1 1 0 0 0 1-1v-4" />
          </BotonZoom>
        </div>
      )}
    </div>
  );
}

function BotonZoom({
  etiqueta,
  onClick,
  children,
}: {
  etiqueta: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      // Nunca `disabled` en los extremos: si el foco está en "Alejar" cuando
      // llega a 1x, deshabilitarlo tira el foco fuera del diálogo y rompe la
      // trampa de foco de la galería. En el límite el botón no hace nada.
      onClick={onClick}
      aria-label={etiqueta}
      title={etiqueta}
      className="grid h-8 w-8 place-items-center rounded-full text-[#3a3c52] hover:bg-[#f1f1f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4654CD]"
    >
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {children}
      </svg>
    </button>
  );
}

export default VisorZoom;
