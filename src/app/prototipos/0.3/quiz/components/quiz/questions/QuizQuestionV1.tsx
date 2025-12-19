'use client';

/**
 * QuizQuestionV1 - Cards con iconos grandes
 *
 * Estilo visual con cards que muestran iconos prominentes
 * y texto descriptivo. Ideal para opciones visuales.
 */

import React from 'react';
import { Card, CardBody } from '@nextui-org/react';
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
    <div className="space-y-6">
      {/* Question header */}
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-bold text-neutral-800 mb-2">
          {question.question}
        </h2>
        {question.helpText && (
          <p className="text-sm text-neutral-500">{question.helpText}</p>
        )}
      </div>

      {/* Options grid - dynamic columns based on option count */}
      <div
        className={`grid gap-3 md:gap-4 ${
          question.options.length === 2
            ? 'grid-cols-2'
            : question.options.length === 3
              ? 'grid-cols-2 md:grid-cols-3'
              : question.options.length === 4
                ? 'grid-cols-2 md:grid-cols-4'
                : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
        }`}
      >
        {question.options.map((option, index) => {
          const IconComponent = iconMap[option.icon] || Laptop;
          const isSelected = selectedOption === option.id;

          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                isPressable
                onPress={() => onSelect(option.id)}
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-2 border-[#4654CD] bg-[#4654CD]/5 shadow-md'
                    : 'border border-neutral-200 hover:border-[#4654CD]/50 hover:shadow-sm'
                }`}
              >
                <CardBody className="text-center py-5 px-3 relative">
                  {/* Selected checkmark */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-5 h-5 bg-[#4654CD] rounded-full flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-white" />
                    </motion.div>
                  )}

                  {/* Icon */}
                  <div
                    className={`mx-auto mb-3 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-[#4654CD] text-white'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>

                  {/* Label */}
                  <p
                    className={`font-semibold text-sm md:text-base ${
                      isSelected ? 'text-[#4654CD]' : 'text-neutral-700'
                    }`}
                  >
                    {option.label}
                  </p>

                  {/* Description */}
                  {option.description && (
                    <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                      {option.description}
                    </p>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizQuestionV1;
