'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { ZONA_GAMER_ASSETS } from '@/app/prototipos/0.6/utils/assets';

interface GamerAccessoriesProps {
  theme: 'dark' | 'light';
}

const ACCESSORIES = [
  { name: 'Razer Basilisk V3 Chroma', tag: 'Incluido en packs', imgDark: `${ZONA_GAMER_ASSETS}/acc/basilisk-dark.png`, imgLight: `${ZONA_GAMER_ASSETS}/acc/basilisk-light.png` },
  { name: 'Razer BlackWidow V3', tag: 'Incluido en packs', imgDark: `${ZONA_GAMER_ASSETS}/acc/blackwidow-dark.png`, imgLight: `${ZONA_GAMER_ASSETS}/acc/blackwidow-light.png` },
  { name: 'Razer Kraken V4', tag: 'Incluido en packs', imgDark: `${ZONA_GAMER_ASSETS}/acc/kraken-dark.png`, imgLight: `${ZONA_GAMER_ASSETS}/acc/kraken-light.png` },
  { name: 'Razer Firefly V2 Pro', tag: 'Incluido en packs', imgDark: `${ZONA_GAMER_ASSETS}/acc/firefly-dark.png`, imgLight: `${ZONA_GAMER_ASSETS}/acc/firefly-light.png` },
  { name: 'Corsair TC100', tag: 'Complemento', imgDark: `${ZONA_GAMER_ASSETS}/acc/corsair-dark.png`, imgLight: `${ZONA_GAMER_ASSETS}/acc/corsair-light.png` },
];

// Duplicated for seamless marquee loop
const CAROUSEL_ACCESSORIES = [...ACCESSORIES, ...ACCESSORIES];

export function GamerAccessories({ theme }: GamerAccessoriesProps) {
  const isDark = theme === 'dark';
  const neonCyan = isDark ? '#00ffd5' : '#00897a';
  const neonPurple = isDark ? '#6366f1' : '#4f46e5';
  const border = isDark ? '#2a2a2a' : '#e0e0e0';
  const bgCard = isDark ? '#1a1a1a' : '#ffffff';
  const gradient = isDark
    ? 'linear-gradient(135deg, #6366f1 0%, #00ffd5 100%)'
    : 'linear-gradient(135deg, #4f46e5 0%, #00897a 100%)';

  return (
    <>
      {/* Divider */}
      <hr className="border-none h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.15), transparent)' }} />

      <section className="py-10 sm:py-[60px]" id="accessories">
        <div className="px-6">
          {/* stag */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded mb-4"
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 11, letterSpacing: 3, textTransform: 'uppercase',
              color: neonCyan,
              background: isDark ? 'rgba(0,255,213,0.05)' : 'rgba(14,148,133,0.06)',
              border: `1px solid ${isDark ? 'rgba(0,255,213,0.12)' : 'rgba(14,148,133,0.15)'}`,
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            EQUÍPATE AL MÁXIMO
          </motion.div>

          {/* stitle */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4"
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1, letterSpacing: 1, color: isDark ? '#ffffff' : '#1a1a1a' }}
          >
            ACCESORIOS{' '}
            <span style={{
              backgroundImage: gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>GAMING</span>
          </motion.h2>

          {/* acc-header-row */}
          <div className="flex items-center justify-between gap-5">
            <p className="text-base m-0" style={{ color: isDark ? '#fff' : '#333' }}>
              Disponibles dentro de nuestros Packs Gamer o como complemento de tu laptop
            </p>
          </div>
        </div>

        {/* acc-carousel-wrap — full width with edge shadows */}
        <div className="w-full">
          <div className="relative mt-10 overflow-hidden">
            {/* Left shadow */}
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: 'clamp(40px, 10vw, 150px)', zIndex: 2, pointerEvents: 'none',
              background: isDark
                ? 'linear-gradient(90deg, #0e0e0e, transparent)'
                : 'linear-gradient(90deg, #f2f2f2, transparent)',
            }} />
            {/* Right shadow */}
            <div style={{
              position: 'absolute', right: 0, top: 0, bottom: 0, width: 'clamp(40px, 10vw, 150px)', zIndex: 2, pointerEvents: 'none',
              background: isDark
                ? 'linear-gradient(270deg, #0e0e0e, transparent)'
                : 'linear-gradient(270deg, #f2f2f2, transparent)',
            }} />
            <style>{`
              @keyframes accScroll {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .acc-carousel-track {
                animation: accScroll 25s linear infinite;
              }
              .acc-carousel-track:hover {
                animation-play-state: paused;
              }
            `}</style>
            <div
              className="acc-carousel-track flex gap-5 py-4"
              style={{ width: 'max-content' }}
            >
              {CAROUSEL_ACCESSORIES.map((acc, i) => (
                <div
                  key={`${acc.name}-${i}`}
                  className="shrink-0 rounded-2xl border text-center cursor-default hover:-translate-y-1.5"
                  style={{
                    background: bgCard,
                    borderColor: border,
                    padding: 'clamp(12px, 3vw, 20px)',
                    width: 'clamp(160px, 40vw, 220px)',
                    transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget) return;
                    e.currentTarget.style.borderColor = isDark ? neonCyan : neonPurple;
                    e.currentTarget.style.boxShadow = isDark
                      ? '0 12px 32px rgba(0,255,213,0.1)'
                      : '0 12px 32px rgba(99,102,241,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget) return;
                    e.currentTarget.style.borderColor = border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Image
                    src={isDark ? acc.imgDark : acc.imgLight}
                    alt={acc.name}
                    width={200}
                    height={120}
                    loading="lazy"
                    className="w-full object-contain mb-3 rounded-lg"
                    style={{ height: 'clamp(80px, 20vw, 120px)' }}
                  />
                  <div
                    className="mb-1"
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 'clamp(12px, 3.5vw, 15px)', fontWeight: 700,
                      color: isDark ? '#fff' : '#333',
                    }}
                  >
                    {acc.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase',
                      color: isDark ? neonCyan : neonPurple,
                    }}
                  >
                    {acc.tag}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
