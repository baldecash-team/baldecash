'use client';

import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

interface GamerStoriesProps {
  theme: 'dark' | 'light';
}

const STORIES = [
  {
    name: 'Carlos M.',
    initials: 'CM',
    quote: 'Con BaldeCash pude tener mi Legion 5 Pro pagando cuotas accesibles. Ahora juego Valorant a 165fps sin drops.',
    detail: 'Legion 5 Pro · Gamer desde 2019',
  },
  {
    name: 'Ana R.',
    initials: 'AR',
    quote: 'Siempre quise una laptop gaming pero parecía imposible. El plan de financiamiento de BaldeCash cambió todo para mí.',
    detail: 'TUF Gaming A15 · Streamer',
  },
  {
    name: 'Diego L.',
    initials: 'DL',
    quote: 'El soporte post-venta es increíble. Me ayudaron a elegir entre OMEN y ROG según mi presupuesto y los juegos que juego.',
    detail: 'OMEN 16 · Diseñador & Gamer',
  },
];

export function GamerStories({ theme }: GamerStoriesProps) {
  const isDark = theme === 'dark';
  const neonCyan = isDark ? '#00ffd5' : '#00897a';
  const neonPurple = isDark ? '#6366f1' : '#4f46e5';
  const border = isDark ? '#2a2a2a' : '#e0e0e0';
  const bgCard = isDark ? '#1a1a1a' : '#ffffff';
  const textMuted = isDark ? '#707070' : '#888';
  const textSecondary = isDark ? '#a0a0a0' : '#555';
  const gradient = isDark
    ? 'linear-gradient(135deg, #6366f1 0%, #00ffd5 100%)'
    : 'linear-gradient(135deg, #4f46e5 0%, #00897a 100%)';

  return (
    <>
      <hr className="border-none h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.15), transparent)' }} />

      <section className="py-[60px]" id="stories">
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
            <MessageSquare className="w-3.5 h-3.5" />
            HISTORIAS DE GAMERS
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4"
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1, letterSpacing: 1 }}
          >
            GAMERS REALES,{' '}
            <span className="accent" style={{ backgroundImage: gradient }}>HISTORIAS REALES</span>
          </motion.h2>

          <p className="text-base mb-10" style={{ color: isDark ? '#fff' : '#333', maxWidth: 560, lineHeight: 1.6 }}>
            Conoce a quienes ya dieron el salto con BaldeCash
          </p>

          {/* Stories grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
            {STORIES.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border p-6 transition-all hover:-translate-y-1"
                style={{ background: bgCard, borderColor: border }}
              >
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold mb-4"
                  style={{
                    background: `${neonPurple}22`,
                    border: `2px solid ${neonPurple}44`,
                    color: neonPurple,
                    fontFamily: "'Orbitron', sans-serif",
                  }}
                >
                  {s.initials}
                </div>

                {/* Quote */}
                <p className="text-sm leading-relaxed mb-4" style={{ color: isDark ? '#ffffff' : '#444' }}>
                  &ldquo;{s.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="text-sm font-bold mb-1">{s.name}</div>
                <div className="text-[11px]" style={{ color: isDark ? '#ffffff' : '#666', fontFamily: "'Share Tech Mono', monospace" }}>
                  {s.detail}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
