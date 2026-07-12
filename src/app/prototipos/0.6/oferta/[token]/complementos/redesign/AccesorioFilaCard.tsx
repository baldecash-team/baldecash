/**
 * AccesorioFilaCard — card HORIZONTAL de accesorio (foto a la izquierda, info a
 * la derecha) para la sección "Recomendado para ti", apiladas en columna.
 *
 * Foto + nombre + cuota + "Ver detalle" a la derecha, botón +/check para
 * agregar/quitar. Badge opcional (ej. "Recomendado") sobre la foto.
 *
 * Puramente presentacional: props → UI, sin fetch ni lógica.
 */
import { Check, Plus, TriangleAlert } from 'lucide-react';

import { OFERTA_COLORS } from '../../components/redesign/ofertaTheme';
import type { Accessory } from '../../../../[landing]/solicitar/types/upsell';

export interface AccesorioFilaCardProps {
  accesorio: Accessory;
  agregado: boolean;
  onToggle: () => void;
  onVerDetalle: () => void;
  /** Etiqueta destacada (pill) sobre la foto, ej. "Recomendado". Opcional. */
  badge?: string;
  /** No cabe en la cuota restante: card atenuada + etiqueta "Supera tu cuota" +
   *  botón agregar deshabilitado. Solo aplica si NO está ya agregado. */
  noCabe?: boolean;
}

export function AccesorioFilaCard({ accesorio, agregado, onToggle, onVerDetalle, badge, noCabe }: AccesorioFilaCardProps) {
  const cuotaFormateada = Math.round(accesorio.monthlyQuota).toLocaleString('es-PE');
  // El "no cabe" solo aplica si aún no está agregado (los agregados siempre se
  // pueden quitar aunque el restante sea negativo).
  const bloqueado = !!noCabe && !agregado;

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border-[1.5px] p-2.5 transition-opacity ${bloqueado ? 'opacity-55' : ''}`}
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
        <div className="text-[13px] font-bold leading-[1.15]" style={{ color: OFERTA_COLORS.textStrong }}>
          {accesorio.name}
        </div>
        <div className="mt-0.5 text-[12.5px] font-bold" style={{ color: OFERTA_COLORS.primary }}>
          +S/{cuotaFormateada}/mes
        </div>
        {/* No cabe: etiqueta clara del porqué (además del "Ver detalle"). */}
        {bloqueado ? (
          <div className="mt-0.5 flex items-center gap-1 text-[11px] font-bold" style={{ color: '#B45309' }}>
            <TriangleAlert className="h-3 w-3 shrink-0" strokeWidth={2.4} />
            Supera tu cuota
          </div>
        ) : (
          <button
            type="button"
            onClick={onVerDetalle}
            className="mt-1 cursor-pointer rounded-lg border-[1.5px] px-3 py-1.5 text-[12px] font-bold transition-colors hover:bg-black/[0.03]"
            style={{ color: OFERTA_COLORS.tealBrand, borderColor: OFERTA_COLORS.tealBrand }}
          >
            Ver detalle
          </button>
        )}
      </div>

      {/* Botón agregar / quitar (deshabilitado si no cabe y no está agregado). */}
      <button
        type="button"
        onClick={onToggle}
        disabled={bloqueado}
        aria-label={agregado ? `Quitar ${accesorio.name}` : `Agregar ${accesorio.name}`}
        className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-white shadow transition-opacity disabled:cursor-not-allowed disabled:opacity-40 enabled:cursor-pointer"
        style={{ backgroundColor: OFERTA_COLORS.primary }}
      >
        {agregado ? <Check className="h-4 w-4" strokeWidth={2.6} /> : <Plus className="h-4 w-4" strokeWidth={2.6} />}
      </button>
    </div>
  );
}
