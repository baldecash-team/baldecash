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
import { Illustration } from '../../../../[landing]/solicitar/confirmacion/components/received/illustration/Illustration';
import { ConfirmarEleccionModal } from '../../components/ConfirmarEleccionModal';

const BRAND_LOGO_URL = 'https://baldecash.s3.amazonaws.com/company/logo.png';

import { ProductDetail } from '../../../../[landing]/producto/components/detail/ProductDetail';
import {
  fetchProductDetail,
  type ProductDetailResult,
} from '../../../../[landing]/producto/api/productDetailApi';
import { getOffer, selectEquipment, OfferApiError } from '../../../../services/offerApi';

interface ChosenSummary {
  name: string;
  brand?: string;
  imageUrl?: string;
  monthly?: number;
}

type State =
  | { kind: 'loading' }
  | { kind: 'ready'; data: ProductDetailResult; landingSlug: string }
  | { kind: 'error'; message: string }
  | { kind: 'selected'; chosen: ChosenSummary };

export function OfertaDetalleClient({ token, slug }: { token: string; slug: string }) {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [selecting, setSelecting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const goToCatalog = useCallback(
    (q: string) => {
      const base = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/aprobacion/${token}`;
      const qs = q.trim() ? `?tab=catalogo&q=${encodeURIComponent(q.trim())}` : '?tab=catalogo';
      window.location.href = `${base}${qs}`;
    },
    [token],
  );
  const irAlCatalogoConBusqueda = useCallback(() => goToCatalog(searchValue), [goToCatalog, searchValue]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const offer = await getOffer(token); // valida token + da landing_slug
        const landing = offer.landingSlug || 'home';
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
    () => `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/aprobacion/${token}`,
    [token],
  );

  const variantId = useMemo(() => {
    if (state.kind !== 'ready') return null;
    const v = state.data.product?.variantId;
    return v != null ? Number(v) : null;
  }, [state]);

  // Resumen del equipo (para el modal de confirmación y la pantalla de éxito).
  const chosen = useMemo<ChosenSummary | null>(() => {
    if (state.kind !== 'ready') return null;
    const p = state.data.product;
    const allQuotas = (state.data.paymentPlans ?? [])
      .flatMap((plan) => (plan.options ?? []).map((o) => o.monthlyQuota))
      .filter((q): q is number => typeof q === 'number' && q > 0);
    return {
      name: p?.displayName || p?.name || 'Tu equipo',
      brand: p?.brand,
      imageUrl: p?.images?.[0]?.url,
      monthly: allQuotas.length ? Math.min(...allQuotas) : undefined,
    };
  }, [state]);

  // Confirmación real (llamada desde el modal).
  async function confirmarEleccion() {
    if (variantId == null || !chosen) return;
    setSelecting(true);
    try {
      await selectEquipment(token, variantId);
      setConfirmOpen(false);
      setState({ kind: 'selected', chosen });
    } catch (err) {
      const msg = err instanceof OfferApiError ? err.message : 'No pudimos registrar tu elección.';
      setConfirmOpen(false);
      setState({ kind: 'error', message: msg });
    } finally {
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
  if (state.kind === 'selected') {
    return <SeleccionConfirmada chosen={state.chosen} backHref={backToOffer} />;
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
          <a href={backToOffer} className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
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
            />
          </div>
          {/* Mobile: botón que lleva al catálogo */}
          <button
            type="button"
            onClick={() => goToCatalog('')}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-500 md:hidden"
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
          paymentPlans={data.paymentPlans}
          similarProducts={[]}
          limitations={data.limitations}
          certifications={data.certifications}
          defaultTerm={data.defaultTerm}
          defaultInitialPercent={data.defaultInitial}
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

/** Confirmación celebratoria con resumen del equipo elegido. */
function SeleccionConfirmada({
  chosen,
  backHref,
}: {
  chosen: ChosenSummary;
  backHref: string;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl">
        {/* Check celebratorio (reutiliza Illustration del 0.6) */}
        <Illustration />

        <h2 className="text-xl font-bold text-[var(--foreground)]">¡Listo! Elegiste tu equipo</h2>
        <p className="mt-2 text-sm text-gray-500">
          Registramos tu elección. Pronto nos pondremos en contacto contigo.
        </p>

        {/* Resumen del equipo */}
        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-left">
          {chosen.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={chosen.imageUrl} alt={chosen.name} className="h-16 w-16 shrink-0 object-contain" />
          ) : (
            <div className="h-16 w-16 shrink-0 rounded-lg bg-gray-200" />
          )}
          <div className="min-w-0">
            {chosen.brand ? (
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{chosen.brand}</p>
            ) : null}
            <p className="truncate text-sm font-semibold text-[var(--foreground)]">{chosen.name}</p>
            {chosen.monthly ? (
              <p className="mt-0.5 text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                Desde S/{Math.round(chosen.monthly)}/mes
              </p>
            ) : null}
          </div>
        </div>

        <a
          href={backHref}
          className="mt-6 inline-block text-sm font-medium"
          style={{ color: 'var(--color-primary)' }}
        >
          Volver a mi oferta
        </a>
      </div>
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
        <a href={backHref} className="mt-4 text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
          Volver a mi oferta
        </a>
      ) : null}
    </div>
  );
}
