'use client';

/**
 * EquipoPedidoCard — card del equipo que el estudiante PIDIÓ, en el index del
 * Caso 4 (downgrade). Read-only, atenuada (gris) con aviso "no disponible".
 * Muestra imagen + cuota + accesorios/seguros que había pedido (gratis o no).
 *
 * Diseño NUEVO del rediseño (OFERTA_COLORS), NO el componente viejo. Solo reusa
 * la DATA del requested_product (imagen, cuota, accesorios).
 *
 * Mobile: para caber en 100vh, los accesorios se COLAPSAN tras un toggle
 * "Ver lo que pediste (N)". En sm+ se muestran siempre.
 */
import { useEffect, useState } from 'react';
import { TriangleAlert, Package, ShieldCheck, ChevronDown } from 'lucide-react';

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
  const totalAddons = accessories.length + insurances.length;
  // Monto principal = total del pedido: equipo + accesorios + seguros. La card
  // muestra este total tachado; el desglose lo descompone (equipo + cada add-on).
  const extrasMonthly =
    accessories.reduce((s, a) => s + (a.monthly ?? 0), 0) +
    insurances.reduce((s, i) => s + (i.monthly ?? 0), 0);
  const totalMonthly = monthly != null ? monthly + extrasMonthly : null;
  // Collapse del desglose con default por viewport: DESKTOP (≥640px) abierto,
  // MOBILE cerrado (ahorra alto para 100vh). El toggle funciona en ambos. Para
  // evitar flash/mismatch de hidratación, el default SSR es cerrado y un effect
  // lo abre en desktop tras montar (matchMedia solo existe en cliente).
  const [abierto, setAbierto] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 640px)').matches) {
      setAbierto(true);
    }
  }, []);

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
          <TriangleAlert className="h-3 w-3" strokeWidth={2.4} />
          Excede tu cuota
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
          {/* Cuota tachada = TOTAL del pedido (equipo + accesorios + seguros). */}
          {totalMonthly ? (
            <div className="mt-1.5">
              <span className="font-['Baloo_2',_sans-serif] text-[15px] font-bold line-through" style={{ color: OFERTA_COLORS.textSoft }}>
                S/{Math.round(totalMonthly)}{cuotaSuffix(paymentFrequency)}
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

      {/* Toggle "ver lo que pediste" — visible en TODOS los viewports. El default
          de `abierto` lo fija el effect por viewport (desktop abierto, mobile
          cerrado); el usuario puede abrir/cerrar en ambos. */}
      {hayAddons ? (
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          className="group mt-2.5 flex w-full cursor-pointer items-center justify-between border-t pt-2.5 text-[12px] font-semibold transition-colors hover:text-[#4F46E5]"
          style={{ borderColor: OFERTA_COLORS.border, color: OFERTA_COLORS.textMid }}
          aria-expanded={abierto}
        >
          <span className="transition-colors group-hover:text-[#4F46E5]">Ver lo que pediste ({totalAddons})</span>
          <ChevronDown
            className="h-4 w-4 transition-transform duration-300 ease-out group-hover:text-[#4F46E5]"
            style={{ transform: abierto ? 'rotate(180deg)' : 'none' }}
          />
        </button>
      ) : null}

      {/* Desglose del pedido: producto principal + accesorios/seguros (read-only).
          Colapso SUAVE con grid-template-rows (0fr↔1fr) + opacidad — sin librería.
          El contenido queda siempre montado; solo se anima su alto. */}
      {hayAddons ? (
        <div
          className="grid transition-all duration-300 ease-out"
          style={{
            gridTemplateRows: abierto ? '1fr' : '0fr',
            opacity: abierto ? 1 : 0,
            marginTop: abierto ? '0.5rem' : 0,
          }}
        >
          <ul
            className="space-y-1.5 overflow-hidden"
            style={{ borderColor: OFERTA_COLORS.border }}
            aria-hidden={!abierto}
          >
            {/* Producto principal con su monto (primera línea del desglose). */}
            {monthly != null ? (
              <li key="ped-equipo" className="flex items-center justify-between gap-2 text-[12.5px]">
                <span className="flex min-w-0 items-center gap-1.5 font-semibold" style={{ color: OFERTA_COLORS.textMid }}>
                  <Package className="h-3.5 w-3.5 flex-none" />
                  <span className="truncate">{nombre}</span>
                </span>
                <span className="flex-none font-semibold line-through" style={{ color: OFERTA_COLORS.textSoft }}>
                  S/{Math.round(monthly)}{cuotaSuffix(paymentFrequency)}
                </span>
              </li>
            ) : null}
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
        </div>
      ) : null}
    </div>
  );
}
