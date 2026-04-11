'use client';

/**
 * DateInput - Calendario popup estilo v0.5
 * Label arriba, input con bordes redondeados, calendario en popover
 * Click en mes/año abre selector para navegación rápida
 */

import React, { useState, useMemo } from 'react';
import { Popover, PopoverTrigger, PopoverContent, Button } from '@nextui-org/react';
import { Check, AlertCircle, Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { FieldTooltip } from './FieldTooltip';
import type { FieldTooltipInfo } from './TextInput';

interface DateInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  success?: boolean;
  helpText?: string;
  tooltip?: FieldTooltipInfo;
  disabled?: boolean;
  required?: boolean;
  minAge?: number; // Edad mínima requerida (0 = sin límite)
  defaultYearOffset?: number; // Offset de años para la vista inicial (ej: -20 para fecha de nacimiento, 0 para fecha actual)
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const MONTHS_SHORT = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

const DAYS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

// Vista del calendario: días, meses, o años
type CalendarView = 'days' | 'months' | 'years';

export const DateInput: React.FC<DateInputProps> = ({
  id,
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder = 'Selecciona una fecha',
  error,
  success,
  helpText,
  tooltip,
  disabled = false,
  required = true,
  minAge = 0,
  defaultYearOffset = -20,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [calendarView, setCalendarView] = useState<CalendarView>('days');

  // Parse date string (YYYY-MM-DD) safely to avoid timezone issues
  const parseDateString = (dateStr: string): Date => {
    return new Date(dateStr + 'T12:00:00');
  };

  const [viewDate, setViewDate] = useState(() => {
    if (value) return parseDateString(value);
    const d = new Date();
    d.setFullYear(d.getFullYear() + defaultYearOffset);
    return d;
  });

  // Para la vista de años, centrar en una década
  const [yearRangeStart, setYearRangeStart] = useState(() => {
    const year = viewDate.getFullYear();
    return Math.floor(year / 10) * 10 - 10; // Empezar una década antes
  });

  const showError = !!error;
  const showSuccess = success && !error && value;

  const selectedDate = value ? parseDateString(value) : null;

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

  const handlePrevYearRange = () => {
    setYearRangeStart(prev => prev - 20);
  };

  const handleNextYearRange = () => {
    setYearRangeStart(prev => prev + 20);
  };

  const handleSelectDay = (day: number) => {
    const year = viewDate.getFullYear();
    const month = String(viewDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    onChange(`${year}-${month}-${dayStr}`);
    setIsOpen(false);
    onBlur?.();
  };

  const handleSelectMonth = (monthIndex: number) => {
    setViewDate(new Date(viewDate.getFullYear(), monthIndex, 1));
    setCalendarView('days');
  };

  const handleSelectYear = (year: number) => {
    setViewDate(new Date(year, viewDate.getMonth(), 1));
    setCalendarView('months');
  };

  const handleHeaderClick = () => {
    if (calendarView === 'days') {
      setCalendarView('months');
    } else if (calendarView === 'months') {
      // Centrar el rango de años en el año actual de viewDate
      const year = viewDate.getFullYear();
      setYearRangeStart(Math.floor(year / 10) * 10 - 10);
      setCalendarView('years');
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
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

  // Solo bloquear fechas futuras (no se puede nacer en el futuro)
  const isFutureDate = (day: number) => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Fin del día actual
    return date > today;
  };

  const isYearDisabled = (year: number) => {
    const currentYear = new Date().getFullYear();
    return year > currentYear; // Solo bloquear años futuros
  };

  const isMonthDisabled = (monthIndex: number) => {
    const year = viewDate.getFullYear();
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Solo bloquear meses futuros del año actual
    if (year > currentYear) return true;
    if (year === currentYear && monthIndex > currentMonth) return true;
    return false;
  };

  const getBorderColor = () => {
    if (showError) return 'border-[#ef4444]';
    if (showSuccess) return 'border-[#22c55e]';
    if (isOpen) return 'border-[var(--color-primary)]';
    return 'border-neutral-300';
  };

  // Generar array de años para mostrar (20 años)
  const yearsToShow = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => yearRangeStart + i);
  }, [yearRangeStart]);

  // Resetear vista cuando se cierra el popover
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      onFocus?.();
    } else {
      onBlur?.();
      setCalendarView('days'); // Reset to days view when closing
    }
  };

  // Renderizar el header según la vista
  const renderHeader = () => {
    if (calendarView === 'years') {
      return (
        <div className="flex items-center justify-between mb-3">
          <Button isIconOnly size="sm" variant="light" onPress={handlePrevYearRange}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-medium text-neutral-800">
            {yearRangeStart} - {yearRangeStart + 19}
          </span>
          <Button isIconOnly size="sm" variant="light" onPress={handleNextYearRange}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      );
    }

    if (calendarView === 'months') {
      return (
        <div className="flex items-center justify-between mb-3">
          <Button isIconOnly size="sm" variant="light" onPress={() => setViewDate(prev => new Date(prev.getFullYear() - 1, prev.getMonth(), 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <button
            type="button"
            onClick={handleHeaderClick}
            className="font-medium text-neutral-800 hover:text-[var(--color-primary)] transition-colors cursor-pointer"
          >
            {viewDate.getFullYear()}
          </button>
          <Button isIconOnly size="sm" variant="light" onPress={() => setViewDate(prev => new Date(prev.getFullYear() + 1, prev.getMonth(), 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      );
    }

    // Vista de días
    return (
      <div className="flex items-center justify-between mb-3">
        <Button isIconOnly size="sm" variant="light" onPress={handlePrevMonth}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <button
          type="button"
          onClick={handleHeaderClick}
          className="font-medium text-neutral-800 hover:text-[var(--color-primary)] transition-colors cursor-pointer"
        >
          {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
        </button>
        <Button isIconOnly size="sm" variant="light" onPress={handleNextMonth}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  // Renderizar contenido según la vista
  const renderContent = () => {
    // Vista de años
    if (calendarView === 'years') {
      return (
        <div className="grid grid-cols-4 gap-2 w-full">
          {yearsToShow.map(year => {
            const isDisabled = isYearDisabled(year);
            const isCurrentYear = year === viewDate.getFullYear();

            return (
              <button
                key={year}
                type="button"
                disabled={isDisabled}
                onClick={() => handleSelectYear(year)}
                className={`
                  py-2 rounded-lg text-sm font-medium transition-all
                  ${isCurrentYear && !isDisabled ? 'bg-[var(--color-primary)] text-white cursor-pointer' : ''}
                  ${isDisabled ? 'text-neutral-300 cursor-not-allowed' : ''}
                  ${!isCurrentYear && !isDisabled ? 'text-neutral-700 hover:bg-neutral-100 cursor-pointer' : ''}
                `}
              >
                {year}
              </button>
            );
          })}
        </div>
      );
    }

    // Vista de meses
    if (calendarView === 'months') {
      return (
        <div className="grid grid-cols-3 gap-2 w-full">
          {MONTHS_SHORT.map((month, index) => {
            const isDisabled = isMonthDisabled(index);
            const isCurrentMonth = index === viewDate.getMonth();

            return (
              <button
                key={month}
                type="button"
                disabled={isDisabled}
                onClick={() => handleSelectMonth(index)}
                className={`
                  py-3 rounded-lg text-sm font-medium transition-all
                  ${isCurrentMonth && !isDisabled ? 'bg-[var(--color-primary)] text-white cursor-pointer' : ''}
                  ${isDisabled ? 'text-neutral-300 cursor-not-allowed' : ''}
                  ${!isCurrentMonth && !isDisabled ? 'text-neutral-700 hover:bg-neutral-100 cursor-pointer' : ''}
                `}
              >
                {month}
              </button>
            );
          })}
        </div>
      );
    }

    // Vista de días (default)
    return (
      <div className="w-full">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2 w-full">
          {DAYS.map(day => (
            <div key={day} className="text-center text-xs font-medium text-neutral-400 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1 w-full">
          {Array.from({ length: startingDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isDisabled = isFutureDate(day);
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
                  ${selected ? 'bg-[var(--color-primary)] text-white' : ''}
                  ${today && !selected ? 'bg-[rgba(var(--color-primary-rgb),0.1)] text-[var(--color-primary)]' : ''}
                  ${isDisabled ? 'text-neutral-300 cursor-not-allowed' : ''}
                  ${!selected && !today && !isDisabled ? 'text-neutral-700 hover:bg-neutral-100' : ''}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div id={id} className="space-y-1.5">
      {/* Label */}
      <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
        {label}
        {!required && <span className="text-neutral-400 text-xs">(Opcional)</span>}
        {tooltip && <FieldTooltip tooltip={tooltip} />}
      </label>

      {/* Help text */}
      {helpText && (
        <p className="text-xs text-neutral-500">{helpText}</p>
      )}

      {/* Date Input with Popover */}
      <Popover isOpen={isOpen} onOpenChange={handleOpenChange} placement="bottom-start">
        <PopoverTrigger>
          <div
            className={`
              flex items-center gap-2 h-11 px-3
              rounded-lg border-2 transition-all duration-200 bg-white cursor-pointer
              ${getBorderColor()}
              ${disabled ? 'opacity-50 bg-neutral-50 cursor-not-allowed' : 'hover:border-[var(--color-primary)]'}
            `}
            onClick={() => !disabled && setIsOpen(true)}
          >
            <Calendar className="w-4 h-4 text-neutral-400" />
            <span className={`flex-1 text-base ${value ? 'text-neutral-800' : 'text-neutral-400'}`}>
              {value ? formatDisplayDate(value) : placeholder}
            </span>

            {/* Clear button for optional fields */}
            {value && !required && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                  onBlur?.();
                }}
                className="p-0.5 rounded-full hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-600 cursor-pointer"
                aria-label="Limpiar fecha"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Status icons */}
            {showSuccess && <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0" />}
            {showError && <AlertCircle className="w-5 h-5 text-[#ef4444] flex-shrink-0" />}
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[280px] bg-white border border-neutral-200 shadow-xl rounded-xl">
          <div className="p-3 w-full">
            {renderHeader()}
            {renderContent()}

            {/* Indicador de selección - solo en vista de días */}
            {calendarView === 'days' && selectedDate && (
              <div className="mt-3 pt-3 border-t border-neutral-100">
                <p className="text-xs text-center text-neutral-500">
                  <Check className="w-3 h-3 inline mr-1 text-[#22c55e]" />
                  Seleccionado
                </p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Error message - always reserve space for alignment in multi-column grids */}
      <div className="min-h-[20px]">
        {error && (
          <p className="text-sm text-[#ef4444] flex items-center gap-1">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default DateInput;
