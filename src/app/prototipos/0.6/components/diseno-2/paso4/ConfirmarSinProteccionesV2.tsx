'use client';

/**
 * Paso 4 de Diseño 2 (BAL-4966): los planes de seguro no cargaron y la
 * persona tiene protecciones elegidas. Enviar así mandaría la solicitud SIN
 * ellas, así que el botón de enviar no lo hace en silencio: pregunta.
 *
 * - "Reintentar": vuelve a pedir los planes (la selección sigue guardada).
 * - "Enviar sin protecciones": recién ahí se suelta la selección y se envía.
 * - Cerrar: no pasa nada; la selección sigue y no se envía.
 *
 * BAL-5276 (punto 5): cada decisión queda en `insurance_skip_confirm`
 * (`decision`: `enviar_sin` | `reintentar` | `cerrar`). Diseño 1 no tiene este
 * aviso: su página de seguros envía sin preguntar.
 */

import React from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { textoDeElegidas } from './ProteccionesV2';
import { BOTON_PRIMARIO_V2, BOTON_SECUNDARIO_V2, ModalV2, type MotivoCierreV2 } from '../ModalV2';
import { useEventTrackerOptional } from '@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext';

export type DecisionSinProtecciones = 'enviar_sin' | 'reintentar' | 'cerrar';

export interface ConfirmarSinProteccionesV2Props {
  isOpen: boolean;
  /** Cuántas protecciones tiene elegidas. */
  elegidas: number;
  onClose: () => void;
  onReintentar: () => void;
  onEnviarSinProtecciones: () => void;
}

/** Sobre `ModalV2` (BAL-5203, punto 10): el estándar de modales de Diseño 2. */
export function ConfirmarSinProteccionesV2({
  isOpen,
  elegidas,
  onClose,
  onReintentar,
  onEnviarSinProtecciones,
}: ConfirmarSinProteccionesV2Props) {
  const tracker = useEventTrackerOptional();
  const registrar = (decision: DecisionSinProtecciones, motivo?: MotivoCierreV2) =>
    tracker?.track('insurance_skip_confirm', {
      decision,
      ...(motivo ? { motivo_cierre: motivo } : {}),
      elegidas,
      diseno: 2,
    });
  return (
    <ModalV2
      abierto={isOpen}
      onCerrar={(motivo) => {
        registrar('cerrar', motivo);
        onClose();
      }}
      icono={AlertTriangle}
      titulo="¿Enviar sin tus protecciones?"
      subtitulo="Revisa antes de enviar tu solicitud"
      idTitulo="confirmar-sin-protecciones-titulo"
      ancho="chico"
      pie={
        <div className="flex w-full flex-col gap-2 sm:flex-row-reverse md:w-auto">
          <button type="button" onClick={() => { registrar('reintentar'); onReintentar(); }} className={`${BOTON_PRIMARIO_V2} sm:flex-1 md:flex-none`}>
            <RotateCw className="h-4 w-4" aria-hidden />
            Reintentar
          </button>
          <button type="button" onClick={() => { registrar('enviar_sin'); onEnviarSinProtecciones(); }} className={`${BOTON_SECUNDARIO_V2} sm:flex-1 md:flex-none`}>
            Enviar sin protecciones
          </button>
        </div>
      }
    >
      <p className="text-sm text-[var(--d2-texto-suave)]">
        No pudimos cargar las protecciones, así que tu solicitud saldría sin las que elegiste (
        {textoDeElegidas(elegidas)}). Puedes reintentar o enviarla sin ellas.
      </p>
    </ModalV2>
  );
}

export default ConfirmarSinProteccionesV2;
