'use client';

/**
 * SeguroDetalleSheet — detalle de un SEGURO (responsive BAL-2212).
 *
 * Desktop → Modal NextUI centrado. Mobile → bottom sheet (motion.div, el caller
 * lo envuelve en <AnimatePresence>). Contenido compartido en
 * `SeguroDetalleContenido`: header "← Volver a la lista" + X, ícono de escudo,
 * proveedor + nombre, descripción, coberturas (viñetas verdes) y exclusiones si
 * las hay, precio grande + plazo, botón "Agregar" / "Quitar".
 *
 * Puramente presentacional: props → UI, sin fetch ni lógica.
 */
import { ArrowLeft, ShieldCheck, Plus, X, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Modal, ModalContent, ModalBody } from '@nextui-org/react';

import { useIsMobile } from '@/app/prototipos/_shared';
import { OFERTA_COLORS } from '../../components/redesign/ofertaTheme';
import type { InsurancePlan, CoverageItem } from '../../../../[landing]/solicitar/types/upsell';

export interface SeguroDetalleSheetProps {
  seguro: InsurancePlan;
  agregado: boolean;
  onAgregar: () => void;
  onVolver: () => void;
  onCerrar: () => void;
}

/** Contenido del detalle del seguro (header + escudo/proveedor/nombre/desc/
 *  coberturas/exclusiones/precio + footer botón). Compartido drawer/modal. */
function SeguroDetalleContenido({
  seguro,
  agregado,
  onAgregar,
  onVolver,
  onCerrar,
  bodyClassName,
}: SeguroDetalleSheetProps & { bodyClassName: string }) {
  const cuotaFormateada = Math.round(seguro.monthlyPrice).toLocaleString('es-PE');
  const plazo = seguro.durationMonths ?? 24;
  return (
    <>
      {/* Header */}
      <div className="flex flex-none items-center justify-between px-5 pb-3 pt-4">
        <button
          type="button"
          onClick={onVolver}
          className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium"
          style={{ color: OFERTA_COLORS.textMid }}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la lista
        </button>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full"
          style={{ backgroundColor: '#F1F2F7' }}
        >
          <X className="h-4 w-4" style={{ color: OFERTA_COLORS.textMid }} />
        </button>
      </div>

      <div className={bodyClassName}>
        {/* Ícono de escudo grande */}
        <div
          className="flex h-[120px] w-full items-center justify-center rounded-xl"
          style={{ backgroundColor: OFERTA_COLORS.lilac }}
        >
          <ShieldCheck className="h-14 w-14" strokeWidth={1.8} style={{ color: OFERTA_COLORS.primary }} />
        </div>

        {/* Proveedor + nombre */}
        {seguro.provider?.name ? (
          <p className="mt-4 text-[10px] font-bold tracking-[.08em]" style={{ color: OFERTA_COLORS.tealBrand }}>
            {seguro.provider.name.toUpperCase()}
          </p>
        ) : null}
        <h3 className="mt-1 font-['Baloo_2',_sans-serif] text-[23px] font-bold" style={{ color: OFERTA_COLORS.textStrong }}>
          {seguro.name}
        </h3>

        {/* Descripción */}
        {seguro.description ? (
          <p className="mt-2 text-[13.5px] leading-[1.5]" style={{ color: OFERTA_COLORS.textMid }}>
            {seguro.description}
          </p>
        ) : null}

        {/* Coberturas */}
        {seguro.coverage && seguro.coverage.length > 0 ? (
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: OFERTA_COLORS.greenDark }}>
              Qué cubre
            </p>
            <ul className="mt-2 space-y-2">
              {seguro.coverage.map((item: CoverageItem, index: number) => (
                <li key={`${seguro.id}-detcov-${index}`} className="flex items-start gap-2 text-[13px]" style={{ color: '#4B5563' }}>
                  <Check className="mt-[2px] h-4 w-4 flex-none" strokeWidth={2.6} style={{ color: OFERTA_COLORS.greenDark }} />
                  <span>
                    <span className="font-semibold" style={{ color: OFERTA_COLORS.textStrong }}>{item.name}</span>
                    {item.description ? <span> — {item.description}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Exclusiones */}
        {seguro.exclusions && seguro.exclusions.length > 0 ? (
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: OFERTA_COLORS.textSoft }}>
              No incluye
            </p>
            <ul className="mt-2 space-y-1.5">
              {seguro.exclusions.map((ex, index) => (
                <li key={`${seguro.id}-exc-${index}`} className="flex items-start gap-2 text-[12.5px]" style={{ color: OFERTA_COLORS.textMid }}>
                  <X className="mt-[2px] h-3.5 w-3.5 flex-none" strokeWidth={2.6} style={{ color: OFERTA_COLORS.textSoft }} />
                  <span>{ex}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Precio grande */}
        <div className="mt-5 border-t pt-4" style={{ borderColor: OFERTA_COLORS.border }}>
          <div className="font-['Baloo_2',_sans-serif] text-[30px] font-extrabold" style={{ color: OFERTA_COLORS.primary }}>
            +S/{cuotaFormateada}/mes
          </div>
          <p className="mt-0.5 text-sm" style={{ color: OFERTA_COLORS.textSoft }}>
            en {plazo} meses
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-none border-t bg-white px-5 py-4" style={{ borderColor: OFERTA_COLORS.border }}>
        <button
          type="button"
          onClick={onAgregar}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-4 font-['Baloo_2',_sans-serif] text-[16px] font-bold text-white transition-transform hover:brightness-95"
          style={{ backgroundColor: OFERTA_COLORS.primary }}
        >
          {agregado ? (
            'Quitar'
          ) : (
            <>
              <Plus className="h-4 w-4" strokeWidth={2.6} />
              Agregar al pedido
            </>
          )}
        </button>
      </div>
    </>
  );
}

export function SeguroDetalleSheet(props: SeguroDetalleSheetProps) {
  const { onCerrar } = props;
  const isMobile = useIsMobile();

  // DESKTOP: modal centrado.
  if (!isMobile) {
    return (
      <Modal
        isOpen
        onClose={onCerrar}
        placement="center"
        size="md"
        scrollBehavior="inside"
        hideCloseButton
        backdrop="opaque"
        classNames={{
          wrapper: 'z-[10001]',
          backdrop: 'z-[10000] bg-black/50',
          base: 'bg-white rounded-2xl overflow-hidden',
          body: 'bg-white p-0',
        }}
      >
        <ModalContent>
          <ModalBody>
            <SeguroDetalleContenido {...props} bodyClassName="px-5 pb-5" />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  // MOBILE: bottom sheet.
  return (
    <>
      <motion.div
        key="seguro-detalle-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onCerrar}
        className="fixed inset-0 z-[9998]"
        style={{ backgroundColor: 'rgba(24,26,42,.42)', touchAction: 'none' }}
      />
      <motion.div
        key="seguro-detalle-sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-[9999] flex max-h-[85dvh] flex-col rounded-t-2xl bg-white"
        style={{ overscrollBehavior: 'contain', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <SeguroDetalleContenido {...props} bodyClassName="flex-1 overflow-y-auto px-5 pb-28" />
      </motion.div>
    </>
  );
}
