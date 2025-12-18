'use client';

/**
 * QuizQuestionV2 - Botones grandes horizontales
 *
 * Estilo con botones horizontales de ancho completo
 * para opciones claras y faciles de tocar en movil.
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
  ChevronRight,
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

export const QuizQuestionV2: React.FC<QuizQuestionProps> = ({
  question,
  selectedOption,
  onSelect,
}) => {
  return (
    <div className="space-y-6">
      {/* Question header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-neutral-800 mb-2">
          {question.question}
        </h2>
        {question.helpText && (
          <p className="text-sm text-neutral-500">{question.helpText}</p>
        )}
      </div>

      {/* Options list */}
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const IconComponent = iconMap[option.icon] || Laptop;
          const isSelected = selectedOption === option.id;

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(option.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 text-left ${
                isSelected
                  ? 'bg-[#4654CD] text-white shadow-lg'
                  : 'bg-white border border-neutral-200 hover:border-[#4654CD] hover:bg-[#4654CD]/5'
              }`}
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-[#4654CD]/10 text-[#4654CD]'
                }`}
              >
                <IconComponent className="w-6 h-6" />
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <p
                  className={`font-semibold ${
                    isSelected ? 'text-white' : 'text-neutral-800'
                  }`}
                >
                  {option.label}
                </p>
                {option.description && (
                  <p
                    className={`text-sm mt-0.5 ${
                      isSelected ? 'text-white/80' : 'text-neutral-500'
                    }`}
                  >
                    {option.description}
                  </p>
                )}
              </div>

              {/* Right indicator */}
              <div className="flex-shrink-0">
                {isSelected ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 bg-white rounded-full flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-[#4654CD]" />
                  </motion.div>
                ) : (
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default QuizQuestionV2;
