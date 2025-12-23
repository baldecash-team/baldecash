'use client';

/**
 * DatePickerFieldV6 - Selector basado en edad compacto
 * UX: Slider de edad + seleccion rapida de mes/dia en una sola vista
 * V6: Label flotante animado + borde estilo fintech
 */

import React, { useState, useEffect } from 'react';
import { Slider } from '@nextui-org/react';
import { Cake } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FieldConfig } from '../../../types/wizard-solicitud';
import { getLabel } from './labels';
import { getHelpTooltip } from './HelpTooltip';

interface DatePickerFieldV6Props {
  field: FieldConfig;
  value: string | undefined;
  error?: string;
  onChange: (value: string) => void;
  labelVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  helpVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  isLoading?: boolean;
}

const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MONTHS_FULL = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export const DatePickerFieldV6: React.FC<DatePickerFieldV6Props> = ({
  field,
  value,
  error,
  onChange,
  labelVersion = 1,
  helpVersion = 1,
}) => {
  const currentYear = new Date().getFullYear();

  const parseDate = (dateStr: string | undefined) => {
    if (!dateStr) return { age: 22, month: 5, day: 15 };
    const d = new Date(dateStr);
    return {
      age: currentYear - d.getFullYear(),
      month: d.getMonth(),
      day: d.getDate()
    };
  };

  const { age: initialAge, month: initialMonth, day: initialDay } = parseDate(value);
  const [age, setAge] = useState(initialAge);
  const [month, setMonth] = useState(initialMonth);
  const [day, setDay] = useState(initialDay);
  const [showDays, setShowDays] = useState(false);

  const LabelComponent = getLabel(labelVersion);
  const HelpTooltip = getHelpTooltip(helpVersion);
  const [isFocused, setIsFocused] = useState(false);

  const birthYear = currentYear - age;
  const daysInMonth = new Date(birthYear, month + 1, 0).getDate();

  // Update parent when selection changes
  useEffect(() => {
    const validDay = Math.min(day, daysInMonth);
    if (validDay !== day) setDay(validDay);
    const newDate = new Date(birthYear, month, validDay);
    onChange(newDate.toISOString().split('T')[0]);
  }, [age, month, day, birthYear, daysInMonth, onChange]);

  const getSliderContent = (withFocusHandlers = false) => (
    <div
      className={`bg-neutral-50 border-2 rounded-xl p-4 transition-all duration-200 ${
        error
          ? 'border-red-400 bg-red-50/50'
          : isFocused
            ? 'border-[#4654CD] bg-white shadow-lg shadow-[#4654CD]/10'
            : 'border-neutral-200 hover:bg-neutral-100 hover:shadow-md'
      }`}
      onFocus={() => withFocusHandlers && setIsFocused(true)}
      onBlur={() => withFocusHandlers && setIsFocused(false)}
      tabIndex={withFocusHandlers ? 0 : undefined}
    >
        {/* Age slider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#4654CD]/10 flex items-center justify-center shrink-0">
            <Cake className="w-5 h-5 text-[#4654CD]" />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold text-[#4654CD]">{age}</span>
              <span className="text-sm text-neutral-500">años</span>
            </div>
            <Slider
              size="sm"
              step={1}
              minValue={18}
              maxValue={70}
              value={age}
              onChange={(val) => setAge(val as number)}
              classNames={{
                track: 'bg-neutral-200 h-1.5',
                filler: 'bg-[#4654CD]',
                thumb: 'bg-[#4654CD] w-4 h-4 shadow-md',
              }}
            />
          </div>
        </div>

        {/* Month selector - compact */}
        <div className="mb-3">
          <p className="text-[10px] text-neutral-400 mb-1.5">Mes de nacimiento</p>
          <div className="grid grid-cols-6 gap-1">
            {MONTHS_SHORT.map((m, idx) => (
              <button
                key={m}
                onClick={() => {
                  setMonth(idx);
                  setShowDays(true);
                }}
                className={`
                  py-1.5 rounded text-xs font-medium transition-all
                  ${month === idx
                    ? 'bg-[#4654CD] text-white'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:border-[#4654CD]'
                  }
                `}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Day selector - compact grid */}
        {showDays && (
          <div className="mb-3">
            <p className="text-[10px] text-neutral-400 mb-1.5">Dia de nacimiento</p>
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const d = i + 1;
                return (
                  <button
                    key={d}
                    onClick={() => setDay(d)}
                    className={`
                      h-7 rounded text-xs font-medium transition-all
                      ${day === d
                        ? 'bg-[#4654CD] text-white'
                        : 'bg-white border border-neutral-200 text-neutral-600 hover:border-[#4654CD]'
                      }
                    `}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Result summary */}
        <div className="pt-3 border-t border-neutral-200 flex items-center justify-between">
          <span className="text-sm text-neutral-600">
            {day} de {MONTHS_FULL[month]} de {birthYear}
          </span>
          <span className="text-sm font-bold text-[#4654CD]">{age} años</span>
        </div>
      </div>
  );

  const sliderContent = getSliderContent(false);
  const hasValue = !!value;
  const showFloatingLabel = isFocused || hasValue;

  // V6: Fintech Premium con label flotante animado (igual que InputFieldV6)
  if (labelVersion === 6) {
    return (
      <div
        className="relative pt-5"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        {/* Floating Label */}
        <motion.label
          className={`absolute left-3 top-0 pointer-events-none z-10 transition-colors duration-200 bg-white px-1
            ${showFloatingLabel ? 'text-xs font-medium' : 'text-sm font-normal'}
            ${isFocused ? 'text-[#4654CD]' : 'text-neutral-500'}
            ${error ? 'text-red-500' : ''}`}
          animate={{
            top: showFloatingLabel ? -2 : 24,
            fontSize: showFloatingLabel ? '11px' : '14px'
          }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          {field.label}
          {field.required && <span className="text-red-400 ml-0.5">*</span>}
          {!field.required && showFloatingLabel && <span className="text-neutral-300 ml-1 text-[10px]">(opcional)</span>}
        </motion.label>

        {getSliderContent(true)}

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-red-500 text-xs mt-1.5 ml-1"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // V2: Material Design floating label
  if (labelVersion === 2) {
    const hasValue = !!value;
    return (
      <div className="relative pt-2">
        <LabelComponent field={field} isFocused={false} hasValue={hasValue} hasError={!!error} />
        <div className="pt-3">
          {sliderContent}
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  // V5: Horizontal layout with label on left
  if (labelVersion === 5) {
    return (
      <div className="flex items-start gap-3">
        <LabelComponent field={field} hasError={!!error} />
        <div className="flex-1">
          {sliderContent}
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      </div>
    );
  }

  // V3: Minimal label above
  if (labelVersion === 3) {
    return (
      <div className="space-y-1.5">
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
          {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
        </span>
        {sliderContent}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  // Default: Label above
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <LabelComponent field={field} hasError={!!error} />
        {field.helpText && <HelpTooltip content={field.helpText} title={field.label} />}
      </div>
      {sliderContent}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default DatePickerFieldV6;
