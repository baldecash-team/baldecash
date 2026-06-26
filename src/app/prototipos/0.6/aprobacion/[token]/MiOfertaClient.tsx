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
import { Navbar } from '../../components/hero/Navbar';
import { CatalogoOfertaTab } from './components/CatalogoOfertaTab';
import { TuOfertaTab } from './components/TuOfertaTab';
import { CenteredMessage } from './components/CenteredMessage';

const BRAND_LOGO_URL = 'https://baldecash.s3.amazonaws.com/company/logo.png';

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
      {/* Header con logo (como el home). El Navbar logoOnly es fixed h-16 y trae
          su propio contenedor; lo dejamos full-width para alinear con el catálogo. */}
      <Navbar logoOnly fullWidth logoUrl={BRAND_LOGO_URL} />

      {/* Offset para el navbar fixed + barra de tabs sticky justo debajo.
          Mismo wrapper (w-full px-3 sm:px-4 lg:px-6) que filtros+cards → todo arranca igual. */}
      <div className="pt-16" />
      <div className="sticky top-16 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="w-full px-3 sm:px-4 lg:px-6">
          <nav className="flex gap-2 py-2.5">
            <TabChip active={tab === 'oferta'} onClick={() => setTab('oferta')}>
              Tu oferta
            </TabChip>
            <TabChip active={tab === 'catalogo'} onClick={() => setTab('catalogo')}>
              Catálogo (hasta S/ {Math.round(offer.maxMonthlyQuota)}/mes)
            </TabChip>
          </nav>
        </div>
      </div>

      {tab === 'oferta' ? (
        <TuOfertaTab offer={offer} onVerCatalogo={() => setTab('catalogo')} onSelect={handleSelect} />
      ) : (
        <CatalogoOfertaTab token={token} offer={offer} onSelect={handleSelect} />
      )}
    </div>
  );
}

/** Tab estilo card/chip: el activo se eleva con sombra + borde de color de marca. */
function TabChip({
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
      aria-pressed={active}
      className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
        active
          ? 'border-[var(--color-primary)] bg-white text-[var(--color-primary)] shadow-md -translate-y-0.5'
          : 'border-transparent bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}
