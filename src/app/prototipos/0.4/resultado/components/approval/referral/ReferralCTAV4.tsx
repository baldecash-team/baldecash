'use client';

/**
 * ReferralCTAV4 - Banner animado
 * Aparece después de la celebración con animación
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@nextui-org/react';
import { Users, X, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReferralCTAProps {
  referralCode?: string;
  rewardAmount?: number;
  onReferClick?: () => void;
  delay?: number;
}

export const ReferralCTAV4: React.FC<ReferralCTAProps> = ({
  referralCode = 'MARIA50',
  rewardAmount = 50,
  onReferClick,
  delay = 3000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-40 p-4"
        >
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden">
            <div className="bg-[#4654CD]/5 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#4654CD]" />
                <span className="font-semibold text-neutral-800">Oferta especial</span>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                radius="full"
                className="cursor-pointer"
                onPress={() => setIsDismissed(true)}
              >
                <X className="w-4 h-4 text-neutral-400" />
              </Button>
            </div>

            <div className="p-4">
              <p className="text-neutral-700 mb-3">
                Gana <span className="font-bold text-[#4654CD]">S/{rewardAmount}</span> por cada amigo que se registre
              </p>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-neutral-100 rounded-lg px-3 py-2">
                  <span className="text-sm font-mono text-neutral-700">{referralCode}</span>
                </div>
                <Button
                  className="bg-[#4654CD] text-white cursor-pointer"
                  startContent={<Users className="w-4 h-4" />}
                  onPress={onReferClick}
                >
                  Invitar
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReferralCTAV4;
