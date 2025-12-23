'use client';

import React from 'react';
import { Card, CardBody, Button } from '@nextui-org/react';
import { MessageCircle, BookOpen, ArrowRight } from 'lucide-react';

interface AdvisorCTAV5Props {
  onContact?: () => void;
}

/**
 * AdvisorCTAV5 - Split Layout
 * Asesor como opción + autoservicio alternativo
 */
export const AdvisorCTAV5: React.FC<AdvisorCTAV5Props> = ({ onContact }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Opción asesor */}
      <Card className="border-2 border-[#4654CD] bg-[#4654CD]/5">
        <CardBody className="p-5">
          <div className="w-10 h-10 bg-[#4654CD]/10 rounded-lg flex items-center justify-center mb-3">
            <MessageCircle className="w-5 h-5 text-[#4654CD]" />
          </div>
          <h3 className="font-semibold text-neutral-800 mb-1">Habla con un asesor</h3>
          <p className="text-sm text-neutral-600 mb-4">
            Te ayudamos a encontrar la mejor opción para tu caso particular.
          </p>
          <Button
            className="w-full bg-[#4654CD] text-white font-semibold cursor-pointer hover:bg-[#3a47b3]"
            endContent={<ArrowRight className="w-4 h-4" />}
            onPress={onContact}
          >
            Contactar asesor
          </Button>
        </CardBody>
      </Card>

      {/* Opción autoservicio */}
      <Card className="border border-neutral-200">
        <CardBody className="p-5">
          <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5 text-neutral-600" />
          </div>
          <h3 className="font-semibold text-neutral-800 mb-1">Explora por tu cuenta</h3>
          <p className="text-sm text-neutral-600 mb-4">
            Revisa nuestras preguntas frecuentes y guías de ayuda.
          </p>
          <Button
            variant="bordered"
            className="w-full border-neutral-300 text-neutral-700 cursor-pointer hover:bg-neutral-50"
            endContent={<ArrowRight className="w-4 h-4" />}
          >
            Ver centro de ayuda
          </Button>
        </CardBody>
      </Card>
    </div>
  );
};
