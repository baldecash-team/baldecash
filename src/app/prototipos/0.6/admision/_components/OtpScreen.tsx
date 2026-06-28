'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { OtpField } from './OtpField';
import { PhoneFrame } from './PhoneFrame';
import { ErrorBanner } from './ErrorBanner';
import { sendEmailByToken, verifyEmailByToken, emailStatusByToken } from '../_lib/api/links';
import { sendEmailVerification, verifyEmailCode, getEmailStatus } from '../_lib/api/verification';
import { friendlyError, attemptsCopy } from '../_lib/errors';
import { admissionEvents } from '../_lib/events';

function parseCooldownSeconds(message: string, fallback = 60): number {
  const m = /(\d+)\s*s/i.exec(message ?? '');
  return m ? Math.max(1, parseInt(m[1], 10)) : fallback;
}

/** Estados de la pantalla. Mejora #1/#2: se eliminó el estado previo "cta". */
type ScreenState = 'dni' | 'sending' | 'code' | 'confirmed';

interface OtpScreenProps {
  applicationId?: number;
  token?: string;
  onConfirmed?: () => void;
  initialVerified?: boolean;
}

/**
 * Pantalla de verificación de correo institucional.
 *
 * MODO TOKEN (link): al montar se ENVÍA el código automáticamente y se aterriza
 * directo en el campo OTP (sin paso previo). Mejoras #1/#2.
 * MODO DNI (fallback): pide el documento y luego el código.
 */
