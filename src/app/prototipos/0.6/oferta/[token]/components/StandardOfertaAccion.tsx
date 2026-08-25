'use client';

/**
 * StandardOfertaAccion — vista aceptar/rechazar de la oferta ESTÁNDAR
 * (F-6B, Task 5 · docs/superpowers/specs/2026-07-08-f6b-oferta-url-cliente-design.md).
 *
 * A diferencia del Caso 4/5 (selección dentro de un catálogo topado por
 * cuota), acá el analista ya armó UNA sola oferta (producto/cuota/tea/plazo/
 * inicial/total) y el cliente solo decide: aceptar o rechazar. Countdown de
 * vigencia que deshabilita ambos botones al expirar — evita un accept/reject
 * tardío que el backend igual rechazaría (410 `expired`).
 *
 * Desde 2026-08-11 usa el MISMO card rico del Caso 5 (EquipoRecomendadoCard) y
 * el saludo del upsell, en vez de una pantalla propia con un card de texto:
 * docs/superpowers/specs/2026-08-11-oferta-estandar-look-upsell-design.md.
 * «Ver detalle» abre la ficha del equipo en la landing de la solicitud, en
 * pestaña nueva.
 *
 * 2026-08-12 — la pantalla dejó de empujar hacia el «Aceptar»:
 *   - el card ya no trae CTA; las tres acciones (aceptar / rechazar /
 *     consultar) van juntas y al mismo peso debajo;
 *   - «Consultar» (WhatsApp) es nueva y sigue activa con la oferta vencida:
 *     antes solo aparecía DESPUÉS de rechazar;
 *   - se muestra de qué equipo se viene cuando la oferta cambia el equipo;
 *   - los términos se leen en una tarjeta (cuota, inicial, plazo, total) con
 *     TEA/TCEA al pie, en vez de una grilla que destacaba la TEA.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, Ban, Check, CheckCircle2, Clock, MessageCircle, Package, XCircle } from 'lucide-react';

import {
  acceptOffer,
  quoteOffer,
  rejectOffer,
  OfferApiError,
  type OfferView,
  type StandardOfferOption,
} from '../../../services/offerApi';
import { createSpecsFromEav } from '../../../services/catalogApi';
import { routes } from '../../../utils/routes';
import { useAnalytics } from '../../../analytics/useAnalytics';
import { OfertaHeader } from './redesign/OfertaHeader';
import { OFERTA_COLORS } from './redesign/ofertaTheme';
import { EquipoRecomendadoCard, type EquipoRecomendadoInfo } from './redesign/EquipoRecomendadoCard';
import { specsToChips } from './redesign/specsChips';
import { OfertaEstadoMensaje } from './OfertaEstadoMensaje';
import { SeleccionConfirmada, type ChosenSummary } from './SeleccionConfirmada';
import { cuotaSuffix, plazoUnit } from './equipoCardFormat';
import { useCountdown } from './useCountdown';

const WHATSAPP_URL = 'https://wa.link/osgxjf';

/** Fila de chips de un eje del menú (plazo o inicial). */
function OpcionesFila({
  etiqueta,
  valores,
  actual,
  formato,
  onElegir,
}: {
  etiqueta: string;
  valores: number[];
  actual: number | null;
  formato: (valor: number) => string;
  onElegir: (valor: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 text-[11.5px] font-semibold" style={{ color: OFERTA_COLORS.textMid }}>
        {etiqueta}
      </div>
      <div className="flex flex-wrap gap-2">
        {valores.map((valor) => {
          const activo = valor === actual;
          return (
            <button
              key={valor}
              type="button"
              aria-pressed={activo}
              onClick={() => onElegir(valor)}
              className="cursor-pointer rounded-lg border-[1.5px] px-3 py-1.5 text-[13px] font-bold transition-all duration-150 active:scale-[.97]"
              style={
                activo
                  ? { borderColor: OFERTA_COLORS.primary, backgroundColor: OFERTA_COLORS.primary, color: '#fff' }
                  : { borderColor: OFERTA_COLORS.border, backgroundColor: '#fff', color: OFERTA_COLORS.textMid }
              }
            >
              {formato(valor)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function StandardOfertaAccion({
  token,
  offer,
  onConverted,
}: {
  token: string;
  offer: OfferView;
  onConverted?: () => void;
}) {
  const analytics = useAnalytics();
  const info = offer.standardOffer ?? null;
  const countdown = useCountdown(offer.expiresAt);

  const [loading, setLoading] = useState<'accept' | 'reject' | null>(null);
  const [decision, setDecision] = useState<'accepted' | 'rejected' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Rangos de plazo/inicial. Vacío = oferta de una sola combinación: todo lo
  // que sigue degrada a la vista de siempre.
  const options = useMemo(() => info?.options ?? [], [info?.options]);
  const terms = useMemo(
    () => [...new Set(options.map((o) => o.termMonths))].sort((a, b) => a - b),
    [options],
  );
  const initials = useMemo(
    () => [...new Set(options.map((o) => o.initialPercent))].sort((a, b) => a - b),
    [options],
  );
  // Arranca en la combinación que armó el gestor (la que trae la oferta), para
  // que abrir el link muestre lo mismo que se le prometió al cliente.
  const [selTerm, setSelTerm] = useState<number | null>(null);
  const [selInitial, setSelInitial] = useState<number | null>(null);
  // El plazo de la oferta es el default, salvo que el backend no lo ofrezca
  // (excluye el plazo que la solicitud ya tiene): ahí arranca en el primero
  // disponible, para que el chip activo y las cifras cuenten lo mismo.
  const defaultTerm = info?.termMonths ?? null;
  const curTerm =
    selTerm ?? (defaultTerm != null && terms.includes(defaultTerm) ? defaultTerm : terms[0] ?? defaultTerm);
  const defaultInitial = info?.initialPaymentPercent ?? null;
  const curInitial =
    selInitial
    ?? (defaultInitial != null && initials.includes(defaultInitial) ? defaultInitial : initials[0] ?? defaultInitial);
  const selected = useMemo(
    () => options.find((o) => o.termMonths === curTerm && o.initialPercent === curInitial) ?? null,
    [options, curTerm, curInitial],
  );

  // Cifras que se muestran: las de la combinación elegida cuando hay menú.
  const shownMonthly = selected?.monthlyPayment ?? info?.monthlyPayment ?? null;
  const shownInitialPayment = selected?.initialPayment ?? info?.initialPayment ?? null;
  const shownInitialPercent = selected?.initialPercent ?? info?.initialPaymentPercent ?? null;
  const shownTea = selected?.tea ?? info?.tea ?? null;
  const shownTcea = selected?.tcea ?? info?.tcea ?? null;

  // Accesorios/seguros de la "Oferta con Accesorios": su cuota ya está dentro
  // de `monthlyPayment`, así que sin desglose el cliente ve una cuota más alta
  // que la de su equipo sin ninguna explicación.
  const addons = useMemo(
    () => [...(info?.accessories ?? []), ...(info?.insurances ?? [])],
    [info?.accessories, info?.insurances],
  );
  // El desglose por ítem corresponde a la combinación con la que se creó la
  // oferta. Si el cliente elige otro plazo/inicial la cuota se reparte
  // distinto: se sigue listando cada accesorio (los recibe igual) pero sin un
  // `+S/x/mes` que sería falso.
  const showAddonAmounts =
    options.length === 0
    || (curTerm === info?.termMonths && curInitial === info?.initialPaymentPercent);

  // Los add-ons arrancan SIN marcar: el cliente suma lo que quiere, en vez de
  // encontrarse todo puesto y tener que sacarlo. La cuota que ve al abrir es la
  // de su equipo solo, y cada casilla la va subiendo.
  //
  // Los regalos de combo no llevan casilla — no cuestan nada y vienen atados al
  // combo, así que no entran en esto.
  const togglables = useMemo(() => addons.filter((a) => !a.includedFree), [addons]);
  // `dropped` = lo NO elegido. Arranca con todo adentro, de ahí el initializer.
  const [dropped, setDropped] = useState<number[]>(() => togglables.map((a) => a.id));
  const isKept = useCallback((id: number) => !dropped.includes(id), [dropped]);
  // Con 18 accesorios, marcarlos uno por uno no es una opción razonable.
  const todosMarcados = togglables.length > 0 && dropped.length === 0;
  const toggleTodos = useCallback(() => {
    setDropped((prev) => (prev.length === 0 ? togglables.map((a) => a.id) : []));
    analytics.track('offer_standard_addon_toggle', {
      offer_code: offer.offerCode,
      bulk: true,
    });
  }, [togglables, analytics, offer.offerCode]);

  const toggleAddon = useCallback((id: number) => {
    setDropped((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    analytics.track('offer_standard_addon_toggle', { offer_code: offer.offerCode, addon_id: id });
  }, [analytics, offer.offerCode]);

  // Cuota del equipo solo: la total menos TODOS los deltas. Sobre esa base se
  // suman los que quedan marcados, así el número de arriba y las filas de
  // abajo siempre cuentan la misma historia.
  const equipoMonthly =
    shownMonthly != null
      ? shownMonthly - addons.reduce((sum, a) => sum + a.monthlyDelta, 0)
      : null;
  const keptDelta = togglables
    .filter((a) => isKept(a.id))
    .reduce((sum, a) => sum + a.monthlyDelta, 0);
  // Estimación local, para que el número reaccione al instante al marcar.
  const estimado =
    equipoMonthly != null && shownMonthly != null
      ? (dropped.length ? equipoMonthly + keptDelta : shownMonthly)
      : shownMonthly;

  // Cotización EXACTA del backend. La estimación de arriba se va hasta un sol
  // contra lo que realmente se contrata (la cuota se redondea al entero), así
  // que apenas llega esta, manda ella: el cliente no puede ver un número y
  // firmar otro.
  const [quoted, setQuoted] = useState<{ key: string; option: StandardOfferOption } | null>(null);
  const selectionKey = `${curTerm}|${curInitial}|${dropped.slice().sort().join(',')}`;
  useEffect(() => {
    if (!togglables.length || !dropped.length) {
      setQuoted(null);
      return;
    }
    let cancelled = false;
    quoteOffer(token, {
      addonIds: addons.filter((a) => isKept(a.id)).map((a) => a.id),
      ...(options.length && curTerm != null ? { term: curTerm } : {}),
      ...(options.length && curInitial != null ? { initialPercent: curInitial } : {}),
    })
      .then((q) => { if (!cancelled) setQuoted({ key: selectionKey, option: q }); })
      // Si la cotización falla, se sigue mostrando la estimación: es mejor un
      // número aproximado que un guion. El backend recalcula al aceptar igual.
      .catch(() => { if (!cancelled) setQuoted(null); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionKey, token]);

  // Todas las cifras de la tarjeta salen de la misma fuente: si hay
  // cotización vigente manda ella. Antes solo la cuota reaccionaba y "Total a
  // pagar" seguía mostrando el monto con TODOS los accesorios, contradiciendo
  // la cuota de arriba.
  const vigente = quoted && quoted.key === selectionKey ? quoted.option : null;
  const cuotaConSeleccion = vigente ? vigente.monthlyPayment : estimado;

  // Vencida en vivo (el usuario dejó la pestaña abierta hasta que expiró) o ya
  // había vencido al cargar. En ambos casos: botones deshabilitados.
  const expired = countdown?.expired === true;
  const disabled = loading !== null || expired;

  const handleAccept = useCallback(async () => {
    if (disabled) return;
    setLoading('accept');
    setError(null);
    analytics.track('offer_standard_accept_click', { offer_code: offer.offerCode });
    try {
      await acceptOffer(
        token,
        // Solo cuando hay menú: sin rangos el backend rechazaría una elección
        // (`no_options`) y además no hay nada que elegir.
        options.length && curTerm != null && curInitial != null
          ? { term: curTerm, initialPercent: curInitial }
          : undefined,
        // Solo si hay algo que elegir: sin add-ons no se manda nada y el
        // backend deja la oferta intacta.
        togglables.length ? addons.filter((a) => isKept(a.id)).map((a) => a.id) : undefined,
      );
      analytics.track('offer_standard_accepted', {
        offer_code: offer.offerCode,
        term_months: curTerm,
        initial_percent: curInitial,
      });
      onConverted?.();
      setDecision('accepted');
    } catch (err) {
      const message =
        err instanceof OfferApiError ? err.message : 'No pudimos registrar tu decisión. Intenta nuevamente.';
      analytics.track('offer_standard_decision_error', { offer_code: offer.offerCode, action: 'accept' });
      setError(message);
    } finally {
      setLoading(null);
    }
  }, [
    disabled, token, offer.offerCode, analytics, onConverted,
    options.length, curTerm, curInitial, togglables.length, addons, isKept,
  ]);

  const handleReject = useCallback(async () => {
    if (disabled) return;
    setLoading('reject');
    setError(null);
    analytics.track('offer_standard_reject_click', { offer_code: offer.offerCode });
    try {
      await rejectOffer(token);
      analytics.track('offer_standard_rejected', { offer_code: offer.offerCode });
      onConverted?.();
      setDecision('rejected');
    } catch (err) {
      const message =
        err instanceof OfferApiError ? err.message : 'No pudimos registrar tu decisión. Intenta nuevamente.';
      analytics.track('offer_standard_decision_error', { offer_code: offer.offerCode, action: 'reject' });
      setError(message);
    } finally {
      setLoading(null);
    }
  }, [disabled, token, offer.offerCode, analytics, onConverted]);

  // "Ver detalle": ficha del equipo en la landing de la solicitud. Necesita los
  // dos slugs; si falta alguno, el card no pinta el botón.
  const detalleUrl =
    info?.productSlug && offer.landingSlug
      ? routes.producto(offer.landingSlug, info.productSlug)
      : null;

  const handleVerDetalle = useCallback(() => {
    if (!detalleUrl) return;
    analytics.track('offer_standard_detail_click', { offer_code: offer.offerCode });
    // Pestaña nueva: que no pierda la oferta al ir a mirar el equipo.
    window.open(detalleUrl, '_blank', 'noopener,noreferrer');
  }, [detalleUrl, analytics, offer.offerCode]);

  // Confirmación de aceptación — mismo componente "¡Felicidades!" que el
  // Caso 4/5 (sin equipo anterior: acá no hay cambio, solo aceptación).
  if (decision === 'accepted') {
    const chosen: ChosenSummary = {
      name: info?.productName || 'Tu equipo',
      // La imagen faltaba: el objeto se armaba sin `imageUrl` y la pantalla de
      // "¡Felicidades!" mostraba el recuadro gris "Sin imagen" justo despues de
      // aceptar --el peor momento para que el equipo no se vea--. El backend la
      // manda (`product_image_url`) y la card de arriba ya la usa; solo no se
      // pasaba a la confirmacion.
      imageUrl: info?.productImageUrl ?? undefined,
      monthly: cuotaConSeleccion ?? shownMonthly ?? undefined,
      termMonths: curTerm ?? info?.termMonths ?? undefined,
      initialAmount: shownInitialPayment ?? undefined,
      initial: shownInitialPercent ?? undefined,
      userName: offer.clientName ?? undefined,
      offerCode: offer.offerCode,
      previous: null,
    };
    return <SeleccionConfirmada chosen={chosen} />;
  }

  // Confirmación de rechazo — mismo lenguaje visual que las pantallas de
  // estado (vencida/inválida), con copy propio.
  if (decision === 'rejected') {
    return (
      <OfertaEstadoMensaje
        icon="ban"
        title="Oferta rechazada"
        description="Registramos tu decisión. Si cambias de opinión o tienes dudas, escríbenos por WhatsApp."
        whatsappUrl={WHATSAPP_URL}
      />
    );
  }

  const totalTexto =
    vigente?.totalAmount ?? selected?.totalAmount ?? info?.totalAmount ?? info?.totalPrice ?? null;

  // El equipo anterior, para el antes/ahora. Llega null cuando no hay
  // comparacion que mostrar.
  const req = offer.requestedProduct;

  // Plazo y frecuencia REALES, con los helpers compartidos de las otras cards
  // (equipoCardFormat) para no abrir un segundo formato. `termMonths` normaliza
  // todo a meses: una oferta quincenal de 24 cuotas se leía "12 meses" y el
  // cliente no reconocía su propio plan; `term` son las cuotas nativas.
  const frecuencia = (info?.paymentFrequency || 'mensual').toLowerCase();
  // Con menú, el plazo elegido manda. Los rangos son siempre mensuales
  // (`normalize_client_options` trabaja en meses), así que `curTerm` ya es el
  // número de cuotas; sin menú se respeta el plazo nativo de la oferta.
  const cuotas = (options.length ? curTerm : null) ?? info?.term ?? info?.termMonths ?? null;
  const plazoTexto = cuotas ? `${cuotas} ${plazoUnit(cuotas, frecuencia)}` : null;

  // Card del equipo ofrecido. `specs` viene como dict EAV plano del backend
  // (igual que el Caso 4/5): se estructura y se convierte a chips.
  const equipo: EquipoRecomendadoInfo = {
    name: info?.productName || 'Tu equipo',
    brand: info?.productBrand ?? undefined,
    imageUrl: info?.productImageUrl ?? undefined,
    monthly: cuotaConSeleccion ?? shownMonthly ?? 0,
    // El card arma su plazo como "en N meses". En una oferta semanal/quincenal
    // eso choca con la cuota, que es de la frecuencia real: se omite acá y el
    // plazo correcto lo da la tarjeta de términos.
    term: frecuencia === 'mensual' ? (curTerm ?? info?.termMonths ?? undefined) : undefined,
    periodLabel: cuotaSuffix(frecuencia),
    initial:
      shownInitialPayment != null && shownInitialPayment > 0
        ? `inicial S/${Math.round(shownInitialPayment)}`.trim()
        : undefined,
    specs: info?.productSpecs
      ? specsToChips(createSpecsFromEav(info.productSpecs, 'laptop'))
      : undefined,
  };

  const aceptarTexto = expired ? 'Oferta vencida' : loading === 'accept' ? 'Aceptando…' : 'Aceptar';

  return (
    <div className="min-h-screen bg-white">
      <OfertaHeader />

      <main className="mx-auto flex w-full max-w-3xl flex-col gap-2.5 px-4 py-3.5 sm:gap-[18px] sm:py-6 sm:px-6 lg:px-8">
        {/* Saludo. Decía "tu solicitud ha sido aprobada": no lo está — hay una
            oferta esperando decisión, y si el cliente la rechaza nunca hubo
            aprobación. Prometer aprobado y después pedir que acepte es lo que
            hacía que el rechazo se leyera como que le quitaron algo. */}
        <div className="text-[18px] font-semibold leading-[1.25]">
          {offer.clientName ? `${offer.clientName.trim()}, tu ` : 'Tu '}
          <span className="font-extrabold" style={{ color: OFERTA_COLORS.primary }}>oferta</span>
          {' '}ha sido generada
        </div>

        <p className="text-[13px]" style={{ color: OFERTA_COLORS.textMid }}>
          {/* Vencida, el subtítulo invitaba a aceptar algo que ya no se puede
              aceptar. Lo contradecía el propio botón de abajo. */}
          {expired
            ? 'Estas son las condiciones que se te ofrecieron. Escríbenos y la reactivamos.'
            : 'Revisa las condiciones y decide. Queda en firme recién cuando la aceptas.'}
        </p>

        {/* Código de la solicitud: para tenerlo a mano si contacta soporte. */}
        {offer.applicationCode ? (
          <div
            className="inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11.5px] font-semibold"
            style={{ backgroundColor: OFERTA_COLORS.lilac, color: OFERTA_COLORS.textSoft }}
          >
            Solicitud: {offer.applicationCode}
          </div>
        ) : null}

        {/* Countdown de vigencia */}
        {countdown ? (
          <div
            className="flex w-fit items-center gap-2 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold"
            style={{
              backgroundColor: expired ? OFERTA_COLORS.amberBg : OFERTA_COLORS.lilac,
              color: expired ? '#B45309' : OFERTA_COLORS.primary,
              border: `1px solid ${expired ? OFERTA_COLORS.amberBorder : OFERTA_COLORS.border}`,
            }}
          >
            <Clock className="h-4 w-4 flex-none" />
            {expired ? 'Esta oferta venció' : <>Vence en {countdown.label}</>}
          </div>
        ) : null}

        {/* De lo pedido a lo ofrecido. Solo cuando la oferta CAMBIA de equipo:
            el backend manda `requested_product` en null si no hay comparación
            que mostrar (mantiene el equipo, o ya se aceptó). Es una tira, no
            dos columnas: el equipo ofrecido ya está completo en el card de
            abajo y repetirlo lo obligaría a comparar dos versiones distintas
            de lo mismo. Sin esto, el cliente que pidió una laptop y recibe
            otra no entiende por qué le cambiaron el equipo. */}
        {req ? (
          <div
            className="flex items-center gap-3 rounded-xl border px-3 py-2.5"
            style={{ borderColor: OFERTA_COLORS.border, backgroundColor: OFERTA_COLORS.lilac }}
          >
            {req.image_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={req.image_url}
                alt={req.name ?? 'Equipo que pediste'}
                className="h-10 w-14 flex-none object-contain opacity-60"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: OFERTA_COLORS.textSoft }}>
                Pediste
              </div>
              <div className="truncate text-[13px] font-semibold" style={{ color: OFERTA_COLORS.textMid }}>
                {req.name ?? 'Tu equipo'}
                {req.monthly_price != null ? (
                  <span className="ml-1.5 line-through" style={{ color: OFERTA_COLORS.textSoft }}>
                    S/{Math.round(req.monthly_price)}
                  </span>
                ) : null}
              </div>
            </div>
            {/* Hacia ABAJO, no a la derecha: el equipo ofrecido es el card que
                sigue. Con la flecha horizontal se lee como que hay algo al
                costado — visto al mirar la pantalla, no en un test. */}
            <ArrowDown className="h-4 w-4 flex-none" style={{ color: OFERTA_COLORS.primary }} />
            <div className="text-[11.5px] font-bold" style={{ color: OFERTA_COLORS.primary }}>
              Te ofrecemos
            </div>
          </div>
        ) : null}

        {/* El card queda informativo: las acciones viven abajo, las tres al
            mismo nivel. Antes el "Aceptar" era el CTA del card y "Rechazar" un
            botón suelto más chico — la jerarquía empujaba a aceptar. */}
        <EquipoRecomendadoCard
          equipo={equipo}
          tone="indigo"
          badgeText="TU OFERTA"
          onVerDetalle={detalleUrl ? handleVerDetalle : undefined}
        />

        {/* Elección de plazo/inicial. Solo aparece el eje con más de una
            opción — un solo plazo no es una decisión. */}
        {options.length > 1 ? (
          <div
            className="flex flex-col gap-3 rounded-xl border p-3.5"
            style={{ borderColor: OFERTA_COLORS.border, backgroundColor: OFERTA_COLORS.grayBg }}
          >
            <div className="text-[13px] font-bold" style={{ color: OFERTA_COLORS.textStrong }}>
              Arma tu cuota
            </div>
            {terms.length > 1 ? (
              <OpcionesFila
                etiqueta="Plazo"
                valores={terms}
                actual={curTerm}
                formato={(t) => `${t} meses`}
                onElegir={(t) => {
                  setSelTerm(t);
                  analytics.track('offer_standard_term_change', {
                    offer_code: offer.offerCode, term_months: t,
                  });
                }}
              />
            ) : null}
            {initials.length > 1 ? (
              <OpcionesFila
                etiqueta="Inicial"
                valores={initials}
                actual={curInitial}
                formato={(i) => (i > 0 ? `${i}%` : 'Sin inicial')}
                onElegir={(i) => {
                  setSelInitial(i);
                  analytics.track('offer_standard_initial_change', {
                    offer_code: offer.offerCode, initial_percent: i,
                  });
                }}
              />
            ) : null}
          </div>
        ) : null}

        {/* Terminos. Reemplaza la grilla que destacaba TEA y total: la inicial
            deja de ser texto incrustado en el plazo y pasa a ser una fila
            propia, porque es el monto que hay que pagar el primer dia. TEA y
            TCEA bajan al pie — siguen visibles por transparencia, pero dejan de
            competir con lo que el cliente necesita para decidir. */}
        <section
          aria-label="Términos de tu oferta"
          className="rounded-xl border"
          style={{ borderColor: OFERTA_COLORS.border }}
        >
          <div className="rounded-t-xl px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[.09em] text-white"
               style={{ backgroundColor: OFERTA_COLORS.primary }}>
            Términos de tu oferta
          </div>
          <dl className="divide-y" style={{ borderColor: OFERTA_COLORS.border }}>
            {shownMonthly != null ? (
              <div className="flex items-baseline justify-between px-3.5 py-2.5">
                <dt className="text-[13px]" style={{ color: OFERTA_COLORS.textMid }}>Cuota</dt>
                <dd className="text-[15px] font-bold" style={{ color: OFERTA_COLORS.primary }}>
                  S/{Math.round(cuotaConSeleccion ?? shownMonthly)}{cuotaSuffix(frecuencia)}
                </dd>
              </div>
            ) : null}
            <div className="flex items-baseline justify-between px-3.5 py-2.5">
              <dt className="text-[13px]" style={{ color: OFERTA_COLORS.textMid }}>Inicial</dt>
              <dd className="text-[14px] font-semibold" style={{ color: OFERTA_COLORS.textStrong }}>
                {(vigente?.initialPayment ?? shownInitialPayment)
                  ? `S/${Math.round(vigente?.initialPayment ?? shownInitialPayment!)}`
                  : 'Sin inicial'}
                {(vigente?.initialPercent ?? shownInitialPercent)
                  ? ` (${vigente?.initialPercent ?? shownInitialPercent}%)`
                  : ''}
              </dd>
            </div>
            {plazoTexto ? (
              <div className="flex items-baseline justify-between px-3.5 py-2.5">
                <dt className="text-[13px]" style={{ color: OFERTA_COLORS.textMid }}>Plazo</dt>
                <dd className="text-[14px] font-semibold" style={{ color: OFERTA_COLORS.textStrong }}>{plazoTexto}</dd>
              </div>
            ) : null}
            {totalTexto != null ? (
              <div className="flex items-baseline justify-between px-3.5 py-2.5">
                <dt className="text-[13px]" style={{ color: OFERTA_COLORS.textMid }}>Total a pagar</dt>
                <dd className="text-[14px] font-semibold" style={{ color: OFERTA_COLORS.textStrong }}>
                  S/{Math.round(totalTexto).toLocaleString('es-PE')}
                </dd>
              </div>
            ) : null}
          </dl>
          {((vigente?.tea ?? shownTea) != null || (vigente?.tcea ?? shownTcea) != null) ? (
            <div className="px-3.5 py-2 text-[11px]" style={{ color: OFERTA_COLORS.textSoft }}>
              {(vigente?.tea ?? shownTea) != null ? <>TEA {vigente?.tea ?? shownTea}%</> : null}
              {(vigente?.tea ?? shownTea) != null && (vigente?.tcea ?? shownTcea) != null ? ' \u00b7 ' : null}
              {(vigente?.tcea ?? shownTcea) != null ? <>TCEA {vigente?.tcea ?? shownTcea}%</> : null}
            </div>
          ) : null}
        </section>

        {/* Accesorios y seguros de la oferta. Su cuota ya está sumada arriba:
            sin esta lista el cliente veía una cuota más alta que la de su
            equipo sin saber de dónde salía. */}
        {addons.length ? (
          <section
            aria-label="Accesorios y seguros que puedes agregar"
            className="rounded-xl border"
            style={{ borderColor: OFERTA_COLORS.border }}
          >
            <div
              className="flex items-center justify-between gap-3 rounded-t-xl px-3.5 py-1.5 text-white"
              style={{ backgroundColor: OFERTA_COLORS.primary }}
            >
              {/* No dice "Incluye": no está incluido hasta que el cliente lo
                  marque. */}
              <span className="text-[10px] font-bold uppercase tracking-[.09em]">
                Puedes agregar
              </span>
              {togglables.length > 1 ? (
                <button
                  type="button"
                  onClick={toggleTodos}
                  className="cursor-pointer rounded-md px-2 py-0.5 text-[11px] font-bold underline-offset-2 transition-opacity hover:opacity-80"
                >
                  {todosMarcados ? 'Quitar todos' : 'Marcar todos'}
                </button>
              ) : null}
            </div>
            <ul className="divide-y" style={{ borderColor: OFERTA_COLORS.border }}>
              {addons.map((a) => {
                const kept = a.includedFree || isKept(a.id);
                return (
                <li
                  key={a.id}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 ${
                    a.includedFree ? '' : 'cursor-pointer'
                  }`}
                  onClick={a.includedFree ? undefined : () => toggleAddon(a.id)}
                >
                  {/* El regalo del combo no lleva casilla: no cuesta nada y no
                      se puede sacar por separado.

                      Misma casilla que los términos del formulario de solicitud
                      (`solicitar/.../CheckboxField`): cuadro de 20px con borde,
                      y al marcar se rellena con el color de marca y sale el
                      check en blanco. La nativa se veía de otro sistema. */}
                  {a.includedFree ? null : (
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={kept}
                      aria-label={`Incluir ${a.name}`}
                      onClick={(e) => { e.stopPropagation(); toggleAddon(a.id); }}
                      className="flex h-5 w-5 flex-none cursor-pointer items-center justify-center rounded border-2 transition-all"
                      style={
                        kept
                          ? { backgroundColor: OFERTA_COLORS.primary, borderColor: OFERTA_COLORS.primary }
                          : { backgroundColor: '#fff', borderColor: '#D4D4D8' }
                      }
                    >
                      {kept ? <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} /> : null}
                    </button>
                  )}
                  <div
                    className="flex h-11 w-11 flex-none items-center justify-center overflow-hidden rounded-lg"
                    style={{ backgroundColor: OFERTA_COLORS.grayBg }}
                  >
                    {a.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={a.imageUrl} alt={a.name} className="h-full w-full object-contain" />
                    ) : (
                      <Package className="h-5 w-5" style={{ color: OFERTA_COLORS.textSoft }} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className="truncate text-[13.5px] font-semibold"
                      style={{ color: OFERTA_COLORS.textStrong }}
                    >
                      {a.name}
                    </div>
                    {!a.includedFree && showAddonAmounts && a.price > 0 ? (
                      <div className="text-[11.5px]" style={{ color: OFERTA_COLORS.textSoft }}>
                        S/{Math.round(a.price).toLocaleString('es-PE')} al contado
                      </div>
                    ) : null}
                  </div>
                  {a.includedFree ? (
                    <span
                      className="whitespace-nowrap rounded-full px-2 py-0.5 text-[11.5px] font-bold"
                      style={{ backgroundColor: OFERTA_COLORS.greenBadgeBg, color: OFERTA_COLORS.greenDark }}
                    >
                      Incluido gratis
                    </span>
                  ) : !showAddonAmounts ? (
                    <span
                      className="whitespace-nowrap text-[12px] font-semibold"
                      style={{ color: OFERTA_COLORS.textSoft }}
                    >
                      Incluido
                    </span>
                  ) : (
                    /* Azul de marca, igual que la cuota de "Términos de tu
                       oferta": las dos dicen lo mismo —plata por mes— y en
                       negro competían con el nombre del accesorio. */
                    <span
                      className="whitespace-nowrap text-[13.5px] font-bold"
                      style={{ color: OFERTA_COLORS.primary }}
                    >
                      +S/{Math.round(a.monthlyDelta)}
                      <span className="text-[11.5px] font-semibold" style={{ color: OFERTA_COLORS.textMid }}>
                        {cuotaSuffix(frecuencia)}
                      </span>
                    </span>
                  )}
                </li>
                );
              })}
            </ul>
            {showAddonAmounts && togglables.length > 0 ? (
              <div className="px-3.5 py-2 text-[11px]" style={{ color: OFERTA_COLORS.textSoft }}>
                {dropped.length === togglables.length
                  ? 'Marca lo que quieras sumar y la cuota se ajusta.'
                  : `Sumaste S/${Math.round(keptDelta)}${cuotaSuffix(frecuencia)} a tu cuota.`}
              </div>
            ) : null}
          </section>
        ) : null}

        {/* Error inline (no reemplaza la pagina: el cliente puede reintentar) */}
        {error ? (
          <div
            className="rounded-lg px-3.5 py-2.5 text-[13px]"
            style={{ backgroundColor: OFERTA_COLORS.amberBg, color: '#B45309', border: `1px solid ${OFERTA_COLORS.amberBorder}` }}
          >
            {error}
          </div>
        ) : null}

        {/* Tres acciones al mismo nivel. "Consultar" es nuevo: antes WhatsApp
            solo aparecia DESPUES de rechazar, asi que el cliente que dudaba no
            tenia salida — o aceptaba o rechazaba. Y sigue habilitado con la
            oferta vencida: si vencio, escribir es justamente lo que hay que
            hacer. */}
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={handleAccept}
            disabled={disabled}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-5 py-3.5 text-[15px] font-bold text-white transition-transform hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: OFERTA_COLORS.primary }}
          >
            <CheckCircle2 className="h-5 w-5" />
            {aceptarTexto}
          </button>
          <button
            type="button"
            onClick={handleReject}
            disabled={disabled}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-5 py-3.5 text-[15px] font-bold transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ borderColor: OFERTA_COLORS.border, color: OFERTA_COLORS.textMid }}
          >
            <XCircle className="h-5 w-5" />
            {loading === 'reject' ? 'Rechazando…' : 'Rechazar'}
          </button>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-5 py-3.5 text-[15px] font-bold transition-colors hover:bg-neutral-50"
            style={{ borderColor: OFERTA_COLORS.border, color: OFERTA_COLORS.primary }}
          >
            <MessageCircle className="h-5 w-5" />
            Consultar
          </a>
        </div>

        {expired ? (
          <div className="flex items-center gap-2 text-[12.5px]" style={{ color: OFERTA_COLORS.textSoft }}>
            <Ban className="h-3.5 w-3.5" />
            Esta oferta ya no puede aceptarse ni rechazarse. Escríbenos para reactivarla.
          </div>
        ) : null}
      </main>
    </div>
  );
}
