'use client';

/**
 * QuizQuestionV6 - Opciones con imagenes
 *
 * Cards con imagenes representativas.
 * Mas visual e inmersivo.
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

// Background gradients for visual variety
const gradients = [
  'from-blue-500/20 to-blue-600/10',
  'from-purple-500/20 to-purple-600/10',
  'from-green-500/20 to-green-600/10',
  'from-orange-500/20 to-orange-600/10',
  'from-pink-500/20 to-pink-600/10',
  'from-cyan-500/20 to-cyan-600/10',
];

export const QuizQuestionV6: React.FC<QuizQuestionProps> = ({
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

      {/* Options as image cards */}
      <div className="grid grid-cols-2 gap-3">
        {question.options.map((option, index) => {
          const IconComponent = iconMap[option.icon] || Laptop;
          const isSelected = selectedOption === option.id;
          const gradient = gradients[index % gradients.length];

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
                className={`cursor-pointer transition-all overflow-hidden ${
                  isSelected
                    ? 'ring-2 ring-[#4654CD] ring-offset-2 shadow-lg'
                    : 'hover:shadow-md'
                }`}
              >
                <CardBody className="p-0">
                  {/* Image/gradient area */}
                  <div
                    className={`aspect-[4/3] bg-gradient-to-br ${gradient} flex items-center justify-center relative`}
                  >
                    <IconComponent
                      className={`w-12 h-12 ${
                        isSelected ? 'text-[#4654CD]' : 'text-neutral-600'
                      }`}
                    />
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-6 h-6 bg-[#4654CD] rounded-full flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </div>

                  {/* Text content */}
                  <div className="p-3">
                    <h3 className="font-semibold text-sm text-neutral-800">
                      {option.label}
                    </h3>
                    {option.description && (
                      <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                        {option.description}
                      </p>
                    )}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizQuestionV6;
