'use client';

import React from 'react';
import { Check, X, MessageCircle } from 'lucide-react';

interface AdvisorMessageV5Props {
  onContact?: () => void;
}

/**
 * AdvisorMessageV5 - Split Layout
 * Qué puede hacer el asesor + qué no
 */
export const AdvisorMessageV5: React.FC<AdvisorMessageV5Props> = ({ onContact }) => {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-200">
        {/* Lo que SÍ puede hacer */}
        <div className="p-5">
          <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
            <Check className="w-4 h-4" />
            Un asesor puede
          </h4>
          <ul className="space-y-2 text-sm text-neutral-600">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Explicar las razones de la decisión</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Explorar alternativas contigo</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Darte tips para el futuro</span>
            </li>
          </ul>
        </div>

        {/* Lo que NO puede hacer */}
        <div className="p-5 bg-neutral-50">
          <h4 className="font-semibold text-neutral-500 mb-3 flex items-center gap-2">
            <X className="w-4 h-4" />
            Lo que no puede
          </h4>
          <ul className="space-y-2 text-sm text-neutral-500">
            <li className="flex items-start gap-2">
              <X className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
              <span>Cambiar la decisión del sistema</span>
            </li>
            <li className="flex items-start gap-2">
              <X className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
              <span>Aprobar sin cumplir requisitos</span>
            </li>
            <li className="flex items-start gap-2">
              <X className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
              <span>Modificar tu historial crediticio</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-200 p-4 bg-neutral-50">
        <button
          onClick={onContact}
          className="flex items-center justify-center gap-2 w-full text-[#4654CD] font-medium cursor-pointer hover:underline"
        >
          <MessageCircle className="w-4 h-4" />
          Hablar con un asesor
        </button>
      </div>
    </div>
  );
};
