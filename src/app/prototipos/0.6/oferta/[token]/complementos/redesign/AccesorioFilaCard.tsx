/**
 * AccesorioFilaCard — card HORIZONTAL de accesorio (foto a la izquierda, info a
 * la derecha) para la sección "Recomendado para ti", apiladas en columna.
 *
 * Foto + nombre + cuota + "Ver detalle" a la derecha, botón +/check para
 * agregar/quitar. Badge opcional (ej. "Recomendado") sobre la foto.
 *
 * Puramente presentacional: props → UI, sin fetch ni lógica.
 */
import { Check, Plus } from 'lucide-react';

import { OFERTA_COLORS } from '../../components/redesign/ofertaTheme';
import type { Accessory } from '../../../../[landing]/solicitar/types/upsell';

export interface AccesorioFilaCardProps {
  accesorio: Accessory;
  agregado: boolean;
  onToggle: () => void;
  onVerDetalle: () => void;
  /** Etiqueta destacada (pill) sobre la foto, ej. "Recomendado". Opcional. */
  badge?: string;
}

export function AccesorioFilaCard({ accesorio, agregado, onToggle, onVerDetalle, badge }: AccesorioFilaCardProps) {
  const cuotaFormateada = Math.round(accesorio.monthlyQuota).toLocaleString('es-PE');

  return (
    <div
      className="flex items-center gap-3 rounded-xl border-[1.5px] p-2.5"
      style={{ borderColor: agregado ? OFERTA_COLORS.primary : OFERTA_COLORS.border }}
    >
      {/* Foto (con badge opcional) */}
      <div className="relative flex-none">
        {badge ? (
          <span
            className="absolute -left-1 -top-1.5 z-10 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white"
            style={{ backgroundColor: OFERTA_COLORS.primary }}
          >
            {badge}
          </span>
        ) : null}
        <div
          className="flex h-[58px] w-[58px] items-center justify-center overflow-hidden rounded-xl border"
          style={{
            borderColor: OFERTA_COLORS.border,
            background: accesorio.image
              ? undefined
              : 'repeating-linear-gradient(135deg, #F1F2F7 0 7px, #E9EBF2 7px 14px)',
          }}
        >
          {accesorio.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={accesorio.image} alt={accesorio.name} className="h-full w-full object-contain" />
          ) : (
            <span className="font-mono text-[8px]" style={{ color: OFERTA_COLORS.textSoft }}>foto</span>
          )}
        </div>
      </div>

      {/* Info: nombre + cuota + ver detalle */}
      <div className="min-w-0 flex-1">
        <div className="truncate font-['Baloo_2',_sans-serif] text-[13px] font-bold leading-[1.15]" style={{ color: OFERTA_COLORS.textStrong }}>
          {accesorio.name}
        </div>
        <div className="mt-0.5 text-[12.5px] font-bold" style={{ color: OFERTA_COLORS.primary }}>
          +S/{cuotaFormateada}/mes
        </div>
        <button
          type="button"
          onClick={onVerDetalle}
          className="mt-0.5 cursor-pointer text-[11px] font-semibold"
          style={{ color: OFERTA_COLORS.tealBrand }}
        >
          Ver detalle
        </button>
      </div>

      {/* Botón agregar / quitar */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={agregado ? `Quitar ${accesorio.name}` : `Agregar ${accesorio.name}`}
        className="flex h-8 w-8 flex-none cursor-pointer items-center justify-center rounded-full text-white shadow"
        style={{ backgroundColor: OFERTA_COLORS.primary }}
      >
        {agregado ? <Check className="h-4 w-4" strokeWidth={2.6} /> : <Plus className="h-4 w-4" strokeWidth={2.6} />}
      </button>
    </div>
  );
}
