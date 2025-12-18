'use client';

/**
 * QuizQuestionV3 - Estilo con escala visual
 *
 * Diseño moderno con opciones como chips/pills
 * y animaciones suaves. Ideal para preferencias.
 */

import React from 'react';
import { Chip } from '@nextui-org/react';
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

export const QuizQuestionV3: React.FC<QuizQuestionProps> = ({
  question,
  selectedOption,
  onSelect,
}) => {
  return (
    <div className="space-y-8">
      {/* Question header with visual emphasis */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-[#4654CD]/10 rounded-2xl mb-4"
        >
          <Sparkles className="w-8 h-8 text-[#4654CD]" />
        </motion.div>
        <h2 className="text-xl md:text-2xl font-bold text-neutral-800 mb-2">
          {question.question}
        </h2>
        {question.helpText && (
          <p className="text-sm text-neutral-500">{question.helpText}</p>
        )}
      </div>

      {/* Options as visual chips/pills */}
      <div className="flex flex-wrap justify-center gap-3">
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
              className={`flex items-center gap-2 px-5 py-3 rounded-full cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'bg-[#4654CD] text-white shadow-lg shadow-[#4654CD]/30'
                  : 'bg-white border-2 border-neutral-200 text-neutral-700 hover:border-[#4654CD] hover:text-[#4654CD]'
              }`}
            >
              {isSelected ? (
                <motion.span
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                >
                  <Check className="w-5 h-5" />
                </motion.span>
              ) : (
                <IconComponent className="w-5 h-5" />
              )}
              <span className="font-medium">{option.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Description of selected option */}
      {selectedOption && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#4654CD]/5 rounded-xl p-4 text-center"
        >
          <p className="text-sm text-[#4654CD]">
            {question.options.find((o) => o.id === selectedOption)?.description ||
              'Excelente eleccion'}
          </p>
        </motion.div>
      )}

      {/* Visual scale indicator (for preference-type questions) */}
      {question.options.length >= 4 && (
        <div className="flex items-center justify-between text-xs text-neutral-400 px-4">
          <span>Basico</span>
          <div className="flex-1 mx-4 h-0.5 bg-gradient-to-r from-neutral-200 via-[#4654CD]/30 to-[#4654CD]" />
          <span>Avanzado</span>
        </div>
      )}
    </div>
  );
};

export default QuizQuestionV3;
