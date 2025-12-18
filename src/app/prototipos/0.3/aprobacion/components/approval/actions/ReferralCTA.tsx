'use client';

/**
 * ReferralCTA - Call to action para referidos
 *
 * F.13: Tres versiones
 * V1: Prominente "Invita amigos y gana"
 * V2: Sutil
 * V3: Sin opcion (en otro momento)
 */

import React from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { Users, Gift, ArrowRight, Sparkles } from 'lucide-react';
import { ApprovalConfig } from '../../../types/approval';

interface ReferralCTAProps {
  version: ApprovalConfig['referralVersion'];
  onInvite?: () => void;
}

export const ReferralCTA: React.FC<ReferralCTAProps> = ({
  version,
  onInvite,
}) => {
  // V3: No referral option
  if (version === 3) {
    return null;
  }

  // V1: Prominent referral CTA
  if (version === 1) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
          <CardBody className="p-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-neutral-800">
                    Invita amigos y gana
                  </h4>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-sm text-neutral-600 mb-3">
                  Por cada amigo que apruebe su solicitud, ambos reciben{' '}
                  <span className="font-bold text-purple-600">S/50</span> de
                  descuento en su primera cuota.
                </p>
                <Button
                  color="secondary"
                  className="bg-purple-600 text-white cursor-pointer"
                  endContent={<ArrowRight className="w-4 h-4" />}
                  onPress={onInvite}
                >
                  Invitar ahora
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    );
  }

  // V2: Subtle referral
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.9 }}
      className="text-center"
    >
      <button
        onClick={onInvite}
        className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 cursor-pointer"
      >
        <Users className="w-4 h-4" />
        <span>Invita amigos y gana descuentos</span>
        <ArrowRight className="w-3 h-3" />
      </button>
    </motion.div>
  );
};

export default ReferralCTA;
