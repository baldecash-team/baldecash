'use client';

/**
 * VipCountdownOverlay - Pantalla completa de countdown para landing VIP
 *
 * States:
 *  1. "countdown" - Fullscreen countdown + DNI button
 *  2. "welcome"   - Personalized welcome with name + "¡Empezar!" button
 *
 * When user clicks "¡Empezar!" after DNI validation, the overlay disappears.
 * When countdown expires, the overlay stays with a "finalizado" message.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BASE_PATH } from '@/app/prototipos/0.6/utils/routes';
import { saveVipToken, saveVipName, setVipWelcomePending } from './DniModal';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface VipWelcomeData {
  firstName: string;
}

export type DniCaptureMode = 'modal' | 'inline';

interface VipCountdownOverlayProps {
  /** ISO date string for countdown end (e.g. "2026-04-25T05:00:00.000Z") */
  endDate: string;
  /** Called when user clicks "¡Empezar!" (DNI validated) to dismiss overlay */
  onExpired?: () => void;
  /** When set, overlay switches to "welcome" state showing the user's name */
  welcomeData?: VipWelcomeData | null;
  /** Landing slug for the "Ver catálogo general" CTA when expired */
  catalogSlug?: string;
  /** Landing slug used to validate the DNI against the backend whitelist */
  landingSlug?: string;
  /** If true, validates the DNI against the server whitelist; otherwise saves locally */
  validateWhitelist?: boolean;
  /** Called after a successful DNI validation (VIP flow) */
  onValidated?: (result: { firstName: string; accessToken: string }) => void;
  /** How the DNI is captured inside the overlay: 'inline' (input+button) or 'modal' (legacy popup). Default: 'inline'. */
  captureMode?: DniCaptureMode;
  /** Called when captureMode='modal' and the user clicks the CTA to open the external DNI modal. */
  onOpenDniModal?: () => void;
}

const DOC_MIN_LENGTH = 8;
const DOC_MAX_LENGTH = 12;
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';
const DNI_STORAGE_PREFIX = 'baldecash-dni-';

