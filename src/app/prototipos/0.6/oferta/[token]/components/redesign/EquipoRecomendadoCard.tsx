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
import { Package, ShieldCheck } from 'lucide-react';

import { OFERTA_COLORS } from './ofertaTheme';

const AMBER_BG = '#FEF3E2';
const AMBER_FG = '#B45309';
/** Cuántos badges mostrar antes de colapsar en "+N más" (solo mobile). */
const MOBILE_BADGE_CAP = 3;

/**
 * Badges de accesorios/seguros incluidos del combo ("Incluye: ..."). Color
 * ámbar tipo "regalo/incluido", ícono según tipo (Package/ShieldCheck).
 * Mobile: muestra hasta MOBILE_BADGE_CAP + un "+N más" que expande. Desktop
 * (≥640px): siempre todos (el "+N más" se oculta vía sm:hidden).
 */
function ComboAddonsBadges({
  accessories = [],
  insurances = [],
}: {
  accessories?: string[];
  insurances?: string[];
}): ReactNode {
  const [expandido, setExpandido] = useState(false);
  const items = [
    ...accessories.map((name) => ({ name, kind: 'acc' as const })),
    ...insurances.map((name) => ({ name, kind: 'ins' as const })),
  ];
  if (items.length === 0) return null;

  const ocultosMobile = Math.max(0, items.length - MOBILE_BADGE_CAP);

  const badge = (name: string, kind: 'acc' | 'ins', hiddenOnMobile: boolean) => (
    <span
      key={`${kind}-${name}`}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        hiddenOnMobile && !expandido ? 'hidden sm:inline-flex' : ''
      }`}
      style={{ backgroundColor: AMBER_BG, color: AMBER_FG }}
    >
      {kind === 'acc' ? (
        <Package className="h-3 w-3 shrink-0" strokeWidth={2.4} />
      ) : (
        <ShieldCheck className="h-3 w-3 shrink-0" strokeWidth={2.4} />
      )}
      {name}
    </span>
  );

  return (
    <div className="mt-2.5">
      <div className="mb-1 text-[10.5px] font-bold uppercase tracking-[.06em]" style={{ color: AMBER_FG }}>
        Incluye
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it, i) => badge(it.name, it.kind, i >= MOBILE_BADGE_CAP))}
        {/* "+N más" solo en mobile y solo si hay ocultos y no está expandido. */}
        {ocultosMobile > 0 && !expandido ? (
          <button
            type="button"
            onClick={() => setExpandido(true)}
            className="inline-flex cursor-pointer items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors hover:bg-[#FEF3E2] sm:hidden"
            style={{ borderColor: AMBER_FG, color: AMBER_FG }}
          >
            +{ocultosMobile} más
          </button>
        ) : null}
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

        {/* Chips de specs */}
        {equipo.specs && equipo.specs.length > 0 ? (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {equipo.specs.map((spec) => (
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

        {/* Footer: plazo/cuota + acciones. Con "Ver detalle" → cuota arriba y
            dos botones en una fila (secundario fantasma + CTA primario). Sin él
            → layout compacto: cuota a la izquierda, CTA a la derecha. */}
        {onVerDetalle ? (
          <div
            className="mt-3 flex items-center justify-between gap-2 border-t pt-[11px]"
            style={{ borderColor: '#F1F2F7' }}
          >
            <div className="min-w-0">
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
            <div className="flex flex-none items-stretch gap-2">
              <button
                type="button"
                onClick={onVerDetalle}
                className="cursor-pointer rounded-lg border px-3.5 py-2.5 font-['Baloo_2',_sans-serif] text-[13px] font-bold transition-all duration-200 ease-out hover:bg-[#F7F8FB] hover:shadow-sm active:scale-[.97]"
                style={{ borderColor: t.border, color: t.cuota }}
              >
                Ver detalle
              </button>
              <button
                type="button"
                onClick={onElegir}
                className="cursor-pointer rounded-lg px-4 py-2.5 font-['Baloo_2',_sans-serif] text-[13.5px] font-bold text-white transition-all duration-200 ease-out hover:brightness-95 active:scale-[.97]"
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
