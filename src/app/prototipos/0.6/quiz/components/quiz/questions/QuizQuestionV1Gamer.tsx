'use client';

/**
 * QuizQuestionV1Gamer - Chips/pills con tema gamer dark/light
 * Misma lógica que V1 pero con estética del GamerTheme.
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap, Gamepad2, Palette, Briefcase, Code,
  Wallet, CreditCard, Feather, Battery, Monitor, Zap,
  Laptop, Shuffle, Smartphone, MonitorPlay, Clock, Calendar,
  CalendarDays, Sparkles, Recycle, Check, LucideIcon,
} from 'lucide-react';
import { QuizQuestionProps } from '../../../types/quiz';
import type { GamerTheme } from '@/app/prototipos/0.6/[landing]/catalogo/components/gamer/gamerTheme';

const F_RAJ = "'Rajdhani', sans-serif";

const iconMap: Record<string, LucideIcon> = {
  GraduationCap, Gamepad2, Palette, Briefcase, Code,
  Wallet, CreditCard, Feather, Battery, Monitor, Zap,
  Laptop, Shuffle, Smartphone, MonitorPlay, Clock, Calendar,
  CalendarDays, Sparkles, Recycle,
};

interface QuizQuestionV1GamerProps extends QuizQuestionProps {
  T: GamerTheme;
  isDark: boolean;
}

export const QuizQuestionV1Gamer: React.FC<QuizQuestionV1GamerProps> = ({
  question,
  selectedOption,
  onSelect,
  T,
  isDark,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Question header */}
      <div style={{ textAlign: 'center' }}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: 16,
            background: `${T.neonCyan}14`,
            marginBottom: 12,
          }}
        >
          <Sparkles size={28} style={{ color: T.neonCyan }} />
        </motion.div>
        <h2 style={{
          fontSize: 18, fontWeight: 700, color: T.textPrimary,
          marginBottom: 6, fontFamily: F_RAJ, lineHeight: 1.3,
        }}>
          {question.question}
        </h2>
        {question.helpText && (
          <p style={{ fontSize: 13, color: T.textMuted, margin: 0, fontFamily: F_RAJ }}>
            {question.helpText}
          </p>
        )}
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
        {question.options.map((option, index) => {
          const IconComponent = iconMap[option.icon] || Laptop;
          const isSelected = selectedOption === option.id;

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(option.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', borderRadius: 999, cursor: 'pointer',
                fontFamily: F_RAJ, fontSize: 14, fontWeight: 600,
                transition: 'all 0.2s',
                background: isSelected ? T.neonCyan : 'transparent',
                color: isSelected
                  ? (isDark ? '#0a0a0a' : '#ffffff')
                  : T.textSecondary,
                border: isSelected
                  ? `2px solid ${T.neonCyan}`
                  : `2px solid ${T.border}`,
                boxShadow: isSelected
                  ? `0 0 12px ${T.neonCyan}50`
                  : 'none',
              }}
            >
              {isSelected ? (
                <motion.span initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}>
                  <Check size={16} />
                </motion.span>
              ) : (
                <IconComponent size={16} />
              )}
              <span>{option.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Description of selected option */}
      {selectedOption && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            borderRadius: 12, padding: '12px 16px', textAlign: 'center',
            background: `${T.neonCyan}14`,
            border: `1px solid ${T.neonCyan}30`,
          }}
        >
          <p style={{ fontSize: 13, color: T.neonCyan, margin: 0, fontFamily: F_RAJ, fontWeight: 500 }}>
            {question.options.find((o) => o.id === selectedOption)?.description || 'Excelente elección'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default QuizQuestionV1Gamer;