export function OtpScreen({ token, applicationId, onConfirmed, initialVerified }: OtpScreenProps) {
  const isTokenMode = Boolean(token);

  const [state, setState] = useState<ScreenState>(
    isTokenMode ? (initialVerified ? 'confirmed' : 'sending') : 'dni'
  );
  const [dni, setDni] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [attempts, setAttempts] = useState(0); // mejora #4

  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const events = useMemo(() => (token ? admissionEvents(token) : null), [token]);

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

  function goToCode() {
    events?.stageExit('email_send');
    events?.stageEnter('code');
    setState('code');
  }

  function markConfirmed() {
    events?.stageExit('code');
    events?.completed();
    setState('confirmed');
    onConfirmed?.();
  }

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, []);

  // ── MODO TOKEN ──────────────────────────────────────────────────────────────

  // Mejora #1/#2: auto-enviar el código al abrir el link (el envío no tiene costo
  // variable) y mostrar directamente el campo del código.
  const autoSentRef = useRef(false);
  useEffect(() => {
    if (!isTokenMode || initialVerified || autoSentRef.current) return;
    autoSentRef.current = true;
    void autoSendByToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function autoSendByToken() {
    if (!token) return;
    setLoading(true);
    setError(null);
    events?.stageEnter('email_send');
    try {
      const result = await sendEmailByToken(token);
      if (result.ok && result.data.status === 'already_verified') {
        markConfirmed();
      } else if (result.ok && result.data.status === 'sent') {
        setMaskedEmail(result.data.email);
        startCooldown(60);
        goToCode();
      } else if (!result.ok) {
        if (result.error.reason === 'cooldown') {
          startCooldown(parseCooldownSeconds(result.error.message));
          const st = await emailStatusByToken(token);
          if (st.ok) setMaskedEmail(st.data.email);
          goToCode();
        } else {
          // Falla recuperable: permanece en "sending" mostrando el error + reintento.
          setError(friendlyError(result.error));
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleValidateByToken() {
    if (code.length < 6 || !token) return;
    setLoading(true);
    setError(null);
    try {
      const result = await verifyEmailByToken(token, code);
      if (result.ok && result.data.verified) {
        markConfirmed();
      } else if (result.ok && !result.data.verified) {
        setAttempts((a) => a + 1);
        setError('No pudimos verificar el código. Revísalo e inténtalo de nuevo.');
        setCode('');
      } else if (!result.ok) {
        setAttempts((a) => a + 1);
        setError(friendlyError(result.error));
        setCode('');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResendByToken() {
    if (cooldown > 0 || !token) return;
    setLoading(true);
    setError(null);
    try {
      const result = await sendEmailByToken(token);
      if (result.ok && result.data.status === 'sent') {
        startCooldown(60);
      } else if (!result.ok) {
        if (result.error.reason === 'cooldown') {
          startCooldown(parseCooldownSeconds(result.error.message));
        } else {
          setError(friendlyError(result.error));
        }
      }
    } finally {
      setLoading(false);
    }
  }

  // ── MODO DNI ────────────────────────────────────────────────────────────────

  async function handleContinue() {
    if (!dni.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await sendEmailVerification(applicationId!, dni.trim());
      if (result.ok && result.data.status === 'already_verified') {
        setState('confirmed');
        onConfirmed?.();
      } else if (result.ok && result.data.status === 'sent') {
        setMaskedEmail(result.data.email);
        startCooldown(60);
        setState('code');
      } else if (!result.ok) {
        if (result.error.reason === 'cooldown') {
          startCooldown(parseCooldownSeconds(result.error.message));
          const st = await getEmailStatus(applicationId!, dni.trim());
          if (st.ok) setMaskedEmail(st.data.email);
          setState('code');
        } else {
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
    try {
      const result = await verifyEmailCode(applicationId!, dni, code);
      if (result.ok && result.data.verified) {
        setState('confirmed');
        onConfirmed?.();
      } else if (result.ok && !result.data.verified) {
        setAttempts((a) => a + 1);
        setError('No pudimos verificar el código. Revísalo e inténtalo de nuevo.');
        setCode('');
      } else if (!result.ok) {
        setAttempts((a) => a + 1);
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
      const result = await sendEmailVerification(applicationId!, dni);
      if (result.ok && result.data.status === 'sent') {
        startCooldown(60);
      } else if (!result.ok) {
        if (result.error.reason === 'cooldown') {
          startCooldown(parseCooldownSeconds(result.error.message));
        } else {
          setError(friendlyError(result.error));
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <PhoneFrame>
      {/* ── MODO TOKEN: Envío automático del código (#1/#2) ─────────────────── */}
      {state === 'sending' && (
        <div className="flex flex-col items-center gap-5 text-center py-6">
          <h1 className="text-xl font-bold text-[#1f2937]">Valida tu correo institucional</h1>
          {!error ? (
            <>
              <div className="w-12 h-12 rounded-full border-4 border-[#e5e7eb] border-t-[#4654CD] animate-spin" />
              <p className="text-[#6b7280] text-sm">Enviando el código a tu correo institucional…</p>
            </>
          ) : (
            <>
              <ErrorBanner message={error} className="w-full" />
              <button
                className="w-full bg-[#4654CD] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                onClick={autoSendByToken}
                disabled={loading}
              >
                Reintentar enviar código
              </button>
            </>
          )}
        </div>
      )}

      {/* ── MODO DNI: Estado DNI ───────────────────────────────────────────── */}
      {state === 'dni' && (
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-2xl font-bold text-[#1f2937]">Verifica tu correo</h1>
          <p className="text-[#6b7280] text-sm">
            Ingresa tu número de DNI para enviar un código a tu correo institucional
            (ej: usuario@universidad.edu.pe).
          </p>

          <div className="w-full text-left">
            <label htmlFor="dni-input" className="block text-sm font-medium text-[#1f2937] mb-1">
              Número de DNI
            </label>
            <input
              id="dni-input"
              type="text"
              inputMode="numeric"
              placeholder="Ingresa tu número de DNI"
              value={dni}
              onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
              className="w-full border-2 border-[#e5e7eb] rounded-xl px-4 py-3 text-[#1f2937] text-base focus:border-[#4654CD] focus:outline-none transition-colors"
              maxLength={8}
            />
          </div>

          {error && <ErrorBanner message={error} className="w-full" />}

          <button
            className="w-full bg-[#4654CD] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            onClick={handleContinue}
            disabled={!dni.trim() || loading}
          >
            Continuar
          </button>
        </div>
      )}

      {/* ── Estado CODE (compartido) ──────────────────────────────────────── */}
      {state === 'code' && (
        <div className="flex flex-col items-center gap-5 text-center">
          <h1 className="text-xl font-bold text-[#1f2937]">Ingresa tu código</h1>
          <p className="text-[#6b7280] text-sm">
            Enviamos un código a tu correo institucional{' '}
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
            onClick={isTokenMode ? handleValidateByToken : handleValidate}
            disabled={code.length < 6 || loading}
          >
            Validar código
          </button>

          {/* Reenviar con cooldown */}
          {cooldown > 0 ? (
            <p className="flex items-center justify-center gap-1.5 text-[#9ca3af] text-sm" aria-live="polite">
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              Podrás reenviar el código en {cooldown}s
            </p>
          ) : (
            <p className="text-[#6b7280] text-sm">
              ¿No te llegó el código?{' '}
              <button
                type="button"
                className="text-[#4654CD] font-semibold hover:underline disabled:opacity-50 cursor-pointer"
                onClick={isTokenMode ? handleResendByToken : handleResend}
                disabled={loading}
              >
                Reenviar
              </button>
            </p>
          )}
        </div>
      )}

      {/* ── Estado CONFIRMED ──────────────────────────────────────────────── */}
      {/* Mismo patrón visual que LinkStatus: badge circular + título + ayuda. */}
      {state === 'confirmed' && (
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <span className="w-14 h-14 rounded-full flex items-center justify-center bg-[#16a34a]/10 text-[#16a34a]">
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <p className="text-[#1f2937] font-semibold text-lg">¡Correo confirmado!</p>
          <p className="text-[#6b7280] text-sm">
            Verificamos tu correo institucional. Seguimos con tu evaluación.
          </p>
        </div>
      )}
    </PhoneFrame>
  );
}
