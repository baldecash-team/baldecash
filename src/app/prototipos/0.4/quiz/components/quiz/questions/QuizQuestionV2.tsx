'use client';

/**
 * QuizQuestionV2 - Cards con iconos grandes
 *
 * Cards prominentes con iconos destacados.
 * Bueno para usuarios visuales.
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

export const QuizQuestionV2: React.FC<QuizQuestionProps> = ({
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

      {/* Options as cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? 'border-2 border-[#4654CD] shadow-lg shadow-[#4654CD]/20'
                    : 'border-2 border-transparent hover:border-[#4654CD]/30'
                }`}
              >
                <CardBody className="p-4 text-center">
                  <div
                    className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 transition-colors ${
                      isSelected
                        ? 'bg-[#4654CD] text-white'
                        : 'bg-[#4654CD]/10 text-[#4654CD]'
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <IconComponent className="w-6 h-6" />
                    )}
                  </div>
                  <h3 className="font-semibold text-sm text-neutral-800">
                    {option.label}
                  </h3>
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

export default QuizQuestionV2;
