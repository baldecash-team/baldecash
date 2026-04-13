'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Monitor } from 'lucide-react';

interface GamerGamesRankingProps {
  theme: 'dark' | 'light';
}

interface Laptop {
  n: string;
  s: string;
  p: string;
}

const GAME_ICONS = [
  // Diana (Valorant)
  <svg key="0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/></svg>,
  // Espada (LoL)
  <svg key="1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/></svg>,
  // Crosshair (Counter-Strike 2)
  <svg key="2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><line x1="12" y1="3" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="21"/><line x1="3" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="21" y2="12"/></svg>,
  // Cuadrícula (Fortnite)
  <svg key="3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  // Shield (Dota 2)
  <svg key="4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  // Globo (FC 25)
  <svg key="5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  // Auto (GTA V)
  <svg key="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-2-2.2-3.5C13 5.5 12 5 11 5H5c-.6 0-1.1.2-1.4.6L1.4 8.3C1.1 8.7 1 9.1 1 9.6V16c0 .6.4 1 1 1h1"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>,
  // Flechas (Minecraft)
  <svg key="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 4l-4 4-4-4"/><path d="M10 8v12"/><path d="M6 14l4 4 4-4"/></svg>,
];

const GAMES = [
  {
    name: 'Valorant', genre: 'FPS Táctico', pct: 35, bar: 92, color: '#ff2d55', iconIdx: 0,
    laptops: [
      { n: 'Legion 5 Pro', s: 'RTX 4060 · 165Hz · Alta calidad', p: 'S/89/mes' },
      { n: 'Victus 15', s: 'RTX 4050 · 144Hz · Media-alta', p: 'S/59/mes' },
      { n: 'IdeaPad Gaming 3', s: 'RTX 3050 · 120Hz · Calidad media', p: 'S/49/mes' },
    ],
  },
  {
    name: 'Counter-Strike 2', genre: 'FPS Competitivo', pct: 25, bar: 72, color: '#ff9500', iconIdx: 2,
    laptops: [
      { n: 'TUF Gaming A15', s: 'RTX 4050 · 200+ fps · Competitivo', p: 'S/65/mes' },
      { n: 'Legion 5 Pro', s: 'RTX 4060 · 300+ fps · Máximos', p: 'S/89/mes' },
      { n: 'Victus 15', s: 'RTX 4050 · 144Hz · Alta calidad', p: 'S/59/mes' },
    ],
  },
  {
    name: 'Dota 2', genre: 'MOBA', pct: 18, bar: 56, color: '#a855f7', iconIdx: 4,
    laptops: [
      { n: 'IdeaPad Gaming 3', s: 'RTX 3050 · Ultra · 60fps estable', p: 'S/49/mes' },
      { n: 'TUF Gaming A15', s: 'RTX 4050 · Máximos sin drops', p: 'S/65/mes' },
      { n: 'Victus 15', s: 'RTX 4050 · Ultra + streaming', p: 'S/59/mes' },
    ],
  },
  {
    name: 'Fortnite', genre: 'Battle Royale', pct: 12, bar: 44, color: '#00ffd5', iconIdx: 3,
    laptops: [
      { n: 'TUF Gaming A15', s: 'RTX 4050 · Alta calidad · 120fps', p: 'S/65/mes' },
      { n: 'Legion 5 Pro', s: 'RTX 4060 · Épico · 165Hz', p: 'S/89/mes' },
      { n: 'ROG Strix G16', s: 'RTX 4060 · Ultra · Competitivo', p: 'S/95/mes' },
    ],
  },
  {
    name: 'FC 25', genre: 'Deportes', pct: 10, bar: 38, color: '#34d399', iconIdx: 5,
    laptops: [
      { n: 'IdeaPad Gaming 3', s: 'RTX 3050 · Ultra · 60fps estable', p: 'S/49/mes' },
      { n: 'Victus 15', s: 'RTX 4050 · Máximos sin drops', p: 'S/59/mes' },
    ],
  },
];

const RANK_COLORS = ['#ff8800', '#94a3b8', '#cd7f32'];

