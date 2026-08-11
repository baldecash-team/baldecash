'use client';

/**
 * StandardOfertaAccion — vista simple aceptar/rechazar de la oferta ESTÁNDAR
 * (F-6B, Task 5 · docs/superpowers/specs/2026-07-08-f6b-oferta-url-cliente-design.md).
 *
 * A diferencia del Caso 4/5 (selección dentro de un catálogo topado por
 * cuota), acá el analista ya armó UNA sola oferta (producto/cuota/tea/plazo/
 * inicial/total) y el cliente solo decide: aceptar o rechazar. Countdown de
 * vigencia (useCountdown, hasta ahora dormido) que deshabilita ambos botones
 * al expirar — evita un accept/reject tardío que el backend igual rechazaría
 * (410 `expired`).
 *
 * Reusa el mismo lenguaje visual del rediseño (OFERTA_COLORS/OfertaHeader) y,
 * para las confirmaciones, los componentes existentes: `SeleccionConfirmada`
 * al aceptar (mismo "¡Felicidades!" del Caso 4/5) y `OfertaEstadoMensaje` al
 * rechazar (mismo lenguaje visual de las pantallas de estado).
 */
import { useCallback, useState } from 'react';
import { Ban, CheckCircle2, Clock, XCircle } from 'lucide-react';

import {
  acceptOffer,
  rejectOffer,
  OfferApiError,
  type OfferView,
} from '../../../services/offerApi';
import { useAnalytics } from '../../../analytics/useAnalytics';
import { OfertaHeader } from './redesign/OfertaHeader';
import { PruebaSocial } from './redesign/PruebaSocial';
import { OFERTA_COLORS } from './redesign/ofertaTheme';
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

  return (
    <div className="min-h-screen bg-white">
      <OfertaHeader />

      <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-6 sm:py-10">
        {/* Saludo — mismo lenguaje visual que el flujo upsell, pero la oferta
            desde admin2 no es una aprobación de solicitud sino una OFERTA: por
            eso dice "ofertada" (no "aprobada"), en verde bold. */}
        <div className="text-[18px] font-semibold leading-[1.25]">
          {offer.clientName
            ? `¡Felicitaciones, ${offer.clientName.trim()}, tu solicitud ha sido`
            : '¡Felicitaciones! Tu solicitud ha sido'}{' '}
          <span className="font-extrabold" style={{ color: OFERTA_COLORS.greenDark }}>ofertada</span>!
        </div>

        {/* Código de la solicitud — mismo chip que el upsell. */}
        {offer.applicationCode ? (
          <div
            className="inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11.5px] font-semibold"
            style={{ backgroundColor: OFERTA_COLORS.lilac, color: OFERTA_COLORS.textSoft }}
          >
            Solicitud: {offer.applicationCode}
          </div>
        ) : null}

        <p className="text-[13px]" style={{ color: OFERTA_COLORS.textMid }}>
          Esta es tu oferta de BaldeCash. Revisa los datos y decide.
        </p>

        {/* Countdown de vigencia */}
        {countdown ? (
          <div
            className="flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold"
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

        {/* Resumen de la oferta */}
        <div
          className="overflow-hidden rounded-xl border-[1.5px]"
          style={{ borderColor: OFERTA_COLORS.primary, boxShadow: '0 10px 24px rgba(79,70,229,.16)' }}
        >
          <div
            className="px-3.5 py-1.5 text-[10px] font-bold tracking-[.09em] text-white"
            style={{ backgroundColor: OFERTA_COLORS.primary }}
          >
            TU OFERTA
          </div>

          <div className="flex flex-col gap-3 px-4 py-4">
            <div className="text-[17px] font-bold leading-[1.2]">
              {info?.productName || 'Equipo'}
            </div>

            {info?.monthlyPayment != null ? (
              <div className="border-t pt-3" style={{ borderColor: '#F1F2F7' }}>
                <div
                  className="font-['Baloo_2',_sans-serif] text-[30px] font-extrabold leading-none"
                  style={{ color: OFERTA_COLORS.primary }}
                >
                  S/{Math.round(info.monthlyPayment)}
                  <span className="text-[15px] font-semibold" style={{ color: OFERTA_COLORS.textMid }}>
                    /mes
                  </span>
                </div>
                {info.termMonths ? (
                  <div className="mt-1 text-[12.5px]" style={{ color: OFERTA_COLORS.textSoft }}>
                    en {info.termMonths} meses
                    {inicialText(info.initialPayment, info.initialPaymentPercent)}
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Datos adicionales: TEA / total */}
            <div className="grid grid-cols-2 gap-2.5 border-t pt-3" style={{ borderColor: '#F1F2F7' }}>
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
            </div>
          </div>
        </div>

        {/* Prueba social — mismo componente que el flujo upsell. */}
        <PruebaSocial />

        {/* Error inline (no reemplaza la página: el cliente puede reintentar) */}
        {error ? (
          <div
            className="rounded-lg px-3.5 py-2.5 text-[13px]"
            style={{ backgroundColor: OFERTA_COLORS.amberBg, color: '#B45309', border: `1px solid ${OFERTA_COLORS.amberBorder}` }}
          >
            {error}
          </div>
        ) : null}

        {/* Acciones */}
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={handleAccept}
            disabled={disabled}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-5 py-3.5 text-[15px] font-bold text-white transition-transform hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: OFERTA_COLORS.green, boxShadow: '0 6px 14px rgba(34,197,94,.35)' }}
          >
            <CheckCircle2 className="h-5 w-5" />
            {loading === 'accept' ? 'Aceptando…' : 'Aceptar oferta'}
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
