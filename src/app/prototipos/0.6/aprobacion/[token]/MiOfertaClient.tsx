'use client';

/**
 * MiOfertaClient — orquestador de la página "Mi Oferta" (Caso 4 · BAL-1785).
 *
 * Carga la oferta por token y maneja estados (cargando / válido / expirado /
 * usado / inválido). Dos tabs que usan el LAYOUT REAL del catálogo:
 *   - "Tu oferta": recomendado + el que pediste (sin filtros).
 *   - "Catálogo":  CatalogLayoutV4 completo con filtros, alimentado por offerApi.
 */

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Clock } from 'lucide-react';

import type { CatalogProduct } from '../../[landing]/catalogo/types/catalog';
import {
  getOffer,
  OfferApiError,
  type OfferView,
  type OfferErrorReason,
} from '../../services/offerApi';
import { CatalogoOfertaTab } from './components/CatalogoOfertaTab';
import { TuOfertaTab } from './components/TuOfertaTab';
import { CenteredMessage } from './components/CenteredMessage';

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

  const handleSelect = useCallback(
    (product: CatalogProduct) => {
      // El detalle / la card de oferta navega al detalle de oferta para confirmar.
      const slug = product.slug;
      window.location.href = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/aprobacion/${token}/producto/${slug}`;
    },
    [token],
  );

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
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header sticky + tabs */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <span className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
            BaldeCash
          </span>
          <span className="text-sm text-gray-400">·</span>
          <span className="text-sm font-medium text-gray-700">Mi oferta</span>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 px-4">
          <TabButton active={tab === 'oferta'} onClick={() => setTab('oferta')}>
            Tu oferta
          </TabButton>
          <TabButton active={tab === 'catalogo'} onClick={() => setTab('catalogo')}>
            Catálogo (hasta S/ {Math.round(offer.maxMonthlyQuota)}/mes)
          </TabButton>
        </nav>
      </header>

      {tab === 'oferta' ? (
        <TuOfertaTab offer={offer} onVerCatalogo={() => setTab('catalogo')} onSelect={handleSelect} />
      ) : (
        <CatalogoOfertaTab token={token} offer={offer} onSelect={handleSelect} />
      )}
    </div>
  );
}

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
      className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
        active
          ? 'border-[var(--color-primary)] text-[var(--foreground)]'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}
