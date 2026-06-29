'use client';

/**
 * Modal "¿confirmas tu elección?" antes de registrar la elección de un equipo
 * (Caso 4). Estilo inspirado en el modal "Detalle del Financiamiento" del
 * detalle de producto: header con fondo de marca + ícono, resumen del equipo.
 *
 * Elegir es una acción importante: consume el link y registra la selección.
 */
import { Modal, ModalContent, ModalBody, ModalFooter, Button } from '@nextui-org/react';
import { ShoppingBag, X, AlertTriangle } from 'lucide-react';

export interface EquipoAConfirmar {
  name: string;
  brand?: string;
  imageUrl?: string;
  monthly?: number;
  term?: number;
}

export function ConfirmarEleccionModal({
  isOpen,
  equipo,
  loading,
  onConfirm,
  onClose,
}: {
  isOpen: boolean;
  equipo: EquipoAConfirmar | null;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      size="md"
      hideCloseButton
      backdrop="opaque"
      classNames={{
        wrapper: 'z-[101]',
        backdrop: 'z-[100] bg-black/50',
        base: 'bg-[var(--surface,#fff)] rounded-2xl overflow-hidden',
        body: 'bg-[var(--surface,#fff)] p-0',
        footer: 'bg-[var(--surface,#fff)]',
      }}
    >
      <ModalContent>
        {/* Header con fondo de marca (estilo "Detalle del Financiamiento") */}
        <div className="flex items-center gap-3 bg-[var(--color-primary)] px-5 py-4">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
            <ShoppingBag className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-white">¿Confirmas tu elección?</h2>
            <p className="text-xs text-white/60">Estás a un paso de elegir tu equipo</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex h-7 w-7 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>

        <ModalBody>
          <div className="px-5 py-4">
            {/* Resumen del equipo */}
            {equipo ? (
              <div className="rounded-xl bg-[rgba(var(--color-primary-rgb),0.05)] p-4">
                <div className="flex items-center gap-4">
                  {equipo.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={equipo.imageUrl} alt={equipo.name} className="h-16 w-16 shrink-0 object-contain" />
                  ) : (
                    <div className="h-16 w-16 shrink-0 rounded-lg bg-gray-200" />
                  )}
                  <div className="min-w-0">
                    {equipo.brand ? (
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{equipo.brand}</p>
                    ) : null}
                    <p className="text-sm font-semibold text-[var(--text-strong,#111827)]">{equipo.name}</p>
                  </div>
                </div>

                {equipo.monthly ? (
                  <div className="mt-4 flex items-center justify-between border-t border-[rgba(var(--color-primary-rgb),0.12)] pt-3">
                    <span className="text-sm text-[var(--text-muted,#4b5563)]">Cuota mensual</span>
                    <span className="text-xl font-bold text-[var(--color-primary)]">
                      Desde S/{Math.round(equipo.monthly)}
                      <span className="text-sm font-normal text-[var(--text-muted,#4b5563)]">/mes</span>
                    </span>
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Aviso */}
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Esta acción registrará tu elección y no podrás cambiarla.</span>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="bordered" onPress={onClose} isDisabled={loading} className="cursor-pointer">
            Cancelar
          </Button>
          <Button
            onPress={onConfirm}
            isLoading={loading}
            className="cursor-pointer font-bold text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Sí, elegir este equipo
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
