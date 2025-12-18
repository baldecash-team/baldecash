'use client';

/**
 * CreateAccountCTA - CTA para crear cuenta en Zona Estudiantes
 *
 * F.11: CTA secundario para crear cuenta
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { User, ArrowRight, Shield } from 'lucide-react';

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
      className="space-y-3"
    >
      {/* Primary CTA - Create account */}
      <Button
        size="lg"
        color="primary"
        className="w-full bg-[#4654CD] cursor-pointer"
        endContent={<ArrowRight className="w-5 h-5" />}
        onPress={onCreateAccount}
      >
        Crear mi cuenta
      </Button>

      {/* Benefits hint */}
      <div className="flex items-center justify-center gap-4 text-xs text-neutral-500">
        <div className="flex items-center gap-1">
          <Shield className="w-3 h-3" />
          <span>Seguimiento en tiempo real</span>
        </div>
        <div className="flex items-center gap-1">
          <User className="w-3 h-3" />
          <span>Historial de pagos</span>
        </div>
      </div>

      {/* Secondary link */}
      <button
        onClick={onGoToHome}
        className="w-full text-center text-sm text-neutral-500 hover:text-neutral-700 cursor-pointer"
      >
        Volver al inicio
      </button>
    </motion.div>
  );
};

export default CreateAccountCTA;
