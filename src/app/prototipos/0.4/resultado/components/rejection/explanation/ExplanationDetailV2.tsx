'use client';

import React from 'react';
import { AlertCircle, CreditCard, Wallet, FileText, HelpCircle } from 'lucide-react';
import type { RejectionCategory } from '../../../types/rejection';

/**
 * ExplanationDetailV2 - Categoría
 * "Relacionado con tu historial crediticio"
 * Indica el área sin detalles específicos
 */

interface ExplanationDetailProps {
  category?: RejectionCategory;
}

const categoryInfo: Record<RejectionCategory, { icon: React.ReactNode; message: string }> = {
  credit: {
    icon: <CreditCard className="w-4 h-4 text-neutral-500" />,
    message: 'Esto está relacionado con tu historial crediticio.',
  },
  income: {
    icon: <Wallet className="w-4 h-4 text-neutral-500" />,
    message: 'Esto está relacionado con la verificación de ingresos.',
  },
  documentation: {
    icon: <FileText className="w-4 h-4 text-neutral-500" />,
    message: 'Esto está relacionado con la documentación proporcionada.',
  },
  other: {
    icon: <HelpCircle className="w-4 h-4 text-neutral-500" />,
    message: 'Hay factores que no nos permiten aprobar tu solicitud en este momento.',
  },
};

export const ExplanationDetailV2: React.FC<ExplanationDetailProps> = ({ category = 'other' }) => {
  const info = categoryInfo[category];

  return (
    <div className="bg-neutral-50 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
          {info.icon}
        </div>
        <div>
          <p className="text-neutral-700">{info.message}</p>
        </div>
      </div>
    </div>
  );
};
