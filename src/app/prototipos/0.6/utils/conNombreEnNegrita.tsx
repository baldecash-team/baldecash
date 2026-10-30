import React from 'react';
import { NEGRITA } from './textoSegunVinculo';
import { useCamposV2 } from '@/app/prototipos/0.6/components/diseno-2/campos/estilosV2';

/**
 * Clase del nombre del familiar. En Diseño 2 la etiqueta ya es negrita entera
 * (`ETIQUETA_V2`), así que la negrita sola no lo hacía sobresalir: ahí va
 * además en el morado de marca (`--color-primary-text`, el primary legible
 * sobre blanco que LayoutContext recalcula por landing). Pedido de Brenda,
 * BAL-5360. Diseño 1 sigue igual: negrita sin color.
 */
export const NOMBRE_FAMILIAR_D1 = 'font-bold';
export const NOMBRE_FAMILIAR_D2 = 'font-bold text-[var(--color-primary-text)]';

/** El nombre del familiar: lee si está dentro de los campos de Diseño 2. */
function NombreDelFamiliar({ children }: { children: React.ReactNode }) {
  const v2 = useCamposV2();
  return (
    <strong className={v2 ? NOMBRE_FAMILIAR_D2 : NOMBRE_FAMILIAR_D1} data-nombre-familiar="">
      {children}
    </strong>
  );
}

/**
 * Dibuja la etiqueta con el nombre del familiar en negrita
 * («Celular de <strong>tu mamá</strong>»), y en Diseño 2 además en morado.
 * Lo que no trae la marca sale igual.
 * Va dentro de un solo <span>: las etiquetas son `flex` con `gap` y, sueltas,
 * cada parte sería un hijo aparte (espacio de más y sin el espacio normal).
 */
export function conNombreEnNegrita(texto: React.ReactNode): React.ReactNode {
  if (typeof texto !== 'string' || !texto.includes(NEGRITA)) return texto;
  return (
    <span>
      {texto.split(NEGRITA).map((parte, i) =>
        i % 2 === 1 ? <NombreDelFamiliar key={i}>{parte}</NombreDelFamiliar> : parte,
      )}
    </span>
  );
}
