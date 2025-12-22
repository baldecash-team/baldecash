'use client';

/**
 * DatePickerField - Input con calendario popup
 * Usa el estilo de input correspondiente a cada version
 */

import React, { useState } from 'react';
import { Input, Popover, PopoverTrigger, PopoverContent, Button } from '@nextui-org/react';
import { Calendar, ChevronLeft, ChevronRight, Loader2, Check, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FieldConfig } from '../../../types/wizard-solicitud';
import { getLabel } from './labels';
import { getHelpTooltip } from './HelpTooltip';

interface DatePickerFieldProps {
  field: FieldConfig;
  value: string | undefined;
  error?: string;
  onChange: (value: string) => void;
  labelVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  helpVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  inputVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  isLoading?: boolean;
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAYS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

// Estilos de input por version
const getInputClasses = (version: number, isOpen: boolean, error: boolean) => {
  const baseClasses = {
    1: {
      inputWrapper: `bg-neutral-50 border border-neutral-300 hover:border-[#4654CD] cursor-pointer shadow-none ${isOpen ? 'border-[#4654CD] ring-2 ring-[#4654CD]/20' : ''} ${error ? 'border-red-500' : ''}`,
      input: 'text-neutral-800 cursor-pointer',
    },
    2: {
      inputWrapper: `bg-transparent border-0 border-b-2 border-neutral-300 rounded-none hover:border-[#4654CD] cursor-pointer shadow-none ${isOpen ? 'border-[#4654CD]' : ''} ${error ? 'border-red-500' : ''}`,
      input: 'text-neutral-800 cursor-pointer',
    },
    3: {
      inputWrapper: `bg-transparent border-0 border-b border-dashed border-neutral-300 rounded-none hover:border-neutral-400 cursor-pointer shadow-none py-1 ${isOpen ? 'border-[#4654CD] border-solid' : ''} ${error ? 'border-red-500' : ''}`,
      input: 'text-neutral-800 placeholder:text-neutral-400 text-lg cursor-pointer',
    },
    4: {
      inputWrapper: `bg-neutral-100 border-0 rounded-xl hover:bg-neutral-200/80 cursor-pointer shadow-none ${isOpen ? 'bg-white ring-2 ring-[#4654CD]' : ''} ${error ? 'ring-2 ring-red-500' : ''}`,
      input: 'text-neutral-800 placeholder:text-neutral-400 cursor-pointer',
    },
    5: {
      inputWrapper: `bg-white/60 backdrop-blur-sm border border-neutral-200/80 rounded-2xl hover:bg-white hover:border-neutral-300 cursor-pointer transition-all duration-200 shadow-none ${isOpen ? 'bg-white border-[#4654CD] ring-4 ring-[#4654CD]/10' : ''} ${error ? 'border-red-400 ring-4 ring-red-500/10' : ''}`,
      input: 'text-neutral-800 placeholder:text-neutral-400 cursor-pointer',
    },
    6: {
      inputWrapper: `bg-neutral-50 border-2 rounded-xl h-14 cursor-pointer transition-all duration-200 shadow-none ${isOpen ? 'border-[#4654CD] bg-white' : 'border-transparent'} ${error ? 'border-red-400 bg-red-50/50' : ''} hover:bg-neutral-100`,
      input: 'text-neutral-900 text-base placeholder:text-neutral-400 cursor-pointer',
    },
  };
  return baseClasses[version as keyof typeof baseClasses] || baseClasses[1];
};

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  field,
  value,
  error,
  onChange,
  labelVersion = 1,
  helpVersion = 1,
  inputVersion = 1,
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
  const inputClasses = getInputClasses(inputVersion, isOpen, !!error);

  const selectedDate = value ? new Date(value) : null;
  const hasValue = !!value;

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

  const placeholderText = labelVersion === 3
    ? `${field.label}${field.required ? ' *' : ''}`
    : 'Selecciona tu fecha de nacimiento';

