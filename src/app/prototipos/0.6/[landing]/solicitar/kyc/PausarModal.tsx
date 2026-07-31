'use client';

/**
 * PausarModal — "Continuar en otro momento" del flujo KYC.
 *
 * Pide confirmación, dispara `pauseKyc` (que envía el link de reanudación por
 * WhatsApp) y muestra el teléfono enmascarado + el plazo real que devolvió el
 * backend. El plazo NUNCA se hardcodea: `ttl_hours` es configurable por landing
 * (1–336h), así que un texto fijo tipo "72 horas" se volvería mentira apenas
 * alguien cambie la config.
 *
 * Estados: idle → sending → sent | error. En error, el copy se mapea por
 * `reason`; `rate_limited` no ofrece reintentar (invita a revisar WhatsApp,
 * reintentar solo generaría más rate-limit).
 *
 * `documentNumber` es OPCIONAL: cuando el caller (kycClient.tsx) no encontró
 * un DNI en localStorage, no lo manda, y este modal le pide al propio usuario
 * que lo escriba (él lo conoce; el backend ya valida contra la solicitud con
 * lockout + auditoría, así que no hace falta tenerlo pre-cargado). Si el
 * caller SÍ tiene el DNI, el comportamiento es el de siempre: sin input,
 * directo al botón de confirmar.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Loader2, MessageCircleMore, AlertCircle, X } from 'lucide-react';
import { pauseKyc, isKycApiError } from '@/app/prototipos/0.6/services/kycApi';
import { useEventTrackerOptional } from '../context/EventTrackerContext';

export interface PausarModalProps {
  open: boolean;
  onClose: () => void;
  /** Se invoca cuando el enlace se envió con éxito (además del estado 'sent' interno). */
  onSent?: () => void;
  applicationCode: string;
  /** Ausente ⇒ el modal pide el DNI al usuario (ver comentario de arriba). */
  documentNumber?: string;
  landing: string;
}

type Status = 'idle' | 'sending' | 'sent' | 'error';

interface SentResult {
  maskedPhone: string;
  ttlHours: number;
}

interface ErrorResult {
  reason: string;
  message: string;
}

/** Copy accionable por `reason`, según la tabla del brief. */
function copyForError(reason: string, backendError: string): string {
  switch (reason) {
    case 'rate_limited':
      return 'Ya te enviamos varios enlaces. Revisa tu WhatsApp.';
    case 'ownership_check_failed':
      return 'No pudimos verificar tus datos. Vuelve a intentarlo desde el inicio.';
    case 'no_phone':
      return 'Tu solicitud no tiene un celular registrado.';
    default: // send_failed y el resto: el error tal cual vino del backend
      return backendError || 'No pudimos enviarte el enlace. Intenta nuevamente.';
  }
}

/**
 * Reasons donde reintentar CON LOS MISMOS DATOS puede resolver el problema:
 * fallas transitorias de red/envío. El resto (`ownership_check_failed`,
 * `ownership_locked`, `no_phone`, `disabled`, `already_complete`,
 * `rate_limited`) depende de un estado que reintentar no cambia — mostrar
 * "Intentar de nuevo" ahí es prometer algo que va a fallar idéntico, o
 * directamente contradice el propio copy (`ownership_check_failed` manda a
 * reiniciar el flujo, no a reintentar en el mismo modal).
 */
const RETRYABLE_REASONS = new Set(['send_failed', 'network']);

