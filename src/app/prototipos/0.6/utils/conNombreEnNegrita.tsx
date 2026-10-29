import React from 'react';
import { NEGRITA } from './textoSegunVinculo';

/**
 * Dibuja la etiqueta con el nombre del familiar en negrita
 * («Celular de <strong>tu mamá</strong>»). Lo que no trae la marca sale igual.
 * Va dentro de un solo <span>: las etiquetas son `flex` con `gap` y, sueltas,
 * cada parte sería un hijo aparte (espacio de más y sin el espacio normal).
 */
export function conNombreEnNegrita(texto: React.ReactNode): React.ReactNode {
  if (typeof texto !== 'string' || !texto.includes(NEGRITA)) return texto;
  return (
    <span>
      {texto.split(NEGRITA).map((parte, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-bold">
            {parte}
          </strong>
        ) : (
          parte
        ),
      )}
    </span>
  );
}
