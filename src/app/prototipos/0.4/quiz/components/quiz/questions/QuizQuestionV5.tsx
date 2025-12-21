'use client';

/**
 * QuizQuestionV5 - Slider continuo (escala)
 *
 * Opciones presentadas como una escala deslizable.
 * Ideal para rangos y preferencias graduales.
 */

import React from 'react';
import { Slider } from '@nextui-org/react';
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

export const QuizQuestionV5: React.FC<QuizQuestionProps> = ({
  question,
  selectedOption,
  onSelect,
}) => {
  const selectedIndex = question.options.findIndex(o => o.id === selectedOption);
  const currentOption = selectedOption
    ? question.options.find(o => o.id === selectedOption)
    : null;
  const IconComponent = currentOption ? iconMap[currentOption.icon] || Laptop : Laptop;

  return (
    <div className="space-y-8">
      {/* Question header */}
      <div className="text-center">
        <h2 className="text-lg sm:text-xl font-bold text-neutral-800 mb-2">
          {question.question}
        </h2>
        {question.helpText && (
          <p className="text-sm text-neutral-500">{question.helpText}</p>
        )}
      </div>

      {/* Selected option display */}
      <motion.div
        key={selectedOption}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-[#4654CD]/10 to-[#4654CD]/5 rounded-2xl p-6 text-center"
      >
        <div className="w-16 h-16 mx-auto rounded-xl bg-[#4654CD] flex items-center justify-center mb-4">
          <IconComponent className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-neutral-800 mb-1">
          {currentOption?.label || 'Selecciona una opcion'}
        </h3>
        <p className="text-sm text-neutral-500">
          {currentOption?.description || 'Desliza para elegir'}
        </p>
      </motion.div>

      {/* Slider */}
      <div className="px-2">
        <Slider
          step={1}
          maxValue={question.options.length - 1}
          minValue={0}
          value={selectedIndex >= 0 ? selectedIndex : 0}
          onChange={(value) => {
            const idx = typeof value === 'number' ? value : value[0];
            onSelect(question.options[idx].id);
          }}
          classNames={{
            base: 'w-full',
            track: 'bg-neutral-200 h-2',
            filler: 'bg-[#4654CD]',
            thumb: 'bg-[#4654CD] w-6 h-6 shadow-lg',
          }}
        />

        {/* Labels */}
        <div className="flex justify-between mt-2">
          {question.options.map((option, idx) => (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={`text-xs cursor-pointer transition-colors ${
                selectedOption === option.id
                  ? 'text-[#4654CD] font-semibold'
                  : 'text-neutral-400'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizQuestionV5;
