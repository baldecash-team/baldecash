'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Layers } from 'lucide-react';

interface GamerBrandsProps {
  theme: 'dark' | 'light';
}

const BRANDS = [
  { name: 'LENOVO', sub: 'Legion · IdeaPad', logo: '/images/zona-gamer/logos marcas/lenovo.png', height: 130 },
  { name: 'HP', sub: 'OMEN · Victus', logo: '/images/zona-gamer/logos marcas/hp.png', height: 70 },
  { name: 'ASUS', sub: 'ROG · TUF Gaming', logo: '/images/zona-gamer/logos marcas/asus.png', height: 130 },
];

export function GamerBrands({ theme }: GamerBrandsProps) {
  const isDark = theme === 'dark';
  const neonCyan = isDark ? '#00ffd5' : '#00b396';
  const textMuted = isDark ? '#707070' : '#888';
  const gradient = isDark
    ? 'linear-gradient(135deg, #6366f1 0%, #82e2d2 100%)'
    : 'linear-gradient(135deg, #4f46e5 0%, #0d9488 100%)';

  // Duplicate brands for seamless carousel
  const carouselBrands = [...BRANDS, ...BRANDS, ...BRANDS, ...BRANDS];

  return (
    <>
      <hr className="border-none h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.15), transparent)' }} />

      <section className="py-[60px] overflow-hidden" id="brands">
        <div className="max-w-[1280px] mx-auto px-6">
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
            <Layers className="w-3.5 h-3.5" />
            MARCAS Y SERIES GAMING
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4"
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1, letterSpacing: 1 }}
          >
            EQUIPOS DE{' '}
            <span className="accent" style={{ backgroundImage: gradient }}>PRIMERA LÍNEA</span>
          </motion.h2>

          <p className="text-base mb-10" style={{ color: isDark ? '#fff' : '#333', maxWidth: 560, lineHeight: 1.6 }}>
            Solo trabajamos con las marcas líderes en gaming a nivel mundial
          </p>

          {/* Marquee carousel */}
          <div
            className="relative overflow-hidden mt-10"
            style={{
              maskImage: 'linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)',
              WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)',
            }}
          >
            <div
              className="flex gap-10 w-max hover:[animation-play-state:paused]"
              style={{ animation: 'brandsScroll 18s linear infinite' }}
            >
              {carouselBrands.map((b, i) => (
                <div
                  key={`${b.name}-${i}`}
                  className="flex flex-col items-center justify-center px-8 py-6 cursor-pointer transition-all duration-300 group"
                  style={{ minWidth: 280 }}
                >
                  <div
                    className="mb-3.5 h-20 flex items-center justify-center"
                  >
                    <Image
                      src={b.logo}
                      alt={b.name}
                      width={220}
                      height={b.height}
                      className="object-contain transition-all duration-300 group-hover:scale-105"
                      style={{
                        height: b.height,
                        maxWidth: 220,
                        opacity: isDark ? 1 : 0.9,
                      }}
                    />
                  </div>
                  <div
                    className="text-[11px]"
                    style={{
                      color: textMuted,
                      fontFamily: "'Share Tech Mono', monospace",
                    }}
                  >
                    {b.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes brandsScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </>
  );
}
