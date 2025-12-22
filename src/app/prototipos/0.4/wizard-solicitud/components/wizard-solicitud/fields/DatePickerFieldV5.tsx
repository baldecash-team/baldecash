'use client';

/**
 * DatePickerFieldV5 - Input con autocompletado inteligente
 * UX: Escribe la fecha en formato libre y se autocompleta
 */

import React, { useState, useMemo } from 'react';
import { Input, Listbox, ListboxItem } from '@nextui-org/react';
import { Calendar, Search, Check } from 'lucide-react';
import type { FieldConfig } from '../../../types/wizard-solicitud';
import { getLabel } from './labels';
import { getHelpTooltip } from './HelpTooltip';

interface DatePickerFieldV5Props {
  field: FieldConfig;
  value: string | undefined;
  error?: string;
  onChange: (value: string) => void;
  labelVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  helpVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  isLoading?: boolean;
}

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

const MONTHS_DISPLAY = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const DatePickerFieldV5: React.FC<DatePickerFieldV5Props> = ({
  field,
  value,
  error,
  onChange,
  labelVersion = 1,
  helpVersion = 1,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const LabelComponent = getLabel(labelVersion);
  const HelpTooltip = getHelpTooltip(helpVersion);

  const currentYear = new Date().getFullYear();
  const maxYear = currentYear - 18;

  // Parse input to generate suggestions
  const suggestions = useMemo(() => {
    const input = inputValue.toLowerCase().trim();
    if (!input) return [];

    const results: { date: Date; display: string; key: string }[] = [];

    // Try to parse different formats
    // "15 marzo 2000", "15/03/2000", "15-03-2000", "marzo 15 2000"

    // Look for numbers and month names
    const numbers = input.match(/\d+/g) || [];
    const monthMatch = MONTHS.findIndex(m => input.includes(m.substring(0, 3)));

    if (numbers && numbers.length >= 1 && numbers[0]) {
      const possibleDay = parseInt(numbers[0]);
      const possibleYear = numbers.length >= 2 && numbers[numbers.length - 1] ? parseInt(numbers[numbers.length - 1]) : null;

      // Generate suggestions for different interpretations
      for (let month = 0; month < 12; month++) {
        if (monthMatch >= 0 && month !== monthMatch) continue;

        const day = possibleDay <= 31 ? possibleDay : 15;
        const year = possibleYear && possibleYear >= 1900 && possibleYear <= maxYear
          ? possibleYear
          : maxYear - 5;

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        if (day > daysInMonth) continue;

        const date = new Date(year, month, day);
        if (date.getFullYear() > maxYear) continue;

        results.push({
          date,
          display: `${day} de ${MONTHS_DISPLAY[month]} de ${year}`,
          key: `${day}-${month}-${year}`
        });
      }
    }

    // Limit and dedupe
    const unique = results.filter((r, i, arr) =>
      arr.findIndex(x => x.key === r.key) === i
    ).slice(0, 6);

    return unique;
  }, [inputValue, maxYear]);

  const handleSelectDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('-').map(Number);
    const date = new Date(year, month, day);
    onChange(date.toISOString().split('T')[0]);
    setInputValue(`${day} de ${MONTHS_DISPLAY[month]} de ${year}`);
    setShowSuggestions(false);
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()} de ${MONTHS_DISPLAY[date.getMonth()]} de ${date.getFullYear()}`;
  };

  // Quick year buttons
  const quickYears = [1990, 1995, 2000, 2005];

  const searchContent = (
    <div className={`bg-neutral-50 border rounded-xl p-4 ${error ? 'border-red-500' : 'border-neutral-200'}`}>
        {/* Search input */}
        <div className="relative">
          <Input
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Escribe tu fecha: ej. 15 marzo 2000"
            startContent={<Search className="w-4 h-4 text-neutral-400" />}
            classNames={{
              inputWrapper: 'bg-white border border-neutral-200 shadow-none',
              input: 'text-neutral-800',
            }}
          />

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-white rounded-xl border border-neutral-200 shadow-lg overflow-hidden">
              <Listbox
                aria-label="Sugerencias de fecha"
                onAction={(key) => handleSelectDate(key as string)}
              >
                {suggestions.map((s) => (
                  <ListboxItem
                    key={s.key}
                    startContent={<Calendar className="w-4 h-4 text-[#4654CD]" />}
                    description={`${currentYear - s.date.getFullYear()} años`}
                  >
                    {s.display}
                  </ListboxItem>
                ))}
              </Listbox>
            </div>
          )}
        </div>

        {/* Quick year buttons */}
        <div className="mt-4">
          <p className="text-xs text-neutral-500 mb-2">Seleccion rapida por año:</p>
          <div className="flex gap-2">
            {quickYears.map(year => (
              <button
                key={year}
                onClick={() => {
                  setInputValue(`15 junio ${year}`);
                  setShowSuggestions(true);
                }}
                className="flex-1 py-2 text-sm font-medium rounded-lg bg-white border border-neutral-200 text-neutral-700 hover:border-[#4654CD] hover:text-[#4654CD] transition-colors"
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {/* Selected date display */}
        {value && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-[#4654CD]/10 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-[#4654CD] flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Fecha seleccionada</p>
              <p className="font-semibold text-[#4654CD]">{formatDisplayDate(value)}</p>
            </div>
          </div>
        )}
      </div>
  );

  // V2: Material Design floating label
  if (labelVersion === 2) {
    const hasValue = !!value;
    return (
      <div className="relative pt-2">
        <LabelComponent field={field} isFocused={showSuggestions} hasValue={hasValue} hasError={!!error} />
        <div className="pt-3">
          {searchContent}
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
          {searchContent}
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
        {searchContent}
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
      {searchContent}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default DatePickerFieldV5;
