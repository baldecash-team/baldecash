'use client';

import React, { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface VipCountdownBannerProps {
  endDate: string;
}

function calculateTimeLeft(endDate: Date): TimeLeft {
  const diff = endDate.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const pad = (n: number) => n.toString().padStart(2, '0');

const FireIcon = () => (
  <svg className="inline-block w-4 h-4 ml-1 -mt-0.5" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 1C8 1 4 5 4 9C4 11.5 5.5 13.5 8 14C10.5 13.5 12 11.5 12 9C12 5 8 1 8 1Z" fill="#F97316"/>
    <path d="M8 5C8 5 5.5 8 5.5 10.5C5.5 12.5 6.5 13.5 8 14C9.5 13.5 10.5 12.5 10.5 10.5C10.5 8 8 5 8 5Z" fill="#FB923C"/>
    <path d="M8 8.5C8 8.5 6.5 10 6.5 11.5C6.5 12.5 7 13.5 8 14C9 13.5 9.5 12.5 9.5 11.5C9.5 10 8 8.5 8 8.5Z" fill="#FDE047"/>
  </svg>
);

export default function VipCountdownBanner({ endDate }: VipCountdownBannerProps) {
  const targetDate = new Date(endDate);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(targetDate));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const timer = setInterval(() => {
      const tl = calculateTimeLeft(targetDate);
      setTimeLeft(tl);
      if (tl.days === 0 && tl.hours === 0 && tl.minutes === 0 && tl.seconds === 0) {
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [mounted]);

  if (!mounted) return null;
  const isExpired = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;
  if (isExpired) return null;

  const timeUnits = [
    { value: timeLeft.days, label: 'Días' },
    { value: timeLeft.hours, label: 'Hrs' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Seg' },
  ];

  return (
    <>
      <style jsx global>{`
        @font-face {
          font-family: 'DSEG7';
          src: url('/prototipos/0.6/fonts/DSEG7Classic-Bold.woff2') format('woff2');
          font-weight: bold;
          font-style: normal;
          font-display: swap;
        }
      `}</style>

      <div
        className="w-full rounded-xl overflow-hidden relative"
        style={{ backgroundColor: 'var(--color-primary, #4654CD)' }}
      >
        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1.5px, transparent 1.5px)',
            backgroundSize: '18px 18px',
          }}
        />

        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.08) 0%, transparent 60%)',
          }}
        />

        {/* Mobile: stacked layout | Desktop: 3-column row */}
        <div className="relative flex flex-col md:flex-row items-center md:justify-between px-4 sm:px-8 lg:px-10 py-4 sm:py-5 gap-3 md:gap-8">
          {/* Logo + pill row on mobile, just logo on desktop */}
          <div className="flex-shrink-0 flex md:block items-center gap-3">
            <img
              src="https://baldecash.s3.amazonaws.com/company/logo-vip.png"
              alt="BaldeCash VIP"
              className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto"
            />
            {/* Pill badge — inline on mobile, overlapping card on desktop */}
            <div
              className="md:hidden inline-flex items-center px-3 py-1 rounded-full text-white text-xs font-bold whitespace-nowrap"
              style={{ backgroundColor: '#1CC8C0' }}
            >
              ¡Por tiempo limitado:
              <FireIcon />
            </div>
          </div>

          {/* Center: Message card with overlapping pill */}
          <div className="flex-1 flex flex-col items-center w-full md:w-auto">
            <div className="relative w-full max-w-md">
              {/* Pill badge — desktop only, overlaps card top border */}
              <div className="hidden md:block absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                <div
                  className="inline-flex items-center px-4 py-1 rounded-full text-white text-sm font-bold whitespace-nowrap shadow-lg"
                  style={{ backgroundColor: '#1CC8C0' }}
                >
                  ¡Por tiempo limitado:
                  <FireIcon />
                </div>
              </div>

              {/* Bordered card */}
              <div
                className="px-4 sm:px-6 md:px-8 pt-3 pb-2.5 md:pt-7 md:pb-4 rounded-xl text-center"
                style={{
                  border: '1.5px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(30, 40, 130, 0.35)',
                }}
              >
                <p className="text-white text-xs sm:text-sm md:text-base lg:text-lg font-bold leading-relaxed font-['Baloo_2',_sans-serif]">
                  Encuentra los equipos marcados y aprovecha un{' '}
                  <span style={{ color: '#E5A823' }}>precio exclusivo</span>{' '}
                  para ti.
                </p>
              </div>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex-shrink-0 flex flex-col items-center md:items-end">
            <p className="text-xs sm:text-sm md:text-base font-bold font-['Baloo_2',_sans-serif] mb-1.5 md:mb-2" style={{ color: '#E5A823' }}>
              Esta promo termina en:
            </p>
            <div className="flex gap-1 sm:gap-1.5 md:gap-2 items-start">
              {timeUnits.map((unit, index) => (
                <div key={unit.label} className="flex items-start gap-1 sm:gap-1.5 md:gap-2">
                  <div className="flex flex-col items-center">
                    <span
                      className="text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-none"
                      style={{
                        fontFamily: "'DSEG7', monospace",
                        color: '#E5A823',
                        textShadow: '0 0 12px rgba(229, 168, 35, 0.3)',
                      }}
                    >
                      {pad(unit.value)}
                    </span>
                    <span className="text-white/50 text-[9px] sm:text-[10px] mt-0.5 font-medium tracking-wide">
                      {unit.label}
                    </span>
                  </div>
                  {index < timeUnits.length - 1 && (
                    <span
                      className="text-lg sm:text-xl md:text-2xl lg:text-3xl leading-none mt-0.5"
                      style={{ color: '#E5A823', opacity: 0.5 }}
                    >
                      :
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
