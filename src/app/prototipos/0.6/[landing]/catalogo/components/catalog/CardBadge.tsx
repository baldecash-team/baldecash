'use client';

/**
 * CardBadge v0.6 — Badge base de las tarjetas del catálogo.
 *
 * Existe para que los badges apilados en la esquina de la card (condición,
 * grado, tags del producto) compartan UNA escala. Antes cada uno traía sus
 * propias clases y quedaban con alturas distintas: "Semi nuevo" 14px, "Oferta"
 * 19px y "Grado X" en un tercer valor, los tres pegados en la misma esquina
 * (BAL-3202).
 *
 * El color NO se define acá: cada badge lo trae de su fuente (facet de
 * condiciones, `productTagsConfig`, etc.). Este componente fija tamaño,
 * padding, radio y peso tipográfico.
 */

import React from 'react';

/**
 * Escala compartida. Cambiar acá cambia TODOS los badges de la card.
 *
 * `self-start` no es decorativo: los badges se apilan dentro de un contenedor
 * flex en columna, y ahí el `align-items` por defecto es `stretch`. Sin esto,
 * cada badge se estiraba al ancho del MAS LARGO de la pila --medido: «Oferta»
 * salia con los mismos 83px que «Semi Nuevo», con el color relleno hasta el
 * borde--. `inline-flex` por si solo no alcanza: como hijo de un flex, el que
 * manda es el contenedor.
 */
export const CARD_BADGE_CLASS =
  'inline-flex self-start items-center px-2.5 py-1 rounded-md shadow-sm text-xs font-bold leading-none whitespace-nowrap';

interface CardBadgeProps {
  children: React.ReactNode;
  /** Color de fondo. Lo decide quien usa el badge, no este componente. */
  backgroundColor: string;
  /** Color del texto. Por defecto blanco, que es lo que usan los fondos sólidos. */
  color?: string;
  className?: string;
}

export const CardBadge: React.FC<CardBadgeProps> = ({
  children,
  backgroundColor,
  color = '#ffffff',
  className = '',
}) => (
  <span
    className={`${CARD_BADGE_CLASS}${className ? ` ${className}` : ''}`}
    style={{ backgroundColor, color }}
  >
    {children}
  </span>
);

export default CardBadge;
