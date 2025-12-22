'use client';

import React from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { ShoppingBag, ArrowRight } from 'lucide-react';

/**
 * AccessoryIntroV6 - Hero card de impacto
 * "Lleva tu equipo completo" - máximo impacto visual
 */
export const AccessoryIntroV6: React.FC = () => {
  return (
    <Card className="mb-6 bg-[#4654CD] border-none">
      <CardBody className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                Lleva tu equipo completo
              </h2>
              <p className="text-sm text-white/80">
                Agrega accesorios a tu cuota mensual.{' '}
                <span className="text-white/60">Son opcionales.</span>
              </p>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-white/50" />
        </div>
      </CardBody>
    </Card>
  );
};

export default AccessoryIntroV6;
