'use client';

/**
 * ExplanationDetail - Detalle accionable de la explicación
 * Versión fija para v0.5 - Estilo V3 (Accionable)
 * Enfocado en acciones positivas
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, CheckCircle2 } from 'lucide-react';
import { RejectionCategory, improvementTips } from '../../../types/rejection';

interface ExplanationDetailProps {
  category?: RejectionCategory;
}

export const ExplanationDetail: React.FC<ExplanationDetailProps> = ({
  category = 'other',
}) => {
  const tips = improvementTips[category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-[#4654CD]/5 rounded-lg p-4 mb-6 border border-[#4654CD]/10"
    >
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-5 h-5 text-[#4654CD]" />
        <h3 className="font-semibold text-neutral-800">Qué puedes hacer para mejorar</h3>
      </div>
      <ul className="space-y-2">
        {tips.map((tip, index) => (
          <li key={index} className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#4654CD] mt-0.5 flex-shrink-0" />
            <span className="text-sm text-neutral-700">{tip}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default ExplanationDetail;
