'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Gift } from 'lucide-react';

interface GamerCtaProps {
  theme: 'dark' | 'light';
  catalogUrl: string;
}

export function GamerCta({ theme, catalogUrl }: GamerCtaProps) {
  const isDark = theme === 'dark';
  const neonCyan = isDark ? '#00ffd5' : '#00897a';
  const neonPurple = isDark ? '#6366f1' : '#4f46e5';
  const gradient = isDark
    ? 'linear-gradient(135deg, #6366f1 0%, #00ffd5 100%)'
    : 'linear-gradient(135deg, #4f46e5 0%, #00897a 100%)';

  return (
    <>
      <hr className="border-none h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.15), transparent)' }} />

      <section
        className="relative overflow-hidden text-center"
        style={{ padding: 'clamp(40px, 10vw, 100px) 0' }}
      >
        {/* Background radial */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.06), transparent 70%)',
            opacity: isDark ? 1 : 0.5,
          }}
        />

        <div className="relative z-[1] max-w-[1280px] mx-auto px-6">
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
            <Gift className="w-3.5 h-3.5" />
            ¿LISTO PARA EL CAMBIO?
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4"
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1, letterSpacing: 1 }}
          >
            TU PRÓXIMO
            <br />
            <span className="accent" style={{ backgroundImage: gradient }}>SETUP GAMING</span>
            <br />
            EMPIEZA AQUÍ
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mb-4"
            style={{ fontSize: 'clamp(14px, 3.5vw, 16px)', color: isDark ? '#fff' : '#333', maxWidth: 560, lineHeight: 1.6 }}
          >
            Financiamiento accesible, las mejores marcas y una comunidad que te respalda
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex gap-4 justify-center mt-4"
          >
            <a
              href={catalogUrl}
              className="inline-flex items-center gap-2 no-underline text-white transition-all hover:-translate-y-0.5"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 14, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
                padding: '12px 28px', borderRadius: 8,
                background: neonPurple,
              }}
            >
              Explorar Catálogo
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
