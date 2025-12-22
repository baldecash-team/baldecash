'use client';

/**
 * DatePickerFieldV1 - Calendario clasico en popup
 * UX: Click para abrir calendario flotante con navegacion mes/año
 */

import React, { useState } from 'react';
import { Input, Popover, PopoverTrigger, PopoverContent, Button } from '@nextui-org/react';
import { Calendar, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import type { FieldConfig } from '../../../types/wizard-solicitud';
import { getLabel } from './labels';
import { getHelpTooltip } from './HelpTooltip';

interface DatePickerFieldV1Props {
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

export const DatePickerFieldV1: React.FC<DatePickerFieldV1Props> = ({
  field,
  value,
  error,
  onChange,
  labelVersion = 1,
  helpVersion = 1,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value);
    const d = new Date();
    d.setFullYear(d.getFullYear() - 20);
    return d;
  });

  const LabelComponent = getLabel(labelVersion);
  const HelpTooltip = getHelpTooltip(helpVersion);

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
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
    return date > eighteenYearsAgo;
  };

  // V3 style: show label in placeholder
  const placeholderText = labelVersion === 3
    ? `${field.label}${field.required ? ' *' : ''}`
    : 'Selecciona una fecha';

  const datePickerContent = (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom-start">
      <PopoverTrigger>
        <div className="relative">
          <Input
            readOnly
            value={value ? formatDisplayDate(value) : ''}
            placeholder={placeholderText}
            isInvalid={!!error}
            errorMessage={error}
            isDisabled={isLoading}
            startContent={<Calendar className="w-4 h-4 text-neutral-400" />}
            endContent={isLoading ? <Loader2 className="w-4 h-4 text-[#4654CD] animate-spin" /> : undefined}
            classNames={{
              inputWrapper: `bg-neutral-50 border border-neutral-300 hover:border-[#4654CD] focus-within:border-[#4654CD] cursor-pointer shadow-none ${isOpen ? 'border-[#4654CD] ring-2 ring-[#4654CD]/20' : ''}`,
              input: 'text-neutral-800 cursor-pointer',
              errorMessage: 'text-red-500 text-xs mt-1',
            }}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[280px] bg-white border border-neutral-200 shadow-xl rounded-xl">
        <div className="p-3">
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

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(day => (
              <div key={day} className="text-center text-xs font-medium text-neutral-400 py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startingDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const disabled = isFutureOrTooRecent(day);
              const selected = isSelected(day);
              const today = isToday(day);

              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelectDay(day)}
                  className={`
                    aspect-square rounded-lg text-sm font-medium transition-all
                    ${selected ? 'bg-[#4654CD] text-white' : ''}
                    ${today && !selected ? 'bg-[#4654CD]/10 text-[#4654CD]' : ''}
                    ${disabled ? 'text-neutral-300 cursor-not-allowed' : ''}
                    ${!selected && !today && !disabled ? 'text-neutral-700 hover:bg-neutral-100' : ''}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

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
  );

  // V2: Material Design floating label - Input con padding para label flotante
  if (labelVersion === 2) {
    const hasValue = !!value;
    return (
      <div className="relative pt-2">
        <LabelComponent field={field} isFocused={isOpen} hasValue={hasValue} hasError={!!error} />
        <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom-start">
          <PopoverTrigger>
            <div className="relative">
              <Input
                readOnly
                value={value ? formatDisplayDate(value) : ''}
                placeholder=""
                isInvalid={!!error}
                isDisabled={isLoading}
                startContent={<Calendar className="w-4 h-4 text-neutral-400" />}
                endContent={isLoading ? <Loader2 className="w-4 h-4 text-[#4654CD] animate-spin" /> : undefined}
                classNames={{
                  inputWrapper: `bg-white border border-neutral-300 hover:border-[#4654CD] focus-within:border-[#4654CD] cursor-pointer shadow-none pt-4 ${isOpen ? 'border-[#4654CD] ring-2 ring-[#4654CD]/20' : ''}`,
                  input: 'text-neutral-800 cursor-pointer',
                }}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[280px] bg-white border border-neutral-200 shadow-xl rounded-xl">
            <div className="p-3">
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

              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map(day => (
                  <div key={day} className="text-center text-xs font-medium text-neutral-400 py-1">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startingDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const disabled = isFutureOrTooRecent(day);
                  const selected = isSelected(day);
                  const today = isToday(day);

                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleSelectDay(day)}
                      className={`
                        aspect-square rounded-lg text-sm font-medium transition-all
                        ${selected ? 'bg-[#4654CD] text-white' : ''}
                        ${today && !selected ? 'bg-[#4654CD]/10 text-[#4654CD]' : ''}
                        ${disabled ? 'text-neutral-300 cursor-not-allowed' : ''}
                        ${!selected && !today && !disabled ? 'text-neutral-700 hover:bg-neutral-100' : ''}
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

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
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  // V5: Horizontal layout with label on left
  if (labelVersion === 5) {
    return (
      <div className="flex items-start gap-3">
        <LabelComponent field={field} hasError={!!error} />
        <div className="flex-1">{datePickerContent}</div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  // V3: No separate label (in placeholder)
  if (labelVersion === 3) {
    return (
      <div className="space-y-1.5">
        {datePickerContent}
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
      {field.description && (
        <p className="text-xs text-neutral-500 -mt-1 mb-2">{field.description}</p>
      )}
      {datePickerContent}
    </div>
  );
};

export default DatePickerFieldV1;
