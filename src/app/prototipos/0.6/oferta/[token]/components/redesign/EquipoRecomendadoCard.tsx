/**
 * EquipoRecomendadoCard — card destacada del equipo recomendado (BAL-2184).
 *
 * Copiado 1:1 de la card "APROBADO PARA TI" del mock, Caso 4
 * (docs/superpowers/design-refs/mock-index.html, líneas ~331-357): badge
 * superior con check, foto placeholder, marca en mayúsculas + nombre, chips
 * de specs (`lilac` bg), línea empática opcional en verde, footer con
 * plazo/inicial + cuota grande + botón CTA.
 *
 * `tone='verde'` usa el lenguaje visual del Caso 4 (downgrade aprobado):
 * borde/badge/botón `green`, cuota en `greenDark`.
 * `tone='indigo'` reutiliza la misma estructura para el Caso 5 (upsell,
 * "Aprovecha tu monto"): borde/badge/botón/cuota `primary`.
 *
 * Puramente presentacional: props → UI, sin fetch ni lógica de selección
 * (el `onElegir` lo conecta quien ensambla el index, Task 4).
 */
import type { ReactNode } from 'react';
import { useState } from 'react';
import { ChevronDown, Package, ShieldCheck } from 'lucide-react';

import { OFERTA_COLORS } from './ofertaTheme';

const AMBER_BG = '#FEF3E2';
const AMBER_FG = '#B45309';

/**
 * Badges de accesorios/seguros incluidos del combo ("Incluye: ..."). Color
 * ámbar tipo "regalo/incluido", ícono según tipo (Package/ShieldCheck). El
 * collapse en mobile lo maneja el contenedor padre (zona specs + Incluye).
 */
