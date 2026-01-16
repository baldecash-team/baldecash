'use client';

/**
 * DateInput - Calendario popup estilo v0.5
 * Label arriba, input con bordes redondeados, calendario en popover
 */

import React, { useState } from 'react';
import { Tooltip, Popover, PopoverTrigger, PopoverContent, Button } from '@nextui-org/react';
import { Check, AlertCircle, Info, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import type { FieldTooltipInfo } from './TextInput';

interface DateInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  success?: boolean;
  helpText?: string;
  tooltip?: FieldTooltipInfo;
  disabled?: boolean;
  required?: boolean;
  minAge?: number; // Edad mínima requerida (default 18)
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAYS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

export const DateInput: React.FC<DateInputProps> = ({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder = 'Selecciona una fecha',
  error,
  success,
  helpText,
  tooltip,
  disabled = false,
  required = true,
  minAge = 18,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value);
    const d = new Date();
    d.setFullYear(d.getFullYear() - 20);
    return d;
  });

  const showError = !!error;
  const showSuccess = success && !error && value;

  const selectedDate = value ? new Date(value) : null;

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(viewDate);

  const handlePrevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange(newDate.toISOString().split('T')[0]);
    setIsOpen(false);
    onBlur?.();
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      viewDate.getFullYear() === today.getFullYear() &&
      viewDate.getMonth() === today.getMonth() &&
      day === today.getDate()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      viewDate.getFullYear() === selectedDate.getFullYear() &&
      viewDate.getMonth() === selectedDate.getMonth() &&
      day === selectedDate.getDate()
    );
  };

  const isFutureOrTooRecent = (day: number) => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const minAgeDate = new Date();
    minAgeDate.setFullYear(minAgeDate.getFullYear() - minAge);
    return date > minAgeDate;
  };

  const getBorderColor = () => {
    if (showError) return 'border-[#ef4444]';
    if (showSuccess) return 'border-[#22c55e]';
    if (isOpen) return 'border-[#4654CD]';
    return 'border-neutral-300';
  };

  return (
    <div id={id} className="space-y-1.5">
      {/* Label */}
      <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
        {label}
        {!required && <span className="text-neutral-400 text-xs">(Opcional)</span>}
        {tooltip && (
          <Tooltip
            trigger={'press' as 'focus'}
            content={
              <div className="max-w-xs p-2">
                <p className="font-semibold text-neutral-800">{tooltip.title}</p>
                <p className="text-xs text-neutral-500 mt-1">{tooltip.description}</p>
                {tooltip.recommendation && (
                  <p className="text-xs text-[#4654CD] mt-2 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {tooltip.recommendation}
                  </p>
                )}
              </div>
            }
            classNames={{
              content: 'bg-white shadow-lg border border-neutral-200',
            }}
          >
            <span className="inline-flex">
              <Info className="w-4 h-4 text-neutral-400 hover:text-[#4654CD] cursor-help transition-colors" />
            </span>
          </Tooltip>
        )}
      </label>

      {/* Help text */}
      {helpText && (
        <p className="text-xs text-neutral-500">{helpText}</p>
      )}

      {/* Date Input with Popover */}
      <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom-start">
        <PopoverTrigger>
          <div
            className={`
              flex items-center gap-2 h-11 px-3
              rounded-lg border-2 transition-all duration-200 bg-white cursor-pointer
              ${getBorderColor()}
              ${disabled ? 'opacity-50 bg-neutral-50 cursor-not-allowed' : 'hover:border-[#4654CD]'}
            `}
            onClick={() => !disabled && setIsOpen(true)}
          >
            <Calendar className="w-4 h-4 text-neutral-400" />
            <span className={`flex-1 text-base ${value ? 'text-neutral-800' : 'text-neutral-400'}`}>
              {value ? formatDisplayDate(value) : placeholder}
            </span>

            {/* Status icons */}
            {showSuccess && <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0" />}
            {showError && <AlertCircle className="w-5 h-5 text-[#ef4444] flex-shrink-0" />}
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[280px] bg-white border border-neutral-200 shadow-xl rounded-xl">
          <div className="p-3">
            {/* Month/Year Navigation */}
            <div className="flex items-center justify-between mb-3">
              <Button isIconOnly size="sm" variant="light" onPress={handlePrevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-medium text-neutral-800">
                {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
              </span>
              <Button isIconOnly size="sm" variant="light" onPress={handleNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map(day => (
                <div key={day} className="text-center text-xs font-medium text-neutral-400 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startingDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isDisabled = isFutureOrTooRecent(day);
                const selected = isSelected(day);
                const today = isToday(day);

                return (
                  <button
                    key={day}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleSelectDay(day)}
                    className={`
                      aspect-square rounded-lg text-sm font-medium transition-all cursor-pointer
                      ${selected ? 'bg-[#4654CD] text-white' : ''}
                      ${today && !selected ? 'bg-[#4654CD]/10 text-[#4654CD]' : ''}
                      ${isDisabled ? 'text-neutral-300 cursor-not-allowed' : ''}
                      ${!selected && !today && !isDisabled ? 'text-neutral-700 hover:bg-neutral-100' : ''}
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Quick Year Selection */}
            <div className="mt-3 pt-3 border-t border-neutral-100 flex gap-2">
              {[1990, 1995, 2000, 2005].map(year => (
                <Button
                  key={year}
                  size="sm"
                  variant="flat"
                  className="flex-1 text-xs"
                  onPress={() => setViewDate(new Date(year, viewDate.getMonth(), 1))}
                >
                  {year}
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Error message */}
      {error && (
        <p className="text-sm text-[#ef4444] flex items-center gap-1">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

export default DateInput;
