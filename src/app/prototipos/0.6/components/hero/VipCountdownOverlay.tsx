'use client';

/**
 * VipCountdownOverlay - Pantalla completa de countdown para landing VIP
 *
 * States:
 *  1. "countdown" - Fullscreen countdown + DNI button
 *  2. "welcome"   - Personalized welcome with name + "¡Empezar!" button
 *
 * When countdown expires OR user clicks "¡Empezar!", the overlay disappears
 * and reveals the landing content beneath.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface VipWelcomeData {
  firstName: string;
}

interface VipCountdownOverlayProps {
  onOpenDniModal: () => void;
  /** ISO date string for countdown end (e.g. "2026-04-25T05:00:00.000Z") */
  endDate: string;
  /** Called when countdown reaches zero or user clicks "¡Empezar!" */
  onExpired?: () => void;
  /** When set, overlay switches to "welcome" state showing the user's name */
  welcomeData?: VipWelcomeData | null;
}

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
  onOpenDniModal,
  endDate,
  onExpired,
  welcomeData,
}) => {
  const targetDate = new Date(endDate);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize only on client to avoid hydration mismatch
  useEffect(() => {
    const tl = calculateTimeLeft(targetDate);
    setTimeLeft(tl);
    const alreadyExpired = isExpiredDate(targetDate);
    setExpired(alreadyExpired);
    if (alreadyExpired) onExpired?.();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || expired) return;

    const timer = setInterval(() => {
      const tl = calculateTimeLeft(targetDate);
      setTimeLeft(tl);

      if (tl.days === 0 && tl.hours === 0 && tl.minutes === 0 && tl.seconds === 0) {
        setExpired(true);
        onExpired?.();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [mounted, expired]);

  // Block body scroll and hide chat widget while overlay is visible
  useEffect(() => {
    if (!expired) {
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [expired]);

  // Don't render on server or before client mount
  if (!mounted || expired) return null;

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
      <style jsx global>{`
        @font-face {
          font-family: 'DSEG7';
          src: url('/prototipos/0.6/fonts/DSEG7Classic-Bold.woff2') format('woff2');
          font-weight: bold;
          font-style: normal;
          font-display: swap;
        }
      `}</style>

      <AnimatePresence>
        {!expired && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
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
                src="https://baldecash.s3.amazonaws.com/company/logo-vip.png"
                alt="BaldeCash VIP"
                className="h-16 sm:h-20 md:h-24 w-auto mb-6 sm:mb-8"
              />

              {/* Title */}
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
                    {/* Separator colon between units (except after last) */}
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
            </div>

            {/* Bottom section: Card */}
            <div className="w-full px-4 pb-8 sm:pb-12 flex justify-center">
              <AnimatePresence mode="wait">
                {!showWelcome ? (
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

                    {/* CTA Button inside card */}
                    <button
                      onClick={onOpenDniModal}
                      className="w-full py-3.5 bg-white rounded-xl text-base font-semibold transition-all duration-200 hover:shadow-lg active:scale-[0.98] cursor-pointer"
                      style={{ color: '#4654CD' }}
                    >
                      Ingresa tu DNI para acceder
                    </button>
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
                      ¡{welcomeData.firstName}, esto es solo para ti
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
                        setExpired(true);
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VipCountdownOverlay;
