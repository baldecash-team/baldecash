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
import { OfertaBannerAprobada } from './components/OfertaBannerAprobada';
import { UpsellPortada } from './components/UpsellPortada';
import { TuOfertaTab } from './components/TuOfertaTab';
import { OfertaEstadoMensaje, type OfertaEstadoIcon } from './components/OfertaEstadoMensaje';
import { ConfirmarEleccionModal, type EquipoAConfirmar } from './components/ConfirmarEleccionModal';
import { SeleccionConfirmada, type ChosenSummary } from './components/SeleccionConfirmada';
import { saveOfferSelection, type StoredEquipo } from './offerStorage';
import { useAnalytics } from '../../analytics/useAnalytics';

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

export function MiOfertaClient({ token }: { token: string }) {
  const analytics = useAnalytics();
  const [state, setState] = useState<PageState>({ kind: 'loading' });

  // "Ver otros equipos" navega a la subruta de catálogo (página separada).
  const goToCatalogo = useCallback(() => {
    analytics.track('offer_catalog_open', {}); // funnel: abre catálogo de oferta
    window.location.href = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}/catalogo`;
  }, [token, analytics]);

  // Modal de confirmación de elección. Unifica los 3 orígenes (card de catálogo,
  // oferta exclusiva del Caso 5, "continuar con mi equipo"): cada uno arma el
  // variantId a seleccionar, el resumen para el modal y el resumen final.
  const [pending, setPending] = useState<{
    variantId: number | null;
    comboId?: number | null;
    slug?: string | null;
    equipo: EquipoAConfirmar;
    summary: ChosenSummary;
  } | null>(null);
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
            // Accesorios/seguros sumados → desglose en la confirmación (BAL-2064).
            accessories: eq.accessories ?? [],
            insurances: eq.insurances ?? [],
          });
          return;
        }
        // Funnel: la oferta se cargó y es visible (portada). offerCase distingue
        // Caso 4 (downgrade) de Caso 5 (upsell).
        analytics.track('offer_viewed', { offer_case: offer.offerCase });
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
  }, [token, analytics]);

  // "Equipo anterior" (para el UI "anterior → nuevo" en la confirmación).
  const previousFrom = useCallback((offer: OfferView | null) => {
    const req = offer?.requestedProduct;
    return req ? { name: req.name ?? 'Tu equipo', imageUrl: req.image_url ?? undefined } : null;
  }, []);

  // Aceptar un equipo → página de accesorios/seguros (mini-checkout, BAL-2064).
  // Unifica los caminos de aceptación (index "Aceptar equipo", card de catálogo,
  // oferta exclusiva Caso 5): TODOS pasan por accesorios y confirman allí. La
  // selección (variant/combo/slug + datos del equipo) se guarda en localStorage
  // → la URL de accesorios queda limpia, sin query params. El combo se propaga
  // para sincronizar el accesorio gratis del bundle a legacy.
  const goToAccesorios = useCallback(
    (
      variantId: number | null,
      comboId: number | null | undefined,
      slug: string | null | undefined,
      equipo?: StoredEquipo,
    ) => {
      const base = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}/accesorios`;
      if (variantId == null) {
        // Sin variante usable → caer al detalle para resolver allí.
        window.location.href = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}/producto/${slug ?? ''}`;
        return;
      }
      saveOfferSelection(token, {
        variantId,
        comboId: comboId ?? null,
        slug: slug ?? null,
        name: equipo?.name || 'Tu equipo',
        brand: equipo?.brand,
        imageUrl: equipo?.imageUrl,
        monthly: equipo?.monthly,
      });
      window.location.href = base;
    },
    [token],
  );

  // Card "Elegir" del catálogo / "Aceptar equipo" del index → mini-checkout.
  const handleSelect = useCallback(
    (product: CatalogProduct) => {
      // Funnel: click "elegir" en una card (equipo aprobado o del catálogo).
      analytics.track('offer_equipment_select_click', {
        variant_id: product.variantId ? Number(product.variantId) : null,
        combo_id: product.comboId ?? null,
      });
      goToAccesorios(
        product.variantId ? Number(product.variantId) : null,
        product.comboId ?? null,
        product.slug,
        {
          name: product.displayName || product.name,
          brand: product.brand,
          imageUrl: product.images?.[0] || product.thumbnail,
          monthly: product.quotaMonthly,
        },
      );
    },
    [goToAccesorios, analytics],
  );

  // Caso 5: aceptar la oferta exclusiva → mini-checkout de accesorios/seguros.
  // (Perfil B ya trae accesorio incluido y Perfil C es tarifa especial; aun así
  // el cliente puede sumar más add-ons que quepan en su cuota restante.)
  const handleAceptarExclusiva = useCallback(() => {
    const offer = state.kind === 'ready' ? state.offer : null;
    const ex = offer?.exclusiveOffer;
    if (!ex || ex.variantId == null) return;
    // La oferta exclusiva no nace de un combo del catálogo (el accesorio del
    // Perfil B se resuelve aparte en el backend) → sin comboId.
    goToAccesorios(ex.variantId, null, ex.slug, {
      name: ex.name ?? 'Tu equipo',
      brand: ex.brand ?? undefined,
      imageUrl: ex.imageUrl ?? undefined,
      monthly: ex.combinedMonthly,
    });
  }, [state, goToAccesorios]);

  // Caso 5: "continuar con mi equipo" → confirma quedarse con el equipo pedido.
  const handleContinuarMiEquipo = useCallback(() => {
    const offer = state.kind === 'ready' ? state.offer : null;
    const req = offer?.requestedProduct;
    if (!req || req.variant_id == null) return;
    setPending({
      variantId: req.variant_id,
      slug: req.slug,
      equipo: {
        name: req.name ?? 'Tu equipo',
        imageUrl: req.image_url ?? undefined,
        monthly: req.monthly_price ?? undefined,
      },
      summary: {
        name: req.name ?? 'Tu equipo',
        imageUrl: req.image_url ?? undefined,
        monthly: req.monthly_price ?? undefined,
        offerCode: offer?.applicationCode ?? offer?.offerCode,
        userName: offer?.clientName ?? undefined,
        previous: null, // se queda con el mismo → no hay "anterior → nuevo"
      },
    });
  }, [state]);

  const confirmSelect = useCallback(async () => {
    if (!pending) return;
    if (pending.variantId == null) {
      // Sin variante usable → caer al detalle para resolver allí.
      window.location.href = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}/producto/${pending.slug}`;
      return;
    }
    setConfirming(true);
    try {
      await selectEquipment(token, pending.variantId, pending.comboId);
      // Éxito: confirmación EN LA MISMA página (sin re-validar el token consumido).
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
      {/* Header con logo. El contenedor del logo usa el MISMO ancho/márgenes que
          el banner y las cards (max-w-5xl centrado en desktop) para que todo
          quede alineado verticalmente. En mobile: solo px-4 (sin margen grande). */}
      <Navbar
        logoOnly
        logoUrl={BRAND_LOGO_URL}
        logoContainerClassName="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8"
      />

      {/* Offset para el navbar fixed. Sin tabs: todo en un solo scroll. */}
      <div className="pt-16" />

      {/* Banner de felicitaciones (reemplaza al countdown) */}
      <OfertaBannerAprobada clientName={offer.clientName} />

      {/* Sección destacada. Caso 5 (upsell) → portada TU EQUIPO vs OFERTA
          EXCLUSIVA. Caso 4 (downgrade) → el que pediste + aprobado para ti.
          "Ver otros equipos" navega a la subruta /catalogo (ya no scroll inline). */}
      {offer.offerCase === 'upsell' ? (
        <UpsellPortada
          offer={offer}
          onAceptar={handleAceptarExclusiva}
          onContinuar={handleContinuarMiEquipo}
          onVerCatalogo={goToCatalogo}
        />
      ) : (
        <TuOfertaTab token={token} offer={offer} onVerCatalogo={goToCatalogo} onSelect={handleSelect} />
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

