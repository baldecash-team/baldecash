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
import { NavbarSearch } from '../../[landing]/catalogo/components/catalog/NavbarActions';
import { CatalogoOfertaTab } from './components/CatalogoOfertaTab';
import { TuOfertaTab } from './components/TuOfertaTab';
import { OfertaEstadoMensaje, type OfertaEstadoIcon } from './components/OfertaEstadoMensaje';
import { ConfirmarEleccionModal, type EquipoAConfirmar } from './components/ConfirmarEleccionModal';
import { SeleccionConfirmada, type ChosenSummary } from './components/SeleccionConfirmada';

const BRAND_LOGO_URL = 'https://baldecash.s3.amazonaws.com/company/logo.png';

type TabKey = 'oferta' | 'catalogo';

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

function readInitialTab(): TabKey {
  if (typeof window === 'undefined') return 'oferta';
  return new URLSearchParams(window.location.search).get('tab') === 'catalogo' ? 'catalogo' : 'oferta';
}
function readInitialQuery(): string {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('q') || '';
}

export function MiOfertaClient({ token }: { token: string }) {
  const [state, setState] = useState<PageState>({ kind: 'loading' });
  const [tab, setTab] = useState<TabKey>(readInitialTab);
  const [searchQuery, setSearchQuery] = useState(readInitialQuery);

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
          setSelected({
            name: eq.name,
            brand: eq.brand ?? undefined,
            imageUrl: eq.imageUrl ?? undefined,
            monthly: eq.monthlyPayment ?? undefined,
            termMonths: eq.termMonths ?? undefined,
            offerCode: offer.applicationCode ?? offer.offerCode,
            userName: offer.clientName ?? undefined,
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
      window.location.href = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/aprobacion/${token}/producto/${pending.product.slug}`;
      return;
    }
    setConfirming(true);
    try {
      await selectEquipment(token, variantId);
      // Éxito: mostramos la confirmación EN LA MISMA página (sin redirigir ni
      // re-validar el token, que ya quedó consumido). Construimos el resumen
      // completo para el ReceivedScreen reutilizado.
      const p = pending.product;
      const offerCode = state.kind === 'ready' ? state.offer.offerCode : undefined;
      setPending(null);
      setSelected({
        name: pending.equipo.name,
        brand: pending.equipo.brand,
        imageUrl: pending.equipo.imageUrl,
        monthly: p.quotaMonthly,
        finalPrice: p.price,
        offerCode,
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
        backHref={`${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/aprobacion/${token}`}
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

      {/* Offset para el navbar fixed + barra de tabs sticky justo debajo.
          Mismo wrapper (w-full px-3 sm:px-4 lg:px-6) que filtros+cards → todo arranca igual. */}
      <div className="pt-16" />
      <div className="sticky top-16 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="w-full px-3 sm:px-4 lg:px-6">
          {/* Tabs a la izquierda; buscador CENTRADO en la misma fila (tab Catálogo, desktop). */}
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-2.5">
            <nav className="flex gap-2">
              <TabChip active={tab === 'oferta'} onClick={() => setTab('oferta')}>
                Tu oferta
              </TabChip>
              <TabChip active={tab === 'catalogo'} onClick={() => setTab('catalogo')}>
                Catálogo (hasta S/ {Math.round(offer.maxMonthlyQuota)}/mes)
              </TabChip>
            </nav>
            {tab === 'catalogo' ? (
              <div className="hidden md:flex md:justify-center">
                <NavbarSearch
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onClear={() => setSearchQuery('')}
                  placeholder="Buscar por marca, modelo…"
                />
              </div>
            ) : (
              <span aria-hidden />
            )}
            <span aria-hidden className="hidden md:block" />
          </div>
        </div>
      </div>

      {tab === 'oferta' ? (
        <TuOfertaTab offer={offer} onVerCatalogo={() => setTab('catalogo')} onSelect={handleSelect} />
      ) : (
        <CatalogoOfertaTab
          token={token}
          offer={offer}
          onSelect={handleSelect}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

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
      className={`cursor-pointer rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
        active
          ? 'border-[var(--color-primary)] bg-white text-[var(--color-primary)] shadow-md -translate-y-0.5'
          : 'border-transparent bg-gray-100 text-gray-500 hover:-translate-y-0.5 hover:bg-gray-200 hover:text-gray-700 hover:shadow-sm'
      }`}
    >
      {children}
    </button>
  );
}
