'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star, Zap } from 'lucide-react';
import Image from 'next/image';

export interface GamerStepSuccessProps {
  stepName: string;
  stepNumber: number;
  totalSteps: number;
  onComplete?: () => void;
}

const getMessage = (stepNumber: number, totalSteps: number): string => {
  const progress = stepNumber / totalSteps;
  if (stepNumber === totalSteps) return '¡INFORMACIÓN COMPLETA!';
  if (stepNumber === 1) return '¡EXCELENTE INICIO!';
  if (stepNumber === totalSteps - 1) return '¡UN PASO MÁS!';
  if (totalSteps >= 4 && progress >= 0.7) return '¡YA CASI TERMINAMOS!';
  if (totalSteps >= 4 && progress >= 0.45 && progress <= 0.55) return '¡VAS POR LA MITAD!';
  if (totalSteps >= 5 && progress >= 0.2 && progress <= 0.3) return '¡BUEN AVANCE!';
  return ['¡VAS MUY BIEN!', '¡SIGUE ASÍ!', '¡BUEN TRABAJO!'][(stepNumber - 1) % 3];
};

const CYAN = '#00ffd5';
const PURPLE = '#6366f1';

const Particle: React.FC<{ delay: number; x: number; color: string }> = ({ delay, x, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 0, x, scale: 0 }}
    animate={{
      opacity: [0, 1, 1, 0],
      y: [-20, -70, -100, -130],
      x: [x, x + (Math.random() - 0.5) * 50],
      scale: [0, 1.2, 1, 0.5],
      rotate: [0, Math.random() * 360],
    }}
    transition={{ duration: 1.5, delay, ease: 'easeOut' }}
    className="absolute"
    style={{ color }}
  >
    {Math.random() > 0.6 ? (
      <Star className="w-4 h-4 fill-current" />
    ) : Math.random() > 0.3 ? (
      <Sparkles className="w-4 h-4" />
    ) : (
      <Zap className="w-4 h-4 fill-current" />
    )}
  </motion.div>
);

export const GamerStepSuccess: React.FC<GamerStepSuccessProps> = ({
  stepName,
  stepNumber,
  totalSteps,
  onComplete,
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => onComplete?.(), 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const message = getMessage(stepNumber, totalSteps);
  const particles = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    delay: Math.random() * 0.4,
    x: (i - 8) * 14,
    color: i % 3 === 0 ? CYAN : i % 3 === 1 ? PURPLE : '#a78bfa',
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: typeof window !== 'undefined' && sessionStorage.getItem('gamer-theme') === 'light' ? '#f5f5f5' : '#0e0e0e' }}
    >
      {/* Subtle glow behind center */}
      <div
        className="absolute"
        style={{
          width: 300,
          height: 300,
          background: `radial-gradient(circle, rgba(0,255,213,0.08) 0%, transparent 70%)`,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="text-center relative"
      >
        {/* Confetti particles */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {particles.map((p) => (
            <Particle key={p.id} delay={p.delay} x={p.x} color={p.color} />
          ))}
        </div>

        {/* Balde gamer logo */}
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: [0, 1.15, 1], rotate: [-15, 5, 0] }}
          transition={{ duration: 0.6, times: [0, 0.6, 1] }}
          className="relative mx-auto mb-5"
          style={{ width: 100, height: 100 }}
        >
          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: `2px solid ${CYAN}` }}
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          />
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: `2px solid ${PURPLE}` }}
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 2.8, opacity: 0 }}
            transition={{ duration: 1.2, delay: 0.5 }}
          />

          <Image
            src="/images/zona-gamer/logo baldecash/logo balde zona gamer.png"
            alt="Balde Gamer"
            width={100}
            height={100}
            className="relative z-10 drop-shadow-[0_0_20px_rgba(0,255,213,0.4)]"
            style={{ objectFit: 'contain' }}
          />
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p
            className="text-2xl font-bold mb-1"
            style={{
              fontFamily: 'Rajdhani, sans-serif',
              background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {message}
          </p>
          <p className="text-sm" style={{ color: '#707070' }}>
            Paso {stepNumber} de {totalSteps} completado
          </p>
        </motion.div>

        {/* Progress dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-2 mt-5"
        >
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <motion.div
              key={s}
              className="w-2.5 h-2.5 rounded-full"
              style={{
                background: s <= stepNumber ? CYAN : (typeof window !== 'undefined' && sessionStorage.getItem('gamer-theme') === 'light' ? '#d4d4d4' : '#2a2a2a'),
                boxShadow: s <= stepNumber ? `0 0 6px ${CYAN}` : 'none',
              }}
              initial={s === stepNumber ? { scale: 0 } : {}}
              animate={s === stepNumber ? { scale: [0, 1.5, 1] } : {}}
              transition={{ delay: 0.6 + s * 0.1 }}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default GamerStepSuccess;
