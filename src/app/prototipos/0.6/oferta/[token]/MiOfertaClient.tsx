'use client';

/**
 * MiOfertaClient — orquestador de la página "Mi Oferta" (Caso 4/5 · BAL-1785).
 *
 * Carga la oferta por token y maneja estados (cargando / válido / expirado /
 * usado / inválido). Pantalla única scrolleable (rediseño BAL-2184, sin tabs):
 * saludo + monto aprobado + copy + prueba social + según offerCase la card
 * destacada (recomendado en 'downgrade', oferta exclusiva en 'upsell') más las
 * opciones secundarias (continuar con el equipo pedido / ver catálogo). "Ver
 * catálogo" navega a la subruta /catalogo (CatalogLayoutV4 completo).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { CubeGridSpinner } from '@/app/prototipos/_shared';

import type { CatalogProduct, ProductSpecs } from '../../[landing]/catalogo/types/catalog';
import { createSpecsFromEav } from '../../services/catalogApi';
import {
  getOffer,
  getCatalog,
  selectEquipment,
  OfferApiError,
  type OfferView,
  type OfferErrorReason,
} from '../../services/offerApi';
import { OfertaEstadoMensaje, type OfertaEstadoIcon } from './components/OfertaEstadoMensaje';
import { ConfirmarEleccionModal, type EquipoAConfirmar } from './components/ConfirmarEleccionModal';
import { SeleccionConfirmada, type ChosenSummary } from './components/SeleccionConfirmada';
import { monthlyFactor } from './components/equipoCardFormat';
import { StandardOfertaAccion } from './components/StandardOfertaAccion';
import { saveOfferSelection, clearAllAddons, type StoredEquipo } from './offerStorage';
import { useAnalytics } from '../../analytics/useAnalytics';
import { OfertaHeader } from './components/redesign/OfertaHeader';
import { MontoAprobadoBar } from './components/redesign/MontoAprobadoBar';
import { PruebaSocial } from './components/redesign/PruebaSocial';
import { EquipoRecomendadoCard, type EquipoRecomendadoInfo } from './components/redesign/EquipoRecomendadoCard';
import { specsToChips } from './components/redesign/specsChips';
import { OpcionBarra } from './components/redesign/OpcionBarra';
import { IconoAccesorios } from './components/redesign/IconoAccesorios';
import { EquipoPedidoCard } from './components/redesign/EquipoPedidoCard';
import { OFERTA_COLORS } from './components/redesign/ofertaTheme';

/** Collage de equipos (BAL-2215): ícono de las barras "Ver otros equipos"
 *  (Caso 4) y "Mejora tu equipo" (Caso 5) — comunica la variedad del catálogo. */
const COLLAGE_EQUIPOS_URL = 'https://baldecash.s3.amazonaws.com/images/oferta/collage-equipos.png';
/** Collage de accesorios (BAL-2215): ícono de la barra "Añadir accesorios y
 *  seguros" (Caso 5) — comunica la variedad de accesorios. */
const COLLAGE_ACCESORIOS_URL = 'https://baldecash.s3.amazonaws.com/images/oferta/collage-accesorios.png';

// `specsToChips` vive en components/redesign/specsChips: la comparte con la
// vista de la oferta ESTÁNDAR, que usa la misma card rica.

type PageState =
  | { kind: 'loading' }
  | { kind: 'ready'; offer: OfferView }
  | { kind: 'error'; reason: OfferErrorReason; message: string };

const ERROR_COPY: Record<string, { icon: OfertaEstadoIcon; title: string; body: string }> = {
  expired: { icon: 'clock', title: 'Esta oferta venció', body: 'El tiempo para elegir tu equipo ya terminó. Escríbenos y con gusto te ayudamos a reactivarla.' },
  // Cubre 3 flujos: Caso 4/5 (ya elegiste equipo) y oferta estándar F-6B (ya
  // aceptaste/rechazaste) — copy genérico a propósito, no distingue cuál.
  consumed: { icon: 'alert', title: 'Esta oferta ya fue respondida', body: 'Esta oferta ya fue utilizada. Si necesitas ayuda, contáctanos.' },
  revoked: { icon: 'ban', title: 'Oferta no disponible', body: 'Este enlace fue desactivado. Escríbenos para más información.' },
  invalid: { icon: 'search', title: 'Enlace no válido', body: 'No pudimos encontrar tu oferta. Verifica el enlace que recibiste o escríbenos.' },
  default: { icon: 'alert', title: 'No pudimos cargar tu oferta', body: 'Ocurrió un problema. Intenta nuevamente más tarde.' },
};

