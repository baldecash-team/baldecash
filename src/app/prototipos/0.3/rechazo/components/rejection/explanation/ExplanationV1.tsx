'use client';

/**
 * ExplanationV1 - Explicación breve y directa con tips específicos
 *
 * G.7 V1: Breve y directo "Tu historial crediticio necesita fortalecerse"
 * G.9 V1: Tips específicos y accionables
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody } from '@nextui-org/react';
import { AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { RejectionData } from '../../../types/rejection';

interface ExplanationV1Props {
  rejectionCategory: NonNullable<RejectionData['rejectionCategory']>;
  canRetryIn?: number;
}

const explanationByCategory: Record<string, { title: string; tips: string[] }> = {
  credit: {
    title: 'Tu historial crediticio necesita fortalecerse',
    tips: [
      'Paga tus deudas actuales a tiempo',
      'Evita solicitar múltiples créditos',
      'Mantén tu ratio de uso de crédito bajo 30%',
    ],
  },
  income: {
    title: 'El monto solicitado supera tu capacidad actual',
    tips: [
      'Considera un producto de menor valor',
      'Aumenta tu inicial para reducir las cuotas',
      'Presenta ingresos adicionales comprobables',
    ],
  },
  documentation: {
    title: 'Necesitamos verificar tu documentación',
    tips: [
      'Asegura que tus documentos estén actualizados',
      'Verifica que las fotos sean legibles',
      'Completa todos los campos requeridos',
    ],
  },
  other: {
    title: 'Hay aspectos que necesitamos revisar',
    tips: [
      'Contacta a un asesor para más detalles',
      'Revisa que tu información esté completa',
      'Intenta de nuevo en unos días',
    ],
  },
};

export const ExplanationV1: React.FC<ExplanationV1Props> = ({
  rejectionCategory,
  canRetryIn,
}) => {
  const explanation = explanationByCategory[rejectionCategory] || explanationByCategory.other;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mb-6"
    >
      <Card className="bg-neutral-50 border border-neutral-200">
        <CardBody className="p-4">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-neutral-700 font-medium">{explanation.title}</p>
          </div>

          <div className="space-y-2 mb-4">
            <p className="text-sm text-neutral-600 font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Para mejorar tu perfil:
            </p>
            {explanation.tips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-start gap-2 pl-6"
              >
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-neutral-600">{tip}</span>
              </motion.div>
            ))}
          </div>

          {canRetryIn && (
            <p className="text-xs text-neutral-500 text-center pt-2 border-t border-neutral-200">
              Podrás intentar nuevamente en {canRetryIn} días
            </p>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default ExplanationV1;
