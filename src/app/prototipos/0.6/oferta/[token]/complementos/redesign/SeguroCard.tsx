/**
 * SeguroCard — card de plan de seguro con coberturas (BAL-2185).
 *
 * Copiado 1:1 de las cards de seguro del mock
 * (docs/superpowers/design-refs/mock-accesorios.html, frame 3): ícono
 * escudo en cuadro lila, nombre + cuota, check/+ de selección y viñetas de
 * cobertura abajo.
 *
 * `InsurancePlan.coverage` es `CoverageItem[]` (objetos `{ name, description,
 * icon }`), no strings sueltos — se pinta `coverage[].name` en cada viñeta.
 *
 * Puramente presentacional: props → UI, sin fetch ni lógica (el toggle lo
 * conecta quien ensambla la página, Task 9).
 */
import { Check, Plus, ShieldCheck } from 'lucide-react';

import { OFERTA_COLORS } from '../../components/redesign/ofertaTheme';
import type { InsurancePlan, CoverageItem } from '../../../../[landing]/solicitar/types/upsell';

export interface SeguroCardProps {
  seguro: InsurancePlan;
  seleccionado: boolean;
  onToggle: () => void;
  /** Abre el detalle del seguro (bottom sheet con coberturas + exclusiones). */
  onVerDetalle?: () => void;
}

export function SeguroCard({ seguro, seleccionado, onToggle, onVerDetalle }: SeguroCardProps) {
  const cuotaFormateada = Math.round(seguro.monthlyPrice).toLocaleString('es-PE');

  return (
    <div
      className="rounded-xl border-[1.5px] p-3.5 text-left"
      style={{ borderColor: seleccionado ? OFERTA_COLORS.primary : OFERTA_COLORS.border }}
    >
      {/* Fila principal: toca para agregar/quitar */}
      <button type="button" onClick={onToggle} className="flex w-full cursor-pointer items-center gap-3 text-left">
        <div
          className="flex h-10 w-10 flex-none items-center justify-center rounded-xl"
          style={{ backgroundColor: OFERTA_COLORS.lilac }}
        >
          <ShieldCheck className="h-5 w-5" strokeWidth={2.1} style={{ color: OFERTA_COLORS.primary }} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="font-['Baloo_2',_sans-serif] text-[13.5px] font-bold" style={{ color: OFERTA_COLORS.textStrong }}>
            {seguro.name}
          </div>
          <div className="mt-0.5 text-[12.5px] font-bold" style={{ color: OFERTA_COLORS.primary }}>
            +S/{cuotaFormateada}/mes
          </div>
        </div>

        <div
          className="flex h-7 w-7 flex-none items-center justify-center rounded-full"
          style={{
            backgroundColor: seleccionado ? OFERTA_COLORS.primary : OFERTA_COLORS.lilac,
          }}
        >
          {seleccionado ? (
            <Check className="h-4 w-4" strokeWidth={2.6} style={{ color: '#fff' }} />
          ) : (
            <Plus className="h-4 w-4" strokeWidth={2.6} style={{ color: OFERTA_COLORS.primary }} />
          )}
        </div>
      </button>

      {seguro.coverage && seguro.coverage.length > 0 ? (
        <ul className="mt-2.5 space-y-1.5 border-t pt-2.5" style={{ borderColor: '#F1F2F7' }}>
          {seguro.coverage.map((item: CoverageItem, index: number) => (
            <li key={`${seguro.id}-cov-${index}`} className="flex items-start gap-1.5 text-[11.5px]" style={{ color: '#4B5563' }}>
              <Check className="mt-[2px] h-3.5 w-3.5 flex-none" strokeWidth={2.6} style={{ color: OFERTA_COLORS.greenDark }} />
              <span>{item.name}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {onVerDetalle ? (
        <button
          type="button"
          onClick={onVerDetalle}
          className="mt-2 cursor-pointer text-[11px] font-semibold"
          style={{ color: OFERTA_COLORS.tealBrand }}
        >
          Ver detalle
        </button>
      ) : null}
    </div>
  );
}
