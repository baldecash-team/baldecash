'use client';

/**
 * QuizQuestionV4 - Grid de iconos compacto
 *
 * Grid compacto con iconos prominentes.
 * Bueno para muchas opciones.
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

export const QuizQuestionV4: React.FC<QuizQuestionProps> = ({
  question,
  selectedOption,
  onSelect,
}) => {
  return (
    <div className="space-y-6">
      {/* Question header */}
      <div className="text-center">
        <h2 className="text-lg sm:text-xl font-bold text-neutral-800 mb-2">
          {question.question}
        </h2>
        {question.helpText && (
          <p className="text-sm text-neutral-500">{question.helpText}</p>
        )}
      </div>

      {/* Options as compact grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
        {question.options.map((option, index) => {
          const IconComponent = iconMap[option.icon] || Laptop;
          const isSelected = selectedOption === option.id;

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(option.id)}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center p-2 cursor-pointer transition-all ${
                isSelected
                  ? 'bg-[#4654CD] text-white shadow-lg shadow-[#4654CD]/30'
                  : 'bg-white border-2 border-neutral-200 text-neutral-700 hover:border-[#4654CD]'
              }`}
            >
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-1.5 ${
                  isSelected ? 'bg-white/20' : 'bg-transparent'
                }`}
              >
                {isSelected ? (
                  <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </div>
              <span className="text-xs font-medium text-center line-clamp-2">
                {option.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Description of selected option */}
      {selectedOption && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-50 rounded-xl p-3 text-center"
        >
          <p className="text-sm text-neutral-600">
            {question.options.find((o) => o.id === selectedOption)?.description ||
              'Excelente eleccion'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default QuizQuestionV4;