function ComboAddonsBadges({
  accessories = [],
  insurances = [],
}: {
  accessories?: string[];
  insurances?: string[];
}): ReactNode {
  const items = [
    ...accessories.map((name) => ({ name, kind: 'acc' as const })),
    ...insurances.map((name) => ({ name, kind: 'ins' as const })),
  ];
  if (items.length === 0) return null;

  return (
    <div className="mt-2.5">
      <div className="mb-1 text-[10.5px] font-bold uppercase tracking-[.06em]" style={{ color: AMBER_FG }}>
        Incluye
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map(({ name, kind }) => (
          <span
            key={`${kind}-${name}`}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{ backgroundColor: AMBER_BG, color: AMBER_FG }}
          >
            {kind === 'acc' ? (
              <Package className="h-3 w-3 shrink-0" strokeWidth={2.4} />
            ) : (
              <ShieldCheck className="h-3 w-3 shrink-0" strokeWidth={2.4} />
            )}
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

export interface EquipoRecomendadoInfo {
  name: string;
  brand?: string | null;
  imageUrl?: string | null;
  monthly: number;
  term?: number | null;
  initial?: string | null;
  specs?: string[];
  /** Accesorios/seguros incluidos del combo (badges "Incluye: ..."). Solo
   *  cuando el recomendado es un combo. */
  comboAccessories?: string[];
  comboInsurances?: string[];
}

export interface EquipoRecomendadoCardProps {
  equipo: EquipoRecomendadoInfo;
  tone: 'verde' | 'indigo';
  badgeText: string;
  ctaText: string;
  subtext?: string;
  onElegir: () => void;
  /** Acción secundaria "Ver detalle" (botón fantasma). Si no se pasa, no se
   *  muestra ese botón y el CTA "Aceptar" ocupa el ancho como antes. */
  onVerDetalle?: () => void;
}

const TONE_STYLES: Record<
  EquipoRecomendadoCardProps['tone'],
  { border: string; shadow: string; badgeBg: string; cuota: string; boton: string; botonShadow: string }
> = {
  verde: {
    border: OFERTA_COLORS.green,
    shadow: 'rgba(34,197,94,.16)',
    badgeBg: OFERTA_COLORS.green,
    cuota: OFERTA_COLORS.greenDark,
    boton: OFERTA_COLORS.green,
    botonShadow: 'rgba(34,197,94,.35)',
  },
  indigo: {
    border: OFERTA_COLORS.primary,
    shadow: 'rgba(79,70,229,.16)',
    badgeBg: OFERTA_COLORS.primary,
    cuota: OFERTA_COLORS.primary,
    boton: OFERTA_COLORS.primary,
    botonShadow: 'rgba(79,70,229,.35)',
  },
};

function CheckIcon(): ReactNode {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckCircleIcon({ color }: { color: string }): ReactNode {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.9" />
      <path d="M8 12l2.5 2.5L16 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function EquipoRecomendadoCard({
  equipo,
  tone,
  badgeText,
  ctaText,
  subtext,
  onElegir,
  onVerDetalle,
}: EquipoRecomendadoCardProps) {
  const t = TONE_STYLES[tone];
  const cuotaFormateada = Math.round(equipo.monthly).toLocaleString('es-PE');
  const plazoTexto =
    equipo.term != null
      ? `en ${equipo.term} meses${equipo.initial ? ` · ${equipo.initial}` : ' · sin inicial'}`
      : equipo.initial ?? undefined;

  // Collapse de la zona "specs + Incluye" — solo mobile: cerrado por default
  // (ahorra alto en 100vh), abierto en desktop vía sm:. El toggle alterna
  // false↔true. Solo se ofrece si hay algo que colapsar.
  const [detallesAbierto, setDetallesAbierto] = useState(false);
  const haySpecs = !!(equipo.specs && equipo.specs.length > 0);
  const hayIncluye = !!(equipo.comboAccessories?.length || equipo.comboInsurances?.length);
  const hayDetalles = haySpecs || hayIncluye;

  return (
    <div
      className="overflow-hidden rounded-xl border-[1.5px]"
      style={{ borderColor: t.border, boxShadow: `0 10px 24px ${t.shadow}` }}
    >
      {/* Badge superior */}
      <div
        className="flex items-center gap-1.5 px-3.5 py-1.5 text-[10px] font-bold tracking-[.09em] text-white"
        style={{ backgroundColor: t.badgeBg }}
      >
        <CheckIcon />
        {badgeText.toUpperCase()}
      </div>

      <div className="px-4 py-2.5 sm:py-3">
        {/* Foto + marca/nombre */}
        <div className="flex items-start gap-3">
          <div
            className="flex h-14 w-[76px] flex-none items-center justify-center rounded-xl border"
            style={{
              borderColor: OFERTA_COLORS.border,
              background: equipo.imageUrl
                ? undefined
                : 'repeating-linear-gradient(135deg, #F1F2F7 0 7px, #E9EBF2 7px 14px)',
            }}
          >
            {equipo.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={equipo.imageUrl} alt={equipo.name} className="h-full w-full rounded-xl object-contain" />
            ) : (
              <span
                className="font-mono text-[8px]"
                style={{ color: OFERTA_COLORS.textSoft }}
              >
                equipo
              </span>
            )}
          </div>
          <div className="min-w-0">
            {equipo.brand ? (
              <div
                className="text-[10px] font-bold tracking-[.12em]"
                style={{ color: OFERTA_COLORS.textSoft }}
              >
                {equipo.brand.toUpperCase()}
              </div>
            ) : null}
            <div className="mt-0.5 font-['Baloo_2',_sans-serif] text-[14.5px] font-bold leading-[1.15]">
              {equipo.name}
            </div>
          </div>
        </div>

        {/* Subtexto empático */}
        {subtext ? (
          <div
            className="mt-2.5 flex items-center gap-1.5 text-[12px] font-semibold"
            style={{ color: OFERTA_COLORS.greenDark }}
          >
            <CheckCircleIcon color={OFERTA_COLORS.greenDark} />
            {subtext}
          </div>
        ) : null}

        {/* Toggle "specs + Incluye" — SOLO mobile, SIEMPRE visible: alterna
            abrir/cerrar (false↔true). En desktop no aparece (zona siempre visible). */}
        {hayDetalles ? (
          <button
            type="button"
            onClick={() => setDetallesAbierto((v) => !v)}
            className="group mt-2.5 flex w-full cursor-pointer items-center justify-between text-[12px] font-semibold transition-colors sm:hidden"
            style={{ color: OFERTA_COLORS.textMid }}
            aria-expanded={detallesAbierto}
          >
            <span className="group-hover:text-[#4F46E5]">
              {detallesAbierto ? 'Ocultar' : 'Ver'} especificaciones{hayIncluye ? ' y qué incluye' : ''}
            </span>
            <ChevronDown
              className="h-4 w-4 transition-transform duration-300 ease-out group-hover:text-[#4F46E5]"
              style={{ transform: detallesAbierto ? 'rotate(180deg)' : 'none' }}
            />
          </button>
        ) : null}

        {/* Zona colapsable: chips de specs + badges "Incluye". Respeta
            `detallesAbierto` en mobile; en desktop (sm:) siempre visible. */}
        {hayDetalles ? (
          <div className={`${detallesAbierto ? 'block' : 'hidden'} sm:block`}>
            {haySpecs ? (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {equipo.specs!.map((spec) => (
                  <span
                    key={spec}
                    className="rounded-md px-2.5 py-1 text-[11px]"
                    style={{ backgroundColor: OFERTA_COLORS.lilac, color: '#4B5563' }}
                  >
                    {spec}
                  </span>
                ))}
              </div>
            ) : null}

            <ComboAddonsBadges
              accessories={equipo.comboAccessories}
              insurances={equipo.comboInsurances}
            />
          </div>
        ) : null}

        {/* Footer: plazo/cuota + acciones. Con "Ver detalle":
            - MOBILE: cuota arriba, botones en una fila aparte (ancho completo).
            - DESKTOP (sm+): cuota a la izquierda, botones a la derecha, misma fila.
            Sin "Ver detalle" → layout compacto: cuota izquierda, CTA derecha. */}
        {onVerDetalle ? (
          <div
            className="mt-3 flex flex-col gap-2.5 border-t pt-[11px] sm:flex-row sm:items-center sm:justify-between"
            style={{ borderColor: '#F1F2F7' }}
          >
            {/* MOBILE: cuota + plazo en UNA línea, la CUOTA primero
                ("S/170/mes · en 24 meses · sin inicial"). DESKTOP (sm+): dos
                líneas, plazo arriba y cuota abajo (order-2/order-1). */}
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5 sm:flex-col sm:flex-nowrap sm:items-start sm:gap-y-0">
              <div
                className="order-1 font-['Baloo_2',_sans-serif] text-[20px] font-bold leading-[1.1] sm:order-2"
                style={{ color: t.cuota }}
              >
                S/{cuotaFormateada}
                <span className="text-[12.5px] font-semibold" style={{ color: OFERTA_COLORS.textMid }}>
                  /mes
                </span>
              </div>
              {plazoTexto ? (
                <div className="order-2 text-[11.5px] sm:order-1" style={{ color: OFERTA_COLORS.textSoft }}>
                  {plazoTexto}
                </div>
              ) : null}
            </div>
            <div className="flex items-stretch gap-2 sm:flex-none">
              <button
                type="button"
                onClick={onVerDetalle}
                className="flex-1 cursor-pointer rounded-lg border px-3.5 py-2.5 font-['Baloo_2',_sans-serif] text-[13px] font-bold transition-all duration-200 ease-out hover:bg-[#F7F8FB] hover:shadow-sm active:scale-[.97] sm:flex-none"
                style={{ borderColor: t.border, color: t.cuota }}
              >
                Ver detalle
              </button>
              <button
                type="button"
                onClick={onElegir}
                className="flex-1 cursor-pointer rounded-lg px-4 py-2.5 font-['Baloo_2',_sans-serif] text-[13.5px] font-bold text-white transition-all duration-200 ease-out hover:brightness-95 active:scale-[.97] sm:flex-none"
                style={{ backgroundColor: t.boton, boxShadow: `0 6px 14px ${t.botonShadow}` }}
              >
                {ctaText}
              </button>
            </div>
          </div>
        ) : (
          <div
            className="mt-3 flex items-center justify-between border-t pt-[11px]"
            style={{ borderColor: '#F1F2F7' }}
          >
            <div>
              {plazoTexto ? (
                <div className="text-[11.5px]" style={{ color: OFERTA_COLORS.textSoft }}>
                  {plazoTexto}
                </div>
              ) : null}
              <div
                className="font-['Baloo_2',_sans-serif] text-[20px] font-bold leading-[1.1]"
                style={{ color: t.cuota }}
              >
                S/{cuotaFormateada}
                <span className="text-[12.5px] font-semibold" style={{ color: OFERTA_COLORS.textMid }}>
                  /mes
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onElegir}
              className="cursor-pointer rounded-lg px-5 py-3 font-['Baloo_2',_sans-serif] text-[14px] font-bold text-white transition-all duration-200 ease-out hover:brightness-95 active:scale-[.97]"
              style={{ backgroundColor: t.boton, boxShadow: `0 6px 14px ${t.botonShadow}` }}
            >
              {ctaText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
