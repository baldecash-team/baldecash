'use client';

import React from 'react';
import { AlertCircle, CreditCard, Wallet, FileText, HelpCircle } from 'lucide-react';
import type { RejectionCategory } from '../../../types/rejection';

/**
 * ExplanationDetailV6 - Prominente
 * Explicación clara y visible
 * Sin esconder nada, máxima transparencia
 */

interface ExplanationDetailProps {
  category?: RejectionCategory;
}

const categoryInfo: Record<RejectionCategory, { icon: React.ReactNode; title: string; description: string }> = {
  credit: {
    icon: <CreditCard className="w-6 h-6 text-neutral-500" />,
    title: 'Historial crediticio',
    description: 'Tu historial de pagos y nivel de endeudamiento actual no cumplen con los requisitos mínimos para este financiamiento. Esto puede mejorar con el tiempo manteniendo buen comportamiento de pago.',
  },
  income: {
    icon: <Wallet className="w-6 h-6 text-neutral-500" />,
    title: 'Verificación de ingresos',
    description: 'Los ingresos que pudimos verificar no son suficientes para el monto que solicitaste. La cuota mensual superaría el 30% de tus ingresos, lo que consideramos riesgoso para ti.',
  },
  documentation: {
    icon: <FileText className="w-6 h-6 text-neutral-500" />,
    title: 'Documentación incompleta',
    description: 'Encontramos problemas con los documentos presentados: pueden estar vencidos, ser ilegibles, o tener información que no coincide. Puedes corregir esto y volver a aplicar.',
  },
  other: {
    icon: <HelpCircle className="w-6 h-6 text-neutral-500" />,
    title: 'Evaluación general',
    description: 'Nuestro sistema evalúa múltiples factores. En este momento, la combinación de estos factores no permite aprobar tu solicitud, aunque esto puede cambiar en el futuro.',
  },
};

export const ExplanationDetailV6: React.FC<ExplanationDetailProps> = ({ category = 'other' }) => {
  const info = categoryInfo[category];

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
          {info.icon}
        </div>
        <div>
          <h3 className="font-semibold text-neutral-800 mb-1">{info.title}</h3>
          <p className="text-neutral-600">{info.description}</p>
        </div>
      </div>
    </div>
  );
};
