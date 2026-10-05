'use client';

/**
 * Aviso "El precio cambió" (BAL-4198).
 *
 * El `/select` compara la cuota total que el cliente vio en la confirmación
 * (`expected_monthly`) contra la que el backend recalcula al aceptar. Si no
 * coinciden responde 409 `price_changed` con la cuota nueva y NO guarda nada.
 * Antes se cobraba la nueva en silencio (matriz D1: modal S/99 → S/110).
 *
 * Dos salidas: confirmar el monto nuevo (reenvía con ese `expected_monthly`) o
 * volver a revisar su pedido.
 */
import { Modal, ModalContent, ModalBody } from '@nextui-org/react';
import { TriangleAlert } from 'lucide-react';

import { OFERTA_COLORS } from './redesign/ofertaTheme';

/** S/ sin decimales cuando la cuota es entera ("110"), con 2 si no ("99.50"). */
export function formatoCuota(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

interface PrecioCambiadoAvisoProps {
  isOpen: boolean;
  /** Cuota total mensual que el backend cobra ahora. */
  nuevaCuota: number;
  /** Cuota total que el cliente estaba viendo (opcional, para contexto). */
  cuotaVista?: number | null;
  confirming?: boolean;
  onConfirmar: () => void;
  onVolver: () => void;
}

export function PrecioCambiadoAviso({
  isOpen,
  nuevaCuota,
  cuotaVista,
  confirming = false,
  onConfirmar,
  onVolver,
}: PrecioCambiadoAvisoProps) {
  const nueva = formatoCuota(nuevaCuota);
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => (confirming ? undefined : onVolver())}
      placement="center"
      size="sm"
      hideCloseButton
      backdrop="opaque"
      isDismissable={!confirming}
      classNames={{
        wrapper: 'z-[201]',
        backdrop: 'z-[200] bg-black/50',
        base: 'bg-white rounded-2xl overflow-hidden mx-4',
        body: 'bg-white p-0',
      }}
    >
      <ModalContent>
        <ModalBody>
          <div className="px-5 py-6 text-center" role="alertdialog" aria-labelledby="precio-cambiado-titulo">
            <div
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: OFERTA_COLORS.lilac }}
            >
              <TriangleAlert className="h-6 w-6" strokeWidth={2.2} style={{ color: OFERTA_COLORS.primary }} />
            </div>
            <h2
              id="precio-cambiado-titulo"
              className="mt-3.5 font-['Baloo_2',_sans-serif] text-[19px] font-bold"
              style={{ color: OFERTA_COLORS.textStrong }}
            >
              El precio cambió: ahora es S/{nueva}/mes
            </h2>
            <p className="mt-1.5 text-[13.5px] leading-[1.5]" style={{ color: OFERTA_COLORS.textMid }}>
              {cuotaVista != null
                ? `Estabas viendo S/${formatoCuota(Math.round(cuotaVista * 100) / 100)}/mes. `
                : ''}
              Todavía no guardamos nada: confirma el monto nuevo o vuelve a revisar tu pedido.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={onConfirmar}
                disabled={confirming}
                className="flex w-full cursor-pointer items-center justify-center rounded-lg py-3.5 text-[15px] font-bold text-white transition-all duration-200 ease-out hover:brightness-95 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-70"
                style={{ backgroundColor: OFERTA_COLORS.primary }}
              >
                {confirming ? 'Procesando…' : `Confirmar S/${nueva}/mes`}
              </button>
              <button
                type="button"
                onClick={onVolver}
                disabled={confirming}
                className="w-full cursor-pointer rounded-lg py-3 text-[14px] font-bold transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ color: OFERTA_COLORS.textMid }}
              >
                Volver
              </button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
