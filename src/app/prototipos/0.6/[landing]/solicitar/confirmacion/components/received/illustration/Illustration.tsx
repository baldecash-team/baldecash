'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock } from 'lucide-react';

const BALDI_CADE_WELCOME = 'https://baldecash.s3.amazonaws.com/illustrations/baldi-cade-welcome.webp';

interface IllustrationProps {
  overlayVariant?: string | null;
}

export const Illustration: React.FC<IllustrationProps> = ({ overlayVariant }) => {
  const isCade = overlayVariant === 'cade';

  if (isCade) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        className="flex justify-center mb-6 sm:mb-8"
      >
        <img
          src={BALDI_CADE_WELCOME}
          alt="Baldi CADE"
          className="h-36 sm:h-44 w-auto object-contain"
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 15,
        delay: 0.2,
      }}
      className="flex justify-center mb-6 sm:mb-8"
    >
      <div className="relative w-24 h-24 sm:w-28 sm:h-28">
        <div className="absolute inset-0 bg-[var(--color-primary)] rounded-full animate-ping opacity-25" />
        <div className="relative w-full h-full bg-[var(--color-primary)] rounded-full flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/30">
          <CheckCircle className="w-14 h-14 sm:w-16 sm:h-16 text-white" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute -top-1 -right-1 w-9 h-9 sm:w-10 sm:h-10 bg-amber-500 rounded-full flex items-center justify-center shadow-md"
        >
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Illustration;
