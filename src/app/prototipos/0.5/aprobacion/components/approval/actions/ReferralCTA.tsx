'use client';

/**
 * ReferralCTA - Call to action para referidos
 * Versión fija para v0.5: Banner prominente
 */

import React from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { Gift, ArrowRight, Sparkles } from 'lucide-react';

interface ReferralCTAProps {
  onInvite?: () => void;
}

export const ReferralCTA: React.FC<ReferralCTAProps> = ({
  onInvite,
}) => {
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
                <span className="font-bold text-purple-600">S/ 50</span> de
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
};

export default ReferralCTA;
