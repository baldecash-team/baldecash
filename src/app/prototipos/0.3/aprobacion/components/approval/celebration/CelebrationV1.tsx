'use client';

/**
 * CelebrationV1 - Confetti exuberante + ilustracion feliz
 *
 * F.1 V1: Confetti animado + ilustracion feliz
 * F.2 V1: Exuberante (lluvia completa 3-5 segundos)
 */

import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles } from 'lucide-react';

interface CelebrationV1Props {
  duration?: number;
  onComplete?: () => void;
}

export const CelebrationV1: React.FC<CelebrationV1Props> = ({
  duration = 5000,
  onComplete,
}) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <>
      {/* Confetti */}
      {showConfetti && dimensions.width > 0 && (
        <Confetti
          width={dimensions.width}
          height={dimensions.height}
          recycle={false}
          numberOfPieces={300}
          gravity={0.3}
          colors={['#4654CD', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6']}
          tweenDuration={5000}
        />
      )}

      {/* Success Icon with Animation */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.2,
        }}
        className="relative"
      >
        {/* Sparkle decorations */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="absolute -top-2 -right-2"
        >
          <Sparkles className="w-6 h-6 text-amber-400" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.3 }}
          className="absolute -bottom-1 -left-3"
        >
          <Sparkles className="w-5 h-5 text-purple-400" />
        </motion.div>

        {/* Main check circle */}
        <motion.div
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(34, 197, 94, 0.4)',
              '0 0 0 20px rgba(34, 197, 94, 0)',
              '0 0 0 0 rgba(34, 197, 94, 0)',
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: 2,
            repeatDelay: 0.5,
          }}
          className="w-28 h-28 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
          >
            <CheckCircle className="w-16 h-16 text-white" strokeWidth={2.5} />
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default CelebrationV1;
