'use client';

import React from 'react';
import { Info } from 'lucide-react';

interface AdvisorMessageV3Props {
  onContact?: () => void;
}

/**
 * AdvisorMessageV3 - Mensaje Realista
 * "No podemos garantizar, pero podemos ayudar"
 */
export const AdvisorMessageV3: React.FC<AdvisorMessageV3Props> = ({ onContact }) => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-amber-800 mb-2">
            Aunque no podemos garantizar un resultado diferente, un asesor puede ayudarte a entender mejor tu situación y explorar opciones que quizás no hayas considerado.
          </p>
          <button
            onClick={onContact}
            className="text-sm text-amber-700 font-medium hover:underline cursor-pointer"
          >
            Hablar con un asesor →
          </button>
        </div>
      </div>
    </div>
  );
};
