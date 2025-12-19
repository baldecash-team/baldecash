'use client';

/**
 * HeroCtaV9 - Boton Animado
 *
 * Concepto: Pulse o glow attention grabber
 * Estilo: Animacion sutil pero llamativa
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@nextui-org/react';
import { Sparkles } from 'lucide-react';

interface HeroCtaV9Props {
  onCtaClick?: () => void;
}

export const HeroCtaV9: React.FC<HeroCtaV9Props> = ({ onCtaClick }) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        className="relative"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Glow Effect */}
        <motion.div
          className="absolute inset-0 bg-[#4654CD] rounded-xl blur-xl opacity-50"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Main Button */}
        <Button
          size="lg"
          className="relative bg-[#4654CD] text-white font-semibold px-12 py-6 text-lg cursor-pointer hover:bg-[#3a47b3] transition-colors shadow-lg shadow-[#4654CD]/30"
          startContent={
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              <Sparkles className="w-5 h-5" />
            </motion.div>
          }
          onPress={onCtaClick}
        >
          Solicitar mi laptop
        </Button>
      </motion.div>

      <motion.p
        className="text-sm text-neutral-500"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        ¡Más de 500 estudiantes solicitaron hoy!
      </motion.p>
    </div>
  );
};

export default HeroCtaV9;
