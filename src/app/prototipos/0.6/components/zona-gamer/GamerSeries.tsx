'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GamerSeriesProps {
  theme: 'dark' | 'light';
}

const SERIES = [
  {
    name: 'ROG STRIX',
    brand: 'ASUS',
    color: '#ff0040',
    desc: 'La república de los gamers. Tecnología de élite.',
    img: '/images/zona-gamer/series/rog-strix.png',
    pos: 'center 50%',
  },
  {
    name: 'TUF GAMING',
    brand: 'ASUS',
    color: '#ff8800',
    desc: 'Durabilidad militar y rendimiento gaming accesible',
    img: '/images/zona-gamer/series/tuf-gaming.png',
    pos: 'center 45%',
  },
  {
    name: 'LOQ',
    brand: 'LENOVO',
    color: '#00ff7f',
    desc: 'La puerta de entrada al gaming de verdad.',
    img: '/images/zona-gamer/series/loq.png',
    pos: 'center 50%',
  },
  {
    name: 'VICTUS',
    brand: 'HP',
    color: '#00ffd5',
    desc: 'Gaming accesible con rendimiento real.',
    img: '/images/zona-gamer/series/victus.png',
    pos: 'center 50%',
  },
  {
    name: 'LEGION',
    brand: 'LENOVO',
    color: '#00ffd5',
    desc: 'Rendimiento sin compromisos para competir al más alto nivel',
    img: '/images/zona-gamer/series/legion.png',
    pos: 'center 60%',
  },
  {
    name: 'OMEN',
    brand: 'HP',
    color: '#b044ff',
    desc: 'Potencia diseñada para dominar cada partida',
    img: '/images/zona-gamer/series/omen.png',
    pos: 'center 45%',
  },
];

export function GamerSeries({ theme }: GamerSeriesProps) {
  const isDark = theme === 'dark';
  const scrollRef = useRef<HTMLDivElement>(null);
  const border = isDark ? '#2a2a2a' : '#e0e0e0';
  const bgCard = isDark ? '#1a1a1a' : '#ffffff';
  const textSecondary = isDark ? '#a0a0a0' : '#555';
  const gradient = isDark
    ? 'linear-gradient(135deg, #6366f1 0%, #00ffd5 100%)'
    : 'linear-gradient(135deg, #4f46e5 0%, #00897a 100%)';

  const scroll = (dir: number) => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.querySelector<HTMLElement>('.series-card')?.offsetWidth ?? 300;
    scrollRef.current.scrollBy({ left: dir * (cardWidth + 16), behavior: 'smooth' });
  };

  return (
    <>
      <hr className="border-none h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.15), transparent)' }} />

      <section className="py-[60px] overflow-hidden" id="linea-combate">
        <div className="max-w-[1280px] mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-0"
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1, letterSpacing: 1 }}
          >
            ELIGE TU{' '}
            <span className="accent" style={{ backgroundImage: gradient }}>LÍNEA DE COMBATE</span>
          </motion.h2>

          <div className="flex items-center justify-between gap-5 mt-2">
            <p className="text-base m-0" style={{ color: isDark ? '#fff' : '#333' }}>
              Cada serie está diseñada para un tipo de gamer. Encuentra la tuya.
            </p>
            <div className="flex gap-2.5 shrink-0">
              <button
                onClick={() => scroll(-1)}
                className="w-11 h-11 rounded-xl flex items-center justify-center border cursor-pointer transition-all hover:border-[#00ffd5] hover:text-[#00ffd5]"
                style={{ background: bgCard, borderColor: border, color: textSecondary }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll(1)}
                className="w-11 h-11 rounded-xl flex items-center justify-center border cursor-pointer transition-all hover:border-[#00ffd5] hover:text-[#00ffd5]"
                style={{ background: bgCard, borderColor: border, color: textSecondary }}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scroll horizontal: 4 visibles, 2 ocultas */}
          <div
            ref={scrollRef}
            className="flex gap-4 mt-10 overflow-x-auto pb-2 scroll-smooth"
            style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
          >
            {SERIES.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i + 1, 4) * 0.1 }}
                className="series-card relative rounded-2xl overflow-hidden border cursor-pointer group shrink-0"
                style={{
                  width: 'calc(25% - 12px)',
                  minWidth: 220,
                  aspectRatio: '3/4',
                  borderColor: border,
                  scrollSnapAlign: 'start',
                }}
              >
                {/* Background image with zoom on hover */}
                <div
                  className="absolute inset-0 transition-transform duration-[600ms] group-hover:scale-[1.06]"
                  style={{
                    backgroundImage: `url(${s.img})`,
                    backgroundSize: 'cover',
                    backgroundPosition: s.pos,
                  }}
                />

                {/* Dark overlay gradient */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: isDark
                      ? 'linear-gradient(180deg, transparent 40%, rgba(5,5,8,0.9) 100%)'
                      : 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.85) 100%)',
                  }}
                />

                {/* Content at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 transition-transform duration-400 group-hover:translate-y-0">
                  <div
                    className="text-[10px] font-bold tracking-[2px] uppercase mb-1"
                    style={{ color: s.color, fontFamily: "'Share Tech Mono', monospace" }}
                  >
                    {s.brand}
                  </div>
                  <div
                    className="text-[28px] tracking-[2px] mb-1.5 text-white"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    {s.name}
                  </div>
                  <div
                    className="text-xs leading-relaxed opacity-0 translate-y-2 transition-all duration-400 delay-100 group-hover:opacity-100 group-hover:translate-y-0"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    {s.desc}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        .group:hover {
          border-color: rgba(0, 255, 213, 0.2);
          transform: translateY(-6px);
          box-shadow: ${isDark ? '0 14px 40px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.1)'};
        }
      `}</style>
    </>
  );
}
