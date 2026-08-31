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
import { ArrowDown, Ban, Check, CheckCircle2, ChevronRight, Clock, Package, Search, XCircle } from 'lucide-react';

import {
  acceptOffer,
  quoteOffer,
  rejectOffer,
  OfferApiError,
  type OfferView,
  type StandardOfferOption,
} from '../../../services/offerApi';
import { createSpecsFromEav } from '../../../services/catalogApi';
import { useAnalytics } from '../../../analytics/useAnalytics';
import { AccesorioDetalleModal } from './AccesorioDetalleModal';
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
  // Accesorio abierto en el modal de detalle y filtro del buscador (WEB-07).
  const [addonAbiertoId, setAddonAbiertoId] = useState<number | null>(null);
  const [busquedaAddon, setBusquedaAddon] = useState('');

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

  // Los regalos de combo no llevan casilla — no cuestan nada y vienen atados al
  // combo, así que no entran en esto ni se pueden desmarcar.
  const togglables = useMemo(() => addons.filter((a) => !a.includedFree), [addons]);
  // `dropped` = lo NO elegido. Arranca CON TODO ADENTRO: ningún accesorio ni
  // seguro viene marcado por defecto. La cuota que el cliente ve al abrir es la
  // de su equipo solo, y cada casilla que marca la va subiendo — suma lo que
  // quiere en vez de encontrarse todo puesto y tener que sacarlo.
  //
  // El default se inicializa una sola vez, al montar: `offer` ya viene resuelto
  // desde MiOfertaClient (solo renderiza esta vista con la oferta cargada), así
  // que `togglables` está completo en el primer render y no hay que re-sembrarlo
  // después — un effect que lo hiciera pelearía con los toggles del cliente.
  // `null` = el cliente todavía no tocó nada, así que vale el default. NO se
  // siembra el estado con los ids al montar: si `togglables` llegara vacío en el
  // primer render, esa semilla vacía significaría "no hay nada descartado" —
  // o sea, TODO marcado — y no habría forma de corregirla después. Derivándolo
  // en cada render el default no puede quedar viejo: mientras el cliente no
  // marque nada, todo está descartado, en esta visita y en cualquier otra.
  const [dropped, setDropped] = useState<number[] | null>(null);
  const droppedIds = useMemo(
    () => dropped ?? togglables.map((a) => a.id),
    [dropped, togglables],
  );
  const isKept = useCallback((id: number) => !droppedIds.includes(id), [droppedIds]);
  // Con 18 accesorios, marcarlos uno por uno no es una opción razonable.
  const todosMarcados = togglables.length > 0 && droppedIds.length === 0;
  const toggleTodos = useCallback(() => {
    setDropped(droppedIds.length === 0 ? togglables.map((a) => a.id) : []);
    analytics.track('offer_standard_addon_toggle', {
      offer_code: offer.offerCode,
      bulk: true,
    });
  }, [droppedIds, togglables, analytics, offer.offerCode]);

  const toggleAddon = useCallback((id: number) => {
    setDropped(
      droppedIds.includes(id) ? droppedIds.filter((x) => x !== id) : [...droppedIds, id],
    );
    analytics.track('offer_standard_addon_toggle', { offer_code: offer.offerCode, addon_id: id });
  }, [droppedIds, analytics, offer.offerCode]);

  // Modalidad de la oferta (WEB-04). Se calcula ACÁ ARRIBA porque la usan tres
  // cosas: la cuota base (acá abajo), el título de la oferta y la confirmación
  // de aceptación (BAL-3471). Las tres modalidades se distinguen con lo que ya
  // viaja:
  //   accesorios → `offer_type='upsell'` (la "Oferta con Accesorios" de admin2);
  //                se mira también la lista, porque es la que manda en el resto
  //                de la pantalla (ver `_client_options` en el backend);
  //   equipo     → el backend manda `requested_product` SOLO cuando la oferta
  //                cambia de equipo;
  //   plazo      → lo que queda: mismo equipo, otras condiciones.
  const esOfertaDeAccesorios = (info?.offerType ?? '') === 'upsell' || addons.length > 0;
  const req = offer.requestedProduct;

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

  // ── Cuota base VIGENTE (campos nuevos del backend, 2026-08-30) ─────────
  // `currentMonthlyPayment` es lo que la solicitud paga HOY: equipo vigente +
  // los accesorios que YA tiene colgados. Esos preexistentes no se listan como
  // ítems (el catálogo del link ya los excluye): van horneados en la base, así
  // que no se pueden desmarcar — desde esta página el cliente solo AGREGA.
  // Cada add-on que marca sube la base: 200 + 20 = 220, y uno de 15 → 235.
  //
  // La cuota congelada de la oferta (`monthlyPayment`) sale del precio de
  // lista GLOBAL del catálogo y no del que el cliente pidió: el hero decía
  // S/224 cuando la solicitud vigente es 253 + 35 = 288 (caso 120107).
  //
  // Solo manda en la oferta de ACCESORIOS, sobre el MISMO equipo y en la
  // combinación con la que se armó: una oferta que cambia el equipo (`req`) o
  // el plazo/inicial tiene por definición otra cuota que la vigente, y ahí el
  // número correcto sigue siendo el de la oferta. Sin los campos nuevos
  // (backend viejo) todo cae al cálculo de siempre: la página no cambia.
  const preexistentesMonthly = info?.preexistingAddonsMonthlyPayment ?? 0;
  const baseVigente = info?.currentMonthlyPayment ?? null;
  const usaBaseVigente =
    baseVigente != null && esOfertaDeAccesorios && !req && showAddonAmounts;

  // Estimación local, para que el número reaccione al instante al marcar.
  const estimado = usaBaseVigente
    ? baseVigente + keptDelta
    : equipoMonthly != null && shownMonthly != null
      ? (droppedIds.length ? equipoMonthly + keptDelta : shownMonthly)
      : shownMonthly;

  // Cotización EXACTA del backend. La estimación de arriba se va hasta un sol
  // contra lo que realmente se contrata (la cuota se redondea al entero), así
  // que apenas llega esta, manda ella: el cliente no puede ver un número y
  // firmar otro.
  const [quoted, setQuoted] = useState<{ key: string; option: StandardOfferOption } | null>(null);
  const selectionKey = `${curTerm}|${curInitial}|${droppedIds.slice().sort().join(',')}`;
  useEffect(() => {
    if (!togglables.length || !droppedIds.length) {
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
  // Con la base vigente manda la suma local: `/quote` cotiza sobre el
  // `total_price` CONGELADO de la oferta, así que devuelve la cuota del número
  // viejo (224 + lo marcado) y no la que la solicitud va a quedar pagando
  // (288 + lo marcado, que es lo que el backend deja al aceptar). El resto de
  // las cifras —inicial, total, TEA/TCEA— siguen saliendo de la cotización.
  const cuotaConSeleccion = usaBaseVigente
    ? estimado
    : vigente
      ? vigente.monthlyPayment
      : estimado;

  const addonAbierto = useMemo(
    () => addons.find((a) => a.id === addonAbiertoId) ?? null,
    [addons, addonAbiertoId],
  );
  // Con 18 accesorios encontrar uno a ojo es scroll y suerte. Debajo de ese
  // volumen el buscador es una caja más que estorba.
  const hayBuscador = togglables.length > 6;
  const addonsVisibles = useMemo(() => {
    const q = busquedaAddon.trim().toLowerCase();
    if (!q) return addons;
    return addons.filter((a) => a.name.toLowerCase().includes(q));
  }, [addons, busquedaAddon]);

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

  // "Ver detalle" (WEB-05): la ficha COMPLETA del equipo —galería, todas las
  // specs, cronograma de pago— dentro de la oferta. Antes abría la landing en
  // una pestaña nueva: el mismo equipo, pero en el sitio comercial, con su
  // navbar y sus CTAs de "solicitar", y sin el plazo de esta oferta. La ficha
  // interna ya existe (la usa el Caso 4) y vuelve con "Volver a mi oferta".
  const detalleUrl = info?.productSlug
    ? `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}/producto/${info.productSlug}`
    : null;

  const handleVerDetalle = useCallback(() => {
    analytics.track('offer_standard_detail_click', { offer_code: offer.offerCode });
  }, [analytics, offer.offerCode]);

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
    // El copy depende de lo que se aceptó (BAL-3471): una oferta de accesorios
    // no cambió el equipo, así que no puede decir "cambio de equipo" ni titular
    // la tarjeta "Tu nuevo equipo".
    const tipo = esOfertaDeAccesorios ? 'accesorios' : req ? 'equipo' : 'condiciones';
    return <SeleccionConfirmada chosen={chosen} variant={tipo} />;
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

  // `req` (el equipo anterior, para el antes/ahora) y `esOfertaDeAccesorios`
  // se declaran más arriba: la confirmación de aceptación también los usa.

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
  // La cuota que repite la barra fija: la misma que la tarjeta, para que no
  // haya dos números conviviendo en pantalla.
  const cuotaVigente = cuotaConSeleccion ?? shownMonthly;

  // Título por modalidad (WEB-04). `esOfertaDeAccesorios` se declara arriba.
  const nombre = offer.clientName?.trim();
  const saludo = esOfertaDeAccesorios
    ? (nombre ? `Hola ${nombre}, complementa tu solicitud con el ` : 'Complementa tu solicitud con el ')
    : (nombre ? `Hola ${nombre}, tu asesor te ha ofrecido un ` : 'Tu asesor te ha ofrecido un ');
  const tituloAcento = esOfertaDeAccesorios
    ? 'accesorio'
    : req ? 'cambio de equipo' : 'cambio de plazo';
  const tituloCierre = esOfertaDeAccesorios ? ' que necesitas!' : '';

  return (
    <div className="min-h-screen bg-white">
      <OfertaHeader />

      {/* `pb-28`: la barra fija de decisión tapa el final del scroll — sin este
          colchón el último accesorio queda debajo de ella. */}
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-2.5 px-4 py-3.5 pb-28 sm:gap-[18px] sm:py-6 sm:pb-28 sm:px-6 lg:px-8">
        {/* Título (WEB-04). El anterior era el mismo para las tres
            modalidades —"tu oferta ha sido generada"— y no decía qué le
            ofrecieron: el cliente tenía que deducirlo de las cifras. Ahora el
            título ES la oferta. Sin subtítulo: lo que decía ("revisa las
            condiciones y decide") ya lo dicen los botones. */}
        <h1 className="text-[18px] font-semibold leading-[1.25]">
          {saludo}
          <span className="font-extrabold" style={{ color: OFERTA_COLORS.primary }}>
            {tituloAcento}
          </span>
          {tituloCierre}
        </h1>

        {/* Vencida sí necesita una línea: los botones de abajo están apagados y
            sin esto la pantalla no explica por qué. */}
        {expired ? (
          <p className="text-[13px]" style={{ color: OFERTA_COLORS.textMid }}>
            Estas son las condiciones que se te ofrecieron.{' '}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-2"
              style={{ color: OFERTA_COLORS.primary }}
            >
              Escríbenos
            </a>{' '}
            y la reactivamos.
          </p>
        ) : null}

        {/* Número de la solicitud, para tenerlo a mano si contacta soporte. El
            `legacy_id` es el que el cliente conoce; el code de ws2 (`APP-xxxx`)
            es interno y queda de fallback (WEB-01). */}
        {offer.legacyId ?? offer.applicationCode ? (
          <div
            className="inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11.5px] font-semibold"
            style={{ backgroundColor: OFERTA_COLORS.lilac, color: OFERTA_COLORS.textSoft }}
          >
            Solicitud: {offer.legacyId ?? offer.applicationCode}
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
          verDetalleHref={detalleUrl ?? undefined}
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
          aria-label="Tu nueva cuota"
          className="rounded-xl border"
          style={{ borderColor: OFERTA_COLORS.border }}
        >
          {/* "Términos de tu oferta" describía el contenido en la lengua del
              contrato; el cliente entra a ver cuánto va a pagar (WEB-03). */}
          <div className="rounded-t-xl px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[.09em] text-white"
               style={{ backgroundColor: OFERTA_COLORS.primary }}>
            Tu nueva cuota
          </div>
          <dl className="divide-y" style={{ borderColor: OFERTA_COLORS.border }}>
            {cuotaVigente != null ? (
              <div className="flex items-baseline justify-between px-3.5 py-2.5">
                <dt className="text-[13px]" style={{ color: OFERTA_COLORS.textMid }}>Cuota</dt>
                <dd className="text-[15px] font-bold" style={{ color: OFERTA_COLORS.primary }}>
                  S/{Math.round(cuotaVigente)}{cuotaSuffix(frecuencia)}
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
          {/* Los accesorios que la solicitud YA tiene no son una fila que se
              pueda marcar ni desmarcar: viven adentro de la cuota base. Sin
              esta línea, el cliente ve una cuota más alta que la de su equipo
              y no sabe de dónde sale. */}
          {usaBaseVigente && preexistentesMonthly > 0 ? (
            <div
              className="border-t px-3.5 py-2 text-[11px]"
              style={{ borderColor: OFERTA_COLORS.border, color: OFERTA_COLORS.textSoft }}
            >
              Incluye S/{Math.round(preexistentesMonthly)}{cuotaSuffix(frecuencia)} de los
              accesorios que ya tienes en tu solicitud.
            </div>
          ) : null}
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
            {hayBuscador ? (
              <div className="border-b px-3.5 py-2.5" style={{ borderColor: OFERTA_COLORS.border }}>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: OFERTA_COLORS.textSoft }}
                  />
                  <input
                    type="search"
                    aria-label="Buscar accesorio"
                    placeholder="Buscar accesorio"
                    value={busquedaAddon}
                    onChange={(e) => setBusquedaAddon(e.target.value)}
                    className="w-full rounded-lg border py-2 pl-8 pr-3 text-[13px] outline-none focus:border-[color:var(--color-primary)]"
                    style={{ borderColor: OFERTA_COLORS.border, color: OFERTA_COLORS.textStrong }}
                  />
                </div>
              </div>
            ) : null}
            <ul className="divide-y" style={{ borderColor: OFERTA_COLORS.border }}>
              {addonsVisibles.map((a) => {
                const kept = a.includedFree || isKept(a.id);
                return (
                <li key={a.id} className="flex items-center gap-2.5 px-3.5 py-2.5">
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
                  {/* La foto y el nombre abren la ficha (WEB-07): la casilla
                      sigue siendo la que decide, así mirar el accesorio no
                      obliga a marcarlo primero. */}
                  <button
                    type="button"
                    aria-label={`Ver detalle de ${a.name}`}
                    onClick={() => setAddonAbiertoId(a.id)}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-left"
                  >
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
                    <ChevronRight className="h-4 w-4 flex-none" style={{ color: OFERTA_COLORS.textSoft }} />
                  </button>
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
                {droppedIds.length === togglables.length
                  ? 'Marca lo que quieras sumar y la cuota se ajusta.'
                  : `Sumaste S/${Math.round(keptDelta)}${cuotaSuffix(frecuencia)} a tu cuota.`}
              </div>
            ) : null}
          </section>
        ) : null}

        {/* Error inline (no reemplaza la pagina: el cliente puede reintentar) */}
        {error ? (
          <div
            role="alert"
            className="rounded-lg px-3.5 py-2.5 text-[13px]"
            style={{ backgroundColor: OFERTA_COLORS.amberBg, color: '#B45309', border: `1px solid ${OFERTA_COLORS.amberBorder}` }}
          >
            {error}
          </div>
        ) : null}

        {expired ? (
          <div className="flex items-center gap-2 text-[12.5px]" style={{ color: OFERTA_COLORS.textSoft }}>
            <Ban className="h-3.5 w-3.5" />
            Esta oferta ya no puede aceptarse ni rechazarse. Escríbenos para reactivarla.
          </div>
        ) : null}
      </main>

      {/* Barra fija de decisión (WEB-06). Las acciones vivían al final del
          scroll: con el menú de plazo, la tarjeta de cuota y hasta 18
          accesorios, el cliente que iba marcando add-ons perdía de vista tanto
          la cuota como los botones. Acá la cuota vigente y las dos decisiones
          lo acompañan todo el scroll.

          Aceptar en verde y rechazar en rojo (WEB-02): antes eran el azul de
          marca y un borde gris, y el gris se leía como "deshabilitado". Se fue
          también el botón "Consultar" — el enlace a WhatsApp sigue en el aviso
          de vencida, que es donde hacía falta. */}
      <div
        role="region"
        aria-label="Tu decisión"
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 backdrop-blur"
        style={{ borderColor: OFERTA_COLORS.border, boxShadow: '0 -6px 20px rgba(15,23,42,.08)' }}
      >
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          {cuotaVigente != null ? (
            <div className="min-w-0 flex-none">
              <div className="text-[10px] font-bold uppercase tracking-[.08em]" style={{ color: OFERTA_COLORS.textSoft }}>
                Tu cuota
              </div>
              <div className="text-[19px] font-extrabold leading-[1.1]" style={{ color: OFERTA_COLORS.primary }}>
                S/{Math.round(cuotaVigente)}
                <span className="text-[11.5px] font-semibold" style={{ color: OFERTA_COLORS.textMid }}>
                  {cuotaSuffix(frecuencia)}
                </span>
              </div>
            </div>
          ) : null}
          <div className="flex flex-1 items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleReject}
              disabled={disabled}
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-4 py-3 text-[14px] font-bold text-white transition-transform hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: OFERTA_COLORS.red }}
            >
              <XCircle className="h-4.5 w-4.5" />
              {loading === 'reject' ? 'Rechazando…' : 'Rechazar'}
            </button>
            <button
              type="button"
              onClick={handleAccept}
              disabled={disabled}
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-5 py-3 text-[14px] font-bold text-white transition-transform hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: OFERTA_COLORS.greenDark }}
            >
              <CheckCircle2 className="h-4.5 w-4.5" />
              {aceptarTexto}
            </button>
          </div>
        </div>
      </div>

      {/* Ficha del accesorio (WEB-07). */}
      {addonAbierto ? (
        <AccesorioDetalleModal
          addon={addonAbierto}
          incluido={addonAbierto.includedFree || isKept(addonAbierto.id)}
          sufijoCuota={cuotaSuffix(frecuencia)}
          mostrarMontos={showAddonAmounts}
          onToggle={() => {
            toggleAddon(addonAbierto.id);
            setAddonAbiertoId(null);
          }}
          onCerrar={() => setAddonAbiertoId(null)}
        />
      ) : null}
    </div>
  );
}
