'use client';

/**
 * DeferredDeliveryModal — Aviso informativo al dar "Lo quiero" sobre un equipo
 * con entrega diferida (taggeado en BD). Muestra la fecha estimada de entrega y
 * pide confirmar antes de continuar (agregar al carrito o pasar a solicitud).
 *
 * Compartido entre el card del catálogo y el detalle del producto.
 */

import React from 'react';
import { Modal, ModalContent, ModalBody, Button } from '@nextui-org/react';
import { Truck, CalendarClock } from 'lucide-react';
import {
  formatShippingDate,
  formatLocationTimes,
  type DeferredDelivery,
} from '@/app/prototipos/0.6/utils/deferredDelivery';

interface DeferredDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Continuar (agregar al carrito / pasar a solicitud). */
  onConfirm: () => void;
  /** Datos de entrega diferida. */
  deferredDelivery?: DeferredDelivery | null;
  /** Nombre del producto (para personalizar el mensaje). */
  productName?: string;
}

export const DeferredDeliveryModal: React.FC<DeferredDeliveryModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  deferredDelivery,
  productName,
}) => {
  const shippingDate = formatShippingDate(deferredDelivery?.estimatedFrom ?? null);
  const locationTimes = formatLocationTimes(
    deferredDelivery?.limaDaysMin ?? null,
    deferredDelivery?.limaDaysMax ?? null,
    deferredDelivery?.provinciaDaysMin ?? null,
    deferredDelivery?.provinciaDaysMax ?? null,
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      backdrop="blur"
      placement="center"
      classNames={{
        // z-[9999] y no z-[100]: los botones flotantes del catálogo
        // ("¿Necesitas ayuda?", comparar) viven en z-[100], así que empataban
        // con el modal y quedaban ENCIMA del backdrop —se veían nítidos sobre
        // la página atenuada—. Es el nivel que ya usan Cronograma,
        // Certificaciones y SimilarProducts en el detalle.
        wrapper: 'z-[9999]',
        backdrop: 'bg-black/50 backdrop-blur-sm z-[9998]',
        base: 'bg-white rounded-2xl shadow-2xl border border-neutral-200 mx-4',
        body: 'p-0',
        closeButton: 'top-4 right-4 hover:bg-neutral-100 rounded-lg cursor-pointer',
      }}
    >
      <ModalContent>
        <ModalBody className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-[rgba(var(--color-primary-rgb),0.1)] flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6 text-[var(--color-primary)]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-800">Entrega programada</h2>
              <p className="text-sm text-[var(--color-primary)] font-medium">Confirma antes de continuar</p>
            </div>
          </div>

          {/* Intro */}
          <p className="text-sm text-neutral-600 mb-4">
            {productName ? (
              <><span className="font-semibold text-neutral-800">{productName}</span> tiene entrega programada. </>
            ) : (
              <>El equipo que elegiste tiene entrega programada. </>
            )}
            Te llegará en la fecha estimada:
          </p>

          {/* Fecha de envío + tiempos por ubicación */}
          <div className="flex items-center gap-3 bg-[rgba(var(--color-primary-rgb),0.05)] border border-[rgba(var(--color-primary-rgb),0.15)] rounded-xl px-4 py-3 mb-6">
            <CalendarClock className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0" />
            <div>
              {shippingDate && (
                <p className="text-base font-bold text-neutral-800 leading-tight">
                  Se envía desde {shippingDate}
                </p>
              )}
              {locationTimes && (
                <p className="text-xs text-neutral-500 mt-0.5">{locationTimes}</p>
              )}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex gap-2">
            <Button
              size="lg"
              variant="bordered"
              className="flex-1 border-neutral-300 text-neutral-600 font-semibold cursor-pointer hover:bg-neutral-50 rounded-xl"
              onPress={onClose}
            >
              Cancelar
            </Button>
            <Button
              size="lg"
              className="flex-1 bg-[var(--color-primary)] text-white font-bold cursor-pointer hover:brightness-90 rounded-xl"
              onPress={() => {
                onConfirm();
                onClose();
              }}
            >
              Entendido, continuar
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default DeferredDeliveryModal;
