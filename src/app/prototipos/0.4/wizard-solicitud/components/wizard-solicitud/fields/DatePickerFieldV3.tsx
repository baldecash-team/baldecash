'use client';

/**
 * DatePickerFieldV3 - Selector compacto con 3 columnas
 * UX: Tres selectores de scroll compactos para dia, mes y año
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { FieldConfig } from '../../../types/wizard-solicitud';
import { getLabel } from './labels';
import { getHelpTooltip } from './HelpTooltip';

interface DatePickerFieldV3Props {
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

export const DatePickerFieldV3: React.FC<DatePickerFieldV3Props> = ({
  field,
  value,
  error,
  onChange,
  labelVersion = 1,
  helpVersion = 1,
}) => {
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear - 18;

  const parseDate = (dateStr: string | undefined) => {
    if (!dateStr) return { day: 15, month: 5, year: maxYear - 5 };
    const d = new Date(dateStr);
    return { day: d.getDate(), month: d.getMonth(), year: d.getFullYear() };
  };

  const { day: initialDay, month: initialMonth, year: initialYear } = parseDate(value);
  const [selectedDay, setSelectedDay] = useState(initialDay);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedYear, setSelectedYear] = useState(initialYear);

  const LabelComponent = getLabel(labelVersion);
  const HelpTooltip = getHelpTooltip(helpVersion);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);

  // Update parent when selection changes
  useEffect(() => {
    const validDay = Math.min(selectedDay, daysInMonth);
    if (validDay !== selectedDay) {
      setSelectedDay(validDay);
    }
    const newDate = new Date(selectedYear, selectedMonth, validDay);
    onChange(newDate.toISOString().split('T')[0]);
  }, [selectedDay, selectedMonth, selectedYear, daysInMonth, onChange]);

  const NumberPicker = ({
    value,
    min,
    max,
    onChange,
    format = (v: number) => String(v).padStart(2, '0'),
    label
  }: {
    value: number;
    min: number;
    max: number;
    onChange: (v: number) => void;
    format?: (v: number) => string;
    label: string;
  }) => {
    const increment = () => onChange(value >= max ? min : value + 1);
    const decrement = () => onChange(value <= min ? max : value - 1);

    return (
      <div className="flex-1 flex flex-col items-center">
        <span className="text-[10px] text-neutral-400 mb-1">{label}</span>
        <button
          type="button"
          onClick={increment}
          className="w-full h-6 flex items-center justify-center text-neutral-400 hover:text-[#4654CD] hover:bg-[#4654CD]/5 rounded transition-colors"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <div className="w-full h-10 bg-[#4654CD]/10 rounded-lg flex items-center justify-center">
          <span className="text-lg font-bold text-[#4654CD]">{format(value)}</span>
        </div>
        <button
          type="button"
          onClick={decrement}
          className="w-full h-6 flex items-center justify-center text-neutral-400 hover:text-[#4654CD] hover:bg-[#4654CD]/5 rounded transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const pickerContent = (
    <div className={`bg-neutral-50 border rounded-xl p-4 ${error ? 'border-red-500' : 'border-neutral-200'}`}>
      {/* Pickers */}
      <div className="flex gap-3">
        <NumberPicker
          value={selectedDay}
          min={1}
          max={daysInMonth}
          onChange={setSelectedDay}
          label="Dia"
        />
        <NumberPicker
          value={selectedMonth}
          min={0}
          max={11}
          onChange={setSelectedMonth}
          format={(v) => MONTHS_SHORT[v]}
          label="Mes"
        />
        <NumberPicker
          value={selectedYear}
          min={currentYear - 80}
          max={maxYear}
          onChange={setSelectedYear}
          format={(v) => String(v)}
          label="Año"
        />
      </div>

      {/* Selected date summary */}
      <div className="mt-3 pt-3 border-t border-neutral-200 flex items-center justify-between">
        <span className="text-sm text-neutral-600">
          {selectedDay} de {MONTHS_FULL[selectedMonth]} de {selectedYear}
        </span>
        <span className="text-sm font-medium text-[#4654CD]">
          {currentYear - selectedYear} años
        </span>
      </div>
    </div>
  );

  // V2: Material Design floating label
  if (labelVersion === 2) {
    const hasValue = !!value;
    return (
      <div className="relative pt-2">
        <LabelComponent field={field} isFocused={false} hasValue={hasValue} hasError={!!error} />
        <div className="pt-3">
          {pickerContent}
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
          {pickerContent}
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      </div>
    );
  }

  // V3: Minimal label above
  if (labelVersion === 3) {
    return (
      <div className="space-y-1.5">
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide inline-flex items-center gap-2">
          {field.label}
          {field.required ? (
            <span className="text-[9px] px-1 py-0.5 bg-[#4654CD]/10 text-[#4654CD] rounded font-medium leading-none normal-case">
              Requerido
            </span>
          ) : (
            <span className="text-[9px] px-1 py-0.5 bg-neutral-100 text-neutral-400 rounded font-medium leading-none normal-case">
              Opcional
            </span>
          )}
        </span>
        {pickerContent}
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
      {pickerContent}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default DatePickerFieldV3;
