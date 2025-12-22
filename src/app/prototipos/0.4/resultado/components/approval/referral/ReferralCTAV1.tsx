'use client';

/**
 * ReferralCTAV1 - Prominente
 * CTA grande y visible: "Invita amigos y gana S/50"
 */

import React from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { Users, Gift, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReferralCTAProps {
  referralCode?: string;
  rewardAmount?: number;
  onReferClick?: () => void;
}

export const ReferralCTAV1: React.FC<ReferralCTAProps> = ({
  referralCode = 'MARIA50',
  rewardAmount = 50,
  onReferClick
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="w-full"
    >
      <Card className="bg-gradient-to-r from-[#4654CD] to-[#5B68E0] border-none">
        <CardBody className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Gift className="w-7 h-7 text-white" />
            </div>

            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-1">
                ¡Invita amigos y gana S/{rewardAmount}!
              </h3>
              <p className="text-white/80 text-sm mb-4">
                Por cada amigo que se registre con tu código, ambos ganan un descuento.
              </p>

              <div className="bg-white/10 rounded-lg px-4 py-2 mb-4 inline-block">
                <span className="text-xs text-white/60">Tu código:</span>
                <span className="text-white font-bold ml-2">{referralCode}</span>
              </div>

              <Button
                className="w-full bg-white text-[#4654CD] font-semibold cursor-pointer"
                endContent={<ArrowRight className="w-4 h-4" />}
                onPress={onReferClick}
              >
                Invitar amigos ahora
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default ReferralCTAV1;
