'use client';

import { motion } from 'framer-motion';
import { Zap, ArrowRight, ChevronDown } from 'lucide-react';
import { ZONA_GAMER_ASSETS } from '@/app/prototipos/0.6/utils/assets';

interface GamerHeroProps {
  theme: 'dark' | 'light';
  catalogUrl: string;
}

export function GamerHero({ theme, catalogUrl }: GamerHeroProps) {
  const isDark = theme === 'dark';

  const scrollTo = (id: string, offset = 120) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* hero-banner */}
      <section className="relative overflow-hidden" style={{ padding: 'clamp(40px, 8vw, 80px) 0', minHeight: 'clamp(360px, 60vw, 520px)' }}>
        {/* hero-banner-bg */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: isDark
              ? `url(${ZONA_GAMER_ASSETS}/hero/fondo-dark.png)`
              : `url(${ZONA_GAMER_ASSETS}/hero/fondo-light.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* hero-banner::after overlay - horizontal en desktop, vertical en mobile */}
        <div
          className="absolute inset-0 z-[1] hidden sm:block"
          style={{
            background: isDark
              ? 'linear-gradient(90deg, rgba(5,5,10,0.85) 0%, rgba(5,5,10,0.6) 45%, transparent 75%)'
              : 'linear-gradient(90deg, rgba(242,242,242,0.95) 0%, rgba(242,242,242,0.88) 35%, rgba(242,242,242,0.6) 55%, transparent 75%)',
          }}
        />
        <div
          className="absolute inset-0 z-[1] sm:hidden"
          style={{
            background: isDark
              ? 'linear-gradient(180deg, rgba(5,5,10,0.85) 0%, rgba(5,5,10,0.6) 60%, rgba(5,5,10,0.4) 100%)'
              : 'linear-gradient(180deg, rgba(242,242,242,0.9) 0%, rgba(242,242,242,0.75) 50%, rgba(242,242,242,0.55) 100%)',
          }}
        />

        {/* container */}
        <div className="relative z-[11] max-w-[1280px] mx-auto px-6">
          {/* hero-banner-content */}
          <div style={{ maxWidth: 680 }}>
            {/* hb-tag */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center gap-2 mb-6"
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 12,
                letterSpacing: 3,
                textTransform: 'uppercase',
                color: isDark ? '#00ffd5' : '#00897a',
                background: isDark ? 'rgba(0,255,213,0.06)' : 'rgba(14,148,133,0.06)',
                border: `1px solid ${isDark ? 'rgba(0,255,213,0.15)' : 'rgba(14,148,133,0.15)'}`,
                padding: '6px 16px',
                borderRadius: 4,
              }}
            >
              <Zap className="w-4 h-4" />
              ZONA GAMER 2026
            </motion.div>

            {/* hb-title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 'clamp(48px, 7vw, 96px)',
                lineHeight: 0.95,
                letterSpacing: -1,
                marginBottom: 20,
              }}
            >
              TU SETUP GAMING,
              <br />
              <span
                className="accent"
                style={{
                  backgroundImage: isDark
                    ? 'linear-gradient(135deg, #6366f1 0%, #00ffd5 100%)'
                    : 'linear-gradient(135deg, #4f46e5 0%, #00897a 100%)',
                }}
              >
                AL ALCANCE
              </span>
              <br />
              DE TODOS
            </motion.h1>

            {/* hb-desc */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              style={{
                fontSize: 'clamp(15px, 3.5vw, 18px)',
                color: isDark ? '#ffffff' : '#333',
                lineHeight: 1.7,
                maxWidth: 520,
                marginBottom: 'clamp(20px, 5vw, 32px)',
              }}
            >
              Laptops gaming de las mejores marcas con planes de financiamiento accesibles.
              Legion, OMEN, ROG, TUF Gaming — encuentra tu equipo ideal.
            </motion.p>

            {/* hb-actions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center"
              style={{ gap: 12 }}
            >
              {/* btn-primary */}
              <a
                href={catalogUrl}
                className="inline-flex items-center border-none cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(99,102,241,0.35)] no-underline"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  padding: '12px 28px',
                  borderRadius: 8,
                  background: isDark ? '#6366f1' : '#4f46e5',
                  color: '#fff',
                  gap: 8,
                }}
              >
                Explorar Equipos
                <ArrowRight className="w-4 h-4" />
              </a>

              {/* btn-ghost */}
              <button
                onClick={() => scrollTo('linea-combate', 160)}
                className="inline-flex items-center cursor-pointer transition-all hover:-translate-y-0.5"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  padding: '12px 28px',
                  borderRadius: 8,
                  background: isDark ? 'rgba(99,102,241,0.25)' : 'rgba(79,70,229,0.08)',
                  color: isDark ? '#c7d2fe' : '#4f46e5',
                  border: `2px solid ${isDark ? '#a5b4fc' : '#6366f1'}`,
                  boxShadow: isDark ? '0 0 16px rgba(99,102,241,0.3)' : '0 0 8px rgba(79,70,229,0.1)',
                  backdropFilter: 'blur(8px)',
                  gap: 8,
                }}
                onMouseEnter={(e) => { if (e.currentTarget) { e.currentTarget.style.boxShadow = isDark ? '0 4px 20px rgba(99,102,241,0.25)' : '0 4px 20px rgba(79,70,229,0.2)'; e.currentTarget.style.borderColor = isDark ? '#818cf8' : '#6366f1'; } }}
                onMouseLeave={(e) => { if (e.currentTarget) { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = isDark ? 'rgba(99,102,241,0.4)' : 'rgba(79,70,229,0.3)'; } }}
              >
                Ver Series
                <ChevronDown className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* hero-fade */}
      <div
        className="relative z-10 pointer-events-none"
        style={{
          height: 120,
          marginTop: -120,
          background: `linear-gradient(180deg, transparent, ${isDark ? '#0e0e0e' : '#f2f2f2'} 80%)`,
        }}
      />
    </>
  );
}
