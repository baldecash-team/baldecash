'use client';

/**
 * ExplanationV2 - Explicación detallada con factores
 *
 * G.7 V2: Detallado con factores que influyeron
 * G.9 V2: Sugerencias genéricas
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody, Progress } from '@nextui-org/react';
import { Info, AlertTriangle, Shield, Wallet } from 'lucide-react';
import { RejectionData } from '../../../types/rejection';

interface ExplanationV2Props {
  rejectionCategory: NonNullable<RejectionData['rejectionCategory']>;
  canRetryIn?: number;
}

interface Factor {
  name: string;
  icon: React.ReactNode;
  impact: 'high' | 'medium' | 'low';
  description: string;
}

const factorsByCategory: Record<string, Factor[]> = {
  credit: [
    {
      name: 'Historial de Pagos',
      icon: <Wallet className="w-4 h-4" />,
      impact: 'high',
      description: 'Se detectaron pagos tardíos en tus créditos anteriores',
    },
    {
      name: 'Nivel de Endeudamiento',
      icon: <AlertTriangle className="w-4 h-4" />,
      impact: 'medium',
      description: 'Tu ratio deuda/ingreso está por encima del límite recomendado',
    },
    {
      name: 'Antigüedad Crediticia',
      icon: <Shield className="w-4 h-4" />,
      impact: 'low',
      description: 'Tu historial crediticio es relativamente corto',
    },
  ],
  income: [
    {
      name: 'Capacidad de Pago',
      icon: <Wallet className="w-4 h-4" />,
      impact: 'high',
      description: 'Los ingresos declarados no cubren la cuota solicitada',
    },
    {
      name: 'Estabilidad Laboral',
      icon: <Shield className="w-4 h-4" />,
      impact: 'medium',
      description: 'Se requiere mayor tiempo en el empleo actual',
    },
  ],
  documentation: [
    {
      name: 'Documentos Incompletos',
      icon: <AlertTriangle className="w-4 h-4" />,
      impact: 'high',
      description: 'Faltan algunos documentos requeridos para la verificación',
    },
  ],
  other: [
    {
      name: 'Verificación Pendiente',
      icon: <Info className="w-4 h-4" />,
      impact: 'medium',
      description: 'Necesitamos validar información adicional',
    },
  ],
};

const impactColors = {
  high: 'danger',
  medium: 'warning',
  low: 'default',
} as const;

const impactValues = {
  high: 90,
  medium: 60,
  low: 30,
};

export const ExplanationV2: React.FC<ExplanationV2Props> = ({
  rejectionCategory,
  canRetryIn,
}) => {
  const factors = factorsByCategory[rejectionCategory] || factorsByCategory.other;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mb-6"
    >
      <Card className="bg-white border border-neutral-200">
        <CardBody className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-[#4654CD]" />
            <h3 className="font-semibold text-neutral-800">
              Factores que influyeron en esta decisión
            </h3>
          </div>

          <div className="space-y-4">
            {factors.map((factor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.15 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500">{factor.icon}</span>
                    <span className="text-sm font-medium text-neutral-700">
                      {factor.name}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      factor.impact === 'high'
                        ? 'bg-red-100 text-red-700'
                        : factor.impact === 'medium'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {factor.impact === 'high'
                      ? 'Alto impacto'
                      : factor.impact === 'medium'
                      ? 'Impacto medio'
                      : 'Bajo impacto'}
                  </span>
                </div>
                <Progress
                  size="sm"
                  value={impactValues[factor.impact]}
                  color={impactColors[factor.impact]}
                  className="max-w-full"
                />
                <p className="text-xs text-neutral-500 pl-6">{factor.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-200">
            <p className="text-sm text-neutral-600">
              <strong>Sugerencia:</strong> Trabaja en mejorar estos aspectos para
              aumentar tus posibilidades de aprobación en el futuro.
            </p>
            {canRetryIn && (
              <p className="text-xs text-neutral-400 mt-2">
                Tiempo estimado para nuevo intento: {canRetryIn} días
              </p>
            )}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default ExplanationV2;
