'use client';

/**
 * CreateAccountCTA - CTA para crear cuenta en Zona Estudiantes
 * Versión fija para v0.5 - Estilo v0.4
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { User, ArrowRight, Home } from 'lucide-react';

interface CreateAccountCTAProps {
  onCreateAccount?: () => void;
  onGoToHome?: () => void;
}

export const CreateAccountCTA: React.FC<CreateAccountCTAProps> = ({
  onCreateAccount,
  onGoToHome,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
      className="space-y-4"
    >
      {/* Primary CTA - Create account */}
      <Button
        size="lg"
        className="w-full bg-[#4654CD] text-white font-semibold h-14 cursor-pointer"
        startContent={<User className="w-5 h-5" />}
        endContent={<ArrowRight className="w-5 h-5" />}
        onPress={onCreateAccount}
      >
        Crear mi cuenta
      </Button>

      {/* Secondary link - Home */}
      <button
        onClick={onGoToHome}
        className="w-full flex items-center justify-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 cursor-pointer transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Volver al inicio</span>
      </button>
    </motion.div>
  );
};

export default CreateAccountCTA;