export function GamerGamesRanking({ theme }: GamerGamesRankingProps) {
  const isDark = theme === 'dark';
  const [selectedGame, setSelectedGame] = useState<number | null>(null);
  const neonCyan = isDark ? '#00ffd5' : '#00897a';
  const neonPurple = isDark ? '#00ffd5' : '#4f46e5';
  const textMuted = isDark ? '#707070' : '#888';
  const textSecondary = isDark ? '#a0a0a0' : '#555';
  const border = isDark ? '#2a2a2a' : '#e0e0e0';
  const bgCard = isDark ? '#111' : '#fff';
  const bgSurface = isDark ? '#0a0a0a' : '#f5f5f5';
  const gradient = isDark
    ? 'linear-gradient(135deg, #6366f1 0%, #00ffd5 100%)'
    : 'linear-gradient(135deg, #4f46e5 0%, #00897a 100%)';

  const openModal = useCallback((idx: number) => {
    setSelectedGame(idx);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    setSelectedGame(null);
    document.body.style.overflow = '';
  }, []);

  const game = selectedGame !== null ? GAMES[selectedGame] : null;

  return (
    <>
      <hr className="border-none h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.15), transparent)' }} />

      <section className="py-[60px]" id="games">
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
            <Trophy className="w-3.5 h-3.5" />
            TOP GAMES COMUNIDAD
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4"
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1, letterSpacing: 1 }}
          >
            ¿QUÉ JUEGAN{' '}
            <span className="accent" style={{ backgroundImage: gradient }}>NUESTROS GAMERS?</span>
          </motion.h2>

          <p className="text-base" style={{ color: isDark ? '#fff' : '#333', maxWidth: 560, lineHeight: 1.6 }}>
            Los juegos más populares entre la comunidad BaldeCash — Haz clic para ver laptops compatibles
          </p>

          {/* Accent line */}
          <div className="w-12 h-[3px] rounded mt-3 mb-10" style={{ background: gradient }} />

          {/* Games list */}
          <div className="flex flex-col">
            {GAMES.map((g, i) => (
              <motion.div
                key={g.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                onClick={() => openModal(i)}
                className="grid items-center gap-3.5 py-5 px-6 cursor-pointer transition-all relative group"
                style={{
                  gridTemplateColumns: '60px 52px 1fr 1fr 60px 28px',
                  borderBottom: `1px solid ${border}`,
                  borderTop: i === 0 ? `1px solid ${border}` : 'none',
                }}
              >
                {/* Hover left bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: g.color }}
                />

                {/* Hover background */}
                <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none"
                  style={{ background: 'rgba(99,102,241,0.03)' }} />

                {/* Rank */}
                <span
                  className="text-base font-extrabold relative z-10"
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    color: g.color,
                  }}
                >
                  #{i + 1}
                </span>

                {/* Icon */}
                <div
                  className="w-[42px] h-[42px] rounded-[10px] flex items-center justify-center shrink-0 relative z-10 [&>svg]:w-[22px] [&>svg]:h-[22px]"
                  style={{
                    background: `${g.color}22`,
                    border: `1px solid ${g.color}33`,
                    color: g.color,
                  }}
                >
                  {GAME_ICONS[g.iconIdx]}
                </div>

                {/* Name + genre */}
                <div className="relative z-10">
                  <div
                    className="text-[17px] font-bold"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    {g.name}
                  </div>
                  <div
                    className="text-[10px] tracking-[1px] mt-0.5"
                    style={{ color: textMuted, fontFamily: "'Share Tech Mono', monospace" }}
                  >
                    {g.genre}
                  </div>
                </div>

                {/* Bar */}
                <div className="relative z-10 hidden sm:flex items-center">
                  <div
                    className="flex-1 h-1.5 rounded-full overflow-hidden"
                    style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)' }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${g.bar}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 + i * 0.1 }}
                      style={{ background: `linear-gradient(90deg, ${g.color}, ${g.color}88)` }}
                    />
                  </div>
                </div>

                {/* Percentage */}
                <span
                  className="text-sm font-bold text-right relative z-10"
                  style={{ fontFamily: "'Orbitron', sans-serif", color: textSecondary }}
                >
                  {g.pct}%
                </span>

                {/* Arrow hint */}
                <span
                  className="relative z-10 hidden sm:flex items-center opacity-30 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1"
                  style={{ color: g.color, fontSize: 24, fontWeight: 700 }}
                >
                  ›
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Game Modal */}
      <AnimatePresence>
        {game && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
            className="fixed inset-0 z-[200] flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-2xl overflow-y-auto"
              style={{
                background: bgCard,
                border: `1px solid ${border}`,
                padding: 32,
                maxWidth: 560,
                width: '90%',
                maxHeight: '80vh',
                boxShadow: isDark ? undefined : '0 20px 60px rgba(0,0,0,0.15)',
              }}
            >
              {/* Close button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center border cursor-pointer transition-all hover:border-[#ff0055] hover:text-[#ff0055]"
                style={{ background: 'none', borderColor: border, color: textMuted }}
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3.5 mb-5">
                <div
                  className="w-[50px] h-[50px] rounded-xl flex items-center justify-center [&>svg]:w-[26px] [&>svg]:h-[26px]"
                  style={{
                    background: `${game.color}22`,
                    border: `1px solid ${game.color}33`,
                    color: game.color,
                  }}
                >
                  {GAME_ICONS[game.iconIdx]}
                </div>
                <div>
                  <div
                    className="text-[28px]"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    {game.name}
                  </div>
                  <div
                    className="text-[10px] tracking-[2px]"
                    style={{ color: textMuted, fontFamily: "'Share Tech Mono', monospace" }}
                  >
                    {game.genre}
                  </div>
                </div>
              </div>

              {/* Subtitle */}
              <div
                className="text-sm font-bold tracking-[1px] uppercase mb-4"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  color: neonPurple,
                }}
              >
                LAPTOPS RECOMENDADAS PARA {game.name.toUpperCase()}
              </div>

              {/* Laptops list */}
              <div className="flex flex-col gap-2.5">
                {game.laptops.map((l: Laptop, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer"
                    style={{
                      background: bgSurface,
                      borderColor: border,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(0,255,213,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = border;
                    }}
                  >
                    {/* Laptop icon */}
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(99,102,241,0.06)' }}
                    >
                      <Monitor className="w-7 h-5" style={{ color: textMuted, opacity: 0.4 }} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-[15px] font-bold"
                        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                      >
                        {l.n}
                      </div>
                      <div className="text-[11px]" style={{ color: textMuted }}>
                        {l.s}
                      </div>
                    </div>

                    {/* Price */}
                    <div
                      className="text-sm font-bold whitespace-nowrap"
                      style={{
                        fontFamily: "'Orbitron', sans-serif",
                        color: neonPurple,
                      }}
                    >
                      {l.p}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
