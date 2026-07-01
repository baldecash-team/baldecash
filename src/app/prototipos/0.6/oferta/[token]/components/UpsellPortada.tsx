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

// Mensaje de la oferta exclusiva según el perfil.
const PROFILE_MESSAGE: Record<string, string> = {
  A: 'Cambia a un equipo mejor por la misma cuota ya aprobada.',
  B: 'Tu mismo equipo, con accesorios incluidos, sin cambiar la cuota.',
  C: 'Combo completo a precio especial. Llévate más por lo mismo.',
};

function EquipoCard({
  label,
  brand,
  name,
  imageUrl,
  monthly,
  subtitle,
  highlight,
}: {
  label: string;
  brand?: string | null;
  name?: string | null;
  imageUrl?: string | null;
  monthly?: number | null;
  subtitle?: string | null;
  highlight?: boolean;
}) {
  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white ${
        highlight ? 'border-2' : 'border-gray-200'
      }`}
      style={
        highlight
          ? { borderColor: GREEN, boxShadow: `0 0 24px 4px ${GREEN}33, 0 6px 16px ${GREEN}22` }
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
        </div>
      ) : (
        <div className="px-4 py-2.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</span>
        </div>
      )}

      <div className="flex items-center justify-center bg-gray-50 px-6 py-6">
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
  onVerCatalogo,
}: {
  offer: OfferView;
  onAceptar: () => void;
  onVerCatalogo: () => void;
}) {
  const current = offer.requestedProduct; // el equipo que ya tenía aprobado
  const ex = offer.exclusiveOffer;
  const profile = (offer.profile || 'A').toUpperCase();
  const nombre = (offer.clientName || '').trim();
  const acc = ex?.accessory;

  return (
    <main className="w-full px-3 py-6 sm:px-4 lg:px-6">
      {/* Encabezado */}
      <div className="mx-auto mb-6 max-w-3xl text-center">
        <h1 className="font-['Baloo_2',_sans-serif] text-2xl font-bold text-[var(--foreground)]">
          {nombre ? `¡Tu equipo está listo, ${nombre}!` : '¡Tu equipo está listo!'}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Aprobamos tu equipo a S/{Math.round(offer.maxMonthlyQuota)}/mes con inicial S/0. Antes de firmar, mira esto:
        </p>
      </div>

      {/* TU EQUIPO vs OFERTA EXCLUSIVA */}
      <div className="mx-auto grid max-w-4xl items-stretch gap-6 md:grid-cols-2">
        <EquipoCard
          label="Tu equipo"
          name={current?.name}
          imageUrl={current?.image_url}
          monthly={current?.monthly_price}
        />
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
      </div>

      {/* Acciones */}
      <div className="mx-auto mt-8 flex max-w-md flex-col gap-3">
        <button
          type="button"
          onClick={onAceptar}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all hover:brightness-90"
          style={{ backgroundColor: GREEN }}
        >
          <CheckCircle2 className="h-5 w-5" />
          Aceptar oferta exclusiva
        </button>
        <button
          type="button"
          onClick={onVerCatalogo}
          className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
        >
          Ver catálogo completo
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </main>
  );
}
