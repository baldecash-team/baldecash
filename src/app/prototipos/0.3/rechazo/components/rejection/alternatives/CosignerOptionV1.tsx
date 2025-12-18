'use client';

/**
 * CosignerOptionV1 - Opción de aval prominente
 *
 * G.13 V1: Prominente con beneficios destacados
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody, Button } from '@nextui-org/react';
import { Users, Shield, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

interface CosignerOptionV1Props {
  onSelectCosigner?: () => void;
}

export const CosignerOptionV1: React.FC<CosignerOptionV1Props> = ({
  onSelectCosigner,
}) => {
  const benefits = [
    'Mayor probabilidad de aprobación',
    'Posibilidad de financiar el producto original',
    'Mismo plazo y condiciones',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardBody className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Users className="w-7 h-7 text-amber-600" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-neutral-800 text-lg">
                  ¿Tienes alguien que te respalde?
                </h3>
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>

              <p className="text-neutral-600 mb-4">
                Con un aval (codeudor), puedes acceder al financiamiento que
                necesitas. Puede ser un familiar o amigo con buen historial
                crediticio.
              </p>

              <div className="space-y-2 mb-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-neutral-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center gap-2 mb-4 bg-white/60 rounded-lg p-3">
                <Shield className="w-5 h-5 text-[#4654CD]" />
                <p className="text-xs text-neutral-600">
                  El aval solo es responsable si tú no puedes pagar. Es un
                  respaldo, no una obligación directa.
                </p>
              </div>

              <Button
                className="w-full bg-amber-500 text-white font-semibold"
                endContent={<ArrowRight className="w-4 h-4" />}
                onPress={onSelectCosigner}
              >
                Agregar un aval a mi solicitud
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default CosignerOptionV1;
