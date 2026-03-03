'use client';

/**
 * QuizQuestionV1 - Chips/pills con animaciones
 * Diseño moderno con opciones como chips/pills y animaciones suaves.
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Gamepad2,
  Palette,
  Briefcase,
  Code,
  Wallet,
  CreditCard,
  Feather,
  Battery,
  Monitor,
  Zap,
  Laptop,
  Shuffle,
  Smartphone,
  MonitorPlay,
  Clock,
  Calendar,
  CalendarDays,
  Sparkles,
  Recycle,
  Check,
  LucideIcon,
} from 'lucide-react';
import { QuizQuestionProps } from '../../../types/quiz';

const iconMap: Record<string, LucideIcon> = {
  GraduationCap,
  Gamepad2,
  Palette,
  Briefcase,
  Code,
  Wallet,
  CreditCard,
  Feather,
  Battery,
  Monitor,
  Zap,
  Laptop,
  Shuffle,
  Smartphone,
  MonitorPlay,
  Clock,
  Calendar,
  CalendarDays,
  Sparkles,
  Recycle,
};

export const QuizQuestionV1: React.FC<QuizQuestionProps> = ({
  question,
  selectedOption,
  onSelect,
}) => {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Question header with visual emphasis */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl mb-4"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}
        >
          <Sparkles className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: 'var(--color-primary)' }} />
        </motion.div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-800 mb-2">
          {question.question}
        </h2>
        {question.helpText && (
          <p className="text-sm text-neutral-500">{question.helpText}</p>
        )}
      </div>

      {/* Options as visual chips/pills */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {question.options.map((option, index) => {
          const IconComponent = iconMap[option.icon] || Laptop;
          const isSelected = selectedOption === option.id;

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(option.id)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'shadow-lg'
                  : 'bg-white border-2 border-neutral-200 text-neutral-700 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
              }`}
              style={isSelected
                ? {
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    boxShadow: '0 10px 15px -3px color-mix(in srgb, var(--color-primary) 30%, transparent)'
                  }
                : undefined
              }
            >
              {isSelected ? (
                <motion.span
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                >
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.span>
              ) : (
                <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
              <span className="font-medium text-sm sm:text-base">{option.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Description of selected option */}
      {selectedOption && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-4 text-center"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 5%, transparent)' }}
        >
          <p className="text-sm" style={{ color: 'var(--color-primary)' }}>
            {question.options.find((o) => o.id === selectedOption)?.description ||
              'Excelente elección'}
          </p>
        </motion.div>
      )}

    </div>
  );
};

export default QuizQuestionV1;
