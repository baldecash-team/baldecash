'use client';

/**
 * Celebration - Confetti exuberante + animación de éxito
 * Versión fija para v0.5 - Estilo v0.4
 */

import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';
import { CheckCircle, PartyPopper } from 'lucide-react';

interface CelebrationProps {
  duration?: number;
  onComplete?: () => void;
}

export const Celebration: React.FC<CelebrationProps> = ({
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
        className="relative w-28 h-28"
      >
        {/* Ping effect */}
        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-25" />

        {/* Main check circle */}
        <div className="relative w-full h-full bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
          <CheckCircle className="w-16 h-16 text-white" />
        </div>

        {/* Party Popper decoration */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute -top-2 -right-2"
        >
          <PartyPopper className="w-8 h-8 text-amber-500" />
        </motion.div>
      </motion.div>
    </>
  );
};

export default Celebration;