export function PausarModal({
  open,
  onClose,
  onSent,
  applicationCode,
  documentNumber,
  landing,
}: PausarModalProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [sent, setSent] = useState<SentResult | null>(null);
  const [error, setError] = useState<ErrorResult | null>(null);
  // Solo se usa cuando el caller NO trae `documentNumber` (sin DNI en
  // localStorage): el propio usuario lo escribe acá.
  const [dniInput, setDniInput] = useState('');
  const [dniInputError, setDniInputError] = useState<string | null>(null);
  const tracker = useEventTrackerOptional();

  // Al reabrir, arrancar siempre limpio: no arrastrar el resultado de un intento
  // anterior. Ajuste de estado durante el render (patrón recomendado por React
  // para "resetear estado cuando cambia una prop"), no en un efecto: evitar el
  // round-trip extra de un useEffect disparando otro render en cascada.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setStatus('idle');
      setSent(null);
      setError(null);
      setDniInput('');
      setDniInputError(null);
    }
  }

  const handleSend = async () => {
    // Sin DNI de localStorage: validar lo que escribió el usuario ANTES de
    // llamar al backend (requerido + solo dígitos). Con DNI de localStorage,
    // el comportamiento es el de siempre.
    let effectiveDocumentNumber = documentNumber;
    if (!effectiveDocumentNumber) {
      const trimmed = dniInput.trim();
      if (!trimmed) {
        setDniInputError('Ingresa tu número de documento.');
        return;
      }
      if (!/^\d+$/.test(trimmed)) {
        setDniInputError('Solo números.');
        return;
      }
      setDniInputError(null);
      effectiveDocumentNumber = trimmed;
    }

    setStatus('sending');
    tracker?.track('kyc_pause_requested', { application_code: applicationCode, landing_slug: landing });

    const result = await pauseKyc({ applicationCode, documentNumber: effectiveDocumentNumber });

    if (isKycApiError(result)) {
      tracker?.track('kyc_resume_link_send_error', {
        application_code: applicationCode,
        landing_slug: landing,
        reason: result.reason,
      });
      setError({ reason: result.reason, message: result.error });
      setStatus('error');
      return;
    }

    tracker?.track('kyc_resume_link_sent', {
      application_code: applicationCode,
      landing_slug: landing,
      ttl_hours: result.ttl_hours,
    });
    setSent({ maskedPhone: result.masked_phone, ttlHours: result.ttl_hours });
    setStatus('sent');
    onSent?.();
  };

  const canRetry = status === 'error' && !!error && RETRYABLE_REASONS.has(error.reason);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — no se cierra mientras hay un request en curso. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[10002] bg-black/50 backdrop-blur-sm"
            onClick={status !== 'sending' ? onClose : undefined}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 z-[10002] flex items-center justify-center p-4"
          >
            <div
              className="relative w-full max-w-md bg-white rounded-2xl border border-neutral-200 shadow-sm px-6 py-7"
              onClick={(e) => e.stopPropagation()}
            >
              {status !== 'sending' && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {(status === 'idle' || status === 'sending') && (
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#ECECFB] flex items-center justify-center">
                    <Clock className="w-7 h-7 text-[#4654CD]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1f2937]">Continuar en otro momento</h3>
                    <p className="text-sm text-[#6b7280] mt-1">
                      Te enviaremos un enlace por WhatsApp al número registrado en tu solicitud
                      para que continúes cuando quieras.
                    </p>
                  </div>

                  {/*
                    Solo cuando el caller no encontró el DNI en localStorage:
                    se lo pedimos al propio usuario en vez de bloquear la
                    pausa entera. El backend valida este valor contra la
                    solicitud (lockout + auditoría), así que no hace falta
                    tenerlo pre-cargado para ofrecer el botón.
                  */}
                  {!documentNumber && (
                    <div className="w-full text-left space-y-1">
                      <label htmlFor="pausar-document-number" className="text-sm font-medium text-[#1f2937]">
                        Ingresa tu número de documento para confirmar que eres tú
                      </label>
                      <input
                        id="pausar-document-number"
                        type="text"
                        inputMode="numeric"
                        required
                        disabled={status === 'sending'}
                        value={dniInput}
                        onChange={(e) => {
                          setDniInput(e.target.value);
                          setDniInputError(null);
                        }}
                        placeholder="Ej. 48509924"
                        className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm text-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#4654CD] disabled:opacity-50"
                      />
                      {dniInputError && (
                        <p className="text-xs text-[#ef4444]">{dniInputError}</p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 w-full pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={status === 'sending'}
                      className="flex-1 border border-[#4654CD] text-[#4654CD] font-semibold py-2.5 rounded-xl hover:bg-[#ECECFB] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={status === 'sending'}
                      className="flex-1 bg-[#4654CD] text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {status === 'sending' && <Loader2 className="w-4 h-4 animate-spin" />}
                      {status === 'sending' ? 'Enviando...' : 'Enviar enlace'}
                    </button>
                  </div>
                </div>
              )}

              {status === 'sent' && sent && (
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#ECECFB] flex items-center justify-center">
                    <MessageCircleMore className="w-7 h-7 text-[#4654CD]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1f2937]">Enlace enviado</h3>
                    <p className="text-sm text-[#6b7280] mt-1">
                      Te enviamos un enlace a tu WhatsApp{' '}
                      <span className="font-semibold text-[#1f2937]">{sent.maskedPhone}</span>.
                      Es válido por {sent.ttlHours} horas.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full bg-[#4654CD] text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Entendido
                  </button>
                </div>
              )}

              {status === 'error' && error && (
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertCircle className="w-7 h-7 text-[#ef4444]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1f2937]">No pudimos enviar el enlace</h3>
                    <p className="text-sm text-[#6b7280] mt-1">
                      {copyForError(error.reason, error.message)}
                    </p>
                  </div>
                  <div className="flex gap-3 w-full">
                    {canRetry ? (
                      <>
                        <button
                          type="button"
                          onClick={onClose}
                          className="flex-1 border border-[#4654CD] text-[#4654CD] font-semibold py-2.5 rounded-xl hover:bg-[#ECECFB] transition-colors cursor-pointer"
                        >
                          Cerrar
                        </button>
                        <button
                          type="button"
                          onClick={handleSend}
                          className="flex-1 bg-[#4654CD] text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
                        >
                          Intentar de nuevo
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={onClose}
                        className="w-full bg-[#4654CD] text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        Entendido
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default PausarModal;