  // Calendario popup compartido
  const calendarPopup = (
    <PopoverContent className="p-0 w-[280px] bg-white border border-neutral-200 shadow-xl rounded-xl">
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <Button isIconOnly size="sm" variant="light" onPress={() => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-medium text-neutral-800">
            {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
          </span>
          <Button isIconOnly size="sm" variant="light" onPress={() => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>
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

            return (
              <button
                key={day}
                type="button"
                disabled={disabled}
                onClick={() => handleSelectDay(day)}
                className={`
                  aspect-square rounded-lg text-sm font-medium transition-all
                  ${selected ? 'bg-[#4654CD] text-white' : ''}
                  ${disabled ? 'text-neutral-300 cursor-not-allowed' : ''}
                  ${!selected && !disabled ? 'text-neutral-700 hover:bg-neutral-100' : ''}
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
  );

  // Contenido del end para V6
  const endContentV6 = (
    <div className="flex items-center gap-2">
      {isLoading && <Loader2 className="w-4 h-4 text-[#4654CD] animate-spin" />}
      {hasValue && !error && !isLoading && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </motion.div>
      )}
      {field.helpText && (
        <button type="button" className="text-neutral-400 hover:text-[#4654CD] transition-colors" title={field.helpText}>
          <HelpCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  // V6: Estilo Fintech Premium con label flotante
  if (inputVersion === 6) {
    const showFloatingLabel = isOpen || hasValue;
    return (
      <div className="relative">
        <motion.label
          className={`absolute left-3 pointer-events-none z-10 transition-colors duration-200
            ${showFloatingLabel ? 'text-xs font-medium' : 'text-sm font-normal'}
            ${isOpen ? 'text-[#4654CD]' : 'text-neutral-400'} ${error ? 'text-red-500' : ''}`}
          animate={{
            top: showFloatingLabel ? 6 : '50%',
            y: showFloatingLabel ? 0 : '-50%',
            fontSize: showFloatingLabel ? '11px' : '14px'
          }}
          transition={{ duration: 0.15, ease: 'easeOut' }}>
          {field.label}{field.required && <span className="text-red-400 ml-0.5">*</span>}
        </motion.label>
        <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom-start">
          <PopoverTrigger>
            <div className="relative">
              <Input
                readOnly
                value={value ? formatDisplayDate(value) : ''}
                placeholder=""
                isInvalid={!!error}
                isDisabled={isLoading}
                size="lg"
                classNames={{
                  ...inputClasses,
                  inputWrapper: `${inputClasses.inputWrapper} pt-4`,
                  input: `${inputClasses.input} mt-1`,
                }}
                endContent={endContentV6}
              />
            </div>
          </PopoverTrigger>
          {calendarPopup}
        </Popover>
        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              className="text-red-500 text-xs mt-1.5 ml-1">{error}</motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // V2: Material Design floating label
  if (labelVersion === 2) {
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
                size={inputVersion === 5 ? 'lg' : 'md'}
                startContent={<Calendar className="w-4 h-4 text-neutral-400" />}
                endContent={isLoading ? <Loader2 className="w-4 h-4 text-[#4654CD] animate-spin" /> : undefined}
                classNames={{
                  ...inputClasses,
                  inputWrapper: `${inputClasses.inputWrapper} pt-3`,
                }}
              />
            </div>
          </PopoverTrigger>
          {calendarPopup}
        </Popover>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  // V5: Horizontal layout with label on left
  if (labelVersion === 5) {
    return (
      <div className="flex items-start gap-3">
        <LabelComponent field={field} isFocused={isOpen} hasValue={hasValue} hasError={!!error} />
        <div className="flex-1">
          <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom-start">
            <PopoverTrigger>
              <div className="relative">
                <Input
                  readOnly
                  value={value ? formatDisplayDate(value) : ''}
                  placeholder={placeholderText}
                  isInvalid={!!error}
                  isDisabled={isLoading}
                  size={inputVersion === 5 ? 'lg' : 'md'}
                  startContent={<Calendar className="w-4 h-4 text-neutral-400" />}
                  endContent={isLoading ? <Loader2 className="w-4 h-4 text-[#4654CD] animate-spin" /> : undefined}
                  classNames={inputClasses}
                />
              </div>
            </PopoverTrigger>
            {calendarPopup}
          </Popover>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      </div>
    );
  }

  // V3: No separate label (in placeholder)
  if (labelVersion === 3) {
    return (
      <div className="space-y-1.5">
        <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom-start">
          <PopoverTrigger>
            <div className="relative">
              <Input
                readOnly
                value={value ? formatDisplayDate(value) : ''}
                placeholder={placeholderText}
                isInvalid={!!error}
                isDisabled={isLoading}
                size={inputVersion === 5 ? 'lg' : 'md'}
                startContent={<Calendar className="w-4 h-4 text-neutral-400" />}
                endContent={isLoading ? <Loader2 className="w-4 h-4 text-[#4654CD] animate-spin" /> : undefined}
                classNames={inputClasses}
              />
            </div>
          </PopoverTrigger>
          {calendarPopup}
        </Popover>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  // Default: Label above
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <LabelComponent field={field} isFocused={isOpen} hasValue={hasValue} hasError={!!error} />
        {field.helpText && <HelpTooltip content={field.helpText} title={field.label} />}
      </div>
      <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom-start">
        <PopoverTrigger>
          <div className="relative">
            <Input
              readOnly
              value={value ? formatDisplayDate(value) : ''}
              placeholder={field.placeholder || 'Selecciona tu fecha de nacimiento'}
              isInvalid={!!error}
              isDisabled={isLoading}
              size={inputVersion === 5 ? 'lg' : 'md'}
              startContent={<Calendar className="w-4 h-4 text-neutral-400" />}
              endContent={isLoading ? <Loader2 className="w-4 h-4 text-[#4654CD] animate-spin" /> : undefined}
              classNames={inputClasses}
            />
          </div>
        </PopoverTrigger>
        {calendarPopup}
      </Popover>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default DatePickerField;
