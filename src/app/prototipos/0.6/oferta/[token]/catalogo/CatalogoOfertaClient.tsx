'use client';

/**
 * CatalogoOfertaClient — página de catálogo de la oferta (subruta /catalogo).
 *
 * Carga la oferta por token y muestra el catálogo completo filtrado por la cuota
 * (CatalogoOfertaTab). Reusa el modal de confirmación y la pantalla de selección
 * de la página principal. "Ver otros equipos" de /oferta/{token} lleva aquí.
 */

import { useCallback, useEffect, useState } from 'react';
import { CubeGridSpinner } from '@/app/prototipos/_shared';

import type { CatalogProduct } from '../../../[landing]/catalogo/types/catalog';
import {
  getOffer,
  selectEquipment,
  OfferApiError,
  type OfferView,
  type OfferErrorReason,
} from '../../../services/offerApi';
import { Navbar } from '../../../components/hero/Navbar';
import { CatalogoOfertaTab } from '../components/CatalogoOfertaTab';
import { OfertaEstadoMensaje, type OfertaEstadoIcon } from '../components/OfertaEstadoMensaje';
import { ConfirmarEleccionModal, type EquipoAConfirmar } from '../components/ConfirmarEleccionModal';
import { SeleccionConfirmada, type ChosenSummary } from '../components/SeleccionConfirmada';

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
  const [state, setState] = useState<PageState>({ kind: 'loading' });
  const [searchQuery, setSearchQuery] = useState(readInitialQuery);
  const [pending, setPending] = useState<{
    variantId: number | null;
    slug?: string | null;
    equipo: EquipoAConfirmar;
    summary: ChosenSummary;
  } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [selected, setSelected] = useState<ChosenSummary | null>(null);

  const backToOferta = useCallback(() => {
    window.location.href = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}`;
  }, [token]);

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

  const handleSelect = useCallback(
    (product: CatalogProduct) => {
      const offer = state.kind === 'ready' ? state.offer : null;
      const req = offer?.requestedProduct;
      const imageUrl = product.images?.[0] || product.thumbnail;
      setPending({
        variantId: product.variantId ? Number(product.variantId) : null,
        slug: product.slug,
        equipo: {
          name: product.displayName || product.name,
          brand: product.brand,
          imageUrl,
          monthly: product.quotaMonthly,
        },
        summary: {
          name: product.displayName || product.name,
          brand: product.brand,
          imageUrl,
          monthly: product.quotaMonthly,
          finalPrice: product.price,
          offerCode: offer?.offerCode,
          userName: offer?.clientName ?? undefined,
          previous: req ? { name: req.name ?? 'Tu equipo', imageUrl: req.image_url ?? undefined } : null,
        },
      });
    },
    [state],
  );

  const confirmSelect = useCallback(async () => {
    if (!pending) return;
    if (pending.variantId == null) {
      window.location.href = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}/producto/${pending.slug}`;
      return;
    }
    setConfirming(true);
    try {
      await selectEquipment(token, pending.variantId);
      const summary = pending.summary;
      setPending(null);
      setSelected(summary);
    } catch (err) {
      const reason = err instanceof OfferApiError ? err.reason : 'unknown';
      const message = err instanceof OfferApiError ? err.message : 'No pudimos registrar tu elección.';
      setPending(null);
      setState({ kind: 'error', reason, message });
    } finally {
      setConfirming(false);
    }
  }, [pending, token]);

  if (selected) {
    return (
      <SeleccionConfirmada
        chosen={selected}
        backHref={`${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}`}
      />
    );
  }

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
        onBack={backToOferta}
      />

      <ConfirmarEleccionModal
        isOpen={pending !== null}
        equipo={pending?.equipo ?? null}
        loading={confirming}
        onConfirm={confirmSelect}
        onClose={() => (confirming ? undefined : setPending(null))}
      />
    </div>
  );
}
