'use client';

/**
 * UpsellPortada — portada del Caso 5 (Mockup 5). Muestra "TU EQUIPO" (el que el
 * cliente ya tenía aprobado) frente a "OFERTA EXCLUSIVA PARA TI" (la mejora), con
 * el mensaje según el perfil A/B/C. El cliente puede aceptar la oferta, quedarse
 * con su equipo, o ver el catálogo completo.
 */
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import type { OfferView } from '../../../services/offerApi';

const GREEN = '#16a34a';
// Morado tenue para la card "Tu equipo" (derivado del primary #4654CD).
const PURPLE_SOFT_BG = '#F1F2FB';
const PURPLE_SOFT_BORDER = '#C7CDF0';

// Mensaje de la oferta exclusiva según el perfil (sin mencionar la cuota/tope).
const PROFILE_MESSAGE: Record<string, string> = {
  A: 'Cambia a un equipo mejor sin pagar de más.',
  B: 'Tu mismo equipo, con accesorios incluidos.',
  C: 'Combo completo a precio especial. Llévate más.',
};

function EquipoCard({
  label,
  brand,
  name,
  imageUrl,
  monthly,
  subtitle,
  highlight,
  tone = 'default',
}: {
  label: string;
  brand?: string | null;
  name?: string | null;
  imageUrl?: string | null;
  monthly?: number | null;
  subtitle?: string | null;
  highlight?: boolean;
  /** 'morado' = card "Tu equipo" en morado tenio; 'default' = neutra. */
  tone?: 'default' | 'morado';
}) {
  const isMorado = !highlight && tone === 'morado';
  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden rounded-2xl border ${
        highlight ? 'border-2 bg-white' : isMorado ? 'border' : 'border-gray-200 bg-white'
      }`}
      style={
        highlight
          ? { borderColor: GREEN, boxShadow: `0 0 24px 4px ${GREEN}33, 0 6px 16px ${GREEN}22` }
          : isMorado
            ? { borderColor: PURPLE_SOFT_BORDER, backgroundColor: PURPLE_SOFT_BG }
            : undefined
      }
    >
      {highlight ? (
        <div
          className="flex items-center justify-center gap-2 px-4 py-2.5"
          style={{ background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN}cc 50%, ${GREEN} 100%)` }}
        >
          <Sparkles className="h-4 w-4 text-white" />
          <span className="text-sm font-black uppercase tracking-widest text-white">
            Oferta exclusiva para ti
          </span>
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      ) : (
        <div className="px-4 py-2.5">
          <span
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: isMorado ? 'var(--color-primary)' : '#9ca3af' }}
          >
            {label}
          </span>
        </div>
      )}

      <div
        className={`flex items-center justify-center px-6 py-6 ${isMorado ? '' : 'bg-gray-50'}`}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={name ?? ''} className="h-36 w-auto object-contain" />
        ) : (
          <div className="flex h-36 w-full items-center justify-center text-gray-300">Sin imagen</div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-6 py-5">
        {brand ? (
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{brand}</p>
        ) : null}
        <h3 className="mt-1 text-base font-bold leading-snug text-[var(--text-strong,#111827)]">
          {name ?? 'Tu equipo'}
        </h3>
        {monthly ? (
          <div className="mt-3">
            <p className="text-2xl font-extrabold" style={{ color: highlight ? GREEN : 'var(--color-primary)' }}>
              S/{Math.round(monthly)}
              <span className="text-base font-normal text-gray-400">/mes</span>
            </p>
            <p className="mt-0.5 text-xs text-gray-400">en 24 meses · sin inicial</p>
          </div>
        ) : null}
        {subtitle ? <p className="mt-2 text-xs font-medium text-emerald-600">{subtitle}</p> : null}
      </div>
    </div>
  );
}

export function UpsellPortada({
  offer,
  onAceptar,
  onContinuar,
  onVerCatalogo,
}: {
  offer: OfferView;
  onAceptar: () => void;
  onContinuar: () => void;
  onVerCatalogo: () => void;
}) {
  const current = offer.requestedProduct; // el equipo que ya tenía aprobado
  const ex = offer.exclusiveOffer;
  const profile = (offer.profile || 'A').toUpperCase();
  const nombre = (offer.clientName || '').trim();
  const acc = ex?.accessory;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Encabezado */}
      <div className="mx-auto mb-6 max-w-3xl text-center">
        <h1 className="font-['Baloo_2',_sans-serif] text-2xl font-bold text-[var(--foreground)]">
          {nombre ? `¡Tu equipo está listo, ${nombre}!` : '¡Tu equipo está listo!'}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Antes de firmar, mira esta oferta que preparamos para ti:
        </p>
        {/* Perfil C — tarifa especial: badge destacado */}
        {offer.isCustomRate ? (
          <div
            className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <Sparkles className="h-4 w-4" />
            Tarifa especial para ti
            <Sparkles className="h-4 w-4" />
          </div>
        ) : null}
      </div>

      {/* TU EQUIPO vs OFERTA EXCLUSIVA — cada card con su propio CTA */}
      <div className="mx-auto grid max-w-4xl items-stretch gap-6 md:grid-cols-2">
        {/* Tu equipo (morado tenue) + CTA "continuar con mi equipo" */}
        <div className="flex flex-col gap-3">
          <EquipoCard
            label="Tu equipo"
            tone="morado"
            name={current?.name}
            imageUrl={current?.image_url}
            monthly={current?.monthly_price}
          />
          <button
            type="button"
            onClick={onContinuar}
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-semibold transition-colors hover:bg-[#F1F2FB]"
            style={{ borderColor: '#C7CDF0', color: 'var(--color-primary)' }}
          >
            Continuar con mi equipo
          </button>
        </div>

        {/* Oferta exclusiva + CTA "aceptar" (compacto) */}
        <div className="flex flex-col gap-3">
          <EquipoCard
            label="Oferta exclusiva"
            highlight
            brand={ex?.brand}
            name={ex?.name}
            imageUrl={ex?.imageUrl}
            monthly={ex?.combinedMonthly}
            subtitle={
              acc
                ? `Incluye ${acc.name} — ${PROFILE_MESSAGE[profile] ?? ''}`
                : PROFILE_MESSAGE[profile] ?? ''
            }
          />
          <button
            type="button"
            onClick={onAceptar}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-all hover:brightness-90"
            style={{ backgroundColor: GREEN }}
          >
            <CheckCircle2 className="h-4 w-4" />
            Aceptar oferta exclusiva
          </button>
        </div>
      </div>

      {/* Ver catálogo completo (secundario, centrado) */}
      <div className="mx-auto mt-6 flex max-w-xs">
        <button
          type="button"
          onClick={onVerCatalogo}
          className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold text-gray-500 transition-colors hover:text-gray-700"
        >
          Ver catálogo completo
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </main>
  );
}
