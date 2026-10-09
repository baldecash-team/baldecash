'use client';

/**
 * Aviso "Otro cliente acaba de llevarse este equipo".
 *
 * El `/select` asegura el stock del equipo antes de aceptar. Si era la última
 * unidad y otro cliente la tomó primero, responde 409 `unit_out_of_stock` y NO
 * guarda nada: la oferta y el link siguen vivos. Antes las dos aceptaciones
 * pasaban y una de las dos quedaba aprobada sin equipo que entregar.
 *
 * Una sola salida: elegir otro equipo (el llamador recarga el catálogo de la
 * oferta, donde el agotado ya no aparece).
 */
import { Modal, ModalContent, ModalBody } from '@nextui-org/react';
import { PackageX } from 'lucide-react';

import { OfferApiError } from '../../../services/offerApi';
import { OFERTA_COLORS } from './redesign/ofertaTheme';

/** ¿El error del `/select` es "equipo agotado"? */
export function esEquipoAgotado(err: unknown): boolean {
  return err instanceof OfferApiError && err.reason === 'unit_out_of_stock';
}

interface EquipoAgotadoAvisoProps {
  isOpen: boolean;
  onElegirOtro: () => void;
}

export function EquipoAgotadoAviso({ isOpen, onElegirOtro }: EquipoAgotadoAvisoProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onElegirOtro}
      placement="center"
      size="sm"
      hideCloseButton
      backdrop="opaque"
      isDismissable={false}
      classNames={{
        wrapper: 'z-[201]',
        backdrop: 'z-[200] bg-black/50',
        base: 'bg-white rounded-2xl overflow-hidden mx-4',
        body: 'bg-white p-0',
      }}
    >
      <ModalContent>
        <ModalBody>
          <div className="px-5 py-6 text-center" role="alertdialog" aria-labelledby="equipo-agotado-titulo">
            <div
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: OFERTA_COLORS.lilac }}
            >
              <PackageX className="h-6 w-6" strokeWidth={2.2} style={{ color: OFERTA_COLORS.primary }} />
            </div>
            <h2
              id="equipo-agotado-titulo"
              className="mt-3.5 font-['Baloo_2',_sans-serif] text-[19px] font-bold"
              style={{ color: OFERTA_COLORS.textStrong }}
            >
              Otro cliente acaba de llevarse este equipo
            </h2>
            <p className="mt-1.5 text-[13.5px] leading-[1.5]" style={{ color: OFERTA_COLORS.textMid }}>
              Elige otro de tu oferta. No guardamos nada y tu oferta sigue disponible.
            </p>
            <div className="mt-5">
              <button
                type="button"
                onClick={onElegirOtro}
                className="flex w-full cursor-pointer items-center justify-center rounded-lg py-3.5 text-[15px] font-bold text-white transition-all duration-200 ease-out hover:brightness-95 active:scale-[.98]"
                style={{ backgroundColor: OFERTA_COLORS.primary }}
              >
                Ver otros equipos
              </button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
