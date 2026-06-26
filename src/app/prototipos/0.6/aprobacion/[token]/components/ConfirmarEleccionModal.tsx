'use client';

/**
 * Modal "¿estás seguro?" antes de registrar la elección de un equipo (Caso 4).
 * Elegir es una acción importante: consume el link y registra la selección.
 */
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';
import { AlertTriangle } from 'lucide-react';

export interface EquipoAConfirmar {
  name: string;
  brand?: string;
  imageUrl?: string;
  monthly?: number;
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
      backdrop="opaque"
      classNames={{
        wrapper: 'z-[101]',
        backdrop: 'z-[100] bg-black/50',
        base: 'bg-[var(--surface,#fff)] rounded-2xl',
        header: 'bg-[var(--surface,#fff)]',
        body: 'bg-[var(--surface,#fff)]',
        footer: 'bg-[var(--surface,#fff)]',
        closeButton: 'top-3 right-3 hover:bg-gray-100 rounded-lg cursor-pointer',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <span className="text-lg font-bold text-[var(--foreground)]">¿Confirmas tu elección?</span>
        </ModalHeader>
        <ModalBody>
          {equipo ? (
            <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
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
                <p className="truncate text-sm font-semibold text-[var(--foreground)]">{equipo.name}</p>
                {equipo.monthly ? (
                  <p className="mt-0.5 text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                    Desde S/{Math.round(equipo.monthly)}/mes
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Esta acción registrará tu elección y no podrás cambiarla.</span>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="bordered" onPress={onClose} isDisabled={loading}>
            Cancelar
          </Button>
          <Button
            onPress={onConfirm}
            isLoading={loading}
            className="font-bold text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Sí, elegir este equipo
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
