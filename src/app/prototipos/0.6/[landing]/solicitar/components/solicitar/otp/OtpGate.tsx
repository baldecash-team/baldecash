'use client';

/**
 * OtpGate — pantalla full-screen "Valida tu correo" que se interpone DESPUÉS
 * del submit de la solicitud y ANTES del resumen/confirmación, cuando la landing
 * tiene habilitada la sección `otp_verification` en su solicitar-config.
 *
 * A diferencia del `OtpScreen` del flujo por link (que vive dentro de un
 * `PhoneFrame`), este gate ocupa el ancho completo (sin columna de resumen) y
 * emite eventos de tracking con `source: 'inline'` para distinguir este funnel
 * del basado en link (`source: 'link'`).
 *
 * Reusa la lógica de verificación de correo (`/public/email-verification/*`),
 * keyed por `application_id` + `document_number`, igual que el OtpScreen en modo
 * DNI.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { OtpField } from '@/app/prototipos/0.6/admision/_components/OtpField';
import { ErrorBanner } from '@/app/prototipos/0.6/admision/_components/ErrorBanner';
import {
  sendEmailVerification,
  verifyEmailCode,
  getEmailStatus,
} from '@/app/prototipos/0.6/admision/_lib/api/verification';
import { friendlyError, attemptsCopy } from '@/app/prototipos/0.6/admision/_lib/errors';
import { useAnalytics } from '@/app/prototipos/0.6/analytics/useAnalytics';
import { checkInstitutionalEmail } from './institutionalDomains';

function parseCooldownSeconds(message: string, fallback = 60): number {
  const m = /(\d+)\s*s/i.exec(message ?? '');
  return m ? Math.max(1, parseInt(m[1], 10)) : fallback;
}

type GateState = 'dni' | 'code' | 'confirmed';

interface OtpGateProps {
  /** ID numérico de la solicitud recién creada (necesario para el envío/verify). */
  applicationId: number;
  /** DNI del postulante, si se pudo capturar del formulario (prefill opcional). */
  documentNumber?: string;
  /**
   * Si true, se permite continuar sin verificar (muestra "Omitir por ahora").
   * Por defecto el gate es obligatorio.
   */
  optional?: boolean;
  /** Se invoca cuando el correo queda verificado (o se omite si optional). */
  onConfirmed: () => void;
}

