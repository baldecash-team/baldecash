'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Star, Zap } from 'lucide-react';
import Image from 'next/image';
import { ZONA_GAMER_ASSETS } from '@/app/prototipos/0.6/utils/assets';

export interface StepSuccessMessageProps {
  stepName: string;
  stepNumber: number;
  totalSteps: number;
  onComplete?: () => void;
  theme?: 'gamer';
}

const ROTATING_MESSAGES = ['¡Vas muy bien!', '¡Sigue así!', '¡Buen trabajo!'];
const ROTATING_MESSAGES_GAMER = ['¡VAS MUY BIEN!', '¡SIGUE ASÍ!', '¡BUEN TRABAJO!'];

const getMessage = (stepNumber: number, totalSteps: number, gamer?: boolean): string => {
  const progress = stepNumber / totalSteps;
  if (gamer) {
    if (stepNumber === totalSteps) return '¡INFORMACIÓN COMPLETA!';
    if (stepNumber === 1) return '¡EXCELENTE INICIO!';
    if (stepNumber === totalSteps - 1) return '¡UN PASO MÁS!';
    if (totalSteps >= 4 && progress >= 0.7) return '¡YA CASI TERMINAMOS!';
    if (totalSteps >= 4 && progress >= 0.45 && progress <= 0.55) return '¡VAS POR LA MITAD!';
    if (totalSteps >= 5 && progress >= 0.2 && progress <= 0.3) return '¡BUEN AVANCE!';
    return ROTATING_MESSAGES_GAMER[(stepNumber - 1) % 3];
  }
  if (stepNumber === totalSteps) return '¡Información completa!';
  if (stepNumber === 1) return '¡Excelente inicio!';
  if (stepNumber === totalSteps - 1) return '¡Un paso más!';
  if (totalSteps >= 4 && progress >= 0.7) return '¡Ya casi terminamos!';
  if (totalSteps >= 4 && progress >= 0.45 && progress <= 0.55) return '¡Vas por la mitad!';
  if (totalSteps >= 5 && progress >= 0.2 && progress <= 0.3) return '¡Buen avance!';
  return ROTATING_MESSAGES[(stepNumber - 1) % ROTATING_MESSAGES.length];
};

// --- Standard theme sub-components ---

const StandardParticle: React.FC<{ delay: number; x: number; color: string }> = ({ delay, x, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 0, x, scale: 0 }}
    animate={{
      opacity: [0, 1, 1, 0],
      y: [-20, -60, -80, -100],
      x: [x, x + (Math.random() - 0.5) * 40],
      scale: [0, 1, 1, 0.5],
      rotate: [0, Math.random() * 360],
    }}
    transition={{ duration: 1.5, delay, ease: 'easeOut' }}
    className="absolute"
    style={{ color }}
  >
    {Math.random() > 0.5 ? <Star className="w-4 h-4 fill-current" /> : <Sparkles className="w-4 h-4" />}
  </motion.div>
);

// --- Gamer theme sub-components ---

const CYAN = '#00ffd5';
const PURPLE = '#6366f1';
const MONO = "'Share Tech Mono', monospace";
const ORBITRON = "'Orbitron', sans-serif";

const CornerBracket: React.FC<{ position: 'tl' | 'tr' | 'bl' | 'br'; delay?: number }> = ({ position, delay = 0 }) => {
  const base: React.CSSProperties = { position: 'absolute', width: 28, height: 28, borderColor: CYAN, borderStyle: 'solid' };
  const pos: Record<typeof position, React.CSSProperties> = {
    tl: { top: 0, left: 0, borderWidth: '2px 0 0 2px' },
    tr: { top: 0, right: 0, borderWidth: '2px 2px 0 0' },
    bl: { bottom: 0, left: 0, borderWidth: '0 0 2px 2px' },
    br: { bottom: 0, right: 0, borderWidth: '0 2px 2px 0' },
  };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      style={{ ...base, ...pos[position] }}
    />
  );
};

