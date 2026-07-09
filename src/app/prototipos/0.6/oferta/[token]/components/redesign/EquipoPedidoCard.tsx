/**
 * EquipoPedidoCard — card del equipo que el estudiante PIDIÓ, en el index del
 * Caso 4 (downgrade). Read-only, atenuada (gris) con aviso "no disponible".
 * Muestra imagen + cuota + accesorios/seguros que había pedido (gratis o no).
 *
 * Diseño NUEVO del rediseño (OFERTA_COLORS), NO el componente viejo. Solo reusa
 * la DATA del requested_product (imagen, cuota, accesorios). Puramente
 * presentacional.
 */
import { Ban, Package, ShieldCheck } from 'lucide-react';

import { OFERTA_COLORS } from './ofertaTheme';
import { cuotaSuffix, plazoUnit, inicialText } from '../equipoCardFormat';

interface Addon {
  id: number | null;
  name: string;
  monthly: number;
}

export interface EquipoPedidoCardProps {
  nombre: string;
  imageUrl?: string | null;
  monthly?: number | null;
  termMonths?: number | null;
  initialAmount?: number | null;
  initialPercent?: number | null;
  paymentFrequency?: string | null;
  /** Chips de specs (procesador/RAM/almacenamiento). Vacío si el API no los da. */
  specs?: string[];
  accessories?: Addon[];
  insurances?: Addon[];
}

export function EquipoPedidoCard({
  nombre,
  imageUrl,
  monthly,
  termMonths,
  initialAmount,
  initialPercent,
  paymentFrequency,
  specs = [],
  accessories = [],
  insurances = [],
}: EquipoPedidoCardProps) {
  const hayAddons = accessories.length > 0 || insurances.length > 0;

  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: OFERTA_COLORS.border, backgroundColor: OFERTA_COLORS.grayBg }}
    >
      {/* Etiqueta + no disponible */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[9.5px] font-bold uppercase tracking-[.1em]" style={{ color: OFERTA_COLORS.textSoft }}>
          El que pediste
        </span>
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{ backgroundColor: '#FEF3E2', color: '#B45309' }}
        >
          <Ban className="h-3 w-3" />
          No disponible
        </span>
      </div>

      <div className="flex items-start gap-3">
        {/* Imagen atenuada */}
        <div
          className="flex h-[64px] w-[74px] flex-none items-center justify-center overflow-hidden rounded-xl border bg-white"
          style={{ borderColor: OFERTA_COLORS.border }}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={nombre} className="h-full w-full object-contain opacity-60 grayscale" />
          ) : (
            <span className="font-mono text-[8px]" style={{ color: OFERTA_COLORS.textSoft }}>equipo</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="font-['Baloo_2',_sans-serif] text-[14.5px] font-bold leading-[1.2]" style={{ color: OFERTA_COLORS.textMid }}>
            {nombre}
          </div>
          {/* Chips de specs (si el API los provee) */}
          {specs.length > 0 ? (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {specs.map((s, i) => (
                <span
                  key={`spec-${i}`}
                  className="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                  style={{ backgroundColor: '#fff', color: OFERTA_COLORS.textSoft, border: `1px solid ${OFERTA_COLORS.border}` }}
                >
                  {s}
                </span>
              ))}
            </div>
          ) : null}
          {/* Cuota tachada */}
          {monthly ? (
            <div className="mt-1.5">
              <span className="font-['Baloo_2',_sans-serif] text-[15px] font-bold line-through" style={{ color: OFERTA_COLORS.textSoft }}>
                S/{Math.round(monthly)}{cuotaSuffix(paymentFrequency)}
              </span>
              {termMonths ? (
                <span className="ml-1 text-[11px]" style={{ color: OFERTA_COLORS.textSoft }}>
                  en {termMonths} {plazoUnit(termMonths, paymentFrequency)}
                  {inicialText(initialAmount, initialPercent)}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {/* Accesorios / seguros que había pedido (read-only) */}
      {hayAddons ? (
        <ul className="mt-3 space-y-1.5 border-t pt-3" style={{ borderColor: OFERTA_COLORS.border }}>
          {accessories.map((a) => (
            <li key={`ped-a-${a.id}`} className="flex items-center justify-between gap-2 text-[12.5px]">
              <span className="flex min-w-0 items-center gap-1.5" style={{ color: OFERTA_COLORS.textSoft }}>
                <Package className="h-3.5 w-3.5 flex-none" />
                <span className="truncate">{a.name}</span>
              </span>
              <span className="flex-none line-through" style={{ color: OFERTA_COLORS.textSoft }}>
                +S/{Math.round(a.monthly)}{cuotaSuffix(paymentFrequency)}
              </span>
            </li>
          ))}
          {insurances.map((i) => (
            <li key={`ped-i-${i.id}`} className="flex items-center justify-between gap-2 text-[12.5px]">
              <span className="flex min-w-0 items-center gap-1.5" style={{ color: OFERTA_COLORS.textSoft }}>
                <ShieldCheck className="h-3.5 w-3.5 flex-none" />
                <span className="truncate">{i.name}</span>
              </span>
              <span className="flex-none line-through" style={{ color: OFERTA_COLORS.textSoft }}>
                +S/{Math.round(i.monthly)}{cuotaSuffix(paymentFrequency)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
