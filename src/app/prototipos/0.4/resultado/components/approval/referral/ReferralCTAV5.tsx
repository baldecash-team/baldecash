'use client';

/**
 * ReferralCTAV5 - Panel lateral
 * Referidos en sidebar no intrusivo
 */

import React, { useState } from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { Users, ChevronRight, ChevronLeft, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReferralCTAProps {
  referralCode?: string;
  rewardAmount?: number;
  onReferClick?: () => void;
}

export const ReferralCTAV5: React.FC<ReferralCTAProps> = ({
  referralCode = 'MARIA50',
  rewardAmount = 50,
  onReferClick
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40">
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ x: 280 }}
            animate={{ x: 0 }}
            exit={{ x: 280 }}
            className="w-72"
          >
            <Card className="rounded-l-xl rounded-r-none shadow-lg border-r-0">
              <CardBody className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-neutral-800">Programa de referidos</h4>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    className="cursor-pointer"
                    onPress={() => setIsExpanded(false)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-sm text-neutral-600 mb-4">
                  Gana S/{rewardAmount} por cada amigo que financie su equipo.
                </p>

                <div className="bg-neutral-100 rounded-lg p-3 mb-4">
                  <p className="text-xs text-neutral-500 mb-1">Tu código:</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#4654CD]">{referralCode}</span>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      className="cursor-pointer"
                      onPress={handleCopy}
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-neutral-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  className="w-full bg-[#4654CD] text-white cursor-pointer"
                  startContent={<Users className="w-4 h-4" />}
                  onPress={onReferClick}
                >
                  Invitar amigos
                </Button>
              </CardBody>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="collapsed"
            initial={{ x: 0 }}
            animate={{ x: 0 }}
            exit={{ x: 0 }}
          >
            <Button
              className="bg-[#4654CD] text-white rounded-l-xl rounded-r-none shadow-lg h-auto py-4 px-3 flex-col gap-2 cursor-pointer"
              onPress={() => setIsExpanded(true)}
            >
              <ChevronLeft className="w-4 h-4" />
              <Users className="w-5 h-5" />
              <span className="text-xs writing-mode-vertical">Referidos</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReferralCTAV5;