export function OtpGate({
  applicationId,
  documentNumber,
  optional = false,
  onConfirmed,
}: OtpGateProps) {
  const analytics = useAnalytics();

  const [state, setState] = useState<GateState>('dni');
  const [dni, setDni] = useState(documentNumber ?? '');
  const [institutionalEmail, setInstitutionalEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Evaluación en vivo del correo institucional (client-side, primera pasada).
  const institutionalCheck = checkInstitutionalEmail(institutionalEmail);
  const isInstitutional = institutionalCheck.isInstitutional;

  /** Emite un evento inline del funnel OTP. Fire-and-forget. */
  const emit = useCallback(
    (
      type:
        | 'otp_screen_shown'
        | 'otp_code_sent'
        | 'otp_code_resent'
        | 'otp_code_submitted'
        | 'otp_verified'
        | 'otp_failed',
      props: Record<string, string | number | boolean> = {},
    ) => {
      // `source: 'inline'` distingue este funnel del flujo por link.
      analytics.track(type, { source: 'inline', application_id: applicationId, ...props });
    },
    [analytics, applicationId],
  );

  // Evento de apertura del gate (una sola vez).
  const shownRef = useRef(false);
  useEffect(() => {
    if (shownRef.current) return;
    shownRef.current = true;
    emit('otp_screen_shown');
  }, [emit]);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, []);

  function startCooldown(seconds = 60) {
    setCooldown(seconds);
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    cooldownTimerRef.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) {
          clearInterval(cooldownTimerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  /** Propiedades de institución para adjuntar a los eventos de envío. */
  function institutionalProps(): Record<string, string | boolean> {
    const props: Record<string, string | boolean> = { is_institutional: isInstitutional };
    if (institutionalCheck.institutionCode) {
      props.institution_code = institutionalCheck.institutionCode;
    }
    return props;
  }

  async function handleSend() {
    if (!dni.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await sendEmailVerification(applicationId, dni.trim());
      if (result.ok && result.data.status === 'already_verified') {
        emit('otp_verified', { already_verified: true });
        setState('confirmed');
        onConfirmed();
      } else if (result.ok && result.data.status === 'sent') {
        emit('otp_code_sent', institutionalProps());
        setMaskedEmail(result.data.email);
        startCooldown(60);
        setState('code');
      } else if (!result.ok) {
        if (result.error.reason === 'cooldown') {
          startCooldown(parseCooldownSeconds(result.error.message));
          const st = await getEmailStatus(applicationId, dni.trim());
          if (st.ok) setMaskedEmail(st.data.email);
          setState('code');
        } else {
          emit('otp_failed', { stage: 'send', reason: result.error.reason ?? result.error.code });
          setError(friendlyError(result.error));
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleValidate() {
    if (code.length < 6) return;
    setLoading(true);
    setError(null);
    emit('otp_code_submitted', institutionalProps());
    try {
      const result = await verifyEmailCode(applicationId, dni.trim(), code);
      if (result.ok && result.data.verified) {
        emit('otp_verified');
        setState('confirmed');
        onConfirmed();
      } else if (result.ok && !result.data.verified) {
        setAttempts((a) => a + 1);
        emit('otp_failed', { stage: 'verify', reason: 'invalid_code' });
        setError('No pudimos verificar el código. Revísalo e inténtalo de nuevo.');
        setCode('');
      } else if (!result.ok) {
        setAttempts((a) => a + 1);
        emit('otp_failed', { stage: 'verify', reason: result.error.reason ?? result.error.code });
        setError(friendlyError(result.error));
        setCode('');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    setLoading(true);
    setError(null);
    try {
      const result = await sendEmailVerification(applicationId, dni.trim());
      if (result.ok && result.data.status === 'sent') {
        emit('otp_code_resent', institutionalProps());
        startCooldown(60);
      } else if (!result.ok) {
        if (result.error.reason === 'cooldown') {
          startCooldown(parseCooldownSeconds(result.error.message));
        } else {
          emit('otp_failed', { stage: 'resend', reason: result.error.reason ?? result.error.code });
          setError(friendlyError(result.error));
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white px-4 py-8 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Valida tu correo"
    >
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        {/* ── Estado DNI: pedir documento + correo institucional opcional ── */}
        {state === 'dni' && (
          <div className="flex flex-col items-center gap-6 text-center w-full">
            <h1 className="text-2xl font-bold text-[#1f2937]">Valida tu correo</h1>
            <p className="text-[#6b7280] text-sm">
              Estás a un paso de terminar. Ingresa tu DNI y te enviaremos un código
              a tu correo para confirmar tu identidad.
            </p>

            <div className="w-full text-left">
              <label htmlFor="otp-gate-dni" className="block text-sm font-medium text-[#1f2937] mb-1">
                Número de DNI
              </label>
              <input
                id="otp-gate-dni"
                type="text"
                inputMode="numeric"
                placeholder="Ingresa tu número de DNI"
                value={dni}
                onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                className="w-full border-2 border-[#e5e7eb] rounded-xl px-4 py-3 text-[#1f2937] text-base focus:border-[#4654CD] focus:outline-none transition-colors"
                maxLength={8}
              />
            </div>

            {/* Correo institucional (opcional). Validación de dominio client-side. */}
            <div className="w-full text-left">
              <label htmlFor="otp-gate-inst-email" className="block text-sm font-medium text-[#1f2937] mb-1">
                Correo institucional <span className="text-[#9ca3af] font-normal">(opcional)</span>
              </label>
              <input
                id="otp-gate-inst-email"
                type="email"
                autoComplete="off"
                placeholder="usuario@universidad.edu.pe"
                value={institutionalEmail}
                onChange={(e) => setInstitutionalEmail(e.target.value)}
                className="w-full border-2 border-[#e5e7eb] rounded-xl px-4 py-3 text-[#1f2937] text-base focus:border-[#4654CD] focus:outline-none transition-colors"
              />
              {institutionalEmail.trim().length > 0 && (
                <p className={`text-xs mt-1 ${isInstitutional ? 'text-[#16a34a]' : 'text-[#9ca3af]'}`}>
                  {isInstitutional
                    ? `Correo institucional reconocido (${institutionalCheck.institutionCode}).`
                    : 'No reconocemos este dominio institucional, pero puedes continuar.'}
                </p>
              )}
            </div>

            {error && <ErrorBanner message={error} className="w-full" />}

            <button
              className="w-full bg-[#4654CD] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              onClick={handleSend}
              disabled={!dni.trim() || loading}
            >
              {loading ? 'Enviando…' : 'Enviar código'}
            </button>

            {optional && (
              <button
                type="button"
                className="text-[#6b7280] text-sm underline underline-offset-2 hover:text-[#1f2937] cursor-pointer"
                onClick={onConfirmed}
              >
                Omitir por ahora
              </button>
            )}
          </div>
        )}

        {/* ── Estado CODE ── */}
        {state === 'code' && (
          <div className="flex flex-col items-center gap-5 text-center w-full">
            <h1 className="text-xl font-bold text-[#1f2937]">Ingresa tu código</h1>
            <p className="text-[#6b7280] text-sm">
              Enviamos un código a tu correo{' '}
              <span className="font-semibold text-[#1f2937]">{maskedEmail}</span>
            </p>

            <OtpField value={code} onChange={setCode} />

            {error && (
              <div className="w-full flex flex-col gap-1.5">
                <ErrorBanner message={error} />
                {attempts > 0 && <p className="text-[#6b7280] text-xs">{attemptsCopy(attempts)}</p>}
              </div>
            )}

            <button
              className="w-full bg-[#4654CD] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              onClick={handleValidate}
              disabled={code.length < 6 || loading}
            >
              Validar código
            </button>

            {cooldown > 0 ? (
              <p className="flex items-center justify-center gap-1.5 text-[#9ca3af] text-sm" aria-live="polite">
                Podrás reenviar el código en {cooldown}s
              </p>
            ) : (
              <p className="text-[#6b7280] text-sm">
                ¿No te llegó el código?{' '}
                <button
                  type="button"
                  className="text-[#4654CD] font-semibold hover:underline disabled:opacity-50 cursor-pointer"
                  onClick={handleResend}
                  disabled={loading}
                >
                  Reenviar
                </button>
              </p>
            )}

            {optional && (
              <button
                type="button"
                className="text-[#6b7280] text-sm underline underline-offset-2 hover:text-[#1f2937] cursor-pointer"
                onClick={onConfirmed}
              >
                Omitir por ahora
              </button>
            )}
          </div>
        )}

        {/* ── Estado CONFIRMED (breve, antes de continuar al resumen) ── */}
        {state === 'confirmed' && (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <span className="w-14 h-14 rounded-full flex items-center justify-center bg-[#16a34a]/10 text-[#16a34a]">
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <p className="text-[#1f2937] font-semibold text-lg">¡Correo confirmado!</p>
            <p className="text-[#6b7280] text-sm">Seguimos con tu solicitud.</p>
          </div>
        )}
      </div>
    </div>
  );
}
