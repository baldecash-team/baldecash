'use client';

/**
 * AccesorioDetalleSheet — bottom sheet de detalle de un accesorio (BAL-2185).
 *
 * Copiado 1:1 del frame 4 del mock
 * (docs/superpowers/design-refs/mock-accesorios.html): header
 * "← Volver a la lista" + X, foto grande, marca + nombre, descripción,
 * precio grande + plazo, botón full-width "Agregar al pedido" / "Quitar".
 *
 * Puramente presentacional: props → UI, sin fetch ni lógica (onAgregar lo
 * conecta quien ensambla la página, Task 9 — normalmente el mismo
 * toggleAcc que usa el resto de la pantalla).
 */
import { ArrowLeft, Package, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';

import { OFERTA_COLORS } from '../../components/redesign/ofertaTheme';
import type { Accessory } from '../../../../[landing]/solicitar/types/upsell';

export interface AccesorioDetalleSheetProps {
  accesorio: Accessory;
  agregado: boolean;
  onAgregar: () => void;
  onVolver: () => void;
  onCerrar: () => void;
}

export function AccesorioDetalleSheet({ accesorio, agregado, onAgregar, onVolver, onCerrar }: AccesorioDetalleSheetProps) {
  const cuotaFormateada = Math.round(accesorio.monthlyQuota).toLocaleString('es-PE');
  const plazo = accesorio.term ?? 24;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        key="detalle-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onCerrar}
        className="fixed inset-0 z-[9998]"
        style={{ backgroundColor: 'rgba(24,26,42,.42)', touchAction: 'none' }}
      />

      {/* Bottom Sheet */}
      <motion.div
        key="detalle-sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-[9999] flex max-h-[788px] flex-col rounded-t-[26px] bg-white"
        style={{ overscrollBehavior: 'contain', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
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

        <div className="flex-1 overflow-y-auto px-5 pb-28">
          {/* Foto grande */}
          <div
            className="flex h-[200px] w-full items-center justify-center rounded-[20px] border"
            style={{
              borderColor: OFERTA_COLORS.border,
              background: accesorio.image
                ? undefined
                : 'repeating-linear-gradient(135deg, #F1F2F7 0 10px, #E9EBF2 10px 20px)',
            }}
          >
            {accesorio.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={accesorio.image} alt={accesorio.name} className="h-full w-full rounded-[20px] object-contain" />
            ) : (
              <Package className="h-10 w-10" style={{ color: OFERTA_COLORS.textSoft }} />
            )}
          </div>

          {/* Marca + nombre */}
          {accesorio.brand?.name ? (
            <p className="mt-4 text-[10px] font-bold tracking-[.08em]" style={{ color: OFERTA_COLORS.textSoft }}>
              {accesorio.brand.name.toUpperCase()}
            </p>
          ) : null}
          <h3 className="mt-1 font-['Baloo_2',_sans-serif] text-[23px] font-bold" style={{ color: OFERTA_COLORS.textStrong }}>
            {accesorio.name}
          </h3>

          {/* Descripción */}
          {accesorio.description ? (
            <p className="mt-2 text-[13.5px] leading-[1.5]" style={{ color: OFERTA_COLORS.textMid }}>
              {accesorio.description}
            </p>
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

        <div className="flex-none border-t bg-white px-5 py-4" style={{ borderColor: OFERTA_COLORS.border }}>
          <button
            type="button"
            onClick={onAgregar}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[15px] py-4 font-['Baloo_2',_sans-serif] text-[16px] font-bold text-white transition-transform hover:brightness-95"
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
      </motion.div>
    </>
  );
}