// WhatsApp de contacto (mismo enlace que usa el flujo regular en ContactInfo).
const WHATSAPP_URL = 'https://wa.link/osgxjf';

export function MiOfertaClient({ token }: { token: string }) {
  const analytics = useAnalytics();
  const [state, setState] = useState<PageState>({ kind: 'loading' });

  // Timing (BAL-2236): ancla de cuándo se emitió offer_viewed (portada visible)
  // y flag para emitir offer_time_to_first_action UNA sola vez.
  const offerViewedAt = useRef<number | null>(null);
  const firstActionTracked = useRef(false);

  // Abandono (BAL-2236): convertedRef = "el usuario CONVIRTIÓ o AVANZÓ" (eligió
  // un equipo con éxito, o navegó a complementos/catálogo/detalle) — en
  // cualquiera de esos casos, si luego se oculta la pestaña NO es abandono.
  // Solo cuenta como abandono cerrar/cambiar de pestaña sin haber hecho nada
  // de eso. abandonedTracked evita emitir offer_abandoned más de una vez por
  // sesión (visibilitychange puede disparar varias veces al cambiar de tab).
  const convertedRef = useRef(false);
  const abandonedTracked = useRef(false);
  // Ref-mirror de `state`: el listener de visibilitychange se registra UNA
  // sola vez (mount) pero necesita leer el offerCase MÁS RECIENTE al momento
  // de ocultarse la pestaña (la oferta carga async tras el mount).
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  useEffect(() => {
    const onVisibilityChange = () => {
      if (
        document.visibilityState === 'hidden' &&
        !convertedRef.current &&
        !abandonedTracked.current
      ) {
        abandonedTracked.current = true;
        const current = stateRef.current;
        analytics.track('offer_abandoned', {
          offer_case: current.kind === 'ready' ? current.offer.offerCase : undefined,
        });
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const trackFirstAction = useCallback(() => {
    if (firstActionTracked.current || offerViewedAt.current == null) return;
    firstActionTracked.current = true;
    analytics.track('offer_time_to_first_action', {
      offer_case: state.kind === 'ready' ? state.offer.offerCase : undefined,
      seconds: Math.round((Date.now() - offerViewedAt.current) / 1000),
    });
  }, [analytics, state]);

  // "Ver otros equipos" navega a la subruta de catálogo (página separada).
  const goToCatalogo = useCallback(() => {
    trackFirstAction();
    analytics.track('offer_catalog_open', {}); // funnel: abre catálogo de oferta
    convertedRef.current = true; // avanzó al catálogo → no es abandono (BAL-2236)
    window.location.href = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}/catalogo`;
  }, [token, analytics, trackFirstAction]);

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
  // Nº de equipos del catálogo de la oferta (copy "Elige entre XX equipos" de
  // la card "Cambiar equipo" del upsell). Se carga async; null hasta tenerlo.
  const [catalogCount, setCatalogCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    getOffer(token)
      .then((offer) => {
        if (!active) return;
        // Link ya consumido con selección → mostrar directo la confirmación.
        if (offer.alreadySelected && offer.selectedEquipment) {
          // Ya convirtió (en una visita anterior) → si cierra esta pestaña de
          // confirmación no es abandono (BAL-2236).
          convertedRef.current = true;
          const eq = offer.selectedEquipment;
          const req = offer.requestedProduct;
          setSelected({
            name: eq.name,
            brand: eq.brand ?? undefined,
            imageUrl: eq.imageUrl ?? undefined,
            monthly: eq.monthlyPayment ?? undefined,
            termMonths: eq.termMonths ?? undefined,
            initial: eq.initialPercent ?? undefined,
            initialAmount: eq.initialAmount ?? undefined,
            offerCode: offer.applicationCode ?? offer.offerCode,
            userName: offer.clientName ?? undefined,
            // Equipo anterior → para el UI "anterior → nuevo". Con su pricing REAL
            // (de la solicitud): cuota, plazo, inicial y frecuencia (celular =
            // semanal/quincenal), no un mensual forzado.
            previous: req ? {
              name: req.name ?? 'Tu equipo',
              imageUrl: req.image_url ?? undefined,
              monthly: req.monthly_price ?? undefined,
              term: req.term_months ?? undefined,
              nativeTerm: req.term ?? undefined,
              initial: req.initial_percent ?? undefined,
              initialAmount: req.initial_amount ?? undefined,
              paymentFrequency: req.payment_frequency ?? undefined,
            } : null,
            // Accesorios/seguros sumados → desglose en la confirmación (BAL-2064).
            accessories: eq.accessories ?? [],
            insurances: eq.insurances ?? [],
          });
          return;
        }
        // Funnel: la oferta se cargó y es visible (portada). offerCase distingue
        // Caso 4 (downgrade) de Caso 5 (upsell).
        analytics.track('offer_viewed', { offer_case: offer.offerCase });
        // Timing (BAL-2236): ancla para offer_time_to_first_action / offer_time_to_convert.
        offerViewedAt.current = Date.now();
        // Funnel: la portada muestra una card destacada (recomendado en Caso 4
        // downgrade, oferta exclusiva en Caso 5 upsell).
        if (offer.recommended || offer.exclusiveOffer) {
          analytics.track('offer_recommended_view', { offer_case: offer.offerCase });
        }
        setState({ kind: 'ready', offer });
      })
      .catch((err) => {
        if (!active) return;
        const reason = err instanceof OfferApiError ? err.reason : 'unknown';
        const message = err instanceof OfferApiError ? err.message : 'Error desconocido';
        // Funnel: el link cargó pero el backend indica que la oferta venció.
        if (reason === 'expired') {
          analytics.track('offer_expired_view', { offer_case: 'unknown' });
        }
        setState({ kind: 'error', reason, message });
      });
    return () => {
      active = false;
    };
  }, [token, analytics]);

  // Cuenta los equipos del catálogo de la oferta para el copy de la card
  // Conteo del catálogo para el subtítulo de la barra "Mejora tu equipo".
  // Caso 4 (downgrade) y Caso 5 (upsell) usan el mismo copy con contador
  // (BAL-2224), así que se carga en ambos. Best-effort: si falla, el copy
  // cae a la versión sin número. No aplica en oferta estándar.
  useEffect(() => {
    if (state.kind !== 'ready' || state.offer.offerCase === 'standard') return;
    let active = true;
    getCatalog(token, {})
      .then((cat) => { if (active) setCatalogCount(cat.count ?? null); })
      .catch(() => { /* sin count: el copy usa la versión sin número */ });
    return () => { active = false; };
  }, [state, token]);

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
      preselectedAccessoryIds?: number[],
      preselectedInsuranceIds?: number[],
    ) => {
      const base = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}/complementos`;
      // Avanzó (a complementos o, en el fallback, al detalle) → no es abandono
      // (BAL-2236). Se marca antes de ambas ramas: es el choke point único de
      // handleSelect / handleAceptarExclusiva / handleContinuarMiEquipo.
      convertedRef.current = true;
      if (variantId == null) {
        // Sin variante usable → caer al detalle para resolver allí.
        window.location.href = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}/producto/${slug ?? ''}`;
        return;
      }
      // Entrar a complementos desde el index es una "entrada nueva": debe
      // resetear a lo que realmente tiene el pedido, no rehidratar una selección
      // previa guardada en localStorage (BAL-2255). Sin esto, si el cliente quitó
      // un accesorio, volvió al index y re-entró manteniendo el MISMO equipo, el
      // ítem quitado seguía quitado (saveOfferSelection solo limpiaba al CAMBIAR
      // de equipo). El refresh dentro de complementos no pasa por aquí → conserva
      // su selección.
      clearAllAddons(token);
      saveOfferSelection(token, {
        variantId,
        comboId: comboId ?? null,
        slug: slug ?? null,
        name: equipo?.name || 'Tu equipo',
        brand: equipo?.brand,
        imageUrl: equipo?.imageUrl,
        monthly: equipo?.monthly,
        // Plazo/inicial elegidos (o los reales del pedido en "mantener mi equipo"):
        // complementos los usa para mostrar el plazo y cotizar los add-ons a esa
        // celda (BAL-2212). Sin esto caía al default del snapshot.
        term: equipo?.term,
        initial: equipo?.initial,
        preselectedAccessoryIds:
          preselectedAccessoryIds && preselectedAccessoryIds.length ? preselectedAccessoryIds : undefined,
        preselectedInsuranceIds:
          preselectedInsuranceIds && preselectedInsuranceIds.length ? preselectedInsuranceIds : undefined,
      });
      window.location.href = base;
    },
    [token],
  );

  // Card "Elegir" del catálogo / "Aceptar equipo" del index → mini-checkout.
  const handleSelect = useCallback(
    (product: CatalogProduct) => {
      trackFirstAction();
      // Funnel: click "elegir" en una card (equipo aprobado o del catálogo).
      analytics.track('offer_equipment_select_click', {
        variant_id: product.variantId ? Number(product.variantId) : null,
        combo_id: product.comboId ?? null,
      });
      // Funnel (paso 3): equipo elegido, origen "recommended" (Caso 4).
      analytics.track('offer_equipment_chosen', {
        offer_case: state.kind === 'ready' ? state.offer.offerCase : undefined,
        source: 'recommended',
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
    [goToAccesorios, analytics, state, trackFirstAction],
  );

  // Caso 5: aceptar la oferta exclusiva → mini-checkout de accesorios/seguros.
  // (Perfil B ya trae accesorio incluido y Perfil C es tarifa especial; aun así
  // el cliente puede sumar más add-ons que quepan en su cuota restante.)
  const handleAceptarExclusiva = useCallback(() => {
    trackFirstAction();
    const offer = state.kind === 'ready' ? state.offer : null;
    const ex = offer?.exclusiveOffer;
    if (!ex || ex.variantId == null) return;
    // Funnel: acepta la oferta exclusiva (Caso 5 upsell).
    analytics.track('offer_equipment_chosen', {
      offer_case: offer?.offerCase,
      source: 'exclusive',
      variant_id: ex.variantId ?? null,
      combo_id: ex.comboId ?? null,
    });
    // Si el exclusivo es un COMBO (Perfil C), se pasa su comboId → complementos
    // resuelve los accesorios/seguros GRATIS del combo. El accesorio del Perfil B
    // (no-combo) se resuelve aparte y se pasa preseleccionado.
    const regaloId = ex.accessory?.product_id;
    goToAccesorios(
      ex.variantId,
      ex.comboId ?? null,
      ex.slug,
      {
        name: ex.name ?? 'Tu equipo',
        brand: ex.brand ?? undefined,
        imageUrl: ex.imageUrl ?? undefined,
        monthly: ex.combinedMonthly,
      },
      regaloId ? [regaloId] : undefined,
    );
  }, [state, goToAccesorios, analytics, trackFirstAction]);

  // Caso 5: "continuar con mi equipo" → mini-checkout de accesorios/seguros con
  // el equipo PEDIDO (igual que "aceptar exclusiva" y que el flujo del Caso 4).
  // El cliente rechaza el upsell y suma add-ons a su equipo. El backend acepta
  // el equipo pedido en ofertas upsell (BAL-2100 #1). Antes abría un modal inline
  // que llamaba /select con el equipo pedido → 404 variant_not_eligible.
  const handleContinuarMiEquipo = useCallback(() => {
    trackFirstAction();
    const offer = state.kind === 'ready' ? state.offer : null;
    const req = offer?.requestedProduct;
    if (!req || req.variant_id == null) return;
    // Funnel: elige mantener el equipo pedido (rechaza el upsell), Caso 5.
    analytics.track('offer_equipment_chosen', {
      offer_case: offer?.offerCase,
      source: 'keep',
      variant_id: req.variant_id ?? null,
    });
    // Accesorios/seguros que el cliente YA tenía en su pedido → preseleccionados
    // en complementos (editables). Al "mantener mi equipo" no debe perderlos.
    const accIds = (req.accessories ?? [])
      .map((a) => a.id).filter((id): id is number => id != null);
    const insIds = (req.insurances ?? [])
      .map((i) => i.id).filter((id): id is number => id != null);
    goToAccesorios(
      req.variant_id, null, req.slug,
      {
        name: req.name ?? 'Tu equipo',
        brand: undefined,
        imageUrl: req.image_url ?? undefined,
        monthly: req.monthly_price ?? undefined,
        // Plazo/inicial REALES del pedido → complementos los muestra y cotiza los
        // add-ons a esa celda (mismo equipo = mismo plazo del pedido).
        term: req.term_months ?? req.term ?? undefined,
        initial: req.initial_percent ?? undefined,
      },
      accIds,
      insIds,
    );
  }, [state, goToAccesorios, analytics, trackFirstAction]);

  const confirmSelect = useCallback(async () => {
    if (!pending) return;
    if (pending.variantId == null) {
      // Sin variante usable → caer al detalle para resolver allí (avanzó, no
      // abandonó — BAL-2236).
      convertedRef.current = true;
      window.location.href = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}/producto/${pending.slug}`;
      return;
    }
    setConfirming(true);
    try {
      await selectEquipment(token, pending.variantId, pending.comboId);
      // Éxito: CONVIRTIÓ (eligió su equipo) → no es abandono si luego oculta la
      // pestaña (BAL-2236). Confirmación EN LA MISMA página (sin re-validar el
      // token consumido).
      convertedRef.current = true;
      const summary = pending.summary;
      // Funnel: la elección se registró y se muestra la pantalla "¡Listo!".
      analytics.track('offer_success_view', {
        offer_case: state.kind === 'ready' ? state.offer.offerCase : undefined,
        variant_id: pending.variantId ?? null,
      });
      // Timing (BAL-2236): tiempo desde offer_viewed hasta la conversión (elección confirmada).
      if (offerViewedAt.current != null) {
        analytics.track('offer_time_to_convert', {
          offer_case: state.kind === 'ready' ? state.offer.offerCase : undefined,
          seconds: Math.round((Date.now() - offerViewedAt.current) / 1000),
        });
      }
      setPending(null);
      setSelected(summary);
    } catch (err) {
      const reason = err instanceof OfferApiError ? err.reason : 'unknown';
      const message = err instanceof OfferApiError ? err.message : 'No pudimos registrar tu elección.';
      // Funnel: la confirmación de elección falló (variante ya no elegible,
      // link consumido en paralelo, error de red, etc.).
      analytics.track('offer_select_error', {
        offer_case: state.kind === 'ready' ? state.offer.offerCase : undefined,
        reason: err instanceof Error ? err.name : 'unknown',
      });
      setPending(null);
      setState({ kind: 'error', reason, message });
    } finally {
      setConfirming(false);
    }
  }, [pending, token, state, analytics]);

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

  // Oferta ESTÁNDAR (F-6B): el analista ya armó UNA oferta y el cliente solo
  // decide aceptar/rechazar — vista simple con countdown, sin catálogo.
  if (offer.offerCase === 'standard') {
    return (
      <StandardOfertaAccion
        token={token}
        offer={offer}
        onConverted={() => {
          // Aceptó o rechazó → decidió, no abandonó (BAL-2236).
          convertedRef.current = true;
        }}
      />
    );
  }

  // Mapeo de los datos del offer a EquipoRecomendadoInfo (props opcionales →
  // se omite lo que no venga del backend). Caso 4: recommended (CatalogProduct).
  const recomendadoInfo: EquipoRecomendadoInfo | null = offer.recommended
    ? {
        name: offer.recommended.displayName || offer.recommended.name,
        brand: offer.recommended.brand,
        imageUrl: offer.recommended.images?.[0] || offer.recommended.thumbnail,
        monthly: offer.recommended.quotaMonthly,
        term: offer.recommended.hookTermMonths ?? offer.recommended.maxTermMonths,
        initial:
          offer.recommended.hookInitialAmount != null && offer.recommended.hookInitialAmount > 0
            ? `inicial S/${Math.round(offer.recommended.hookInitialAmount)}`
            : undefined,
        specs: specsToChips(offer.recommended.specs),
        comboAccessories: offer.recommended.comboAddons?.accessories.map((a) => a.name),
        comboInsurances: offer.recommended.comboAddons?.insurances.map((i) => i.name),
      }
    : null;

  // Caso 5: exclusiveOffer (ExclusiveOffer).
  const exclusivaInfo: EquipoRecomendadoInfo | null = offer.exclusiveOffer
    ? {
        name: offer.exclusiveOffer.name ?? 'Tu oferta exclusiva',
        brand: offer.exclusiveOffer.brand,
        imageUrl: offer.exclusiveOffer.imageUrl,
        monthly: offer.exclusiveOffer.combinedMonthly,
        term: offer.exclusiveOffer.termMonths,
        initial:
          offer.exclusiveOffer.initialAmount != null && offer.exclusiveOffer.initialAmount > 0
            ? `inicial S/${Math.round(offer.exclusiveOffer.initialAmount)}`
            : undefined,
        // Chips de specs del equipo exclusivo (procesador/RAM/…), para la card
        // "oferta personalizada" del Caso 5 — igual que el recomendado del Caso 4.
        specs: offer.exclusiveOffer.specs
          ? specsToChips(createSpecsFromEav(offer.exclusiveOffer.specs, 'laptop'))
          : undefined,
        // Accesorio recomendado del Perfil B (CON COSTO, no gratis): se muestra
        // con su cuota dentro de la card del equipo exclusivo.
        recommendedAccessory: offer.exclusiveOffer.accessory
          ? {
              name: offer.exclusiveOffer.accessory.name,
              monthly: offer.exclusiveOffer.accessory.monthly,
            }
          : null,
        // Precio del equipo SOLO (sin el accesorio del Perfil B), bajo el nombre.
        equipoMonthly: offer.exclusiveOffer.monthlyPrice,
        // Accesorios/seguros INCLUIDOS del combo (Perfil C) → badges "Incluye".
        comboAccessories: offer.exclusiveOffer.comboAddons?.accessories?.length
          ? offer.exclusiveOffer.comboAddons.accessories.map((a) => a.name)
          : undefined,
        comboInsurances: offer.exclusiveOffer.comboAddons?.insurances?.length
          ? offer.exclusiveOffer.comboAddons.insurances.map((i) => i.name)
          : undefined,
      }
    : null;

  const req = offer.requestedProduct;

  // Cuota total del pedido para la barra (Caso 4/5): equipo + accesorios + seguros
  // que el estudiante ya tenía. La barra la compara contra la cuota aprobada, que
  // es MENSUAL. BAL-2379: para celulares (semanal/quincenal) la cuota del pedido
  // viene en su frecuencia nativa, así que se lleva a mensual con monthlyFactor
  // antes de compararla; si no, la barra sobrestimaba el restante (59/qcn vs 600/mes).
  // La card "tu pedido" sigue mostrando la cuota nativa (/qcn) — esto es solo para
  // el cálculo del restante de la barra.
  const reqFreqFactor = monthlyFactor(req?.payment_frequency);
  const reqExtrasMonthly =
    ((req?.accessories ?? []).reduce((s, a) => s + (a.monthly ?? 0), 0) +
     (req?.insurances ?? []).reduce((s, i) => s + (i.monthly ?? 0), 0)) * reqFreqFactor;
  const reqTotalMonthly =
    req?.monthly_price != null ? (req.monthly_price * reqFreqFactor) + reqExtrasMonthly : null;

  // Chips de specs del equipo pedido (processor/RAM/almacenamiento/GPU/pantalla),
  // igual que la card del recomendado del Caso 4. El backend manda el dict plano
  // EAV en req.specs; createSpecsFromEav lo estructura y specsToChips lo pinta.
  const reqSpecsChips = req?.specs
    ? specsToChips(createSpecsFromEav(req.specs, 'laptop'))
    : [];

  return (
    <div className="min-h-screen bg-white">
      <OfertaHeader />

      <main className="mx-auto flex w-full max-w-3xl flex-col gap-2.5 px-4 py-3.5 sm:gap-[18px] sm:py-6 sm:px-6 lg:px-8">
        {/* Saludo (feedback Marco): "¡Felicitaciones, {nombre}, tu solicitud ha
            sido aprobada!" con nombre completo y "aprobada" en verde bold.
            Idéntico al de la página de complementos. */}
        <div className="text-[18px] font-semibold leading-[1.25]">
          {offer.clientName ? `¡Felicitaciones, ${offer.clientName.trim()}, tu solicitud ha sido` : '¡Felicitaciones! Tu solicitud ha sido'}{' '}
          <span className="font-extrabold" style={{ color: OFERTA_COLORS.greenDark }}>aprobada</span>!
        </div>

        {/* Código de la solicitud (BAL-2250): chip discreto para que el cliente
            lo tenga a mano si contacta soporte. */}
        {offer.applicationCode ? (
          <div
            className="inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11.5px] font-semibold"
            style={{ backgroundColor: OFERTA_COLORS.lilac, color: OFERTA_COLORS.textSoft }}
          >
            Solicitud: {offer.applicationCode}
          </div>
        ) : null}

        {offer.offerCase === 'upsell' ? (
          // Caso 5 (upsell): la barra muestra el equipo que el estudiante PIDIÓ
          // (current_product → requestedProduct), igual que el Caso 4 — NO el
          // equipo exclusivo recomendado. "usa S/X · te quedan S/Y para accesorios".
          <MontoAprobadoBar
            aprobado={offer.maxMonthlyQuota}
            mode="recomendado"
            usado={reqTotalMonthly}
            equipoNombre={req?.name ?? undefined}
          />
        ) : (
          // Caso 4 (downgrade): la barra muestra el equipo que el estudiante
          // PIDIÓ (el que conoce). Como no entra, sale en rojo con el aviso
          // "<tu equipo> cuesta S/X — se pasa de tu monto".
          <MontoAprobadoBar
            aprobado={offer.maxMonthlyQuota}
            mode="pedido"
            usado={reqTotalMonthly}
            equipoNombre={req?.name ?? undefined}
          />
        )}

        {/* Título redundante en mobile (el badge "Aprobada" + el monto ya lo
            comunican) → oculto en mobile para caber en 100vh, visible en sm+. */}
        <div className="hidden text-[17px] font-bold sm:block">
          ¡Estás aprobado! Elige cómo continuar
        </div>

        <PruebaSocial />

        {offer.offerCase === 'upsell' ? (
          <>
            {/* Upsell (mock frame 2): Añadir accesorios (recomendado) →
                Card "Cambiar equipo" enriquecida (collage + ver catálogo) →
                "Mantener mi equipo" con imagen real. */}
            <OpcionBarra
              destacada
              imagen={COLLAGE_ACCESORIOS_URL}
              imagenAlt="Accesorios disponibles"
              icono={<IconoAccesorios size={50} />}
              titulo="Añadir accesorios y seguros"
              subtitulo="Suma accesorios y seguros a tu equipo aprobado"
              onClick={handleContinuarMiEquipo}
            />
            {/* Card "Oferta personalizada": equipo exclusivo con foto + specs +
                cuota + "Ver detalle" separado del CTA "Aceptar equipo" (misma
                EquipoRecomendadoCard del Caso 4, tone índigo). */}
            {exclusivaInfo ? (
              <EquipoRecomendadoCard
                equipo={exclusivaInfo}
                tone="indigo"
                badgeText="Oferta personalizada"
                ctaText="Aceptar equipo"
                subtext="Un equipo mejor dentro de tu cuota aprobada"
                onElegir={handleAceptarExclusiva}
                onVerDetalle={
                  offer.exclusiveOffer?.slug
                    ? () => {
                        // Vio el detalle → avanzó, no abandonó (BAL-2236).
                        convertedRef.current = true;
                        window.location.href = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}/producto/${offer.exclusiveOffer!.slug}`;
                      }
                    : undefined
                }
              />
            ) : null}
            {/* "Mejora tu equipo" (upsell): mismo componente estándar del Caso 4
                (OpcionBarra) — antes usaba CardCambiarEquipo, un layout aparte.
                Se conserva el texto del upsell + el conteo dinámico de equipos. */}
            <OpcionBarra
              imagen={COLLAGE_EQUIPOS_URL}
              imagenAlt="Equipos disponibles"
              icono={<ShoppingBag className="h-[28px] w-[28px]" strokeWidth={1.8} style={{ color: OFERTA_COLORS.primary }} />}
              titulo="Mejora tu equipo"
              subtitulo={
                catalogCount && catalogCount > 0
                  ? `Explora ${catalogCount} equipos aprobados para ti`
                  : 'Explora otros equipos de nuestro catálogo'
              }
              onClick={goToCatalogo}
            />
            {/* "Mantener mi equipo": card rica (misma EquipoPedidoCard del Caso 4,
                variante 'disponible' → sin tachar, con desglose de los
                accesorios/seguros que el cliente ya pidió + CTA "Mantener"). */}
            {req ? (
              <EquipoPedidoCard
                variant="disponible"
                nombre={req.name ?? 'Tu equipo'}
                imageUrl={req.image_url}
                monthly={req.monthly_price}
                termMonths={req.term_months ?? req.term ?? null}
                initialAmount={req.initial_amount ?? null}
                initialPercent={req.initial_percent ?? null}
                paymentFrequency={req.payment_frequency ?? 'mensual'}
                specs={reqSpecsChips}
                accessories={req.accessories ?? []}
                insurances={req.insurances ?? []}
                ctaText="Mantener este equipo"
                onElegir={handleContinuarMiEquipo}
              />
            ) : null}
          </>
        ) : (
          <>
            {/* Card GRIS del equipo pedido (read-only) — diseño NUEVO del
                rediseño, solo reusa la DATA (imagen/accesorios de req). Ya trae
                el badge "No disponible", así que no repetimos el aviso naranja
                separado (ahorra alto en mobile). En mobile los accesorios se
                colapsan tras "ver detalle" para que entre en 100vh. */}
            {req ? (
              <EquipoPedidoCard
                nombre={req.name ?? 'Tu equipo'}
                imageUrl={req.image_url}
                monthly={req.monthly_price}
                termMonths={req.term_months ?? req.term ?? null}
                initialAmount={req.initial_amount ?? null}
                initialPercent={req.initial_percent ?? null}
                paymentFrequency={req.payment_frequency ?? 'mensual'}
                specs={reqSpecsChips}
                accessories={req.accessories ?? []}
                insurances={req.insurances ?? []}
              />
            ) : null}

            <div className="flex items-center gap-3">
              <div className="h-px flex-1" style={{ backgroundColor: OFERTA_COLORS.border }} />
              <span className="whitespace-nowrap text-[11px]" style={{ color: OFERTA_COLORS.textSoft }}>
                pero te aprobamos esto
              </span>
              <div className="h-px flex-1" style={{ backgroundColor: OFERTA_COLORS.border }} />
            </div>

            {recomendadoInfo ? (
              <EquipoRecomendadoCard
                equipo={recomendadoInfo}
                tone="verde"
                badgeText="Aprobado para ti"
                ctaText="Aceptar equipo"
                subtext="Tu solicitud queda aprobada al elegirlo"
                onElegir={() => handleSelect(offer.recommended as CatalogProduct)}
                onVerDetalle={
                  offer.recommended?.slug
                    ? () => {
                        // Vio el detalle → avanzó, no abandonó (BAL-2236).
                        convertedRef.current = true;
                        window.location.href = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}/producto/${offer.recommended!.slug}`;
                      }
                    : undefined
                }
              />
            ) : null}

            <div className="hidden items-center gap-3 sm:flex">
              <div className="h-px flex-1" style={{ backgroundColor: OFERTA_COLORS.border }} />
              <span className="whitespace-nowrap text-[11px]" style={{ color: OFERTA_COLORS.textSoft }}>
                ¿no te convence?
              </span>
              <div className="h-px flex-1" style={{ backgroundColor: OFERTA_COLORS.border }} />
            </div>

            <OpcionBarra
              imagen={COLLAGE_EQUIPOS_URL}
              imagenAlt="Equipos disponibles"
              icono={<ShoppingBag className="h-[28px] w-[28px]" strokeWidth={1.8} style={{ color: OFERTA_COLORS.primary }} />}
              titulo="Mejora tu equipo"
              subtitulo={
                catalogCount && catalogCount > 0
                  ? `Explora ${catalogCount} equipos aprobados para ti`
                  : 'Explora otros equipos de nuestro catálogo'
              }
              onClick={goToCatalogo}
            />
          </>
        )}
      </main>

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

