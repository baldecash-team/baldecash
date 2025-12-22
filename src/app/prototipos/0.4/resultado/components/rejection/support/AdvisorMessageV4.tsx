'use client';

import React from 'react';
import { Card, CardBody, Button } from '@nextui-org/react';
import { MessageCircle, FileSearch, Lightbulb, ArrowRight } from 'lucide-react';

interface AdvisorMessageV4Props {
  onContact?: () => void;
}

/**
 * AdvisorMessageV4 - Promesa Específica
 * "Te ayudamos a entender tu caso"
 */
export const AdvisorMessageV4: React.FC<AdvisorMessageV4Props> = ({ onContact }) => {
  const promises = [
    { icon: FileSearch, text: 'Revisamos tu caso en detalle' },
    { icon: Lightbulb, text: 'Te explicamos qué puedes mejorar' },
    { icon: MessageCircle, text: 'Respondemos todas tus dudas' },
  ];

  return (
    <Card className="border border-[#4654CD]/20 bg-[#4654CD]/5">
      <CardBody className="p-5">
        <h3 className="font-semibold text-neutral-800 mb-3">
          Te ayudamos a entender tu caso
        </h3>

        <div className="space-y-2 mb-4">
          {promises.map((promise, index) => {
            const Icon = promise.icon;
            return (
              <div key={index} className="flex items-center gap-2 text-sm text-neutral-600">
                <Icon className="w-4 h-4 text-[#4654CD]" />
                <span>{promise.text}</span>
              </div>
            );
          })}
        </div>

        <Button
          className="w-full bg-[#4654CD] text-white font-semibold cursor-pointer hover:bg-[#3a47b3]"
          endContent={<ArrowRight className="w-4 h-4" />}
          onPress={onContact}
        >
          Hablar con un asesor
        </Button>
      </CardBody>
    </Card>
  );
};
