'use client';

/**
 * DatePickerFieldV2 - Calendario inline siempre visible
 * UX: Calendario siempre visible sin popup, navegacion fluida
 * Label estilo V6: flotante animado con borde
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FieldConfig } from '../../../types/wizard-solicitud';
import { getLabel } from './labels';
import { getHelpTooltip } from './HelpTooltip';

interface DatePickerFieldV2Props {
  field: FieldConfig;
  value: string | undefined;
  error?: string;
  onChange: (value: string) => void;
  labelVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  helpVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  isLoading?: boolean;
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAYS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

export const DatePickerFieldV2: React.FC<DatePickerFieldV2Props> = ({
  field,
  value,
  error,
  onChange,
  labelVersion = 1,
  helpVersion = 1,
}) => {
  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value);
    const d = new Date();
    d.setFullYear(d.getFullYear() - 20);
    return d;
  });
  const [showYearPicker, setShowYearPicker] = useState(false);

  const LabelComponent = getLabel(labelVersion);
  const HelpTooltip = getHelpTooltip(helpVersion);

  const selectedDate = value ? new Date(value) : null;

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { daysInMonth: lastDay.getDate(), startingDay: firstDay.getDay() };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(viewDate);

  const handleSelectDay = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange(newDate.toISOString().split('T')[0]);
  };

  const isFutureOrTooRecent = (day: number) => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
    return date > eighteenYearsAgo;
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      viewDate.getFullYear() === selectedDate.getFullYear() &&
      viewDate.getMonth() === selectedDate.getMonth() &&
      day === selectedDate.getDate()
    );
  };

  // Generar años para el selector
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 60 }, (_, i) => currentYear - 18 - i);

  const calendarContent = (
    <div className={`bg-neutral-50 border rounded-xl p-3 ${error ? 'border-red-500' : 'border-neutral-200'}`}>
        {/* Header con mes/año */}
        <div className="flex items-center justify-between mb-2">
          <Button isIconOnly size="sm" variant="light" onPress={() => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <button
            onClick={() => setShowYearPicker(!showYearPicker)}
            className="flex items-center gap-1 text-sm font-semibold text-neutral-800 hover:text-[#4654CD] transition-colors"
          >
            {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            <ChevronDown className={`w-3 h-3 transition-transform ${showYearPicker ? 'rotate-180' : ''}`} />
          </button>

          <Button isIconOnly size="sm" variant="light" onPress={() => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Year picker */}
        {showYearPicker && (
          <div className="mb-2 max-h-32 overflow-y-auto grid grid-cols-5 gap-1 p-2 bg-white rounded-lg border border-neutral-200">
            {years.map(year => (
              <button
                key={year}
                onClick={() => {
                  setViewDate(new Date(year, viewDate.getMonth(), 1));
                  setShowYearPicker(false);
                }}
                className={`py-1 text-xs rounded transition-colors ${
                  year === viewDate.getFullYear()
                    ? 'bg-[#4654CD] text-white'
                    : 'hover:bg-neutral-100 text-neutral-600'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        )}

        {/* Dias de la semana */}
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {DAYS.map(day => (
            <div key={day} className="text-center text-[10px] font-medium text-neutral-400 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendario compacto */}
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: startingDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-7" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const disabled = isFutureOrTooRecent(day);
            const selected = isSelected(day);

            return (
              <button
                key={day}
                type="button"
                disabled={disabled}
                onClick={() => handleSelectDay(day)}
                className={`
                  h-7 rounded text-xs font-medium transition-all flex items-center justify-center
                  ${selected ? 'bg-[#4654CD] text-white' : ''}
                  ${disabled ? 'text-neutral-300 cursor-not-allowed' : ''}
                  ${!selected && !disabled ? 'text-neutral-700 hover:bg-[#4654CD]/10' : ''}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Selected date display - mas compacto */}
        {value && (
          <div className="mt-2 pt-2 border-t border-neutral-200 flex items-center justify-between">
            <span className="text-xs text-neutral-500">Seleccionado:</span>
            <span className="text-sm font-semibold text-[#4654CD]">
              {new Date(value).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        )}
      </div>
  );

  // V2: Material Design floating label
  if (labelVersion === 2) {
    const hasValue = !!value;
    return (
      <div className="relative pt-2">
        <LabelComponent field={field} isFocused={false} hasValue={hasValue} hasError={!!error} />
        <div className="pt-3">
          {calendarContent}
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
          {calendarContent}
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      </div>
    );
  }

  // V3: Minimal label above calendar
  if (labelVersion === 3) {
    return (
      <div className="space-y-1.5">
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
          {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
        </span>
        {calendarContent}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  // Default: Label V6 estilo fintech con borde animado
  const hasValue = !!value;
  const [isFocused, setIsFocused] = useState(false);
  const showFloatingLabel = isFocused || hasValue;

  return (
    <div className="relative">
      {/* Label V6: Flotante animado con borde */}
      <motion.div
        className={`
          border-2 rounded-xl p-4 pt-6 transition-all duration-200
          ${isFocused
            ? 'border-[#4654CD] bg-white shadow-lg shadow-[#4654CD]/10'
            : 'border-neutral-200 bg-neutral-50 shadow-sm'
          }
          ${error ? 'border-red-400 bg-red-50/50' : ''}
        `}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        {/* Label flotante */}
        <motion.label
          className={`
            absolute left-4 pointer-events-none z-10 transition-colors duration-200 px-1 bg-white
            ${showFloatingLabel ? 'text-xs font-medium' : 'text-sm font-normal'}
            ${isFocused ? 'text-[#4654CD]' : 'text-neutral-400'}
            ${error ? 'text-red-500' : ''}
          `}
          animate={{
            top: showFloatingLabel ? -8 : 16,
            fontSize: showFloatingLabel ? '11px' : '14px'
          }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          {field.label}
          {field.required && <span className="text-red-400 ml-0.5">*</span>}
          {!field.required && showFloatingLabel && (
            <span className="text-neutral-300 ml-1 text-[10px]">(opcional)</span>
          )}
        </motion.label>

        {/* Calendario inline sin icono */}
        <div className="mt-2">
          {/* Header con mes/año */}
          <div className="flex items-center justify-between mb-2">
            <Button isIconOnly size="sm" variant="light" onPress={() => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <button
              onClick={() => setShowYearPicker(!showYearPicker)}
              className="flex items-center gap-1 text-sm font-semibold text-neutral-800 hover:text-[#4654CD] transition-colors"
            >
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
              <ChevronDown className={`w-3 h-3 transition-transform ${showYearPicker ? 'rotate-180' : ''}`} />
            </button>

            <Button isIconOnly size="sm" variant="light" onPress={() => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Year picker */}
          {showYearPicker && (
            <div className="mb-2 max-h-32 overflow-y-auto grid grid-cols-5 gap-1 p-2 bg-white rounded-lg border border-neutral-200">
              {years.map(year => (
                <button
                  key={year}
                  onClick={() => {
                    setViewDate(new Date(year, viewDate.getMonth(), 1));
                    setShowYearPicker(false);
                  }}
                  className={`py-1 text-xs rounded transition-colors ${
                    year === viewDate.getFullYear()
                      ? 'bg-[#4654CD] text-white'
                      : 'hover:bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          )}

          {/* Dias de la semana */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {DAYS.map(day => (
              <div key={day} className="text-center text-[10px] font-medium text-neutral-400 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendario compacto */}
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: startingDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-7" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const disabled = isFutureOrTooRecent(day);
              const selected = isSelected(day);

              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelectDay(day)}
                  className={`
                    h-7 rounded text-xs font-medium transition-all flex items-center justify-center
                    ${selected ? 'bg-[#4654CD] text-white' : ''}
                    ${disabled ? 'text-neutral-300 cursor-not-allowed' : ''}
                    ${!selected && !disabled ? 'text-neutral-700 hover:bg-[#4654CD]/10' : ''}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Selected date display */}
          {value && (
            <div className="mt-2 pt-2 border-t border-neutral-200 flex items-center justify-between">
              <span className="text-xs text-neutral-500">Seleccionado:</span>
              <span className="text-sm font-semibold text-[#4654CD]">
                {new Date(value).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Error message */}
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
};

export default DatePickerFieldV2;
