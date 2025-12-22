'use client';

/**
 * NextStepsV6 - Checklist interactivo
 * Lista con checkboxes para marcar progreso (visual, no funcional)
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import type { NextStep } from '../../../types/approval';

interface NextStepsProps {
  steps: NextStep[];
}

export const NextStepsV6: React.FC<NextStepsProps> = ({ steps }) => {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set([0])); // First item pre-checked

  const toggleItem = (index: number) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedItems(newChecked);
  };

  const progress = (checkedItems.size / steps.length) * 100;

  return (
    <div className="w-full">
      {/* Header con progreso */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-800">
          Tu checklist
        </h3>
        <span className="text-sm text-neutral-500">
          {checkedItems.size}/{steps.length} completados
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden mb-6">
        <motion.div
          className="h-full bg-gradient-to-r from-[#4654CD] to-[#03DBD0]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Lista de items */}
      <div className="space-y-2">
        {steps.map((step, index) => {
          const isChecked = checkedItems.has(index);
          return (
            <motion.button
              key={index}
              onClick={() => toggleItem(index)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                isChecked
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-neutral-200 hover:border-[#4654CD]/30'
              }`}
              whileTap={{ scale: 0.98 }}
            >
              {/* Checkbox */}
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isChecked
                    ? 'bg-green-500 border-green-500'
                    : 'border-neutral-300'
                }`}
              >
                {isChecked && <Check className="w-4 h-4 text-white" />}
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <h4
                  className={`font-medium ${
                    isChecked ? 'text-green-700 line-through' : 'text-neutral-800'
                  }`}
                >
                  {step.title}
                </h4>
                <p className={`text-sm truncate ${isChecked ? 'text-green-600' : 'text-neutral-500'}`}>
                  {step.description}
                </p>
              </div>

              {/* Flecha */}
              <ChevronRight className={`w-5 h-5 ${isChecked ? 'text-green-400' : 'text-neutral-300'}`} />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default NextStepsV6;