function calculateTimeLeft(endDate: Date): TimeLeft {
  const now = new Date().getTime();
  const diff = endDate.getTime() - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function isExpiredDate(endDate: Date): boolean {
  return new Date().getTime() >= endDate.getTime();
}

const pad = (n: number) => n.toString().padStart(2, '0');

export const VipCountdownOverlay: React.FC<VipCountdownOverlayProps> = ({
  endDate,
  onExpired,
  welcomeData,
  catalogSlug = 'home',
  landingSlug,
  validateWhitelist = false,
  onValidated,
  captureMode = 'inline',
  onOpenDniModal,
}) => {
  const targetDate = new Date(endDate);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [countdownFinished, setCountdownFinished] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Inline DNI form state
  const [dni, setDni] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isValidDni = dni.length >= DOC_MIN_LENGTH && /^\d{8,12}$/.test(dni);

  const handleDniChange = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, DOC_MAX_LENGTH);
    setDni(cleaned);
    if (errorMsg) setErrorMsg(null);
  }, [errorMsg]);

  const handleDniSubmit = useCallback(async () => {
    if (!isValidDni || submitting || !landingSlug) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      if (validateWhitelist) {
        const res = await fetch(
          `${API_BASE_URL}/public/landing/${encodeURIComponent(landingSlug)}/validate-dni/${dni}`,
        );
        const data = await res.json();
        if (!data.valid) {
          setErrorMsg('No encontramos un registro con este DNI.');
          setSubmitting(false);
          return;
        }
        if (data.access_token) saveVipToken(landingSlug, data.access_token);
        if (data.first_name) {
          saveVipName(landingSlug, data.first_name);
          setVipWelcomePending(landingSlug);
        }
        try { localStorage.setItem(`${DNI_STORAGE_PREFIX}${landingSlug}`, dni); } catch {}
        onValidated?.({
          firstName: data.first_name || '',
          accessToken: data.access_token || '',
        });
        // Keep the loading state on while the parent redirects to /catalogo.
        // Do NOT reset submitting here — the component unmounts on navigation.
        return;
      }
      try { localStorage.setItem(`${DNI_STORAGE_PREFIX}${landingSlug}`, dni); } catch {}
      onValidated?.({ firstName: '', accessToken: '' });
      // Same reason: keep loading state until redirect unmounts us.
    } catch {
      setErrorMsg('No encontramos un registro con este DNI.');
      setSubmitting(false);
    }
  }, [isValidDni, submitting, landingSlug, validateWhitelist, dni, onValidated]);

  // Initialize only on client to avoid hydration mismatch
  useEffect(() => {
    const tl = calculateTimeLeft(targetDate);
    setTimeLeft(tl);
    setCountdownFinished(isExpiredDate(targetDate));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || countdownFinished) return;

    const timer = setInterval(() => {
      const tl = calculateTimeLeft(targetDate);
      setTimeLeft(tl);

      if (tl.days === 0 && tl.hours === 0 && tl.minutes === 0 && tl.seconds === 0) {
        setCountdownFinished(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [mounted, countdownFinished]);

  // Block body scroll while overlay is visible (not dismissed)
  useEffect(() => {
    if (!dismissed) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [dismissed]);

  // Don't render on server, before mount, or if user dismissed (via "¡Empezar!")
  if (!mounted || dismissed) return null;

  const showWelcome = !!welcomeData;

  const timeUnits = [
    { value: timeLeft.days, label: 'Días' },
    { value: timeLeft.hours, label: 'Horas' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Seg' },
  ];

  return (
    <>
      {/* @font-face for digital 7-segment countdown */}
      <style>{`
        @font-face {
          font-family: 'DSEG7';
          src: url('${BASE_PATH}/fonts/DSEG7Classic-Bold.woff2') format('woff2');
          font-weight: bold;
          font-style: normal;
          font-display: swap;
        }
      `}</style>

      <div
        className="fixed inset-0 z-[10001] flex flex-col items-center"
        style={{
          background: `
            radial-gradient(circle at 50% 30%, rgba(255,255,255,0.12) 0%, transparent 60%),
            radial-gradient(circle, rgba(255,255,255,0.12) 1.5px, transparent 1.5px)
          `,
          backgroundSize: '100% 100%, 18px 18px',
          backgroundColor: '#4654CD',
        }}
      >
        {/* Top section: Logo + Title + Countdown */}
        <div className="flex-1 flex flex-col items-center justify-center w-full px-4">
          {/* Logo BaldeCash VIP */}
          <img
            src="https://baldecash.s3.amazonaws.com/company/logo-vip-v2.png"
            alt="BaldeCash VIP"
            className="h-24 sm:h-32 md:h-40 w-auto mb-6 sm:mb-8"
          />

          <AnimatePresence mode="wait">
            {!countdownFinished ? (
              /* --- Active countdown --- */
              <motion.div
                key="countdown-active"
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center"
              >
                <h1
                  className="text-3xl sm:text-4xl md:text-5xl font-bold font-['Baloo_2',_sans-serif] text-center mb-0 leading-tight"
                  style={{ color: '#E5A823' }}
                >
                  Esta liquidación
                </h1>
                <p className="text-white text-xl sm:text-2xl md:text-3xl font-extrabold text-center mb-8 sm:mb-10">
                  termina en
                </p>

                {/* Countdown - Digital 7-segment style */}
                <div className="flex gap-2 sm:gap-3 md:gap-5 items-start">
                  {timeUnits.map((unit, index) => (
                    <div key={unit.label} className="flex items-start gap-2 sm:gap-3 md:gap-5">
                      <div className="flex flex-col items-center">
                        <span
                          className="text-3xl sm:text-5xl md:text-6xl leading-none"
                          style={{
                            fontFamily: "'DSEG7', monospace",
                            color: '#E5A823',
                            textShadow: '0 0 20px rgba(229, 168, 35, 0.4), 0 0 40px rgba(229, 168, 35, 0.2)',
                          }}
                        >
                          {pad(unit.value)}
                        </span>
                        <span className="text-white/60 text-[10px] sm:text-xs md:text-sm mt-1 sm:mt-2 font-medium tracking-wide">
                          {unit.label}
                        </span>
                      </div>
                      {index < timeUnits.length - 1 && (
                        <span
                          className="text-2xl sm:text-4xl md:text-5xl font-bold leading-none mt-0.5 sm:mt-1"
                          style={{ color: '#E5A823', opacity: 0.6 }}
                        >
                          :
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              /* --- Expired state --- */
              <motion.div
                key="countdown-expired"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="flex flex-col items-center text-center"
              >
                <h1
                  className="text-3xl sm:text-4xl md:text-5xl font-bold font-['Baloo_2',_sans-serif] mb-3 leading-tight"
                  style={{ color: '#E5A823' }}
                >
                  Venta exclusiva finalizada
                </h1>
                <p className="text-white/80 text-base sm:text-lg md:text-xl max-w-lg leading-relaxed">
                  El periodo de acceso a esta oferta ha terminado.
                  <br />
                  Explora nuestro catálogo general para encontrar tu equipo ideal.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom section: Card */}
        <div className="w-full px-4 pb-8 sm:pb-12 flex justify-center">
          <AnimatePresence mode="wait">
            {countdownFinished ? (
              /* --- Expired card: CTA to general catalog --- */
              <motion.div
                key="expired-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                className="max-w-md w-full flex flex-col gap-3"
              >
                <a
                  href={`/prototipos/0.6/home/catalogo`}
                  className="w-full py-3.5 bg-white rounded-xl text-base font-semibold text-center transition-all duration-200 hover:shadow-lg active:scale-[0.98] cursor-pointer block"
                  style={{ color: '#4654CD' }}
                >
                  Ver catálogo general
                </a>
                <a
                  href="/prototipos/0.6/"
                  className="w-full py-3 text-white/70 hover:text-white text-sm font-medium text-center transition-colors cursor-pointer block"
                >
                  Volver al inicio
                </a>
              </motion.div>
            ) : !showWelcome ? (
              /* --- Countdown card: DNI button --- */
              <motion.div
                key="countdown-card"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="max-w-md w-full rounded-3xl p-6 sm:p-8 text-center"
                style={{
                  background: 'rgba(55, 65, 160, 0.6)',
                  backdropFilter: 'blur(12px)',
                  border: '1.5px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                <p className="text-white text-sm sm:text-base leading-relaxed mb-5">
                  Estás aquí porque eres de los nuestros.
                  <svg className="inline-block w-5 h-5 ml-1 -mt-0.5" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 1C8 1 4 5 4 9C4 11.5 5.5 13.5 8 14C10.5 13.5 12 11.5 12 9C12 5 8 1 8 1Z" fill="#F97316"/>
                    <path d="M8 5C8 5 5.5 8 5.5 10.5C5.5 12.5 6.5 13.5 8 14C9.5 13.5 10.5 12.5 10.5 10.5C10.5 8 8 5 8 5Z" fill="#FB923C"/>
                    <path d="M8 8.5C8 8.5 6.5 10 6.5 11.5C6.5 12.5 7 13.5 8 14C9 13.5 9.5 12.5 9.5 11.5C9.5 10 8 8.5 8 8.5Z" fill="#FDE047"/>
                  </svg>
                  <br />
                  Te desbloquearemos algunas{' '}
                  <span className="font-bold uppercase" style={{ color: '#E5A823' }}>promos exclusivas</span>{' '}
                  que no vas a ver en ningún otro lado y no se repetirán.
                </p>

                {captureMode === 'inline' ? (
                  <>
                    <div className="flex items-stretch gap-2 w-full">
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        value={dni}
                        onChange={(e) => handleDniChange(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleDniSubmit(); }}
                        placeholder="Ingresa tu número de documento"
                        maxLength={DOC_MAX_LENGTH}
                        disabled={submitting}
                        aria-label="DNI"
                        aria-invalid={!!errorMsg}
                        className="flex-1 min-w-0 py-3.5 px-4 bg-white rounded-xl text-base font-medium outline-none focus:ring-2 focus:ring-[#E5A823] placeholder:text-gray-400 disabled:opacity-70"
                        style={{ color: '#4654CD' }}
                      />
                      <button
                        onClick={handleDniSubmit}
                        disabled={!isValidDni || submitting}
                        className="px-5 py-3.5 rounded-xl text-base font-semibold transition-all duration-200 hover:shadow-lg active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 inline-flex items-center justify-center min-w-[92px]"
                        style={{ backgroundColor: '#E5A823', color: '#4654CD' }}
                      >
                        {submitting ? (
                          <svg
                            className="animate-spin h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-label="Validando"
                            role="status"
                          >
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                            <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                          </svg>
                        ) : (
                          'Validar'
                        )}
                      </button>
                    </div>
                    {errorMsg && (
                      <p className="mt-2 text-sm font-medium text-left" style={{ color: '#FCA5A5' }}>
                        {errorMsg}
                      </p>
                    )}
                  </>
                ) : (
                  <button
                    onClick={onOpenDniModal}
                    className="w-full py-3.5 bg-white rounded-xl text-base font-semibold transition-all duration-200 hover:shadow-lg active:scale-[0.98] cursor-pointer"
                    style={{ color: '#4654CD' }}
                  >
                    Ingresa tu DNI para acceder
                  </button>
                )}
              </motion.div>
            ) : (
              /* --- Welcome card: personalized greeting + "¡Empezar!" --- */
              <motion.div
                key="welcome-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="max-w-md w-full rounded-3xl p-6 sm:p-8 text-center"
                style={{
                  background: 'rgba(55, 65, 160, 0.6)',
                  backdropFilter: 'blur(12px)',
                  border: '1.5px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                <p
                  className="text-lg sm:text-xl font-bold font-['Baloo_2',_sans-serif] mb-1"
                  style={{ color: '#E5A823' }}
                >
                  ¡{welcomeData!.firstName}, esto es solo para ti
                  <svg className="inline-block w-5 h-5 ml-1 -mt-0.5" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 1C8 1 4 5 4 9C4 11.5 5.5 13.5 8 14C10.5 13.5 12 11.5 12 9C12 5 8 1 8 1Z" fill="#F97316"/>
                    <path d="M8 5C8 5 5.5 8 5.5 10.5C5.5 12.5 6.5 13.5 8 14C9.5 13.5 10.5 12.5 10.5 10.5C10.5 8 8 5 8 5Z" fill="#FB923C"/>
                    <path d="M8 8.5C8 8.5 6.5 10 6.5 11.5C6.5 12.5 7 13.5 8 14C9 13.5 9.5 12.5 9.5 11.5C9.5 10 8 8.5 8 8.5Z" fill="#FDE047"/>
                  </svg>
                  !
                </p>
                <p className="text-white text-sm sm:text-base leading-relaxed mb-6">
                  Aprovecha estos{' '}
                  <span className="font-bold" style={{ color: '#E5A823' }}>descuentazos exclusivos</span>{' '}
                  que no verás en ningún otro lugar y no volverán.
                </p>

                <button
                  onClick={() => {
                    setDismissed(true);
                    onExpired?.();
                  }}
                  className="w-full py-3.5 bg-white rounded-xl text-base font-semibold transition-all duration-200 hover:shadow-lg active:scale-[0.98] cursor-pointer"
                  style={{ color: '#4654CD' }}
                >
                  ¡Empezar!
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default VipCountdownOverlay;
