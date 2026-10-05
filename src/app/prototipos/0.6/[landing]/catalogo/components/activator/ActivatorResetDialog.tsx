'use client';

import React from 'react';
import { Modal, ModalContent, Button } from '@nextui-org/react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import { useIsMobile } from '@/app/prototipos/_shared';

export interface ActivatorResetDialogProps {
  isOpen: boolean;
  /** Confirm in flight: disables both actions and shows the spinner. */
  isBusy: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const NOTICE_TEXT =
  'Se cerrará el acceso actual y volverá a aparecer la pantalla de ingreso de DNI para el siguiente cliente.';

/** Shared content between the desktop modal and the mobile bottom sheet. */
function ActivatorResetDialogContent({
  isBusy,
  onConfirm,
  onClose,
}: {
  isBusy: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="bg-white p-5">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50">
          <RotateCcw className="h-4 w-4 text-amber-600" />
        </div>
        <span className="text-lg font-semibold text-neutral-800 font-['Baloo_2']">
          ¿Cerrar la sesión actual?
        </span>
      </div>

      <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <span>{NOTICE_TEXT}</span>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="light"
          onPress={onClose}
          isDisabled={isBusy}
          className="h-11 cursor-pointer text-neutral-500"
        >
          Cancelar
        </Button>
        <Button
          onPress={onConfirm}
          isLoading={isBusy}
          isDisabled={isBusy}
          className="h-11 cursor-pointer bg-[#ef4444] text-white hover:bg-[#ef4444]/90"
        >
          Sí, cerrar
        </Button>
      </div>
    </div>
  );
}

export function ActivatorResetDialog({
  isOpen,
  isBusy,
  onConfirm,
  onClose,
}: ActivatorResetDialogProps): React.ReactElement {
  const isMobile = useIsMobile();
  const dragControls = useDragControls();
  const dismiss = () => (isBusy ? undefined : onClose());

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.div
              key="activator-reset-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={dismiss}
              className="fixed inset-0 z-[100]"
              style={{ backgroundColor: 'rgba(24,26,42,.42)', touchAction: 'none' }}
            />
            <motion.div
              key="activator-reset-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              drag={isBusy ? false : 'y'}
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={(_, info) => {
                if (!isBusy && info.offset.y > 100) onClose();
              }}
              className="fixed bottom-0 left-0 right-0 z-[101] flex max-h-[85dvh] flex-col overflow-hidden rounded-t-2xl bg-white"
              style={{ overscrollBehavior: 'contain', paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              <div
                onPointerDown={(e) => { if (!isBusy) dragControls.start(e); }}
                className="flex flex-none justify-center pt-2"
                style={{ cursor: isBusy ? 'default' : 'grab' }}
                aria-hidden
              >
                <div className="h-1 w-10 rounded-full bg-neutral-200" />
              </div>
              <ActivatorResetDialogContent isBusy={isBusy} onConfirm={onConfirm} onClose={onClose} />
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={dismiss}
      size="md"
      placement="center"
      backdrop="opaque"
      scrollBehavior="outside"
      isDismissable={!isBusy}
      // Same convention as ConfirmarEleccionModal and 6 other 0.6 dialogs: the
      // explicit "Cancelar" is the escape hatch, so NextUI's close button is
      // redundant — and here it also renders over the header icon chip.
      hideCloseButton
      classNames={{
        // NextUI's theme-based utilities (bg-overlay, border-medium) do not
        // resolve under this project's Tailwind v4 setup, so the backdrop and
        // the wrapper alignment are declared explicitly — same convention as
        // every other modal in 0.6 (see DeferredDeliveryModal, ConfirmarEleccionModal).
        // `overflow-hidden` is what makes the rounding visible: the content div
        // below is opaque white with square corners, so without clipping it
        // paints over the rounded corners and the card reads as a sharp rectangle.
        // The mobile sheet already pairs rounded-t-2xl with overflow-hidden.
        base: 'bg-white rounded-lg overflow-hidden my-8',
        // `sm:items-center` is required, not redundant: scrollBehavior="outside"
        // makes NextUI inject `sm:items-start`, and that media-query rule beats an
        // unprefixed `items-center` at >=640px, pinning the modal to the top.
        wrapper: 'items-center sm:items-center justify-center py-8 min-h-full',
        backdrop: 'bg-black/50',
        closeButton: 'cursor-pointer',
      }}
    >
      <ModalContent>
        <ActivatorResetDialogContent isBusy={isBusy} onConfirm={onConfirm} onClose={onClose} />
      </ModalContent>
    </Modal>
  );
}
