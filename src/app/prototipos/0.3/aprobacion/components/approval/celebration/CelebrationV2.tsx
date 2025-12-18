'use client';

/**
 * CelebrationV2 - Solo ilustracion grande y colorida
 *
 * F.1 V2: Solo ilustracion grande y colorida
 * F.2 V2: Sutil (burst corto 1-2 segundos)
 */

import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';
import { PartyPopper, Star, Heart } from 'lucide-react';

interface CelebrationV2Props {
  duration?: number;
  onComplete?: () => void;
}

export const CelebrationV2: React.FC<CelebrationV2Props> = ({
  duration = 2000,
  onComplete,
}) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
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
      {/* Subtle confetti burst */}
      {showConfetti && dimensions.width > 0 && (
        <Confetti
          width={dimensions.width}
          height={dimensions.height}
          recycle={false}
          numberOfPieces={100}
          gravity={0.5}
          initialVelocityY={20}
          colors={['#4654CD', '#22c55e', '#f59e0b']}
          tweenDuration={2000}
        />
      )}

      {/* Illustration with floating elements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {/* Floating decorations */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-6 -left-4"
        >
          <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, -8, 0],
            rotate: [0, -10, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.3,
          }}
          className="absolute -top-4 -right-6"
        >
          <Heart className="w-6 h-6 text-pink-400 fill-pink-400" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, -6, 0],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
          className="absolute -bottom-2 -right-4"
        >
          <Star className="w-5 h-5 text-purple-400 fill-purple-400" />
        </motion.div>

        {/* Main illustration container */}
        <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#4654CD]/10 via-purple-100 to-pink-100 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 12,
              delay: 0.3,
            }}
          >
            <PartyPopper className="w-16 h-16 text-[#4654CD]" />
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default CelebrationV2;
