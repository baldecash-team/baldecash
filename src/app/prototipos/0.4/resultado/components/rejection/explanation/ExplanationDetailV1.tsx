'use client';

import React from 'react';
import { Info } from 'lucide-react';
import type { RejectionCategory } from '../../../types/rejection';

/**
 * ExplanationDetailV1 - General vago
 * "No cumples con los requisitos actuales"
 * Sin detalles específicos
 */

interface ExplanationDetailProps {
  category?: RejectionCategory;
}

export const ExplanationDetailV1: React.FC<ExplanationDetailProps> = () => {
  return (
    <div className="bg-neutral-50 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
          <Info className="w-4 h-4 text-neutral-500" />
        </div>
        <div>
          <p className="text-neutral-700">
            En este momento no cumples con los requisitos necesarios para aprobar el financiamiento.
          </p>
        </div>
      </div>
    </div>
  );
};
