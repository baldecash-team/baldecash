'use client';

/**
 * Contenido de un desplegable de Diseño 2 que se anima al abrir Y al cerrar
 * (BAL-4959, pedido de Emilio). Antes el contenido se desmontaba de golpe al
 * cerrar: el cierre era instantáneo.
 *
 * - La altura se anima con `grid-template-rows: 0fr → 1fr` (el hijo con
 *   `overflow: hidden` y `min-height: 0`), sin `max-height` fijo.
 * - El contenido hace `opacity 0 → 1` y `translateY(-4px) → 0`.
 * - Abrir: `PLEGABLE_ABRIR` (240 ms); cerrar: `PLEGABLE_CERRAR` (200 ms).
 * - Al cerrar, el contenido sigue montado hasta que termina la transición
 *   (`onTransitionEnd`, con un temporizador de respaldo) y recién ahí se
 *   desmonta. La caja con el `id` queda siempre en el DOM (con `hidden`
 *   cerrada), así el `aria-controls` del botón nunca apunta a la nada.
 * - Con `prefers-reduced-motion` no hay animación: abre y cierra de una.
 */

import React, { useEffect, useRef, useState } from 'react';
import { PLEGABLE_ABRIR, PLEGABLE_CERRAR, useMenosMovimiento } from './movimiento';

export interface PlegableV2Props extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  abierto: boolean;
  id: string;
  children: React.ReactNode;
  /** Clases de la caja de afuera (bordes, márgenes). */
  className?: string;
  /** Clases del contenido (lo que se desvanece y se desliza). */
  classNameContenido?: string;
  /** Ref al contenido (para hacer scroll hasta él al abrir). */
  contenidoRef?: React.Ref<HTMLDivElement>;
}

export function PlegableV2({
  abierto,
  id,
  children,
  className = '',
  classNameContenido = '',
  contenidoRef,
  style,
  ...resto
}: PlegableV2Props) {
  const menos = useMenosMovimiento();
  // `montado`: el contenido está en el DOM. `desplegado`: 1fr (lo que anima).
  const [montado, setMontado] = useState(abierto);
  const [desplegado, setDesplegado] = useState(abierto);
  const respaldo = useRef<number | null>(null);

  useEffect(() => {
    const limpiar = () => {
      if (respaldo.current !== null) {
        window.clearTimeout(respaldo.current);
        respaldo.current = null;
      }
    };
    limpiar();
    if (abierto) {
      setMontado(true);
      if (menos) {
        setDesplegado(true);
        return limpiar;
      }
      // Un cuadro con 0fr ya montado y recién ahí 1fr: si no, no hay transición.
      let segundo = 0;
      const primero = requestAnimationFrame(() => {
        segundo = requestAnimationFrame(() => setDesplegado(true));
      });
      return () => {
        cancelAnimationFrame(primero);
        cancelAnimationFrame(segundo);
        limpiar();
      };
    }
    setDesplegado(false);
    if (menos) {
      setMontado(false);
      return limpiar;
    }
    // Respaldo por si `transitionend` no llega (pestaña oculta, sin layout).
    respaldo.current = window.setTimeout(() => setMontado(false), PLEGABLE_CERRAR.ms + 80);
    return limpiar;
  }, [abierto, menos]);

  // Al abrir, el contenido entra al DOM en el MISMO render (no un render
  // después): así quien lo abrió puede enfocarlo en su efecto.
  const enDom = abierto || montado;
  const t = abierto ? PLEGABLE_ABRIR : PLEGABLE_CERRAR;
  const transicion = menos ? 'none' : undefined;

  const alTerminar = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || e.propertyName !== 'grid-template-rows') return;
    if (!abierto) {
      if (respaldo.current !== null) window.clearTimeout(respaldo.current);
      respaldo.current = null;
      setMontado(false);
    }
  };

  return (
    <div
      id={id}
      hidden={!enDom}
      data-plegable-v2={enDom ? (desplegado ? 'abierto' : 'moviendo') : 'cerrado'}
      onTransitionEnd={alTerminar}
      className={className}
      style={{
        ...style,
        display: enDom ? 'grid' : 'none',
        gridTemplateRows: desplegado ? '1fr' : '0fr',
        transition: transicion ?? `grid-template-rows ${t.ms}ms ${t.curva}`,
      }}
      {...resto}
    >
      <div style={{ overflow: 'hidden', minHeight: 0 }}>
        {enDom && (
          <div
            ref={contenidoRef}
            className={classNameContenido}
            style={{
              opacity: desplegado ? 1 : 0,
              transform: desplegado ? 'none' : 'translateY(-4px)',
              transition: transicion ?? `opacity ${t.ms}ms ${t.curva}, transform ${t.ms}ms ${t.curva}`,
            }}
          >
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

export default PlegableV2;