const SideBracket: React.FC<{ side: 'left' | 'right' }> = ({ side }) => {
  const isLeft = side === 'left';
  const style: React.CSSProperties = {
    width: 14, height: 72,
    borderTop: `2px solid ${CYAN}`, borderBottom: `2px solid ${CYAN}`,
    borderLeft: isLeft ? `2px solid ${CYAN}` : undefined,
    borderRight: isLeft ? undefined : `2px solid ${CYAN}`,
    borderTopLeftRadius: isLeft ? 3 : 0, borderBottomLeftRadius: isLeft ? 3 : 0,
    borderTopRightRadius: isLeft ? 0 : 3, borderBottomRightRadius: isLeft ? 0 : 3,
    boxShadow: `0 0 12px ${CYAN}66, inset 0 0 8px ${CYAN}33`,
    flexShrink: 0,
  };
  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -10 : 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      style={style}
    />
  );
};

const GamerParticle: React.FC<{ delay: number; x: number; color: string }> = ({ delay, x, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 0, x, scale: 0 }}
    animate={{
      opacity: [0, 1, 1, 0],
      y: [-10, -60, -90, -120],
      x: [x, x + (Math.random() - 0.5) * 60],
      scale: [0, 1.1, 0.9, 0.3],
      rotate: [0, Math.random() * 360],
    }}
    transition={{ duration: 1.4, delay, ease: 'easeOut' }}
    className="absolute"
    style={{ color, filter: `drop-shadow(0 0 4px ${color})` }}
  >
    {Math.random() > 0.5 ? <Zap className="w-3.5 h-3.5 fill-current" /> : <Sparkles className="w-3.5 h-3.5" />}
  </motion.div>
);

// --- Main component ---

