'use client';

/**
 * ReferralCTAV3 - Con ilustración
 * Card con ilustración flat de grupo de amigos
 */

import React from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { Users, UserPlus, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReferralCTAProps {
  referralCode?: string;
  rewardAmount?: number;
  onReferClick?: () => void;
}

export const ReferralCTAV3: React.FC<ReferralCTAProps> = ({
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
      <Card className="border border-neutral-200">
        <CardBody className="p-6">
          <div className="flex flex-col items-center text-center">
            {/* Ilustración de grupo */}
            <div className="relative mb-6">
              <div className="flex -space-x-4">
                <div className="w-12 h-12 rounded-full bg-[#4654CD]/20 flex items-center justify-center border-2 border-white">
                  <Users className="w-5 h-5 text-[#4654CD]" />
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center border-2 border-white">
                  <UserPlus className="w-5 h-5 text-green-600" />
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center border-2 border-white">
                  <Heart className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </div>

            <h3 className="font-bold text-neutral-800 text-lg mb-2">
              Comparte con tus amigos
            </h3>
            <p className="text-neutral-500 text-sm mb-4">
              Gana S/{rewardAmount} por cada amigo que financie su laptop
            </p>

            <div className="bg-neutral-100 rounded-lg px-4 py-2 mb-4">
              <span className="text-xs text-neutral-500">Código:</span>
              <span className="text-[#4654CD] font-bold ml-2">{referralCode}</span>
            </div>

            <Button
              variant="bordered"
              className="border-[#4654CD] text-[#4654CD] cursor-pointer"
              startContent={<Users className="w-4 h-4" />}
              onPress={onReferClick}
            >
              Compartir con amigos
            </Button>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default ReferralCTAV3;
