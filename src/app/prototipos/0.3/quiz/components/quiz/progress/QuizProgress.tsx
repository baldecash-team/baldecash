'use client';

/**
 * QuizProgress - Indicador de progreso del quiz
 *
 * Muestra el progreso actual del quiz con barra
 * y texto indicador.
 */

import React from 'react';
import { Progress } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { QuizProgressProps } from '../../../types/quiz';

export const QuizProgress: React.FC<QuizProgressProps> = ({
  currentStep,
  totalSteps,
  questionText,
}) => {
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="space-y-2">
      {/* Text indicator */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-500">
          Pregunta <span className="font-semibold text-neutral-700">{currentStep + 1}</span> de{' '}
          <span className="font-semibold text-neutral-700">{totalSteps}</span>
        </span>
        <span className="text-[#4654CD] font-medium">
          {Math.round(progressPercent)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative">
        <Progress
          value={progressPercent}
          classNames={{
            base: 'h-2',
            track: 'bg-neutral-100',
            indicator: 'bg-[#4654CD]',
          }}
          aria-label="Progreso del quiz"
        />
      </div>

      {/* Optional question text */}
      {questionText && (
        <motion.p
          key={questionText}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-neutral-400 text-center"
        >
          {questionText}
        </motion.p>
      )}
    </div>
  );
};

export default QuizProgress;