export const StepSuccessMessage: React.FC<StepSuccessMessageProps> = ({
  stepName,
  stepNumber,
  totalSteps,
  onComplete,
  theme,
}) => {
  const isGamer = theme === 'gamer';

  React.useEffect(() => {
    const timer = setTimeout(() => onComplete?.(), isGamer ? 1700 : 1300);
    return () => clearTimeout(timer);
  }, [onComplete, isGamer]);

  const message = getMessage(stepNumber, totalSteps, isGamer);

  if (isGamer) {
    const isLight = typeof window !== 'undefined' && localStorage.getItem('baldecash-zona-gamer-theme') === 'light';
    const bg = isLight ? '#f5f5f5' : '#0e0e0e';
    const bgCard = isLight ? 'rgba(255,255,255,0.85)' : 'rgba(20,20,20,0.6)';
    const xpTrack = isLight ? '#d4d4d4' : '#2a2a2a';
    const textMuted = isLight ? '#666' : '#707070';
    const messageColor = isLight ? '#00897a' : CYAN;
    const progressPct = (stepNumber / totalSteps) * 100;

    const particles = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      delay: Math.random() * 0.5,
      x: (i - 5) * 18,
      color: i % 2 === 0 ? CYAN : PURPLE,
    }));

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        style={{ background: bg }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Share+Tech+Mono&display=swap');
          @keyframes scanline-sweep {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100vh); }
          }
        `}</style>

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: isLight
              ? 'linear-gradient(rgba(0,137,122,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,137,122,0.04) 1px, transparent 1px)'
              : 'linear-gradient(rgba(0,255,213,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,213,0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
          }}
        />

        <motion.div
          className="absolute left-0 right-0 pointer-events-none"
          style={{
            height: 2,
            background: `linear-gradient(90deg, transparent, ${CYAN}, transparent)`,
            opacity: 0.6,
            animation: 'scanline-sweep 1.4s linear',
          }}
        />

        <div
          className="absolute pointer-events-none"
          style={{
            width: 480, height: 480,
            background: `radial-gradient(circle, ${isLight ? 'rgba(0,137,122,0.12)' : 'rgba(0,255,213,0.1)'} 0%, transparent 60%)`,
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          className="relative"
          style={{
            padding: '40px 48px', maxWidth: 440, width: '90vw',
            background: bgCard, borderRadius: 16,
            border: `1px solid ${isLight ? 'rgba(0,137,122,0.2)' : 'rgba(0,255,213,0.2)'}`,
            boxShadow: isLight
              ? '0 20px 60px rgba(0,137,122,0.15), inset 0 1px 0 rgba(255,255,255,0.8)'
              : '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(0,255,213,0.1), inset 0 1px 0 rgba(0,255,213,0.1)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <CornerBracket position="tl" delay={0} />
          <CornerBracket position="tr" delay={0.05} />
          <CornerBracket position="bl" delay={0.1} />
          <CornerBracket position="br" delay={0.15} />

          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: CYAN, boxShadow: `0 0 8px ${CYAN}` }} />
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 3, color: isLight ? '#00897a' : CYAN, textTransform: 'uppercase' }}>
              PASO COMPLETADO
            </span>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: CYAN, boxShadow: `0 0 8px ${CYAN}` }} />
          </motion.div>

          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="relative flex items-center justify-center gap-3 mb-5"
            style={{ minHeight: 72 }}
          >
            <div className="absolute left-1/2 top-1/2 pointer-events-none" style={{ transform: 'translate(-50%, -50%)' }}>
              {particles.map((p) => (
                <GamerParticle key={p.id} delay={p.delay} x={p.x} color={p.color} />
              ))}
            </div>
            <SideBracket side="left" />
            <Image
              src={`${ZONA_GAMER_ASSETS}/branding/logo-ofi.png`}
              alt="BaldeCash"
              width={240}
              height={56}
              priority
              className="relative z-10"
              style={{
                height: 48, width: 'auto', objectFit: 'contain',
                filter: isLight
                  ? 'drop-shadow(0 0 12px rgba(0,137,122,0.3))'
                  : 'drop-shadow(0 0 16px rgba(0,255,213,0.5)) drop-shadow(0 0 32px rgba(99,102,241,0.3))',
              }}
            />
            <SideBracket side="right" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-center"
          >
            <p style={{ fontFamily: ORBITRON, fontWeight: 900, fontSize: 'clamp(20px, 4vw, 26px)', letterSpacing: 2, color: messageColor, textShadow: isLight ? 'none' : `0 0 20px ${CYAN}55, 0 0 40px ${CYAN}22`, margin: 0, lineHeight: 1.1 }}>
              {message}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="mt-7">
            <div className="flex items-center justify-between mb-2" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 2, color: textMuted }}>
              <span>XP · PROGRESO</span>
              <span style={{ color: isLight ? '#00897a' : CYAN }}>
                {stepNumber.toString().padStart(2, '0')} / {totalSteps.toString().padStart(2, '0')}
              </span>
            </div>
            <div className="relative overflow-hidden" style={{ height: 6, background: xpTrack, borderRadius: 3, boxShadow: 'inset 0 0 4px rgba(0,0,0,0.3)' }}>
              <motion.div
                initial={{ width: `${((stepNumber - 1) / totalSteps) * 100}%` }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
                className="absolute top-0 left-0 h-full"
                style={{ background: `linear-gradient(90deg, ${PURPLE}, ${CYAN})`, boxShadow: `0 0 12px ${CYAN}, 0 0 20px ${CYAN}66`, borderRadius: 3 }}
              />
              <motion.div
                className="absolute top-0 h-full pointer-events-none"
                initial={{ left: '-30%' }}
                animate={{ left: '130%' }}
                transition={{ duration: 1, delay: 0.9, ease: 'easeInOut' }}
                style={{ width: '30%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  // --- Standard theme ---
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    delay: Math.random() * 0.3,
    x: (i - 6) * 15,
    color: i % 3 === 0 ? 'var(--color-primary)' : i % 3 === 1 ? '#22c55e' : 'var(--color-secondary)',
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white backdrop-blur-sm overflow-hidden"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="text-center relative"
      >
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {particles.map((p) => (
            <StandardParticle key={p.id} delay={p.delay} x={p.x} color={p.color} />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.5, times: [0, 0.6, 1] }}
          className="w-20 h-20 rounded-full bg-[#22c55e] flex items-center justify-center mx-auto mb-4 relative"
        >
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#22c55e]"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#22c55e]"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.3, type: 'spring' }}>
            <Check className="w-10 h-10 text-white" strokeWidth={3} />
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <p className="text-2xl font-bold text-neutral-800 mb-1">{message}</p>
          <p className="text-sm text-neutral-500">Paso {stepNumber} de {totalSteps} completado</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <motion.div
              key={step}
              className={`w-2 h-2 rounded-full ${step <= stepNumber ? 'bg-[#22c55e]' : 'bg-neutral-300'}`}
              initial={step === stepNumber ? { scale: 0 } : {}}
              animate={step === stepNumber ? { scale: [0, 1.5, 1] } : {}}
              transition={{ delay: 0.6 + step * 0.1 }}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default StepSuccessMessage;
