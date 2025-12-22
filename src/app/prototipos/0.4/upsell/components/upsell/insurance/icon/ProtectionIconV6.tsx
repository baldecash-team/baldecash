// ProtectionIconV6 - Hero Escudo: Escudo gigante como hero
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Check, Sparkles } from 'lucide-react';

interface ProtectionIconProps {
  className?: string;
}

export const ProtectionIconV6: React.FC<ProtectionIconProps> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Giant Shield */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative"
      >
        <div className="w-32 h-32 rounded-3xl bg-[#4654CD] flex items-center justify-center">
          <Shield className="w-16 h-16 text-white" />
        </div>

        {/* Floating badges */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-[#03DBD0] flex items-center justify-center shadow-lg"
        >
          <Check className="w-5 h-5 text-white" />
        </motion.div>

        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full bg-white border-2 border-[#4654CD] flex items-center justify-center shadow-lg"
        >
          <Sparkles className="w-4 h-4 text-[#4654CD]" />
        </motion.div>
      </motion.div>

      {/* Label */}
      <p className="mt-4 text-sm font-medium text-neutral-600">
        Protección garantizada
      </p>
    </div>
  );
};

export default ProtectionIconV6;
