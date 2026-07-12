/**
 * AccesorioGridCard — card de accesorio dentro del grid 2 columnas del
 * bottom sheet buscador (BAL-2185).
 *
 * Copiado 1:1 del GRID del mock
 * (docs/superpowers/design-refs/mock-accesorios.html, frame 3): foto con
 * botón "+" redondo (top-right) o check si ya está agregado, nombre, cuota
 * y enlace "Ver detalle".
 *
 * Puramente presentacional: props → UI, sin fetch ni lógica (onToggle /
 * onVerDetalle los conecta quien ensambla la página, Task 9).
 */
import { Check, Plus } from 'lucide-react';

import { OFERTA_COLORS } from '../../components/redesign/ofertaTheme';
import type { Accessory } from '../../../../[landing]/solicitar/types/upsell';

export interface AccesorioGridCardProps {
  accesorio: Accessory;
  agregado: boolean;
  onToggle: () => void;
  onVerDetalle: () => void;
  /** Etiqueta destacada (pill) sobre la foto, ej. "Recomendado". Opcional. */
  badge?: string;
}

export function AccesorioGridCard({ accesorio, agregado, onToggle, onVerDetalle, badge }: AccesorioGridCardProps) {
  const cuotaFormateada = Math.round(accesorio.monthlyQuota).toLocaleString('es-PE');

  return (
    <div
      className="rounded-xl border-[1.5px] p-[9px]"
      style={{ borderColor: agregado ? OFERTA_COLORS.primary : OFERTA_COLORS.border }}
    >
      <div className="relative">
        {badge ? (
          <span
            className="absolute left-1.5 top-1.5 z-10 rounded-full px-2 py-0.5 text-[9.5px] font-bold text-white"
            style={{ backgroundColor: OFERTA_COLORS.primary }}
          >
            {badge}
          </span>
        ) : null}
        <div
          className="flex h-[74px] w-full items-center justify-center rounded-xl border"
          style={{
            borderColor: OFERTA_COLORS.border,
            background: accesorio.image
              ? undefined
              : 'repeating-linear-gradient(135deg, #F1F2F7 0 7px, #E9EBF2 7px 14px)',
          }}
        >
          {accesorio.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={accesorio.image} alt={accesorio.name} className="h-full w-full rounded-xl object-contain" />
          ) : (
            <span className="font-mono text-[8px]" style={{ color: OFERTA_COLORS.textSoft }}>
              foto
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-label={agregado ? `Quitar ${accesorio.name}` : `Agregar ${accesorio.name}`}
          className="absolute -right-1.5 -top-1.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-white shadow"
          style={{ backgroundColor: OFERTA_COLORS.primary }}
        >
          {agregado ? (
            <Check className="h-4 w-4" strokeWidth={2.6} />
          ) : (
            <Plus className="h-4 w-4" strokeWidth={2.6} />
          )}
        </button>
      </div>

      {/* Título: máx 2 líneas con "…"; reserva SIEMPRE el alto de 2 líneas
          (min-h) para que todas las cards del grid mantengan la misma altura
          aunque un nombre sea de 1 línea (queda arriba, con el espacio de la 2ª
          reservado). line-clamp-2 corta y agrega la elipsis. */}
      <div
        className="mt-2 line-clamp-2 min-h-[2.3em] text-[12.5px] font-bold leading-[1.15]"
        style={{ color: OFERTA_COLORS.textStrong }}
      >
        {accesorio.name}
      </div>
      <div className="mt-1 text-[12px] font-bold" style={{ color: OFERTA_COLORS.primary }}>
        +S/{cuotaFormateada}/mes
      </div>
      <button
        type="button"
        onClick={onVerDetalle}
        className="mt-1 cursor-pointer text-[11px] font-semibold"
        style={{ color: OFERTA_COLORS.tealBrand }}
      >
        Ver detalle
      </button>
    </div>
  );
}
