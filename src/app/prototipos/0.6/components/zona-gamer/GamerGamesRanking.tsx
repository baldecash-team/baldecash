'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Monitor } from 'lucide-react';
import { useEventTrackerOptional } from '@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext';
import { BASE_PATH } from '@/app/prototipos/0.6/utils/routes';
import { fetchCatalogData } from '@/app/prototipos/0.6/services/catalogApi';
import type { CatalogProduct } from '@/app/prototipos/0.6/[landing]/catalogo/types/catalog';

interface GamerGamesRankingProps {
  theme: 'dark' | 'light';
}

interface Laptop {
  n: string;
  s: string;
  p: string;
  slug: string;
  img: string;
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

// Metadata de los juegos (hardcoded). Las laptops YA NO viven aquí: se traen del
// catálogo en runtime y se reparten con distributeProductsToGames (ver ALGORITHM.md).
const GAMES = [
  { name: 'Valorant', genre: 'FPS Táctico', pct: 35, bar: 92, color: '#ff2d55', iconIdx: 0 },
  { name: 'Counter-Strike 2', genre: 'FPS Competitivo', pct: 25, bar: 72, color: '#ff9500', iconIdx: 2 },
  { name: 'Dota 2', genre: 'MOBA', pct: 18, bar: 56, color: '#a855f7', iconIdx: 4 },
  { name: 'Fortnite', genre: 'Battle Royale', pct: 12, bar: 44, color: '#00ffd5', iconIdx: 3 },
  { name: 'FC 25', genre: 'Deportes', pct: 10, bar: 38, color: '#34d399', iconIdx: 5 },
];

// Orden de los juegos para el round-robin (debe coincidir con GAMES).
const GAME_NAMES = GAMES.map((g) => g.name);
const MIN_PER_GAME = 3; // objetivo por juego cuando hay menos productos que juegos
const MAX_PER_GAME = 6; // tope visible por juego
// Slug del que se traen los productos. Cambiar a 'nvidia' cuando tenga catálogo propio.
const SOURCE_SLUG = 'zona-gamer';

/** GPU como string: rawSpecs.gpu (string crudo) con fallback a specs.gpu.model. */
function gpuStringOf(p: CatalogProduct): string {
  const raw = p.rawSpecs?.gpu;
  if (typeof raw === 'string' && raw) return raw;
  return p.specs?.gpu?.model || '';
}

/** Rank por modelo RTX/GTX para ordenar por potencia (5060 > 5050 > 4050 > 3050). */
function getGpuRank(gpu: string): number {
  const m = gpu.match(/(?:RTX|GTX)\s*(\d{3,4})/i);
  return m ? parseInt(m[1], 10) : 0;
}

/** Texto de specs corto desde el producto: "RTX 4050 · 16GB · 512GB SSD". */
function buildSpecsText(p: CatalogProduct): string {
  const gpu = gpuStringOf(p).replace(/NVIDIA\s+GeForce™?\s*/i, '').trim();
  const ram = p.specs?.ram?.size;
  const storage = p.specs?.storage?.size;
  const storageType = p.specs?.storage?.type;
  const parts = [
    gpu,
    ram ? `${ram}GB` : '',
    storage ? `${storage}GB ${(storageType || 'SSD').toUpperCase()}` : '',
  ];
  return parts.filter(Boolean).join(' · ');
}

/** Convierte un producto del catálogo al shape interno de Laptop del modal. */
function toLaptop(p: CatalogProduct): Laptop {
  return {
    n: p.displayName,
    s: buildSpecsText(p),
    p: `S/${p.quotaMonthly}/mes`,
    slug: p.slug,
    img: (p.images && p.images.length > 0 ? p.images[0] : p.thumbnail) || '',
  };
}

/**
 * Reparte los productos del catálogo entre los 5 juegos de forma balanceada y
 * determinística (round-robin sobre el catálogo ordenado por potencia). Ver
 * ALGORITHM.md. Retorna null si no hay productos (la sección se oculta).
 */
function distributeProductsToGames(products: CatalogProduct[]): Record<string, Laptop[]> | null {
  const n = products.length;
  const ng = GAME_NAMES.length;

  // Sin productos -> ocultar sección.
  if (n === 0) return null;

  // Ordenar por potencia (GPU desc, RAM desc, cuota asc, slug). Determinístico.
  const sorted = [...products].sort((a, b) => {
    const gpuDiff = getGpuRank(gpuStringOf(b)) - getGpuRank(gpuStringOf(a));
    if (gpuDiff !== 0) return gpuDiff;
    const ramDiff = (b.specs?.ram?.size || 0) - (a.specs?.ram?.size || 0);
    if (ramDiff !== 0) return ramDiff;
    const priceDiff = (a.quotaMonthly || 0) - (b.quotaMonthly || 0);
    if (priceDiff !== 0) return priceDiff;
    return a.slug.localeCompare(b.slug);
  });

  const assigned: Record<string, Laptop[]> = {};
  GAME_NAMES.forEach((g) => { assigned[g] = []; });

  if (n >= ng) {
    // Caso normal: round-robin SIN repetición, respetando MAX_PER_GAME.
    let i = 0;
    for (const product of sorted) {
      let attempts = 0;
      while (assigned[GAME_NAMES[i % ng]].length >= MAX_PER_GAME && attempts < ng) {
        i++;
        attempts++;
      }
      if (attempts >= ng) break; // todos al máximo, parar
      assigned[GAME_NAMES[i % ng]].push(toLaptop(product));
      i++;
    }
  } else {
    // Caso extremo: menos productos que juegos -> repetir para no dejar ninguno vacío.
    let idx = 0;
    for (let round = 0; round < MIN_PER_GAME; round++) {
      for (const game of GAME_NAMES) {
        assigned[game].push(toLaptop(sorted[idx % n]));
        idx++;
      }
    }
  }

  return assigned;
}

export function GamerGamesRanking({ theme }: GamerGamesRankingProps) {
  const isDark = theme === 'dark';
  const router = useRouter();
  const tracker = useEventTrackerOptional();
  const [selectedGame, setSelectedGame] = useState<number | null>(null);
  // undefined = cargando · null = catálogo vacío (ocultar) · objeto = listo
  const [productsByGame, setProductsByGame] = useState<Record<string, Laptop[]> | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    fetchCatalogData(SOURCE_SLUG, { limit: 200 }).then((data) => {
      if (!alive) return;
      setProductsByGame(distributeProductsToGames(data?.products ?? []));
    });
    return () => { alive = false; };
  }, []);

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
    tracker?.track('product_click', { game_name: GAMES[idx].name, game_genre: GAMES[idx].genre, source: 'zona_gamer_ranking' });
    setSelectedGame(idx);
    document.body.style.overflow = 'hidden';
  }, [tracker]);

  const closeModal = useCallback(() => {
    setSelectedGame(null);
    document.body.style.overflow = '';
  }, []);

  // Sin productos en el catálogo -> ocultar la sección completa.
  if (productsByGame === null) return null;

  const isLoading = productsByGame === undefined;
  const game = selectedGame !== null ? GAMES[selectedGame] : null;
  const gameLaptops = game && productsByGame ? (productsByGame[game.name] || []) : [];

  return (
    <>
      <style>{`
        .gamer-game-row { grid-template-columns: 36px 36px 1fr 40px 16px; }
        @media (min-width: 640px) { .gamer-game-row { grid-template-columns: 60px 52px 1fr 1fr 60px 28px; } }
        @keyframes gamerSkelPulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.85; } }
        .gamer-skel-block { background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}; border-radius: 6px; animation: gamerSkelPulse 1.4s ease-in-out infinite; }
      `}</style>
      <hr className="border-none h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.15), transparent)' }} />

      <section className="py-10 sm:py-[60px]" id="games">
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
            {isLoading ? (
              GAMES.map((g, i) => (
                <div
                  key={`skel-${g.name}`}
                  className="gamer-game-row grid items-center gap-2 sm:gap-3.5 py-4 sm:py-5 px-3 sm:px-6 relative"
                  style={{ borderBottom: `1px solid ${border}`, borderTop: i === 0 ? `1px solid ${border}` : 'none' }}
                >
                  <div className="gamer-skel-block" style={{ width: 20, height: 16 }} />
                  <div className="gamer-skel-block w-[32px] h-[32px] sm:w-[42px] sm:h-[42px] !rounded-[10px]" />
                  <div className="gamer-skel-block" style={{ width: '55%', height: 14 }} />
                  <div className="gamer-skel-block hidden sm:block" style={{ width: '100%', height: 6 }} />
                  <div className="gamer-skel-block justify-self-end" style={{ width: 28, height: 12 }} />
                  <div />
                </div>
              ))
            ) : GAMES.map((g, i) => (
              <motion.div
                key={g.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                onClick={() => openModal(i)}
                className="gamer-game-row grid items-center gap-2 sm:gap-3.5 py-4 sm:py-5 px-3 sm:px-6 cursor-pointer transition-all relative group"
                style={{
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
                  className="w-[32px] h-[32px] sm:w-[42px] sm:h-[42px] rounded-[8px] sm:rounded-[10px] flex items-center justify-center shrink-0 relative z-10 [&>svg]:w-[16px] [&>svg]:h-[16px] sm:[&>svg]:w-[22px] sm:[&>svg]:h-[22px]"
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
                    className="text-[14px] sm:text-[17px] font-bold"
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
                  className="relative z-10 flex items-center opacity-50 sm:opacity-30 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1"
                  style={{ color: g.color, fontSize: 20, fontWeight: 700 }}
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
                padding: 'clamp(16px, 5vw, 32px)',
                maxWidth: 560,
                width: '92%',
                maxHeight: '85vh',
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
                    className="text-[22px] sm:text-[28px]"
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
                {gameLaptops.map((l: Laptop, i: number) => (
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
                    onClick={() => {
                      tracker?.track('product_click', {
                        laptop_name: l.n,
                        laptop_slug: l.slug,
                        game_name: game.name,
                        source: 'zona_gamer_ranking_modal',
                      });
                      closeModal();
                      router.push(`${BASE_PATH}/zona-gamer/producto/${l.slug}`);
                    }}
                  >
                    {/* Laptop image */}
                    <div
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center shrink-0 overflow-hidden"
                      style={{ background: 'rgba(99,102,241,0.06)' }}
                    >
                      {l.img ? (
                        <img
                          src={l.img}
                          alt={l.n}
                          loading="lazy"
                          className="w-full h-full object-contain p-1"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Monitor className="w-5 h-4 sm:w-7 sm:h-5" style={{ color: textMuted, opacity: 0.4 }} />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-[13px] sm:text-[15px] font-bold"
                        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                      >
                        {l.n}
                      </div>
                      <div className="text-[10px] sm:text-[11px]" style={{ color: textMuted }}>
                        {l.s}
                      </div>
                    </div>

                    {/* Price */}
                    <div
                      className="text-xs sm:text-sm font-bold whitespace-nowrap"
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
