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
 *
 * Rediseño visual (BAL-2186): mismo API de props y misma lógica; solo cambia
 * la presentación para calzar con el mock de Claude Design
 * (docs/superpowers/design-refs/mock-confirmacion.html, frames 1 y 2).
 */
import type { ReactNode } from 'react';
import { Modal, ModalContent, ModalBody, ModalFooter, Button } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { ShoppingBag, X, CheckCircle2, ArrowRight, Check } from 'lucide-react';
import { cuotaSuffix, plazoUnit, inicialText } from './equipoCardFormat';
import { OFERTA_COLORS } from './redesign/ofertaTheme';

/** Header índigo del modal (frames 1/2 del mock) — un tono propio, distinto
 *  del índigo primario de CTAs, para dar jerarquía visual al encabezado. */
const HEADER_INDIGO = '#5850EC';

export interface EquipoAConfirmar {
  name: string;
  brand?: string;
  imageUrl?: string;
  monthly?: number;
  /** Plazo e inicial (%) elegidos — para mostrar "en N meses/semanas · inicial S/X". */
  term?: number;
  initial?: number;
  /** Monto (S/) de la inicial. Se muestra en vez del %; si no viene, cae al %. */
  initialAmount?: number;
  /** Frecuencia ('mensual'|'semanal'|'quincenal') → sufijo de cuota y unidad de plazo. */
  paymentFrequency?: string;
}

/** Caja "Tu pedido incluye": envoltorio neutro reusado en ambos estados
 *  (confirmación/éxito) para el `addonsSlot` que pasa el caller. El contenido
 *  ya distingue regalos del combo (gratis) de lo elegido (+S/) y trae su propia
 *  cuota total — aquí solo lo enmarcamos, sin duplicar montos ni etiquetas. */
