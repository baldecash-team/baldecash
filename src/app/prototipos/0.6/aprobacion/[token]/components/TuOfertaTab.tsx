'use client';

/**
 * TuOfertaTab — pestaña "Tu oferta" (sin filtros). Usa el ancho y estilo del
 * catálogo (no centrado angosto). Muestra:
 *   - Countdown de vencimiento.
 *   - "EL QUE PEDISTE" (tachado, de requested_product).
 *   - "APROBADO PARA TI" (recomendado destacado, ProductCard en modo oferta).
 *   - Botón para ir al catálogo completo.
 */

import { Clock } from 'lucide-react';

import { ProductCard } from '../../../[landing]/catalogo/components/catalog/cards/ProductCard';
import type { CatalogProduct } from '../../../[landing]/catalogo/types/catalog';
import type { OfferView } from '../../../services/offerApi';
import { useCountdown } from './useCountdown';

export function TuOfertaTab({
  offer,
  onVerCatalogo,
  onSelect,
}: {
  offer: OfferView;
  onVerCatalogo: () => void;
  onSelect: (product: CatalogProduct) => void;
}) {
  const countdown = useCountdown(offer.expiresAt);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      {/* Countdown */}
      {countdown && !countdown.expired ? (
        <div className="mb-5 flex items-center justify-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          <Clock className="h-4 w-4" />
          <span>
            Tu oferta vence en <strong>{countdown.label}</strong>
          </span>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* EL QUE PEDISTE */}
        <section>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            El que pediste
          </p>
          {offer.requestedProduct ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-4 opacity-70">
              {offer.requestedProduct.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={offer.requestedProduct.image_url}
                  alt={offer.requestedProduct.name ?? 'Equipo solicitado'}
                  className="mx-auto mb-3 h-32 w-auto object-contain grayscale"
                />
              ) : (
                <div className="mx-auto mb-3 flex h-32 items-center justify-center text-gray-300">
                  Sin imagen
                </div>
              )}
              <p className="text-center text-sm font-medium text-gray-500 line-through">
                {offer.requestedProduct.name}
              </p>
              <p className="mt-1 text-center text-xs text-gray-400">
                No disponible para tu cuota aprobada.
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">—</p>
          )}
        </section>

        {/* APROBADO PARA TI */}
        <section>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-primary)' }}>
            Aprobado para ti
          </p>
          {offer.recommended ? (
            <div className="rounded-2xl border-2 p-2" style={{ borderColor: 'var(--color-primary)' }}>
              <ProductCard
                product={offer.recommended}
                hideColors
                hideFavorite
                ctaLabel="Elegir este equipo"
                onCtaClick={() => onSelect(offer.recommended as CatalogProduct)}
              />
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hay un equipo recomendado disponible.</p>
          )}
        </section>
      </div>

      <button
        type="button"
        onClick={onVerCatalogo}
        className="mt-6 w-full rounded-xl py-3 font-semibold text-white"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        Ver catálogo (hasta S/ {Math.round(offer.maxMonthlyQuota)}/mes)
      </button>
    </main>
  );
}
