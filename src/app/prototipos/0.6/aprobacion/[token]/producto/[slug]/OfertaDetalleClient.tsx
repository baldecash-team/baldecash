'use client';

/**
 * OfertaDetalleClient — detalle de producto dentro de la oferta (Caso 4).
 *
 * Reutiliza ProductDetail real (galería, specs, pricing, cronograma) pero:
 *   - CTA = "Elegir este equipo" → registra la selección vía /select.
 *   - NUNCA navega a /solicitar; sin lead-guard, sin carrito, sin navbar comercial.
 */

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

import { ProductDetail } from '../../../../[landing]/producto/components/detail/ProductDetail';
import {
  fetchProductDetail,
  type ProductDetailResult,
} from '../../../../[landing]/producto/api/productDetailApi';
import { getOffer, selectEquipment, OfferApiError } from '../../../../services/offerApi';

type State =
  | { kind: 'loading' }
  | { kind: 'ready'; data: ProductDetailResult; landingSlug: string }
  | { kind: 'error'; message: string }
  | { kind: 'selected' };

export function OfertaDetalleClient({ token, slug }: { token: string; slug: string }) {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [selecting, setSelecting] = useState(false);

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

  async function handleElegir() {
    if (variantId == null) return;
    setSelecting(true);
    try {
      await selectEquipment(token, variantId);
      setState({ kind: 'selected' });
    } catch (err) {
      const msg = err instanceof OfferApiError ? err.message : 'No pudimos registrar tu elección.';
      setState({ kind: 'error', message: msg });
    } finally {
      setSelecting(false);
    }
  }

  if (state.kind === 'loading') {
    return <Centered icon={<Clock className="h-8 w-8 animate-pulse" />} title="Cargando equipo…" />;
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
    return (
      <Centered
        icon={<CheckCircle2 className="h-10 w-10" />}
        title="¡Listo! Elegiste tu equipo"
        body="Registramos tu elección. Pronto nos pondremos en contacto contigo."
      />
    );
  }

  const { data } = state;
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur">
        <a href={backToOffer} className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
          Volver a mi oferta
        </a>
      </header>
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
          onClickCTA={selecting ? undefined : handleElegir}
          ctaText={selecting ? 'Registrando…' : 'Elegir este equipo'}
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
        <a href={backHref} className="mt-4 text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
          Volver a mi oferta
        </a>
      ) : null}
    </div>
  );
}
