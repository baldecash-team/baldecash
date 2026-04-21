'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, Package, Gamepad2, Zap, Star, Check } from 'lucide-react';
import { ZONA_GAMER_ASSETS } from '@/app/prototipos/0.6/utils/assets';

interface Pack {
  name: string;
  tier: string;
  icon: React.ReactNode;
  imgDark: string;
  imgLight: string;
  items: string[];
  price: string;
  save: string;
  color: string;       // accent color
  colorLight: string;  // accent color for light theme
  colorBg: string;     // bg tint
  popular: boolean;
  imgContain?: boolean;
  imgPad?: number;
}

const PACKS: Pack[] = [
  {
    name: 'STARTER',
    tier: 'PACK ENTRADA',
    icon: <Gamepad2 className="w-11 h-11" />,
    imgDark: `${ZONA_GAMER_ASSETS}/packs/starter-dark.png`,
    imgLight: `${ZONA_GAMER_ASSETS}/packs/starter-light.png`,
    items: [
      'Laptop HP Victus 15-fb3020la',
      'Mouse Razer DeathAdder Essential',
      'Pad Mouse Razer Sphex',
      'Teclado Teros TE-4072G RGB',
      'Auricular Razer Kraken V3',
    ],
    price: 'S/59',
    save: 'Ahorras S/120 vs compra individual',
    color: '#5b9cff',
    colorLight: '#2563eb',
    colorBg: 'rgba(91,156,255,0.08)',
    popular: false,
  },
  {
    name: 'PRO GAMER',
    tier: 'PACK MEDIA-ALTA',
    icon: <Zap className="w-11 h-11" />,
    imgDark: `${ZONA_GAMER_ASSETS}/packs/pro-dark.png`,
    imgLight: `${ZONA_GAMER_ASSETS}/packs/pro-light.png`,
    items: [
      'Laptop ASUS TUF FX607VU-RL048',
      'Mouse Razer Basilisk V3 Chroma',
      'Pad Mouse Razer Sphex',
      'Teclado Razer BlackWidow V3',
      'Auricular Razer Kraken V3',
    ],
    price: 'S/89',
    save: 'Ahorras S/280 vs compra individual',
    color: '#818cf8',
    colorLight: '#6366f1',
    colorBg: 'rgba(99,102,241,0.1)',
    popular: true,
  },
  {
    name: 'ELITE',
    tier: 'PACK PREMIUM',
    icon: <Star className="w-11 h-11" />,
    imgDark: `${ZONA_GAMER_ASSETS}/packs/elite-dark.png`,
    imgLight: `${ZONA_GAMER_ASSETS}/packs/elite-light.png`,
    items: [
      'Laptop ASUS ROG G614M-RV127W',
      'Mouse Razer Basilisk V3 Chroma',
      'Pad Mouse Razer Firefly V2 Pro',
      'Teclado Razer BlackWidow V3',
      'Auricular Razer Kraken V4',
      'Sillón Gaming Corsair TC100',
    ],
    price: 'S/119',
    save: 'Ahorras S/450 vs compra individual',
    color: '#00ffd5',
    colorLight: '#00897a',
    colorBg: 'rgba(0,255,213,0.08)',
    popular: false,
    imgPad: 0,
  },
];

const CATALOG_PULSE_KEYFRAMES = `
  @keyframes catalogPulse {
    0%, 100% { box-shadow: 0 0 0 0 var(--catalog-pulse-from); }
    50% {
      box-shadow: 0 0 16px 4px var(--catalog-pulse-to);
      border-color: var(--catalog-pulse-border);
    }
  }
`;

interface GamerPacksProps {
  theme: 'dark' | 'light';
  catalogUrl: string;
}

