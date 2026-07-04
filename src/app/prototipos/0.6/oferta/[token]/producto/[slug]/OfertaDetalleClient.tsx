'use client';

/**
 * OfertaDetalleClient — detalle de producto dentro de la oferta (Caso 4).
 *
 * Reutiliza ProductDetail real (galería, specs, pricing, cronograma) pero:
 *   - CTA = "Elegir este equipo" → registra la selección vía /select.
 *   - NUNCA navega a /solicitar; sin lead-guard, sin carrito, sin navbar comercial.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, AlertCircle, Search, LayoutGrid } from 'lucide-react';
import { CubeGridSpinner } from '@/app/prototipos/_shared';

import { Navbar } from '../../../../components/hero/Navbar';
import { NavbarSearch } from '../../../../[landing]/catalogo/components/catalog/NavbarActions';

const BRAND_LOGO_URL = 'https://baldecash.s3.amazonaws.com/company/logo.png';

import { ProductDetail } from '../../../../[landing]/producto/components/detail/ProductDetail';
import { defaultDetalleConfig } from '../../../../[landing]/producto/types/detail';
import {
  fetchProductDetail,
  type ProductDetailResult,
} from '../../../../[landing]/producto/api/productDetailApi';
import { getOffer, getCatalog, OfferApiError } from '../../../../services/offerApi';
import { saveOfferSelection } from '../../offerStorage';
import type { ProductSuggestion } from '../../../../services/catalogApi';

type State =
  // readOnly = es el detalle del equipo que el estudiante PIDIÓ. Se puede VER
  // (link "Ver detalle" del card izquierdo) pero NO elegir: la oferta existe
  // precisamente porque ese equipo no calificaba. Sin CTA "Elegir este equipo".
  | { kind: 'loading' }
  | { kind: 'ready'; data: ProductDetailResult; landingSlug: string; readOnly: boolean }
  | { kind: 'error'; message: string };

export function OfertaDetalleClient({ token, slug }: { token: string; slug: string }) {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [searchValue, setSearchValue] = useState('');
  // Plazos/iniciales permitidos por la oferta (BAL-2096). Default [24]/[0] = como antes.
  const [offerTerms, setOfferTerms] = useState<number[]>([24]);
  const [offerInitials, setOfferInitials] = useState<number[]>([0]);

  const goToCatalog = useCallback(
    (q: string) => {
      // Subruta real del catálogo de la oferta (/oferta/{token}/catalogo),
      // NO el viejo ?tab=catalogo. El término de búsqueda va como query param.
      const base = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}/catalogo`;
      const qs = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : '';
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
        if (active) {
          setOfferTerms(offer.terms?.length ? offer.terms : [24]);
          setOfferInitials(offer.initials?.length ? offer.initials : [0]);
        }

        // Oferta ya consumida (el estudiante ya eligió su equipo): el detalle no
        // debe seguir funcionando. Lo devolvemos a la página principal, que muestra
        // la confirmación del equipo elegido.
        if (offer.alreadySelected) {
          window.location.href = backHref;
          return;
        }

        // El equipo que el estudiante PIDIÓ se puede VER (link "Ver detalle" del
        // card izquierdo) pero NO elegir: la oferta existe porque no calificaba.
        // Lo marcamos readOnly para ocultar el CTA "Elegir este equipo".
        const reqSlug = offer.requestedProduct?.slug;
        const readOnly = !!reqSlug && reqSlug === slug;

        const detail = await fetchProductDetail(landing, slug);
        if (!active) return;
        if (!detail) {
          setState({ kind: 'error', message: 'No encontramos este equipo.' });
          return;
        }
        setState({ kind: 'ready', data: detail, landingSlug: landing, readOnly });
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

  // Combo del que nace la elección (si el equipo es un combo). El BE lo necesita
  // para sincronizar el accesorio correcto a legacy (un equipo puede estar en
  // varios combos). Null si es un equipo simple.
  const comboId = useMemo(() => {
    if (state.kind !== 'ready') return null;
    const c = state.data.combo?.id;
    return c != null ? Number(c) : null;
  }, [state]);

  // La oferta permite los plazos/iniciales configurados en el nodo (BAL-2096).
  // Filtramos los payment_plans a la INTERSECCIÓN de esos arrays con lo que el
  // producto realmente soporta. Si el array es un solo valor (ej. [24]/[0]), el
  // selector queda con una sola opción (bloqueado, como antes).
  const offerPlans = useMemo(() => {
    if (state.kind !== 'ready') return [];
    return (state.data.paymentPlans ?? [])
      .filter((plan) => offerTerms.includes(plan.term))
      .map((plan) => ({
        ...plan,
        options: (plan.options ?? []).filter((o) => offerInitials.includes(o.initialPercent)),
      }))
      .filter((plan) => plan.options.length > 0);
  }, [state, offerTerms, offerInitials]);

  // Defaults del selector = celda de menor cuota (plazo más alto + inicial más
  // bajo), igual que la card izquierda de la oferta.
  const defaultTerm = useMemo(
    () => (offerPlans.length ? Math.max(...offerPlans.map((p) => p.term)) : 24),
    [offerPlans],
  );
  const defaultInitial = useMemo(() => {
    const inits = offerPlans.flatMap((p) => (p.options ?? []).map((o) => o.initialPercent));
    return inits.length ? Math.min(...inits) : 0;
  }, [offerPlans]);

  // Cuota de la oferta a la celda por defecto (la más baja) — la misma del catálogo.
  const offerMonthly = useMemo(() => {
    const plan = offerPlans.find((p) => p.term === defaultTerm);
    const opt = (plan?.options ?? []).find((o) => o.initialPercent === defaultInitial);
    return opt && typeof opt.monthlyQuota === 'number' ? opt.monthlyQuota : undefined;
  }, [offerPlans, defaultTerm, defaultInitial]);

  // "Elegir este equipo" → mini-checkout de accesorios/seguros (BAL-2064). La
  // selección (variant/combo/slug + datos del equipo) se guarda en localStorage
  // → la URL de accesorios queda limpia (sin query params) y el modal muestra el
  // equipo correcto. El combo se propaga para sincronizar el accesorio gratis del
  // bundle a legacy al confirmar.
  const goToAccesorios = useCallback(() => {
    const base = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}/accesorios`;
    if (variantId != null && state.kind === 'ready') {
      const p = state.data.product;
      saveOfferSelection(token, {
        variantId,
        comboId,
        slug: slug ?? null,
        name: p?.displayName || p?.name || 'Tu equipo',
        brand: p?.brand,
        imageUrl: p?.images?.[0]?.url,
        monthly: offerMonthly,
        term: defaultTerm,
      });
    }
    window.location.href = base;
  }, [token, variantId, comboId, slug, state, offerMonthly, defaultTerm]);


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

  const { data, readOnly } = state;
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
          {/* Desktop: acceso directo al catálogo completo (sin buscar) */}
          <button
            type="button"
            onClick={() => goToCatalog('')}
            className="hidden shrink-0 cursor-pointer items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-[var(--color-primary)] md:inline-flex"
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Ver todo el catálogo</span>
          </button>
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
          defaultTerm={defaultTerm}
          defaultInitialPercent={defaultInitial}
          paymentFrequencies={data.paymentFrequencies}
          isAvailable={data.isAvailable && variantId != null}
          // Detalle del equipo PEDIDO (readOnly): se puede ver pero no elegir.
          // Sin CTA de elección; en su lugar, un aviso que guía de vuelta.
          // "Elegir este equipo" → página de accesorios/seguros (mini-checkout,
          // BAL-2064). Allí el cliente suma add-ons y confirma todo junto.
          onClickCTA={readOnly ? undefined : goToAccesorios}
          ctaText="Elegir este equipo"
          readOnlyNotice={
            readOnly
              ? 'Este es el equipo que solicitaste. Para aprobar tu solicitud, elige uno de los equipos disponibles en tu oferta.'
              : undefined
          }
          cronogramaVersion={defaultDetalleConfig.cronogramaVersion}
        />
      </main>
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
