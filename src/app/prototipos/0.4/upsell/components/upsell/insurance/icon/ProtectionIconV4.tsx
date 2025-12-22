// ProtectionIconV4 - Escudo Animado: Escudo con efecto brillo
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

interface ProtectionIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { container: 'w-12 h-12', icon: 'w-6 h-6' },
  md: { container: 'w-16 h-16', icon: 'w-8 h-8' },
  lg: { container: 'w-24 h-24', icon: 'w-12 h-12' },
};

export const ProtectionIconV4: React.FC<ProtectionIconProps> = ({
  className = '',
  size = 'md',
}) => {
  const s = sizes[size];

  return (
    <motion.div
      animate={{
        boxShadow: [
          '0 0 0 0 rgba(70, 84, 205, 0.4)',
          '0 0 0 15px rgba(70, 84, 205, 0)',
        ],
      }}
      transition={{ duration: 2, repeat: Infinity }}
      className={`${s.container} rounded-2xl bg-[#4654CD] flex items-center justify-center relative overflow-hidden ${className}`}
    >
      <Shield className={`${s.icon} text-white relative z-10`} />

      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
      />
    </motion.div>
  );
};
