'use client';

/**
 * Paso 4 de Diseño 2 (BAL-4966): los planes de seguro no cargaron y la
 * persona tiene protecciones elegidas. Enviar así mandaría la solicitud SIN
 * ellas, así que el botón de enviar no lo hace en silencio: pregunta.
 *
 * - "Reintentar": vuelve a pedir los planes (la selección sigue guardada).
 * - "Enviar sin protecciones": recién ahí se suelta la selección y se envía.
 * - Cerrar: no pasa nada; la selección sigue y no se envía.
 */

import React from 'react';
import { Modal, ModalContent, ModalBody } from '@nextui-org/react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { textoDeElegidas } from './ProteccionesV2';

export interface ConfirmarSinProteccionesV2Props {
  isOpen: boolean;
  /** Cuántas protecciones tiene elegidas. */
  elegidas: number;
  onClose: () => void;
  onReintentar: () => void;
  onEnviarSinProtecciones: () => void;
}

export function ConfirmarSinProteccionesV2({
  isOpen,
  elegidas,
  onClose,
  onReintentar,
  onEnviarSinProtecciones,
}: ConfirmarSinProteccionesV2Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      backdrop="blur"
      placement="center"
      aria-labelledby="confirmar-sin-protecciones-titulo"
      classNames={{
        // Mismo z-index que los otros modales del flujo (los flotantes van en z-[100]).
        wrapper: 'z-[9999]',
        backdrop: 'bg-black/50 backdrop-blur-sm z-[9998]',
        base: 'bg-white rounded-2xl shadow-2xl border border-neutral-200 mx-4',
        body: 'p-0',
        closeButton: 'top-4 right-4 hover:bg-neutral-100 rounded-lg cursor-pointer',
      }}
    >
      <ModalContent>
        <ModalBody className="p-6">
          <div className="mb-3 flex items-center gap-3 pr-8">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100" aria-hidden>
              <AlertTriangle className="h-6 w-6 text-amber-700" />
            </span>
            <h2 id="confirmar-sin-protecciones-titulo" className="text-lg font-bold text-[#1E2230]">
              ¿Enviar sin tus protecciones?
            </h2>
          </div>
          <p className="mb-5 text-sm text-[#5B6275]">
            No pudimos cargar las protecciones, así que tu solicitud saldría sin las que elegiste (
            {textoDeElegidas(elegidas)}). Puedes reintentar o enviarla sin ellas.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <button
              type="button"
              onClick={onReintentar}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 text-sm font-bold text-white cursor-pointer hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
            >
              <RotateCw className="h-4 w-4" aria-hidden />
              Reintentar
            </button>
            <button
              type="button"
              onClick={onEnviarSinProtecciones}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border-[1.5px] border-neutral-300 bg-white px-4 text-sm font-semibold text-[#3A4052] cursor-pointer hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
            >
              Enviar sin protecciones
            </button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default ConfirmarSinProteccionesV2;
