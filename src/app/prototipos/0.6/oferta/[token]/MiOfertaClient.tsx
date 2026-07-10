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

import { useCallback, useEffect, useState } from 'react';
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
import { StandardOfertaAccion } from './components/StandardOfertaAccion';
import { saveOfferSelection, type StoredEquipo } from './offerStorage';
import { useAnalytics } from '../../analytics/useAnalytics';
import { OfertaHeader } from './components/redesign/OfertaHeader';
import { MontoAprobadoBar } from './components/redesign/MontoAprobadoBar';
import { PruebaSocial } from './components/redesign/PruebaSocial';
import { EquipoRecomendadoCard, type EquipoRecomendadoInfo } from './components/redesign/EquipoRecomendadoCard';
import { OpcionBarra } from './components/redesign/OpcionBarra';
import { CardCambiarEquipo } from './components/redesign/CardCambiarEquipo';
import { IconoAccesorios } from './components/redesign/IconoAccesorios';
import { EquipoPedidoCard } from './components/redesign/EquipoPedidoCard';
import { OFERTA_COLORS } from './components/redesign/ofertaTheme';

/** Chips de specs clave (procesador/RAM/almacenamiento) — mismo criterio que
 *  OfertaEquipoCard, para reusar el mismo lenguaje visual en la card nueva. */
