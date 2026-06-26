'use client';

/**
 * MiOfertaClient — orquestador de la página "Mi Oferta" (Caso 4 · BAL-1785).
 *
 * Carga la oferta por token y maneja los estados (cargando / válido / expirado /
 * usado / inválido). Muestra 2 tabs: "Tu oferta" (default) y "Catálogo".
 *
 * FE-1: estructura, estados y catálogo funcional (ProductCard alimentado por
 * offerApi, con el tope de cuota aplicado por el backend).
 * FE-2: pulido de "Tu oferta" (pedido tachado, recomendado destacado, countdown).
 */

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

import { ProductCard } from '../../[landing]/catalogo/components/catalog/cards/ProductCard';
import type { CatalogProduct } from '../../[landing]/catalogo/types/catalog';
import {
  getOffer,
  getCatalog,
  OfferApiError,
  type OfferView,
  type OfferErrorReason,
} from '../../services/offerApi';

type TabKey = 'oferta' | 'catalogo';

type PageState =
  | { kind: 'loading' }
  | { kind: 'ready'; offer: OfferView }
  | { kind: 'error'; reason: OfferErrorReason; message: string };

const ERROR_COPY: Record<string, { title: string; body: string }> = {
  expired: { title: 'Esta oferta venció', body: 'El enlace de tu oferta ya no está disponible. Escríbenos para ayudarte.' },
  consumed: { title: 'Ya elegiste tu equipo', body: 'Esta oferta ya fue utilizada. Si necesitas ayuda, contáctanos.' },
  revoked: { title: 'Oferta no disponible', body: 'Este enlace fue desactivado. Escríbenos para más información.' },
  invalid: { title: 'Enlace no válido', body: 'No pudimos encontrar tu oferta. Verifica el enlace que recibiste.' },
  default: { title: 'No pudimos cargar tu oferta', body: 'Ocurrió un problema. Intenta nuevamente más tarde.' },
};

export function MiOfertaClient({ token }: { token: string }) {
  const [state, setState] = useState<PageState>({ kind: 'loading' });
  const [tab, setTab] = useState<TabKey>('oferta');
  const [catalog, setCatalog] = useState<CatalogProduct[] | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(false);

  // Carga inicial de la oferta
  useEffect(() => {
    let active = true;
    getOffer(token)
      .then((offer) => active && setState({ kind: 'ready', offer }))
      .catch((err) => {
        if (!active) return;
        const reason = err instanceof OfferApiError ? err.reason : 'unknown';
        const message = err instanceof OfferApiError ? err.message : 'Error desconocido';
        setState({ kind: 'error', reason, message });
      });
    return () => {
      active = false;
    };
  }, [token]);

  // Carga del catálogo la primera vez que se entra al tab "Catálogo"
  const loadCatalog = useCallback(async () => {
    if (catalog !== null) return;
    setCatalogLoading(true);
    try {
      const res = await getCatalog(token);
      setCatalog(res.items);
    } catch {
      setCatalog([]);
    } finally {
      setCatalogLoading(false);
    }
  }, [token, catalog]);

  useEffect(() => {
    if (tab === 'catalogo') void loadCatalog();
  }, [tab, loadCatalog]);

  if (state.kind === 'loading') {
    return <CenteredMessage icon={<Clock className="h-8 w-8 animate-pulse" />} title="Cargando tu oferta…" />;
  }

  if (state.kind === 'error') {
    const copy = ERROR_COPY[state.reason] ?? ERROR_COPY.default;
    return (
      <CenteredMessage
        icon={<AlertCircle className="h-8 w-8 text-amber-500" />}
        title={copy.title}
        body={copy.body}
      />
    );
  }

  const { offer } = state;

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-6">
      {/* Header */}
      <header className="mb-6 flex items-center gap-2">
        <CheckCircle2 className="h-6 w-6" style={{ color: 'var(--color-primary)' }} />
        <h1 className="text-xl font-semibold text-[var(--foreground)]">Mi oferta</h1>
      </header>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        <TabButton active={tab === 'oferta'} onClick={() => setTab('oferta')}>
          Tu oferta
        </TabButton>
        <TabButton active={tab === 'catalogo'} onClick={() => setTab('catalogo')}>
          Catálogo (hasta S/ {Math.round(offer.maxMonthlyQuota)}/mes)
        </TabButton>
      </div>

      {/* Contenido */}
      {tab === 'oferta' ? (
        <OfertaTab offer={offer} onVerCatalogo={() => setTab('catalogo')} />
      ) : (
        <CatalogoTab token={token} items={catalog} loading={catalogLoading} />
      )}
    </main>
  );
}

/** Tab "Tu oferta" — FE-1: estructura base. FE-2 lo pule (tachado, countdown). */
function OfertaTab({ offer, onVerCatalogo }: { offer: OfferView; onVerCatalogo: () => void }) {
  return (
    <section className="space-y-6">
      {offer.recommended ? (
        <div className="rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-primary)' }}>
            Aprobado para ti
          </p>
          <ProductCard product={offer.recommended} hideColors />
        </div>
      ) : (
        <p className="text-sm text-gray-500">No hay un equipo recomendado disponible.</p>
      )}

      <button
        type="button"
        onClick={onVerCatalogo}
        className="w-full rounded-xl py-3 font-semibold text-white"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        Ver catálogo (hasta S/ {Math.round(offer.maxMonthlyQuota)}/mes)
      </button>
    </section>
  );
}

/** Tab "Catálogo" — grilla de ProductCards filtrada por la cuota (backend). */
function CatalogoTab({
  token,
  items,
  loading,
}: {
  token: string;
  items: CatalogProduct[] | null;
  loading: boolean;
}) {
  void token;
  if (loading || items === null) {
    return <CenteredMessage icon={<Clock className="h-6 w-6 animate-pulse" />} title="Cargando catálogo…" />;
  }
  if (items.length === 0) {
    return <p className="py-10 text-center text-sm text-gray-500">No hay equipos disponibles para tu cuota.</p>;
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((product) => (
        <ProductCard key={product.id} product={product} hideColors />
      ))}
    </div>
  );
}

// ── helpers de UI ──────────────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? 'border-[var(--color-primary)] text-[var(--foreground)]'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

function CenteredMessage({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body?: string;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-3" style={{ color: 'var(--color-primary)' }}>
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-[var(--foreground)]">{title}</h2>
      {body ? <p className="mt-2 max-w-sm text-sm text-gray-500">{body}</p> : null}
    </div>
  );
}
