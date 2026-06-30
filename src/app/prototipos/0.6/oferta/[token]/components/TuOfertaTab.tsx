'use client';

/**
 * TuOfertaTab — sección destacada de la oferta (sin tabs, dentro del scroll).
 * Muestra dos cards CUSTOM (OfertaEquipoCard, no la del catálogo):
 *   - "EL QUE PEDISTE": atenuado/tachado si no entra en la cuota; solo "Ver detalle".
 *   - "APROBADO PARA TI": destacado con tag verde "Aprobado" + 3 CTAs.
 */

import type { CatalogProduct } from '../../../[landing]/catalogo/types/catalog';
import type { OfferView } from '../../../services/offerApi';
import { OfertaEquipoCard } from './OfertaEquipoCard';

function detailHref(token: string, slug?: string | null): string | undefined {
  if (!slug) return undefined;
  return `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}/producto/${slug}`;
}

export function TuOfertaTab({
  token,
  offer,
  onVerCatalogo,
  onSelect,
}: {
  token: string;
  offer: OfferView;
  onVerCatalogo: () => void;
  onSelect: (product: CatalogProduct) => void;
}) {
  const rec = offer.recommended;
  const req = offer.requestedProduct;

  return (
    <main className="w-full px-3 py-6 sm:px-4 lg:px-6">
      <div className="grid items-stretch gap-6 lg:grid-cols-2">
        {/* EL QUE PEDISTE */}
        <section className="flex flex-col">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            El que pediste
          </p>
          {req ? (
            <OfertaEquipoCard
              variant="pedido"
              fits={false}
              name={req.name ?? 'Tu equipo'}
              imageUrl={req.image_url}
              href={detailHref(token, req.slug)}
            />
          ) : (
            <p className="text-sm text-gray-400">—</p>
          )}
        </section>

        {/* APROBADO PARA TI */}
        <section className="flex flex-col">
          <p
            className="mb-2 text-xs font-semibold uppercase tracking-wide"
            style={{ color: 'var(--color-primary)' }}
          >
            Aprobado para ti
          </p>
          {rec ? (
            <OfertaEquipoCard
              variant="aprobado"
              brand={rec.brand}
              name={rec.displayName || rec.name}
              imageUrl={rec.images?.[0] || rec.thumbnail}
              monthly={rec.quotaMonthly}
              termMonths={24}
              href={detailHref(token, rec.slug)}
              onAceptar={() => onSelect(rec)}
              onVerOtros={onVerCatalogo}
            />
          ) : (
            <p className="text-sm text-gray-500">No hay un equipo recomendado disponible.</p>
          )}
        </section>
      </div>
    </main>
  );
}
