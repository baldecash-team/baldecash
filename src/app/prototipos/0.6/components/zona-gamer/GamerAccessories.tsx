'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';

interface GamerAccessoriesProps {
  theme: 'dark' | 'light';
}

const ACCESSORIES = [
  { name: 'Razer Basilisk V3 Chroma', tag: 'Incluido en packs', imgDark: '/images/zona-gamer/acc/basilisk-dark.png', imgLight: '/images/zona-gamer/acc/basilisk-light.png' },
  { name: 'Razer BlackWidow V3', tag: 'Incluido en packs', imgDark: '/images/zona-gamer/acc/blackwidow-dark.png', imgLight: '/images/zona-gamer/acc/blackwidow-light.png' },
  { name: 'Razer Kraken V4', tag: 'Incluido en packs', imgDark: '/images/zona-gamer/acc/kraken-dark.png', imgLight: '/images/zona-gamer/acc/kraken-light.png' },
  { name: 'Razer Firefly V2 Pro', tag: 'Incluido en packs', imgDark: '/images/zona-gamer/acc/firefly-dark.png', imgLight: '/images/zona-gamer/acc/firefly-light.png' },
  { name: 'Corsair TC100', tag: 'Complemento', imgDark: '/images/zona-gamer/acc/corsair-dark.png', imgLight: '/images/zona-gamer/acc/corsair-light.png' },
];

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

      <section className="py-[60px]" id="accessories">
        <div className="max-w-[1280px] mx-auto px-6">
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

        {/* acc-grid-wrap */}
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="relative mt-10">
            {/* acc-grid */}
            <div
              className="flex gap-5 overflow-x-auto py-4"
              style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none' }}
            >
              {ACCESSORIES.map((acc, i) => (
                <motion.div
                  key={acc.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="shrink-0 rounded-2xl border text-center cursor-default hover:-translate-y-1.5"
                  style={{
                    background: bgCard,
                    borderColor: border,
                    padding: 20,
                    minWidth: 'calc((100% - 80px) / 5)',
                    transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = isDark ? neonCyan : neonPurple;
                    e.currentTarget.style.boxShadow = isDark
                      ? '0 12px 32px rgba(0,255,213,0.1)'
                      : '0 12px 32px rgba(99,102,241,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* acc-card-img dark */}
                  <Image
                    src={acc.imgDark}
                    alt={acc.name}
                    width={200}
                    height={120}
                    className="w-full object-contain mb-3 rounded-lg"
                    style={{ height: 120, display: isDark ? 'block' : 'none' }}
                  />
                  {/* acc-card-img light */}
                  <Image
                    src={acc.imgLight}
                    alt={acc.name}
                    width={200}
                    height={120}
                    className="w-full object-contain mb-3 rounded-lg"
                    style={{ height: 120, display: isDark ? 'none' : 'block' }}
                  />

                  {/* acc-card-name */}
                  <div
                    className="mb-1"
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 15, fontWeight: 700,
                      color: isDark ? '#fff' : '#333',
                    }}
                  >
                    {acc.name}
                  </div>

                  {/* acc-card-tag */}
                  <div
                    style={{
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase',
                      color: isDark ? neonCyan : neonPurple,
                    }}
                  >
                    {acc.tag}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
