'use client';

/**
 * QuizQuestionV3 - Botones horizontales full-width
 *
 * Botones de ancho completo, faciles de tocar en mobile.
 * Optimizado para dispositivos tactiles.
 */

import React from 'react';
import { Button } from '@nextui-org/react';
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

export const QuizQuestionV3: React.FC<QuizQuestionProps> = ({
  question,
  selectedOption,
  onSelect,
}) => {
  return (
    <div className="space-y-6">
      {/* Question header */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-neutral-800 mb-2">
          {question.question}
        </h2>
        {question.helpText && (
          <p className="text-sm text-neutral-500">{question.helpText}</p>
        )}
      </div>

      {/* Options as full-width buttons */}
      <div className="space-y-2">
        {question.options.map((option, index) => {
          const IconComponent = iconMap[option.icon] || Laptop;
          const isSelected = selectedOption === option.id;

          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Button
                onPress={() => onSelect(option.id)}
                className={`w-full justify-start h-auto py-3 px-4 cursor-pointer ${
                  isSelected
                    ? 'bg-[#4654CD] text-white'
                    : 'bg-white border-2 border-neutral-200 text-neutral-700 hover:border-[#4654CD]'
                }`}
              >
                <div className="flex items-center gap-3 w-full">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-white/20' : 'bg-[#4654CD]/10'
                    }`}
                  >
                    {isSelected ? (
                      <Check className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#4654CD]'}`} />
                    ) : (
                      <IconComponent className="w-5 h-5 text-[#4654CD]" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">{option.label}</p>
                    {option.description && (
                      <p
                        className={`text-xs ${
                          isSelected ? 'text-white/70' : 'text-neutral-500'
                        }`}
                      >
                        {option.description}
                      </p>
                    )}
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 ${
                      isSelected ? 'text-white/50' : 'text-neutral-300'
                    }`}
                  />
                </div>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizQuestionV3;
