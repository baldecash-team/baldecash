'use client';

/**
 * Modal de elección de equipo (Caso 4/5). Tres estados internos:
 *   1. confirmar → resumen del equipo + "Sí, elegir este equipo".
 *   2. cargando  → botón con spinner + texto de progreso (el cambio toca legacy,
 *      puede tardar 1-2s; el texto evita que el spinner se sienta "pegado").
 *   3. éxito     → check animado + "¡Listo!" + "Continuar" (NO recarga la página
 *      en el acto: la navegación la decide el caller vía onSuccessContinue, así
 *      el spinner nunca queda girando durante un window.location).
 *
 * Elegir es una acción importante: consume el link y registra la selección.
 */
import type { ReactNode } from 'react';
import { Modal, ModalContent, ModalBody, ModalFooter, Button } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { ShoppingBag, X, CheckCircle2, ArrowRight, Check } from 'lucide-react';

const APPROVED_GREEN = '#16a34a';

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
  succeeded = false,
  onConfirm,
  onClose,
  onSuccessContinue,
  addonsSlot,
}: {
  isOpen: boolean;
  equipo: EquipoAConfirmar | null;
  loading?: boolean;
  /** Cuando true, el modal pasa al estado de éxito (check animado + Continuar). */
  succeeded?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  /** Se llama al presionar "Continuar" en el estado de éxito. Si no se pasa,
   *  cae a onClose. Aquí el caller navega / refresca (fuera del spinner). */
  onSuccessContinue?: () => void;
  /** Selector de accesorios/seguros (BAL-2064). Se renderiza dentro del modal,
   *  antes del aviso, cuando se pasa. */
  addonsSlot?: ReactNode;
}) {
  const dismiss = () => (loading ? undefined : onClose());

  return (
    <Modal
      isOpen={isOpen}
      onClose={dismiss}
      placement="center"
      size={addonsSlot ? 'lg' : 'md'}
      scrollBehavior="inside"
      hideCloseButton
      backdrop="opaque"
      isDismissable={!loading && !succeeded}
      classNames={{
        wrapper: 'z-[101]',
        backdrop: 'z-[100] bg-black/50',
        base: 'bg-[var(--surface,#fff)] rounded-2xl overflow-hidden',
        body: 'bg-[var(--surface,#fff)] p-0',
        footer: 'bg-[var(--surface,#fff)]',
      }}
    >
      <ModalContent>
        {succeeded ? (
          /* ---------------------------- ÉXITO ---------------------------- */
          <ModalBody>
            <div className="flex flex-col items-center px-6 pb-6 pt-8 text-center">
              {/* Check animado: círculo que aparece con un pop + tick */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                className="flex h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundColor: `${APPROVED_GREEN}1a` }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.12, type: 'spring', stiffness: 300, damping: 16 }}
                >
                  <Check className="h-8 w-8" strokeWidth={3} style={{ color: APPROVED_GREEN }} />
                </motion.div>
              </motion.div>

              <h2 className="mt-4 font-['Baloo_2',_sans-serif] text-xl font-bold text-[var(--text-strong,#111827)]">
                ¡Listo!
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Cambiamos tu equipo y tu solicitud quedó aprobada.
              </p>

              {equipo ? (
                <div className="mt-5 flex w-full items-center gap-3 rounded-xl border border-[rgba(var(--color-primary-rgb),0.12)] bg-[rgba(var(--color-primary-rgb),0.04)] p-3 text-left">
                  {equipo.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={equipo.imageUrl} alt={equipo.name} className="h-12 w-12 shrink-0 object-contain" />
                  ) : (
                    <div className="h-12 w-12 shrink-0 rounded-lg bg-gray-200" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--text-strong,#111827)]">{equipo.name}</p>
                    {equipo.monthly ? (
                      <p className="text-xs text-gray-500">
                        Desde <span className="font-semibold" style={{ color: APPROVED_GREEN }}>S/{Math.round(equipo.monthly)}/mes</span>
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {/* Desglose de accesorios/seguros elegidos (mismo que en la
                  confirmación) — para que el cliente vea qué sumó. */}
              {addonsSlot ? <div className="mt-4 w-full text-left">{addonsSlot}</div> : null}

              <div className="mt-4 flex w-full items-start gap-2 rounded-xl bg-emerald-50 p-3 text-left text-xs text-emerald-800">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Recibirás el contrato por WhatsApp para firmarlo y coordinar la entrega.</span>
              </div>

              <Button
                onPress={onSuccessContinue ?? onClose}
                className="mt-5 w-full cursor-pointer font-bold text-white"
                endContent={<ArrowRight className="h-4 w-4" />}
                style={{ backgroundColor: APPROVED_GREEN }}
              >
                Continuar
              </Button>
            </div>
          </ModalBody>
        ) : (
          /* ------------------------- CONFIRMACIÓN ------------------------ */
          <>
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

                {/* Accesorios/seguros que caben en la cuota (BAL-2064). */}
                {addonsSlot ? <div className="mt-4">{addonsSlot}</div> : null}

                {/* Aviso (wording de Marco): qué pasa al aceptar */}
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Al aceptar, cambiaremos tu equipo y tu solicitud quedará aprobada.</span>
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
                {loading ? 'Procesando tu cambio…' : 'Sí, elegir este equipo'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
