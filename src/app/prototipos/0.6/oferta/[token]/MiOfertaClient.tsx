'use client';

/**
 * MiOfertaClient — orquestador de la página "Mi Oferta" (Caso 4 · BAL-1785).
 *
 * Carga la oferta por token y maneja estados (cargando / válido / expirado /
 * usado / inválido). Dos tabs que usan el LAYOUT REAL del catálogo:
 *   - "Tu oferta": recomendado + el que pediste (sin filtros).
 *   - "Catálogo":  CatalogLayoutV4 completo con filtros, alimentado por offerApi.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { CubeGridSpinner } from '@/app/prototipos/_shared';

import type { CatalogProduct } from '../../[landing]/catalogo/types/catalog';
import {
  getOffer,
  selectEquipment,
  OfferApiError,
  type OfferView,
  type OfferErrorReason,
} from '../../services/offerApi';
import { Navbar } from '../../components/hero/Navbar';
import { OfertaBannerAprobada } from './components/OfertaBannerAprobada';
import { CatalogoOfertaTab } from './components/CatalogoOfertaTab';
import { TuOfertaTab } from './components/TuOfertaTab';
import { OfertaEstadoMensaje, type OfertaEstadoIcon } from './components/OfertaEstadoMensaje';
import { ConfirmarEleccionModal, type EquipoAConfirmar } from './components/ConfirmarEleccionModal';
import { SeleccionConfirmada, type ChosenSummary } from './components/SeleccionConfirmada';

const BRAND_LOGO_URL = 'https://baldecash.s3.amazonaws.com/company/logo.png';

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

// WhatsApp de contacto (mismo enlace que usa el flujo regular en ContactInfo).
const WHATSAPP_URL = 'https://wa.link/osgxjf';

function readInitialQuery(): string {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('q') || '';
}

export function MiOfertaClient({ token }: { token: string }) {
  const [state, setState] = useState<PageState>({ kind: 'loading' });
  const [searchQuery, setSearchQuery] = useState(readInitialQuery);

  // "Ver otros equipos" hace scroll a la sección del catálogo (todo en una página).
  const catalogoRef = useRef<HTMLDivElement>(null);
  const scrollToCatalogo = useCallback(() => {
    catalogoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Modal de confirmación de elección desde una card del catálogo.
  const [pending, setPending] = useState<{ product: CatalogProduct; equipo: EquipoAConfirmar } | null>(null);
  const [confirming, setConfirming] = useState(false);
  // Equipo ya elegido → pantalla de confirmación (ReceivedScreen reutilizado).
  const [selected, setSelected] = useState<ChosenSummary | null>(null);

  useEffect(() => {
    let active = true;
    getOffer(token)
      .then((offer) => {
        if (!active) return;
        // Link ya consumido con selección → mostrar directo la confirmación.
        if (offer.alreadySelected && offer.selectedEquipment) {
          const eq = offer.selectedEquipment;
          const req = offer.requestedProduct;
          setSelected({
            name: eq.name,
            brand: eq.brand ?? undefined,
            imageUrl: eq.imageUrl ?? undefined,
            monthly: eq.monthlyPayment ?? undefined,
            termMonths: eq.termMonths ?? undefined,
            offerCode: offer.applicationCode ?? offer.offerCode,
            userName: offer.clientName ?? undefined,
            // Equipo anterior → para el UI "anterior → nuevo" (igual que al elegir
            // desde una card). El backend lo devuelve en already_selected.
            previous: req ? { name: req.name ?? 'Tu equipo', imageUrl: req.image_url ?? undefined } : null,
          });
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
  }, [token]);

  // Card "Elegir" → abre el modal de confirmación (no navega ni selecciona aún).
  const handleSelect = useCallback((product: CatalogProduct) => {
    setPending({
      product,
      equipo: {
        name: product.displayName || product.name,
        brand: product.brand,
        // images[0] es la imagen principal (carga); el thumbnail puede dar 403.
        imageUrl: product.images?.[0] || product.thumbnail,
        monthly: product.quotaMonthly,
      },
    });
  }, []);

  const confirmSelect = useCallback(async () => {
    if (!pending) return;
    const variantId = pending.product.variantId ? Number(pending.product.variantId) : null;
    if (variantId == null) {
      // Sin variante usable → caer al detalle para resolver allí.
      window.location.href = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}/producto/${pending.product.slug}`;
      return;
    }
    setConfirming(true);
    try {
      await selectEquipment(token, variantId);
      // Éxito: mostramos la confirmación EN LA MISMA página (sin redirigir ni
      // re-validar el token, que ya quedó consumido). Construimos el resumen
      // completo para el ReceivedScreen reutilizado.
      const p = pending.product;
      const offer = state.kind === 'ready' ? state.offer : null;
      const req = offer?.requestedProduct;
      setPending(null);
      setSelected({
        name: pending.equipo.name,
        brand: pending.equipo.brand,
        imageUrl: pending.equipo.imageUrl,
        monthly: p.quotaMonthly,
        finalPrice: p.price,
        offerCode: offer?.offerCode,
        userName: offer?.clientName ?? undefined,
        previous: req ? { name: req.name ?? 'Tu equipo', imageUrl: req.image_url ?? undefined } : null,
      });
    } catch (err) {
      const reason = err instanceof OfferApiError ? err.reason : 'unknown';
      const message = err instanceof OfferApiError ? err.message : 'No pudimos registrar tu elección.';
      setPending(null);
      setState({ kind: 'error', reason, message });
    } finally {
      setConfirming(false);
    }
  }, [pending, token, state]);

  // Ya eligió un equipo → pantalla de confirmación "¡Listo!".
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
      {/* Header con logo (como el home). El Navbar logoOnly es fixed h-16 y trae
          su propio contenedor; lo dejamos full-width para alinear con el catálogo. */}
      <Navbar logoOnly fullWidth logoUrl={BRAND_LOGO_URL} />

      {/* Offset para el navbar fixed. Sin tabs: todo en un solo scroll. */}
      <div className="pt-16" />

      {/* Banner de felicitaciones (reemplaza al countdown) */}
      <OfertaBannerAprobada clientName={offer.clientName} />

      {/* Sección destacada: el que pediste + aprobado para ti */}
      <TuOfertaTab token={token} offer={offer} onVerCatalogo={scrollToCatalogo} onSelect={handleSelect} />

      {/* Catálogo completo (siempre visible debajo) */}
      <div ref={catalogoRef}>
        <CatalogoOfertaTab
          token={token}
          offer={offer}
          onSelect={handleSelect}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

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

