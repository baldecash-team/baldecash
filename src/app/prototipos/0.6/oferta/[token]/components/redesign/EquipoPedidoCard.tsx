'use client';

/**
 * EquipoPedidoCard — card del equipo que el estudiante PIDIÓ. Muestra imagen +
 * cuota + accesorios/seguros que había pedido, con desglose colapsable.
 *
 * Dos variantes (prop `variant`):
 *  - 'excede' (default, Caso 4 downgrade): card GRIS atenuada, imagen en
 *    grayscale, cuota y desglose TACHADOS, badge "Excede tu cuota". El equipo
 *    pedido NO entra en la cuota aprobada.
 *  - 'disponible' (Caso 5 upsell, "Mantener mi equipo"): el equipo SÍ cabe →
 *    imagen normal, cuota y desglose SIN tachar (colores normales), header
 *    "Tu equipo" en teal, y CTA opcional "Mantener este equipo".
 *
 * BAL-4193: `availableInCatalog === false` (equipo agotado/despublicado desde
 * que se armó la oferta) fuerza el estilo GRIS de 'excede' aunque la variante
 * sea 'disponible', agrega el badge "Ya no disponible" y OCULTA el CTA — el
 * cliente no puede quedarse con un equipo que ya no existe en el catálogo.
 * Ausente/null (backend viejo) se trata como disponible.
 *
 * Diseño del rediseño (OFERTA_COLORS). Solo reusa la DATA del requested_product
 * / current_product (imagen, cuota, accesorios, seguros).
 *
 * Mobile: para caber en 100vh, los accesorios se COLAPSAN tras un toggle. En
 * sm+ se muestran siempre.
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
  /** 'excede' (Caso 4, tachado gris) | 'disponible' (Caso 5, normal + CTA). */
  variant?: 'excede' | 'disponible';
  /** CTA opcional (solo variante 'disponible'), ej. "Mantener este equipo". */
  ctaText?: string;
  onElegir?: () => void;
  /** BAL-4193: `available_in_catalog` del backend. `false` = el equipo ya no
   *  está publicado (agotado/despublicado) → estilo gris forzado, badge "Ya no
   *  disponible" y sin CTA, sin importar `variant`. Ausente/null = disponible
   *  (compatibilidad con backend viejo). */
  availableInCatalog?: boolean | null;
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
  variant = 'excede',
  ctaText,
  onElegir,
  availableInCatalog,
}: EquipoPedidoCardProps) {
  const disponible = variant === 'disponible';
  // BAL-4193: solo cuenta como "ya no disponible" cuando el backend lo marca
  // explícitamente en `false`. Ausente/null (backend viejo) = disponible.
  const yaNoDisponible = availableInCatalog === false;
  // Estilo visual efectivo: 'disponible' pierde su look normal si el equipo ya
  // no está en catálogo — se ve y se comporta como 'excede' (gris, sin CTA).
  const disponibleVisual = disponible && !yaNoDisponible;
  const hayAddons = accessories.length > 0 || insurances.length > 0;
  const totalAddons = accessories.length + insurances.length;
  // Monto principal = total del pedido: equipo + accesorios + seguros. La card
  // muestra este total; el desglose lo descompone (equipo + cada add-on).
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

  // Colores según el estilo VISUAL efectivo (disponibleVisual): tonos normales
  // si el equipo cabe Y sigue en catálogo; gris atenuado + tachado si excede la
  // cuota (Caso 4) o si ya no está disponible (BAL-4193), sin importar `variant`.
  const nombreColor = disponibleVisual ? OFERTA_COLORS.textStrong : OFERTA_COLORS.textMid;
  const cuotaColor = disponibleVisual ? OFERTA_COLORS.primary : OFERTA_COLORS.textSoft;
  const addonMontoColor = disponibleVisual ? OFERTA_COLORS.textMid : OFERTA_COLORS.textSoft;
  const strike = disponibleVisual ? '' : 'line-through';

  return (
    <div
      className="rounded-xl border p-4"
      style={{
        borderColor: OFERTA_COLORS.border,
        backgroundColor: disponibleVisual ? '#fff' : OFERTA_COLORS.grayBg,
      }}
    >
      {/* Header: 'disponible' → "Tu equipo" (teal); 'excede' → "El que pediste"
          + badge de advertencia. BAL-4193: "Ya no disponible" se agrega (o
          reemplaza el look normal de 'disponible') cuando el backend marca el
          equipo como fuera de catálogo — puede convivir con "Excede tu cuota"
          en Caso 4 si aplican ambos motivos. */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <span
          className="text-[9.5px] font-bold uppercase tracking-[.1em]"
          style={{ color: disponibleVisual ? OFERTA_COLORS.tealBrand : OFERTA_COLORS.textSoft }}
        >
          {disponible ? 'Tu equipo' : 'El que pediste'}
        </span>
        {disponibleVisual ? null : (
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            {yaNoDisponible ? (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ backgroundColor: OFERTA_COLORS.amberBg, color: '#B45309' }}
              >
                Ya no disponible
              </span>
            ) : null}
            {!disponible ? (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ backgroundColor: OFERTA_COLORS.amberBg, color: '#B45309' }}
              >
                <TriangleAlert className="h-3 w-3" strokeWidth={2.4} />
                Excede tu cuota
              </span>
            ) : null}
          </div>
        )}
      </div>

      {/* Texto de apoyo (solo Caso 5 upsell, "Tu equipo" ya no disponible):
          la card gris + el badge ya avisan; esta línea explica por qué y guía
          al cliente. En Caso 4 ('excede') NO se agrega — la card ya es
          puramente informativa y el badge de arriba basta. */}
      {disponible && yaNoDisponible ? (
        <p className="mb-2.5 text-[11.5px] leading-snug" style={{ color: OFERTA_COLORS.textSoft }}>
          Este equipo ya no está en nuestro catálogo. Elige otra opción de tu oferta.
        </p>
      ) : null}

      <div className="flex items-start gap-3">
        {/* Imagen: normal en 'disponible', atenuada (grayscale) en 'excede' o
            cuando el equipo ya no está en catálogo (BAL-4193). */}
        <div
          className="flex h-[64px] w-[74px] flex-none items-center justify-center overflow-hidden rounded-xl border bg-white"
          style={{ borderColor: OFERTA_COLORS.border }}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={nombre} className={`h-full w-full object-contain ${disponibleVisual ? '' : 'opacity-60 grayscale'}`} />
          ) : (
            <span className="font-mono text-[8px]" style={{ color: OFERTA_COLORS.textSoft }}>equipo</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[14.5px] font-bold leading-[1.2]" style={{ color: nombreColor }}>
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
          {/* Cuota = TOTAL del pedido (equipo + accesorios + seguros). Tachada
              solo en 'excede'. */}
          {totalMonthly ? (
            <div className="mt-1.5">
              <span className={`text-[15px] font-bold ${strike}`} style={{ color: cuotaColor }}>
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

      {/* Toggle "ver detalle / lo que pediste" — visible en TODOS los viewports.
          El default de `abierto` lo fija el effect por viewport (desktop abierto,
          mobile cerrado); el usuario puede abrir/cerrar en ambos. */}
      {hayAddons ? (
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          className="group mt-2.5 flex w-full cursor-pointer items-center justify-between border-t pt-2.5 text-[12px] font-semibold transition-colors hover:text-[#4F46E5]"
          style={{ borderColor: OFERTA_COLORS.border, color: OFERTA_COLORS.textMid }}
          aria-expanded={abierto}
        >
          <span className="transition-colors group-hover:text-[#4F46E5]">
            {disponible ? `Ver detalle (${totalAddons})` : `Ver lo que pediste (${totalAddons})`}
          </span>
          <ChevronDown
            className="h-4 w-4 transition-transform duration-300 ease-out group-hover:text-[#4F46E5]"
            style={{ transform: abierto ? 'rotate(180deg)' : 'none' }}
          />
        </button>
      ) : null}

      {/* Desglose del pedido: producto principal + accesorios/seguros. Tachado en
          'excede', normal en 'disponible'. Colapso SUAVE con grid-template-rows
          (0fr↔1fr) + opacidad — sin librería. Contenido siempre montado. */}
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
                <span className={`flex-none font-semibold ${strike}`} style={{ color: addonMontoColor }}>
                  S/{Math.round(monthly)}{cuotaSuffix(paymentFrequency)}
                </span>
              </li>
            ) : null}
            {accessories.map((a) => (
              <li key={`ped-a-${a.id}`} className="flex items-center justify-between gap-2 text-[12.5px]">
                <span className="flex min-w-0 items-center gap-1.5" style={{ color: OFERTA_COLORS.textMid }}>
                  <Package className="h-3.5 w-3.5 flex-none" />
                  <span className="truncate">{a.name}</span>
                </span>
                <span className={`flex-none ${strike}`} style={{ color: addonMontoColor }}>
                  +S/{Math.round(a.monthly)}{cuotaSuffix(paymentFrequency)}
                </span>
              </li>
            ))}
            {insurances.map((i) => (
              <li key={`ped-i-${i.id}`} className="flex items-center justify-between gap-2 text-[12.5px]">
                <span className="flex min-w-0 items-center gap-1.5" style={{ color: OFERTA_COLORS.textMid }}>
                  <ShieldCheck className="h-3.5 w-3.5 flex-none" />
                  <span className="truncate">{i.name}</span>
                </span>
                <span className={`flex-none ${strike}`} style={{ color: addonMontoColor }}>
                  +S/{Math.round(i.monthly)}{cuotaSuffix(paymentFrequency)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* CTA "Mantener este equipo" — solo variante 'disponible' Y el equipo
          sigue en catálogo (BAL-4193). No se renderiza (no solo se oculta) si
          ya no está disponible: no queda en el DOM, así que no hay forma de
          clickearlo ni de llegar a él con teclado (Tab). */}
      {disponibleVisual && onElegir ? (
        <button
          type="button"
          onClick={onElegir}
          className="mt-3.5 w-full cursor-pointer rounded-lg py-2.5 text-center text-[13.5px] font-bold text-white transition-all duration-200 ease-out hover:brightness-95 active:scale-[.98]"
          style={{ backgroundColor: OFERTA_COLORS.primary, boxShadow: '0 6px 14px rgba(79,70,229,.35)' }}
        >
          {ctaText ?? 'Mantener este equipo'}
        </button>
      ) : null}
    </div>
  );
}
