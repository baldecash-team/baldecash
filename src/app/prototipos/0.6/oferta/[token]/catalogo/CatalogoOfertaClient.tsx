'use client';

/**
 * CatalogoOfertaClient — página de catálogo de la oferta (subruta /catalogo).
 *
 * Carga la oferta por token y muestra el catálogo completo filtrado por la cuota
 * (CatalogoOfertaTab). Reusa el modal de confirmación y la pantalla de selección
 * de la página principal. "Ver otros equipos" de /oferta/{token} lleva aquí.
 */

import { useCallback, useEffect, useState } from 'react';
import { CubeGridSpinner, ScrollToTopButton } from '@/app/prototipos/_shared';

import { OFERTA_COLORS } from '../components/redesign/ofertaTheme';
import type { CatalogProduct } from '../../../[landing]/catalogo/types/catalog';
import {
  getOffer,
  OfferApiError,
  type OfferView,
  type OfferErrorReason,
} from '../../../services/offerApi';
import { Navbar } from '../../../components/hero/Navbar';
import { CatalogoOfertaTab } from '../components/CatalogoOfertaTab';
import { OfertaEstadoMensaje, type OfertaEstadoIcon } from '../components/OfertaEstadoMensaje';
import { saveOfferSelection } from '../offerStorage';
import { useAnalytics } from '../../../analytics/useAnalytics';

const BRAND_LOGO_URL = 'https://baldecash.s3.amazonaws.com/company/logo.png';
const WHATSAPP_URL = 'https://wa.link/osgxjf';

type PageState =
  | { kind: 'loading' }
  | { kind: 'ready'; offer: OfferView }
  | { kind: 'error'; reason: OfferErrorReason; message: string };

const ERROR_COPY: Record<string, { icon: OfertaEstadoIcon; title: string; body: string }> = {
  expired: { icon: 'clock', title: 'Esta oferta venció', body: 'El tiempo para elegir tu equipo ya terminó. Escríbenos y con gusto te ayudamos a reactivarla.' },
  consumed: { icon: 'alert', title: 'Ya elegiste tu equipo', body: 'Esta oferta ya fue utilizada. Si necesitas ayuda, contáctanos.' },
  revoked: { icon: 'ban', title: 'Oferta no disponible', body: 'Este enlace fue desactivado. Escríbenos para más información.' },
  invalid: { icon: 'search', title: 'Enlace no válido', body: 'No pudimos encontrar tu oferta. Verifica el enlace que recibiste o escríbenos.' },
  default: { icon: 'alert', title: 'No pudimos cargar tu oferta', body: 'Ocurrió un problema. Intenta nuevamente más tarde.' },
};

function readInitialQuery(): string {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('q') || '';
}

export function CatalogoOfertaClient({ token }: { token: string }) {
  const analytics = useAnalytics();
  const [state, setState] = useState<PageState>({ kind: 'loading' });
  const [searchQuery, setSearchQuery] = useState(readInitialQuery);

  // Navegación pura (sin tracking): también se usa para el redirect AUTOMÁTICO
  // cuando la oferta ya fue consumida (no es un "volver" del usuario).
  const backToOferta = useCallback(() => {
    window.location.href = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}`;
  }, [token]);

  // Funnel (BAL-2236): click explícito del usuario en "Volver a mi oferta"
  // (botón `onBack` de CatalogoOfertaTab). Separado de `backToOferta` para no
  // trackear el redirect automático de arriba (link ya consumido).
  const handleBackToIndex = useCallback(() => {
    analytics.track('offer_back_to_index', {
      offer_case: state.kind === 'ready' ? state.offer.offerCase ?? 'unknown' : 'unknown',
      from: 'catalog',
    });
    backToOferta();
  }, [analytics, state, backToOferta]);

  // Funnel: entrada al catálogo de la oferta (subruta separada de /oferta/{token}).
  // offer_case aún no se conoce al montar (la oferta carga async) → 'unknown'.
  useEffect(() => {
    analytics.track('offer_explore_view', { offer_case: 'unknown', origin: 'catalog' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let active = true;
    getOffer(token)
      .then((offer) => {
        if (!active) return;
        // Ya consumido con selección → volver a la página principal (muestra la
        // confirmación allá). Aquí no se puede elegir de nuevo.
        if (offer.alreadySelected) {
          backToOferta();
          return;
        }
        setState({ kind: 'ready', offer });
      })
      .catch((err) => {
        if (!active) return;
        const reason = err instanceof OfferApiError ? err.reason : 'unknown';
        const message = err instanceof OfferApiError ? err.message : 'Error desconocido';
        setState({ kind: 'error', reason, message });
      });
    return () => {
      active = false;
    };
  }, [token, backToOferta]);

  // Elegir un equipo del catálogo → página de accesorios/seguros (mini-checkout,
  // BAL-2064). La selección (variant/combo/slug + datos del equipo) se guarda en
  // localStorage → la URL de accesorios queda limpia, sin query params.
  const handleSelect = useCallback(
    (product: CatalogProduct) => {
      const base = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}/complementos`;
      const variantId = product.variantId ? Number(product.variantId) : null;
      const comboId = product.comboId != null ? Number(product.comboId) : null;
      // Funnel: elige un equipo desde el catálogo de la oferta (subruta /catalogo).
      analytics.track('offer_equipment_chosen', {
        offer_case: state.kind === 'ready' ? state.offer.offerCase ?? 'unknown' : 'unknown',
        source: 'catalog',
        variant_id: variantId ?? null,
        combo_id: comboId ?? null,
      });
      if (variantId == null) {
        window.location.href = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}/producto/${product.slug ?? ''}`;
        return;
      }
      saveOfferSelection(token, {
        variantId,
        comboId,
        slug: product.slug ?? null,
        name: product.displayName || product.name,
        brand: product.brand,
        imageUrl: product.images?.[0] || product.thumbnail,
        monthly: product.quotaMonthly,
      });
      window.location.href = base;
    },
    [token, analytics, state],
  );

  if (state.kind === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface-bg,#fafafa)]">
        <CubeGridSpinner />
      </div>
    );
  }

  if (state.kind === 'error') {
    const copy = ERROR_COPY[state.reason] ?? ERROR_COPY.default;
    return (
      <OfertaEstadoMensaje
        icon={copy.icon}
        title={copy.title}
        description={copy.body}
        whatsappUrl={WHATSAPP_URL}
      />
    );
  }

  const { offer } = state;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar logoOnly fullWidth logoUrl={BRAND_LOGO_URL} />

      <div className="pt-16" />

      {/* "Volver a mi oferta" va en la fila del buscador (dentro de CatalogoOfertaTab),
          a la misma altura, igual que el detalle del producto. */}
      <CatalogoOfertaTab
        token={token}
        offer={offer}
        onSelect={handleSelect}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onBack={handleBackToIndex}
      />

      {/* Botón "volver arriba" — componente compartido, tema de la oferta. */}
      <ScrollToTopButton
        className="fixed bottom-6 right-6 z-[100] flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-white shadow-lg transition-all duration-200 ease-out hover:scale-110 hover:brightness-95 active:scale-95"
        style={{ backgroundColor: OFERTA_COLORS.primary, boxShadow: '0 6px 16px rgba(79,70,229,.4)' }}
      />
    </div>
  );
}
