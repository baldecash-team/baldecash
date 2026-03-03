'use client';

/**
 * QuizProgress - Indicador de progreso del quiz
 */

import React from 'react';
import { motion } from 'framer-motion';
import { QuizProgressProps } from '../../../types/quiz';

export const QuizProgress: React.FC<QuizProgressProps> = ({
  currentStep,
  totalSteps,
  questionText,
}) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="space-y-2">
      {/* Text indicator */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-500">
          Pregunta {currentStep + 1} de {totalSteps}
        </span>
        <span className="font-medium" style={{ color: 'var(--color-primary)' }}>{Math.round(progress)}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: 'var(--color-primary)' }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Question text preview */}
      {questionText && (
        <p className="text-xs text-neutral-400 truncate">{questionText}</p>
      )}
    </div>
  );
};

export default QuizProgress;
