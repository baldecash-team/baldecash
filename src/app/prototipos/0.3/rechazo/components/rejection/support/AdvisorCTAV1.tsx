'use client';

/**
 * AdvisorCTAV1 - CTA prominente para hablar con asesor
 *
 * G.16 V1: Prominente con indicador de disponibilidad
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody, Button, Avatar } from '@nextui-org/react';
import { MessageCircle, Clock, Star } from 'lucide-react';

interface AdvisorCTAV1Props {
  onContactAdvisor?: () => void;
}

export const AdvisorCTAV1: React.FC<AdvisorCTAV1Props> = ({
  onContactAdvisor,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="border-2 border-[#4654CD]/20 bg-gradient-to-r from-[#4654CD]/5 to-transparent">
        <CardBody className="p-5">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar
                src="/avatars/advisor.png"
                className="w-14 h-14"
                fallback={
                  <div className="w-14 h-14 rounded-full bg-[#4654CD]/20 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-[#4654CD]" />
                  </div>
                }
              />
              {/* Online indicator */}
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-neutral-800 text-lg mb-1">
                ¿Tienes dudas? Hablemos
              </h3>

              <div className="flex items-center gap-2 text-sm text-neutral-600 mb-3">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Disponible ahora</span>
                </div>
                <span className="text-neutral-300">|</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Respuesta en ~2 min</span>
                </div>
              </div>

              <p className="text-sm text-neutral-600 mb-4">
                Un asesor puede revisar tu caso y encontrar la mejor solución
                para ti. Sin compromiso.
              </p>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-4 h-4 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                <span className="text-xs text-neutral-500">
                  4.9/5 - 1,200+ clientes satisfechos
                </span>
              </div>

              <Button
                size="lg"
                className="w-full bg-[#4654CD] text-white font-semibold"
                startContent={<MessageCircle className="w-5 h-5" />}
                onPress={onContactAdvisor}
              >
                Chatear con un asesor
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default AdvisorCTAV1;
