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
 * «Aceptar oferta» es el CTA del card; «Rechazar» queda como acción
 * secundaria debajo para que no compitan. «Ver detalle» abre la ficha del
 * equipo en la landing de la solicitud, en pestaña nueva.
 */
import { useCallback, useState } from 'react';
import { Ban, Clock, XCircle } from 'lucide-react';

import {
  acceptOffer,
  rejectOffer,
  OfferApiError,
  type OfferView,
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
import { inicialText } from './equipoCardFormat';
import { useCountdown } from './useCountdown';

const WHATSAPP_URL = 'https://wa.link/osgxjf';

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
      await acceptOffer(token);
      analytics.track('offer_standard_accepted', { offer_code: offer.offerCode });
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
  }, [disabled, token, offer.offerCode, analytics, onConverted]);

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
      monthly: info?.monthlyPayment ?? undefined,
      termMonths: info?.termMonths ?? undefined,
      initialAmount: info?.initialPayment ?? undefined,
      initial: info?.initialPaymentPercent ?? undefined,
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

  const totalTexto = info?.totalAmount ?? info?.totalPrice ?? null;

  // Card del equipo ofrecido. `specs` viene como dict EAV plano del backend
  // (igual que el Caso 4/5): se estructura y se convierte a chips.
  const equipo: EquipoRecomendadoInfo = {
    name: info?.productName || 'Tu equipo',
    brand: info?.productBrand ?? undefined,
    imageUrl: info?.productImageUrl ?? undefined,
    monthly: info?.monthlyPayment ?? 0,
    term: info?.termMonths ?? undefined,
    initial:
      info?.initialPayment != null && info.initialPayment > 0
        ? `inicial S/${Math.round(info.initialPayment)}`.trim()
        : undefined,
    specs: info?.productSpecs
      ? specsToChips(createSpecsFromEav(info.productSpecs, 'laptop'))
      : undefined,
  };

  const ctaText = expired
    ? 'Oferta vencida'
    : loading === 'accept'
      ? 'Aceptando…'
      : 'Aceptar oferta';

  return (
    <div className="min-h-screen bg-white">
      <OfertaHeader />

      <main className="mx-auto flex w-full max-w-3xl flex-col gap-2.5 px-4 py-3.5 sm:gap-[18px] sm:py-6 sm:px-6 lg:px-8">
        {/* Saludo — mismo del Caso 4/5: nombre completo y "aprobada" en verde. */}
        <div className="text-[18px] font-semibold leading-[1.25]">
          {offer.clientName ? `¡Felicitaciones, ${offer.clientName.trim()}, tu solicitud ha sido` : '¡Felicitaciones! Tu solicitud ha sido'}{' '}
          <span className="font-extrabold" style={{ color: OFERTA_COLORS.greenDark }}>aprobada</span>!
        </div>

        <p className="text-[13px]" style={{ color: OFERTA_COLORS.textMid }}>
          Tu oferta ha sido generada
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

        <EquipoRecomendadoCard
          equipo={equipo}
          tone="indigo"
          badgeText="TU OFERTA"
          ctaText={ctaText}
          subtext="Tu solicitud queda cerrada al aceptarla"
          onElegir={handleAccept}
          onVerDetalle={detalleUrl ? handleVerDetalle : undefined}
        />

        {/* Datos contractuales que la card no muestra: TEA y total a pagar. */}
        <div className="grid grid-cols-2 gap-2.5 rounded-lg border px-3.5 py-3" style={{ borderColor: OFERTA_COLORS.border }}>
          {info?.tea != null ? (
            <div>
              <div className="text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: OFERTA_COLORS.textSoft }}>
                TEA
              </div>
              <div className="text-[15px] font-bold" style={{ color: OFERTA_COLORS.textStrong }}>
                {info.tea}%
              </div>
            </div>
          ) : null}
          {totalTexto != null ? (
            <div>
              <div className="text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: OFERTA_COLORS.textSoft }}>
                Total a pagar
              </div>
              <div className="text-[15px] font-bold" style={{ color: OFERTA_COLORS.textStrong }}>
                S/{Math.round(totalTexto).toLocaleString('es-PE')}
              </div>
            </div>
          ) : null}
          {info?.termMonths ? (
            <div className="col-span-2 text-[12.5px]" style={{ color: OFERTA_COLORS.textSoft }}>
              en {info.termMonths} meses
              {inicialText(info.initialPayment, info.initialPaymentPercent)}
            </div>
          ) : null}
        </div>

        {/* Error inline (no reemplaza la página: el cliente puede reintentar) */}
        {error ? (
          <div
            className="rounded-lg px-3.5 py-2.5 text-[13px]"
            style={{ backgroundColor: OFERTA_COLORS.amberBg, color: '#B45309', border: `1px solid ${OFERTA_COLORS.amberBorder}` }}
          >
            {error}
          </div>
        ) : null}

        {/* Rechazar: acción secundaria, fuera de la card. */}
        <button
          type="button"
          onClick={handleReject}
          disabled={disabled}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-5 py-3 text-[14px] font-bold transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:self-center"
          style={{ borderColor: OFERTA_COLORS.border, color: OFERTA_COLORS.textMid }}
        >
          <XCircle className="h-5 w-5" />
          {loading === 'reject' ? 'Rechazando…' : 'Rechazar oferta'}
        </button>

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
