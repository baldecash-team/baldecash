'use client';

/**
 * ProfileIdentificationV3 - Banner sticky superior
 *
 * Caracteristicas:
 * - Banner sutil en la parte superior
 * - Dismissible (puede cerrarse)
 * - Menos intrusivo
 */

import React, { useState } from 'react';
import { GraduationCap, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfileIdentificationProps } from '../../../types/hero';

export const ProfileIdentificationV3: React.FC<ProfileIdentificationProps> = ({
  onSelectProfile,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-[#4654CD] text-white"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5" />
                <span className="text-sm">
                  Eres estudiante?{' '}
                  <button
                    onClick={() => onSelectProfile?.('student')}
                    className="font-semibold underline hover:no-underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    Accede a beneficios exclusivos
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </span>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-white/10 rounded transition-colors cursor-pointer"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileIdentificationV3;