export function GamerPacks({ theme, catalogUrl }: GamerPacksProps) {
  const isDark = theme === 'dark';
  const neonCyan = isDark ? '#00ffd5' : '#00897a';
  const neonPurple = isDark ? '#6366f1' : '#4f46e5';
  const border = isDark ? '#2a2a2a' : '#e0e0e0';
  const bgCard = isDark ? '#1a1a1a' : '#ffffff';
  const textMuted = isDark ? '#707070' : '#888';
  const gradient = isDark
    ? 'linear-gradient(135deg, #6366f1 0%, #00ffd5 100%)'
    : 'linear-gradient(135deg, #4f46e5 0%, #00897a 100%)';

  return (
    <section className="py-10 sm:py-[60px]" id="catalogo">
      <style>{CATALOG_PULSE_KEYFRAMES}</style>
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
          <Package className="w-3.5 h-3.5" />
          PACKS GAMING
        </motion.div>

        {/* stitle */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mb-4"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(36px, 5vw, 64px)',
            lineHeight: 1, letterSpacing: 1,
          }}
        >
          ARMA TU{' '}
          <span className="accent" style={{ backgroundImage: gradient }}>
            SETUP COMPLETO
          </span>
        </motion.h2>

        {/* sdesc */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mb-10"
          style={{ fontSize: 'clamp(14px, 3.5vw, 16px)', color: isDark ? '#fff' : '#333', maxWidth: 560, lineHeight: 1.6 }}
        >
          Packs pensados para cada tipo de gamer — laptop + accesorios con financiamiento accesible
        </motion.p>

        {/* packs-grid */}
        <div
          className="grid gap-4 grid-cols-1 md:grid-cols-3"
        >
          {PACKS.map((pack, i) => {
            const accent = isDark ? pack.color : pack.colorLight;
            const isStarter = pack.name === 'STARTER';
            const isElite = pack.name === 'ELITE';

            // Card border: solo PRO tiene borde de color
            const cardBorder = pack.popular
              ? `2px solid ${accent}`
              : `1px solid ${border}`;

            // Card bg: solo PRO tiene tint
            const cardBg = pack.popular
              ? (isDark ? '#1a1530' : '#f5f3ff')
              : bgCard;

            // Buttons: PRO solid (destaca), STARTER y ELITE outline (sutiles)
            const btnStyle = pack.popular
              ? {
                  background: isDark ? '#818cf8' : '#6366f1',
                  color: '#fff',
                  border: 'none',
                }
              : {
                  background: 'none',
                  color: accent,
                  border: `1px solid ${accent}`,
                };

            return (
              <motion.div
                key={pack.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-2xl overflow-hidden flex flex-col text-center transition-all hover:-translate-y-1.5"
                style={{
                  background: cardBg,
                  border: cardBorder,
                  padding: 'clamp(20px, 4vw, 32px) clamp(16px, 3vw, 24px)',
                  borderRadius: 16,
                }}
              >
                {/* Popular: solid purple top bar + badge */}
                {pack.popular && (
                  <>
                    <div className="absolute top-0 left-0 right-0 h-[3px]"
                      style={{ background: accent }} />
                    <div
                      className="absolute top-3.5 right-3.5"
                      style={{
                        fontFamily: "'Share Tech Mono', monospace",
                        fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase',
                        padding: '3px 10px', borderRadius: 4,
                        background: accent, color: '#fff', fontWeight: 700,
                      }}
                    >
                      MÁS ELEGIDO
                    </div>
                  </>
                )}


                {/* pack-card-img-wrap */}
                <div className="w-full overflow-hidden" style={{ borderRadius: '12px 12px 0 0', margin: '0 -24px 0', width: 'calc(100% + 48px)' }}>
                  <Image
                    src={isDark ? pack.imgDark : pack.imgLight}
                    alt={pack.name}
                    width={400}
                    height={200}
                    loading="lazy"
                    className="w-full block"
                    style={{ height: 'auto', aspectRatio: '2/1', objectFit: 'cover', padding: pack.imgPad ?? 0 }}
                  />
                </div>

                {/* pack-emoji */}
                <div className="mx-auto mt-5 mb-4" style={{ width: 44, height: 44, color: accent }}>
                  {pack.icon}
                </div>

                {/* pack-name */}
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(22px, 5vw, 28px)', letterSpacing: 1, marginBottom: 4 }}>
                  {pack.name}
                </div>

                {/* pack-tier */}
                <div style={{
                  fontFamily: "'Share Tech Mono', monospace", fontSize: 10, letterSpacing: 2,
                  textTransform: 'uppercase', color: accent, marginBottom: 16,
                }}>
                  {pack.tier}
                </div>

                {/* pack-price-wrap */}
                <div style={{ marginBottom: 20 }}>
                  <span style={{
                    fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(24px, 6vw, 32px)', fontWeight: 800,
                    color: accent,
                  }}>
                    {pack.price}
                  </span>
                  <span className="text-sm" style={{ color: textMuted }}>/mes</span>
                </div>

                {/* pack-divider */}
                <div className="mx-0 my-4" style={{
                  height: 1,
                  background: `linear-gradient(90deg, transparent, ${accent}40, transparent)`,
                }} />

                {/* pack-items */}
                <ul className="list-none p-0 mb-6 flex-1 text-left">
                  {pack.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2.5 py-2 text-[13px]"
                      style={{ color: isDark ? '#fff' : '#333' }}>
                      <Check className="w-4 h-4 shrink-0" style={{ color: accent }} />
                      {item}
                    </li>
                  ))}
                </ul>

                {/* pack-btn */}
                <a
                  href={catalogUrl}
                  className="w-full flex items-center justify-center gap-2 no-underline mt-auto transition-all cursor-pointer"
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
                    padding: 12, borderRadius: 8,
                    ...btnStyle,
                  }}
                >
                  Lo quiero
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>

                {/* pack-save */}
                <div
                  className="inline-block mt-2.5 mx-auto"
                  style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: 10, letterSpacing: 1,
                    color: isDark ? pack.color : pack.colorLight,
                    background: pack.colorBg,
                    border: `1px solid ${pack.color}40`,
                    padding: '3px 10px', borderRadius: 4,
                  }}
                >
                  {pack.save}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* btn-ver-catalogo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-10"
        >
          <a
            href={catalogUrl}
            className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl no-underline font-bold text-[17px] transition-all duration-300 hover:-translate-y-0.5"
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              background: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(79,70,229,0.08)',
              color: isDark ? '#a5b4fc' : '#4f46e5',
              border: `2px solid ${isDark ? '#818cf8' : '#6366f1'}`,
              animation: 'catalogPulse 2.5s ease-in-out infinite',
              ['--catalog-pulse-from' as string]: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(79,70,229,0.06)',
              ['--catalog-pulse-to' as string]: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(79,70,229,0.15)',
              ['--catalog-pulse-border' as string]: isDark ? '#a5b4fc' : '#818cf8',
            } as React.CSSProperties}
          >
            Ver catálogo completo
            <ArrowRight className="w-[18px] h-[18px] transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </motion.div>


      </div>
    </section>
  );
}