function PedidoBox({ children }: { children: ReactNode }) {
  return (
    <div
      className="mt-4 rounded-xl border p-3.5"
      style={{ backgroundColor: OFERTA_COLORS.grayBg, borderColor: OFERTA_COLORS.border }}
    >
      {children}
    </div>
  );
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
        base: 'bg-white rounded-2xl overflow-hidden',
        body: 'bg-white p-0',
        footer: 'bg-white',
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
                className="flex h-[66px] w-[66px] items-center justify-center rounded-full"
                style={{ backgroundColor: OFERTA_COLORS.greenSoft }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.12, type: 'spring', stiffness: 300, damping: 16 }}
                >
                  <Check className="h-[34px] w-[34px]" strokeWidth={3} style={{ color: OFERTA_COLORS.green }} />
                </motion.div>
              </motion.div>

              <h2 className="mt-4 font-['Baloo_2',_sans-serif] text-2xl font-extrabold" style={{ color: OFERTA_COLORS.textStrong }}>
                ¡Listo!
              </h2>
              <p className="mt-1 text-[13px]" style={{ color: OFERTA_COLORS.textMid }}>
                Cambiamos tu equipo y tu solicitud quedó aprobada.
              </p>

              {equipo ? (
                <div
                  className="mt-5 flex w-full items-center gap-3 rounded-xl border p-3 text-left"
                  style={{ backgroundColor: OFERTA_COLORS.grayBg, borderColor: OFERTA_COLORS.border }}
                >
                  {equipo.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={equipo.imageUrl} alt={equipo.name} className="h-12 w-12 shrink-0 object-contain" />
                  ) : (
                    <div className="h-12 w-12 shrink-0 rounded-lg bg-gray-200" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-['Baloo_2',_sans-serif] text-[13px] font-bold" style={{ color: OFERTA_COLORS.textStrong }}>
                      {equipo.name}
                    </p>
                    {/* Cuota del equipo: solo cuando NO hay desglose de pedido
                        (ese ya trae la cuota total y duplicarla es redundante). */}
                    {equipo.monthly && !addonsSlot ? (
                      <p className="text-xs">
                        <span className="font-bold" style={{ color: OFERTA_COLORS.greenDark }}>
                          S/{Math.round(equipo.monthly)}{cuotaSuffix(equipo.paymentFrequency)}
                        </span>
                        {equipo.term ? (
                          <span style={{ color: OFERTA_COLORS.textSoft }}>
                            {' '}· en {equipo.term} {plazoUnit(equipo.term, equipo.paymentFrequency)}
                            {inicialText(equipo.initialAmount, equipo.initial)}
                          </span>
                        ) : null}
                      </p>
                    ) : equipo.term ? (
                      <p className="text-xs" style={{ color: OFERTA_COLORS.textSoft }}>
                        en {equipo.term} {plazoUnit(equipo.term, equipo.paymentFrequency)}
                        {inicialText(equipo.initialAmount, equipo.initial)}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {/* Desglose "Tu pedido incluye" (equipo + regalos + elegidos +
                  cuota total). Trae su propia cuota — no duplicar arriba. */}
              {addonsSlot ? <PedidoBox>{addonsSlot}</PedidoBox> : null}

              <div
                className="mt-4 flex w-full items-start gap-2 rounded-lg p-3 text-left text-xs font-medium"
                style={{ backgroundColor: OFERTA_COLORS.greenSoft, color: OFERTA_COLORS.greenDark }}
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Recibirás el contrato por WhatsApp para firmarlo y coordinar la entrega.</span>
              </div>

              <Button
                onPress={onSuccessContinue ?? onClose}
                className="mt-5 w-full cursor-pointer font-['Baloo_2',_sans-serif] text-base font-bold text-white"
                radius="lg"
                endContent={<ArrowRight className="h-4 w-4" />}
                style={{ backgroundColor: OFERTA_COLORS.green }}
              >
                Continuar
              </Button>
            </div>
          </ModalBody>
        ) : (
          /* ------------------------- CONFIRMACIÓN ------------------------ */
          <>
            {/* Header índigo (frame 1 del mock) */}
            <div className="flex items-center gap-3 px-5 py-[22px]" style={{ backgroundColor: HEADER_INDIGO }}>
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white/[0.16]">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-['Baloo_2',_sans-serif] text-[20px] font-bold text-white">¿Confirmas tu elección?</h2>
                <p className="text-[12.5px] text-white/85">Estás a un paso de elegir tu equipo</p>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className="flex h-7 w-7 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/[0.18] transition-colors hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>

            <ModalBody>
              <div className="px-4 py-4">
                {/* Resumen del equipo */}
                {equipo ? (
                  <div className="flex items-center gap-4">
                    {equipo.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={equipo.imageUrl} alt={equipo.name} className="h-[50px] w-[50px] shrink-0 object-contain" />
                    ) : (
                      <div className="h-[50px] w-[50px] shrink-0 rounded-lg bg-gray-200" />
                    )}
                    <div className="min-w-0">
                      {equipo.brand ? (
                        <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: OFERTA_COLORS.textSoft }}>
                          {equipo.brand}
                        </p>
                      ) : null}
                      <p className="font-['Baloo_2',_sans-serif] text-[13.5px] font-bold" style={{ color: OFERTA_COLORS.textStrong }}>
                        {equipo.name}
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Fila de cuota del equipo: solo cuando NO hay desglose de
                    pedido. Con addonsSlot, la cuota total va DENTRO del desglose
                    y mostrar aquí "cuota mensual" además sería redundante. */}
                {equipo?.monthly && !addonsSlot ? (
                  <div className="mt-3.5 flex items-center justify-between border-t pt-3" style={{ borderColor: '#F1F2F7' }}>
                    <div>
                      <span className="text-sm font-semibold" style={{ color: OFERTA_COLORS.textStrong }}>
                        Cuota {equipo.paymentFrequency === 'semanal' ? 'semanal' : equipo.paymentFrequency === 'quincenal' ? 'quincenal' : 'mensual'}
                      </span>
                      {equipo.term ? (
                        <p className="text-xs" style={{ color: OFERTA_COLORS.textSoft }}>
                          en {equipo.term} {plazoUnit(equipo.term, equipo.paymentFrequency)}
                          {inicialText(equipo.initialAmount, equipo.initial)}
                        </p>
                      ) : null}
                    </div>
                    <span className="font-['Baloo_2',_sans-serif] text-[25px] font-extrabold" style={{ color: OFERTA_COLORS.primary }}>
                      S/{Math.round(equipo.monthly)}
                      <span className="text-sm font-normal" style={{ color: OFERTA_COLORS.textMid }}>{cuotaSuffix(equipo.paymentFrequency)}</span>
                    </span>
                  </div>
                ) : null}

                {/* Desglose "Tu pedido incluye": equipo + regalos del combo
                    (gratis) + elegidos (+S/) + UNA cuota total. */}
                {addonsSlot ? <PedidoBox>{addonsSlot}</PedidoBox> : null}

                {/* Aviso (wording de Marco): qué pasa al aceptar */}
                <div
                  className="mt-4 flex items-start gap-2 rounded-xl p-3 text-sm font-medium"
                  style={{ backgroundColor: OFERTA_COLORS.greenSoft, color: OFERTA_COLORS.greenDark }}
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Al aceptar, cambiaremos tu equipo y tu solicitud quedará aprobada.</span>
                </div>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button
                variant="light"
                onPress={onClose}
                isDisabled={loading}
                className="cursor-pointer font-['Baloo_2',_sans-serif] font-bold"
                style={{ color: OFERTA_COLORS.textMid }}
              >
                Cancelar
              </Button>
              <Button
                onPress={onConfirm}
                isLoading={loading}
                radius="lg"
                className="cursor-pointer font-['Baloo_2',_sans-serif] text-sm font-bold text-white"
                style={{ backgroundColor: OFERTA_COLORS.primary }}
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
