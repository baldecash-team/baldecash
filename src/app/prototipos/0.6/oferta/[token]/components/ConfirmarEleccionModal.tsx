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
import { Modal, ModalContent, Button } from '@nextui-org/react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { ShoppingBag, X, CheckCircle2 } from 'lucide-react';
import { useIsMobile } from '@/app/prototipos/_shared';
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

/** Contenido del paso "¿Confirmas tu elección?" — compartido entre la
 *  presentación modal (desktop) y drawer (mobile). Header índigo + resumen del
 *  equipo + desglose (addonsSlot) + upsell seguros + aviso + footer con
 *  "Cancelar"/"Confirmar". Sin envoltorio propio: el caller (Modal o sheet) lo
 *  monta. `scrollClassName` permite al drawer poner el scroll en el body. */
function ConfirmarEleccionContenido({
  equipo,
  loading,
  onConfirm,
  onClose,
  addonsSlot,
  insuranceUpsellSlot,
  scrollClassName,
}: {
  equipo: EquipoAConfirmar | null;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  addonsSlot?: ReactNode;
  insuranceUpsellSlot?: ReactNode;
  /** Clase del contenedor del body (el drawer necesita flex-1 + overflow). */
  scrollClassName: string;
}) {
  return (
    <>
      {/* Header índigo */}
      <div className="flex flex-none items-center gap-3 px-5 py-[22px]" style={{ backgroundColor: HEADER_INDIGO }}>
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

      {/* Body (scroll dentro del contenedor) */}
      <div className={scrollClassName}>
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

          {/* Fila de cuota del equipo: solo cuando NO hay desglose de pedido. */}
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

          {/* Desglose "Tu pedido incluye" */}
          {addonsSlot ? <PedidoBox>{addonsSlot}</PedidoBox> : null}

          {/* Upsell de seguros (si el caller lo pasa) */}
          {insuranceUpsellSlot}

          {/* Aviso verde */}
          <div
            className="mt-4 flex items-start gap-2 rounded-xl p-3 text-sm font-medium"
            style={{ backgroundColor: OFERTA_COLORS.greenSoft, color: OFERTA_COLORS.greenDark }}
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Al aceptar, cambiaremos tu equipo y tu solicitud quedará aprobada.</span>
          </div>
        </div>
      </div>

      {/* Footer con botones */}
      <div className="flex flex-none items-center justify-end gap-2 px-4 py-3">
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
          isDisabled={loading}
          radius="lg"
          className="cursor-pointer font-['Baloo_2',_sans-serif] text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
          style={{ backgroundColor: OFERTA_COLORS.primary }}
        >
          {loading ? 'Procesando tu cambio…' : 'Confirmar'}
        </Button>
      </div>
    </>
  );
}

export function ConfirmarEleccionModal({
  isOpen,
  equipo,
  loading,
  onConfirm,
  onClose,
  addonsSlot,
  insuranceUpsellSlot,
}: {
  isOpen: boolean;
  equipo: EquipoAConfirmar | null;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  /** Selector de accesorios/seguros (BAL-2064). Se renderiza dentro del modal,
   *  antes del aviso, cuando se pasa. */
  addonsSlot?: ReactNode;
  /** "Asegura tu inversión" (feedback Marco): card verde con seguros
   *  disponibles NO seleccionados + botón "Añadir", antes del aviso final.
   *  Solo se pasa cuando el caller tiene seguros disponibles sin elegir. */
  insuranceUpsellSlot?: ReactNode;
}) {
  const isMobile = useIsMobile();
  const dragControls = useDragControls();
  const dismiss = () => (loading ? undefined : onClose());

  // --- MOBILE: bottom sheet (mismo patrón que BuscadorBottomSheet/SeguroDetalleSheet) ---
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen ? (
          <>
            {/* Backdrop: cierra solo si !loading */}
            <motion.div
              key="confirmar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={dismiss}
              className="fixed inset-0 z-[100]"
              style={{ backgroundColor: 'rgba(24,26,42,.42)', touchAction: 'none' }}
            />
            {/* Sheet */}
            <motion.div
              key="confirmar-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              drag={loading ? false : 'y'}
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={(_, info) => {
                if (!loading && info.offset.y > 100) onClose();
              }}
              className="fixed bottom-0 left-0 right-0 z-[101] flex max-h-[85dvh] flex-col overflow-hidden rounded-t-2xl bg-white"
              style={{ overscrollBehavior: 'contain', paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              {/* Drag handle (deshabilitado mientras carga) */}
              <div
                onPointerDown={(e) => { if (!loading) dragControls.start(e); }}
                className="flex flex-none justify-center pt-3 pb-1"
                style={{ cursor: loading ? 'default' : 'grab' }}
              >
                <div className="h-1 w-10 rounded-full bg-neutral-300" />
              </div>
              <ConfirmarEleccionContenido
                equipo={equipo}
                loading={loading}
                onConfirm={onConfirm}
                onClose={onClose}
                addonsSlot={addonsSlot}
                insuranceUpsellSlot={insuranceUpsellSlot}
                scrollClassName="flex-1 overflow-y-auto"
              />
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    );
  }

  // --- DESKTOP: modal centrado (como hoy) ---
  return (
    <Modal
      isOpen={isOpen}
      onClose={dismiss}
      placement="center"
      size={addonsSlot ? 'lg' : 'md'}
      scrollBehavior="inside"
      hideCloseButton
      backdrop="opaque"
      isDismissable={!loading}
      classNames={{
        wrapper: 'z-[101]',
        backdrop: 'z-[100] bg-black/50',
        base: 'bg-white rounded-2xl overflow-hidden',
        body: 'bg-white p-0',
        footer: 'bg-white',
      }}
    >
      <ModalContent>
        <ConfirmarEleccionContenido
          equipo={equipo}
          loading={loading}
          onConfirm={onConfirm}
          onClose={onClose}
          addonsSlot={addonsSlot}
          insuranceUpsellSlot={insuranceUpsellSlot}
          scrollClassName=""
        />
      </ModalContent>
    </Modal>
  );
}
