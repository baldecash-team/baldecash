'use client';

/**
 * OfertaDetalleClient — detalle de producto dentro de la oferta (Caso 4).
 *
 * Reutiliza ProductDetail real (galería, specs, pricing, cronograma) pero:
 *   - CTA = "Elegir este equipo" → registra la selección vía /select.
 *   - NUNCA navega a /solicitar; sin lead-guard, sin carrito, sin navbar comercial.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, AlertCircle, Search } from 'lucide-react';
import { CubeGridSpinner } from '@/app/prototipos/_shared';

import { Navbar } from '../../../../components/hero/Navbar';
import { NavbarSearch } from '../../../../[landing]/catalogo/components/catalog/NavbarActions';
import { ConfirmarEleccionModal } from '../../components/ConfirmarEleccionModal';

const BRAND_LOGO_URL = 'https://baldecash.s3.amazonaws.com/company/logo.png';

import { ProductDetail } from '../../../../[landing]/producto/components/detail/ProductDetail';
import {
  fetchProductDetail,
  type ProductDetailResult,
} from '../../../../[landing]/producto/api/productDetailApi';
import { getOffer, getCatalog, selectEquipment, OfferApiError } from '../../../../services/offerApi';
import type { ProductSuggestion } from '../../../../services/catalogApi';
import type { ChosenSummary } from '../../components/SeleccionConfirmada';

type State =
  | { kind: 'loading' }
  | { kind: 'ready'; data: ProductDetailResult; landingSlug: string }
  | { kind: 'error'; message: string };

export function OfertaDetalleClient({ token, slug }: { token: string; slug: string }) {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [selecting, setSelecting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const goToCatalog = useCallback(
    (q: string) => {
      const base = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}`;
      const qs = q.trim() ? `?tab=catalogo&q=${encodeURIComponent(q.trim())}` : '?tab=catalogo';
      window.location.href = `${base}${qs}`;
    },
    [token],
  );
  const irAlCatalogoConBusqueda = useCallback(() => goToCatalog(searchValue), [goToCatalog, searchValue]);

  // Sugerencias del dropdown DESDE el catálogo de la oferta (no el catálogo
  // normal): ya vienen filtradas por cuota, sin el equipo pedido y con la cuota
  // a 24m/0%. Así el dropdown no muestra productos fuera de la oferta.
  const fetchOfferSuggestions = useCallback(
    async (q: string): Promise<ProductSuggestion[]> => {
      const res = await getCatalog(token, { q, sortBy: 'price_desc' });
      return res.items.slice(0, 6).map((p) => ({
        id: p.id,
        name: p.displayName || p.name,
        slug: p.slug,
        brand: p.brand,
        category: '',
        price: p.price,
        image: p.images?.[0] || p.thumbnail || null,
        maxTermMonths: 24, // la oferta siempre muestra 24 meses
        quotaMonthly: p.quotaMonthly ?? null,
      }));
    },
    [token],
  );

  // Al elegir una sugerencia, quedarse en el flujo de oferta (no ir al detalle
  // del catálogo normal).
  const goToOfferDetail = useCallback(
    (s: ProductSuggestion) => {
      window.location.href = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}/producto/${s.slug}`;
    },
    [token],
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const offer = await getOffer(token); // valida token + da landing_slug
        const landing = offer.landingSlug || 'home';
        const backHref = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}`;

        // Oferta ya consumida (el estudiante ya eligió su equipo): el detalle no
        // debe seguir funcionando. Lo devolvemos a la página principal, que muestra
        // la confirmación del equipo elegido.
        if (offer.alreadySelected) {
          window.location.href = backHref;
          return;
        }

        // El equipo que el estudiante PIDIÓ no se puede elegir desde la oferta
        // (la oferta existe porque no calificaba). Si alguien abre su detalle a
        // mano (URL directa), lo devolvemos a la página principal de la oferta.
        const reqSlug = offer.requestedProduct?.slug;
        if (reqSlug && reqSlug === slug) {
          window.location.href = backHref;
          return;
        }

        const detail = await fetchProductDetail(landing, slug);
        if (!active) return;
        if (!detail) {
          setState({ kind: 'error', message: 'No encontramos este equipo.' });
          return;
        }
        setState({ kind: 'ready', data: detail, landingSlug: landing });
      } catch (err) {
        if (!active) return;
        const msg = err instanceof OfferApiError ? err.message : 'No pudimos cargar el detalle.';
        setState({ kind: 'error', message: msg });
      }
    })();
    return () => {
      active = false;
    };
  }, [token, slug]);

  const backToOffer = useMemo(
    () => `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}`,
    [token],
  );

  const variantId = useMemo(() => {
    if (state.kind !== 'ready') return null;
    const v = state.data.product?.variantId;
    return v != null ? Number(v) : null;
  }, [state]);

  // La oferta SOLO ofrece 24 meses / inicial 0 (feedback de Marco). Filtramos los
  // payment_plans a esa combinación para que el cliente no pueda cambiar el plazo,
  // y para que la cuota mostrada coincida con la del catálogo.
  const OFFER_TERM = 24;
  const OFFER_INITIAL = 0;
  const offerPlans = useMemo(() => {
    if (state.kind !== 'ready') return [];
    return (state.data.paymentPlans ?? [])
      .filter((plan) => plan.term === OFFER_TERM)
      .map((plan) => ({
        ...plan,
        options: (plan.options ?? []).filter((o) => o.initialPercent === OFFER_INITIAL),
      }))
      .filter((plan) => plan.options.length > 0);
  }, [state]);

  // Cuota de la oferta: la de 24m / inicial 0 (la misma del catálogo).
  const offerMonthly = useMemo(() => {
    const opt = offerPlans[0]?.options?.[0];
    return opt && typeof opt.monthlyQuota === 'number' ? opt.monthlyQuota : undefined;
  }, [offerPlans]);

  // Resumen del equipo (para el modal de confirmación y la pantalla de éxito).
  const chosen = useMemo<ChosenSummary | null>(() => {
    if (state.kind !== 'ready') return null;
    const p = state.data.product;
    return {
      name: p?.displayName || p?.name || 'Tu equipo',
      brand: p?.brand,
      imageUrl: p?.images?.[0]?.url,
      monthly: offerMonthly,
    };
  }, [state, offerMonthly]);

  // Confirmación real (llamada desde el modal).
  async function confirmarEleccion() {
    if (variantId == null || !chosen) return;
    setSelecting(true);
    try {
      await selectEquipment(token, variantId);
      // Tras elegir, volvemos a la página principal de la oferta: como el link ya
      // quedó consumido, esa página detecta already_selected y muestra la
      // confirmación (equipo anterior → nuevo). Así el refresh es consistente y
      // hay una sola pantalla de confirmación.
      window.location.href = backToOffer;
    } catch (err) {
      const msg = err instanceof OfferApiError ? err.message : 'No pudimos registrar tu elección.';
      setConfirmOpen(false);
      setState({ kind: 'error', message: msg });
      setSelecting(false);
    }
  }

  if (state.kind === 'loading') {
    // Sin pantalla intermedia "cargando equipo" (como el detalle regular):
    // solo el spinner de marca del proyecto, breve, hasta que llegan los datos.
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <CubeGridSpinner />
      </div>
    );
  }
  if (state.kind === 'error') {
    return (
      <Centered
        icon={<AlertCircle className="h-8 w-8 text-amber-500" />}
        title="Algo salió mal"
        body={state.message}
        backHref={backToOffer}
      />
    );
  }

  const { data } = state;
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header con logo (como la página de oferta) */}
      <Navbar logoOnly fullWidth logoUrl={BRAND_LOGO_URL} />
      <div className="pt-16" />
      {/* Sub-barra: volver a mi oferta + buscador (lleva al catálogo de la oferta) */}
      <div className="sticky top-16 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 px-3 py-2.5 sm:px-4 lg:px-6">
          <a href={backToOffer} className="inline-flex shrink-0 cursor-pointer items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver a mi oferta</span>
          </a>
          {/* Desktop: buscador centrado, ancho como el flujo regular */}
          <div className="hidden md:flex md:justify-center">
            <NavbarSearch
              value={searchValue}
              onChange={setSearchValue}
              onClear={() => setSearchValue('')}
              onSubmit={irAlCatalogoConBusqueda}
              placeholder="Buscar otro equipo…"
              fetchSuggestions={fetchOfferSuggestions}
              onSelectSuggestion={goToOfferDetail}
            />
          </div>
          {/* Mobile: botón que lleva al catálogo */}
          <button
            type="button"
            onClick={() => goToCatalog('')}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-50 md:hidden"
          >
            <Search className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
            Buscar
          </button>
          <span aria-hidden className="hidden md:block" />
        </div>
      </div>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <ProductDetail
          product={data.product}
          combo={data.combo}
          paymentPlans={offerPlans}
          similarProducts={[]}
          limitations={data.limitations}
          certifications={data.certifications}
          defaultTerm={OFFER_TERM}
          defaultInitialPercent={OFFER_INITIAL}
          paymentFrequencies={data.paymentFrequencies}
          isAvailable={data.isAvailable && variantId != null}
          onClickCTA={() => setConfirmOpen(true)}
          ctaText="Elegir este equipo"
        />
      </main>

      <ConfirmarEleccionModal
        isOpen={confirmOpen}
        equipo={chosen}
        loading={selecting}
        onConfirm={confirmarEleccion}
        onClose={() => (selecting ? undefined : setConfirmOpen(false))}
      />
    </div>
  );
}

function Centered({
  icon,
  title,
  body,
  backHref,
}: {
  icon: React.ReactNode;
  title: string;
  body?: string;
  backHref?: string;
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-3" style={{ color: 'var(--color-primary)' }}>
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-[var(--foreground)]">{title}</h2>
      {body ? <p className="mt-2 max-w-sm text-sm text-gray-500">{body}</p> : null}
      {backHref ? (
        <a href={backHref} className="mt-4 cursor-pointer text-sm font-medium hover:underline" style={{ color: 'var(--color-primary)' }}>
          Volver a mi oferta
        </a>
      ) : null}
    </div>
  );
}
