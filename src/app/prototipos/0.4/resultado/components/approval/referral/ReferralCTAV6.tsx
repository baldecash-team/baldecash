'use client';

/**
 * ReferralCTAV6 - CTA gigante
 * Acción principal destacada como hero
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { Users, ArrowRight, Sparkles, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReferralCTAProps {
  referralCode?: string;
  rewardAmount?: number;
  onReferClick?: () => void;
}

export const ReferralCTAV6: React.FC<ReferralCTAProps> = ({
  referralCode = 'MARIA50',
  rewardAmount = 50,
  onReferClick
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1 }}
      className="w-full"
    >
      <div className="relative bg-[#4654CD] rounded-2xl p-8 overflow-hidden">
        {/* Decoraciones de fondo */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 text-center">
          {/* Icono grande */}
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1
            }}
            className="w-20 h-20 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center"
          >
            <Gift className="w-10 h-10 text-white" />
          </motion.div>

          {/* Título grande */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Gana S/{rewardAmount}
          </h2>
          <p className="text-white/80 text-lg mb-2">
            por cada amigo que refieras
          </p>

          <div className="flex items-center justify-center gap-2 text-white/60 text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Sin límite de invitaciones</span>
            <Sparkles className="w-4 h-4" />
          </div>

          {/* Código prominente */}
          <div className="bg-white/20 backdrop-blur rounded-xl px-6 py-4 mb-6 inline-block">
            <p className="text-white/60 text-xs mb-1">Tu código exclusivo</p>
            <p className="text-2xl font-bold text-white tracking-wider">{referralCode}</p>
          </div>

          {/* CTA grande */}
          <Button
            size="lg"
            className="w-full max-w-xs mx-auto bg-white text-[#4654CD] font-bold text-lg h-14 cursor-pointer"
            startContent={<Users className="w-5 h-5" />}
            endContent={<ArrowRight className="w-5 h-5" />}
            onPress={onReferClick}
          >
            Invitar amigos
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ReferralCTAV6;
