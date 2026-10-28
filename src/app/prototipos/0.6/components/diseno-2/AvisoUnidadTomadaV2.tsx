'use client';

/**
 * «Ese equipo ya no está disponible» en Diseño 2 (BAL-5203, punto 10): el
 * mismo aviso que `ModalAviso` muestra en Diseño 1 cuando la unidad quedó
 * tomada al enviar, sobre el modal base del kit (`ModalV2`).
 *
 * El botón LLEVA al catálogo, y cerrar (X, Escape, fondo o arrastre) también:
 * quedarse en un formulario que no se va a poder enviar no sirve.
 */

import React from 'react';
import { PackageX } from 'lucide-react';
import { BOTON_PRIMARIO_V2, ModalV2 } from './ModalV2';

export interface AvisoUnidadTomadaV2Props {
  /** El mensaje del backend; `null` = cerrado. */
  mensaje: string | null;
  onElegirOtro: () => void;
}

export function AvisoUnidadTomadaV2({ mensaje, onElegirOtro }: AvisoUnidadTomadaV2Props) {
  return (
    <ModalV2
      abierto={!!mensaje}
      onCerrar={onElegirOtro}
      icono={PackageX}
      titulo="Ese equipo ya no está disponible"
      subtitulo="Elige otro equipo para continuar"
      ancho="chico"
      datos={{ 'data-unidad-tomada-v2': true }}
      pie={
        <button type="button" onClick={onElegirOtro} className={`${BOTON_PRIMARIO_V2} flex-1 md:flex-none`}>
          Elegir otro equipo
        </button>
      }
    >
      <p className="text-sm text-[var(--d2-texto-2)]">{mensaje}</p>
    </ModalV2>
  );
}

export default AvisoUnidadTomadaV2;