// Chips de specs para la card recomendada. Mismo conjunto/formato que la card
// del catálogo (ProductCard): procesador, RAM+tipo, storage+tipo, GPU, display
// — así el equipo se ve idéntico en el catálogo y en la oferta.
function specsToChips(specs?: ProductSpecs | null): string[] {
  if (!specs) return [];
  const chips: string[] = [];
  if (specs.processor?.model) chips.push(specs.processor.model);
  if (specs.ram?.size) {
    chips.push(`${specs.ram.size}GB ${String(specs.ram.type ?? '')}`.trim());
  }
  if (specs.storage?.size) {
    chips.push(`${specs.storage.size}GB ${String(specs.storage.type ?? '').toUpperCase()}`.trim());
  }
  const gpuModel = specs.gpu?.model && String(specs.gpu.model) !== 'null' ? String(specs.gpu.model) : '';
  if (gpuModel) chips.push(specs.gpu?.vram ? `${gpuModel} ${specs.gpu.vram}GB` : gpuModel);
  if (specs.display?.size) {
    chips.push(`${specs.display.size}" ${String(specs.display.resolution ?? '').toUpperCase()}`.trim());
  }
  return chips;
}

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

  // Cuenta los equipos del catálogo de la oferta para el copy de la card
  // "Cambiar equipo" (solo upsell). Best-effort: si falla, el copy cae a la
  // versión sin número.
  useEffect(() => {
    if (state.kind !== 'ready' || state.offer.offerCase !== 'upsell') return;
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
    ) => {
      const base = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}/complementos`;
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
        // Plazo/inicial elegidos (o los reales del pedido en "mantener mi equipo"):
        // complementos los usa para mostrar el plazo y cotizar los add-ons a esa
        // celda (BAL-2212). Sin esto caía al default del snapshot.
        term: equipo?.term,
        initial: equipo?.initial,
        preselectedAccessoryIds:
          preselectedAccessoryIds && preselectedAccessoryIds.length ? preselectedAccessoryIds : undefined,
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
    // Perfil B se resuelve aparte en el backend) → sin comboId. El accesorio de
    // regalo (Perfil B) se pasa preseleccionado al mini-checkout.
    const regaloId = ex.accessory?.product_id;
    goToAccesorios(
      ex.variantId,
      null,
      ex.slug,
      {
        name: ex.name ?? 'Tu equipo',
        brand: ex.brand ?? undefined,
        imageUrl: ex.imageUrl ?? undefined,
        monthly: ex.combinedMonthly,
      },
      regaloId ? [regaloId] : undefined,
    );
  }, [state, goToAccesorios]);

  // Caso 5: "continuar con mi equipo" → mini-checkout de accesorios/seguros con
  // el equipo PEDIDO (igual que "aceptar exclusiva" y que el flujo del Caso 4).
  // El cliente rechaza el upsell y suma add-ons a su equipo. El backend acepta
  // el equipo pedido en ofertas upsell (BAL-2100 #1). Antes abría un modal inline
  // que llamaba /select con el equipo pedido → 404 variant_not_eligible.
  const handleContinuarMiEquipo = useCallback(() => {
    const offer = state.kind === 'ready' ? state.offer : null;
    const req = offer?.requestedProduct;
    if (!req || req.variant_id == null) return;
    goToAccesorios(req.variant_id, null, req.slug, {
      name: req.name ?? 'Tu equipo',
      brand: undefined,
      imageUrl: req.image_url ?? undefined,
      monthly: req.monthly_price ?? undefined,
      // Plazo/inicial REALES del pedido → complementos los muestra y cotiza los
      // add-ons a esa celda (mismo equipo = mismo plazo del pedido).
      term: req.term_months ?? req.term ?? undefined,
      initial: req.initial_percent ?? undefined,
    });
  }, [state, goToAccesorios]);

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

  // Oferta ESTÁNDAR (F-6B): el analista ya armó UNA oferta y el cliente solo
  // decide aceptar/rechazar — vista simple con countdown, sin catálogo.
  if (offer.offerCase === 'standard') {
    return <StandardOfertaAccion token={token} offer={offer} />;
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
      }
    : null;

  const req = offer.requestedProduct;

  // Cuota total del pedido para la barra (Caso 4): equipo + accesorios + seguros
  // que el estudiante ya tenía. La barra debe reflejar lo que realmente ocupa
  // de su monto aprobado, no solo el equipo.
  const reqExtrasMonthly =
    (req?.accessories ?? []).reduce((s, a) => s + (a.monthly ?? 0), 0) +
    (req?.insurances ?? []).reduce((s, i) => s + (i.monthly ?? 0), 0);
  const reqTotalMonthly =
    req?.monthly_price != null ? req.monthly_price + reqExtrasMonthly : null;

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
        <div className="font-['Baloo_2',_sans-serif] text-[18px] font-semibold leading-[1.25]">
          {offer.clientName ? `¡Felicitaciones, ${offer.clientName.trim()}, tu solicitud ha sido` : '¡Felicitaciones! Tu solicitud ha sido'}{' '}
          <span className="font-extrabold" style={{ color: OFERTA_COLORS.greenDark }}>aprobada</span>!
        </div>

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
        <div className="hidden font-['Baloo_2',_sans-serif] text-[17px] font-bold sm:block">
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
              icono={<IconoAccesorios size={50} />}
              titulo="Añadir accesorios"
              subtitulo={
                exclusivaInfo?.name
                  ? `Suma extras a tu ${exclusivaInfo.name}`
                  : 'Suma extras a tu equipo aprobado'
              }
              cuota={exclusivaInfo?.monthly != null ? `S/${Math.round(exclusivaInfo.monthly)}/mes` : undefined}
              onClick={handleAceptarExclusiva}
            />
            <CardCambiarEquipo
              montoAprobado={offer.maxMonthlyQuota}
              equiposCount={catalogCount}
              imagen={exclusivaInfo?.imageUrl ?? null}
              accesorio={
                offer.exclusiveOffer?.accessory
                  ? {
                      name: offer.exclusiveOffer.accessory.name,
                      imageUrl: offer.exclusiveOffer.accessory.image_url ?? null,
                      monthly: offer.exclusiveOffer.accessory.monthly,
                    }
                  : null
              }
              onVerCatalogo={goToCatalogo}
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
              icono={<ShoppingBag className="h-[28px] w-[28px]" strokeWidth={1.8} style={{ color: OFERTA_COLORS.primary }} />}
              titulo="Ver otros equipos"
              subtitulo="Explora el catálogo aprobado"
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

