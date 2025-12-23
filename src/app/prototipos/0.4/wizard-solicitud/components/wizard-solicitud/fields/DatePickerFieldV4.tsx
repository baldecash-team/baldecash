'use client';

/**
 * DatePickerFieldV4 - Inputs segmentados
 * UX: Tres campos separados para dia/mes/año con validacion inteligente
 */

import React, { useState, useRef, useEffect } from 'react';
import { Select, SelectItem } from '@nextui-org/react';
import { Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import type { FieldConfig } from '../../../types/wizard-solicitud';
import { getLabel } from './labels';
import { getHelpTooltip } from './HelpTooltip';

interface DatePickerFieldV4Props {
  field: FieldConfig;
  value: string | undefined;
  error?: string;
  onChange: (value: string) => void;
  labelVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  helpVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  isLoading?: boolean;
}

const MONTHS = [
  { value: '0', label: 'Enero' },
  { value: '1', label: 'Febrero' },
  { value: '2', label: 'Marzo' },
  { value: '3', label: 'Abril' },
  { value: '4', label: 'Mayo' },
  { value: '5', label: 'Junio' },
  { value: '6', label: 'Julio' },
  { value: '7', label: 'Agosto' },
  { value: '8', label: 'Septiembre' },
  { value: '9', label: 'Octubre' },
  { value: '10', label: 'Noviembre' },
  { value: '11', label: 'Diciembre' },
];

export const DatePickerFieldV4: React.FC<DatePickerFieldV4Props> = ({
  field,
  value,
  error,
  onChange,
  labelVersion = 1,
  helpVersion = 1,
}) => {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 80;
  const maxYear = currentYear - 18;

  const parseDate = (dateStr: string | undefined) => {
    if (!dateStr) return { day: '', month: '', year: '' };
    const d = new Date(dateStr);
    return {
      day: String(d.getDate()),
      month: String(d.getMonth()),
      year: String(d.getFullYear())
    };
  };

  const { day: initialDay, month: initialMonth, year: initialYear } = parseDate(value);
  const [day, setDay] = useState(initialDay);
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);
  const [isComplete, setIsComplete] = useState(!!value);

  const LabelComponent = getLabel(labelVersion);
  const HelpTooltip = getHelpTooltip(helpVersion);

  const getDaysInMonth = (m: string, y: string) => {
    if (!m || !y) return 31;
    return new Date(parseInt(y), parseInt(m) + 1, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(month, year);
  const days = Array.from({ length: daysInMonth }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1).padStart(2, '0')
  }));

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => ({
    value: String(maxYear - i),
    label: String(maxYear - i)
  }));

  // Update parent when all fields are filled
  useEffect(() => {
    if (day && month && year) {
      const validDay = Math.min(parseInt(day), daysInMonth);
      const newDate = new Date(parseInt(year), parseInt(month), validDay);
      onChange(newDate.toISOString().split('T')[0]);
      setIsComplete(true);
    } else {
      setIsComplete(false);
    }
  }, [day, month, year, daysInMonth, onChange]);

  // Calculate age
  const calculateAge = () => {
    if (!day || !month || !year) return null;
    return currentYear - parseInt(year);
  };

  const age = calculateAge();

  const selectContent = (
    <div className={`bg-neutral-50 border rounded-xl p-4 ${error ? 'border-red-500' : 'border-neutral-200'}`}>
        {/* Icon and title */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#4654CD]/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[#4654CD]" />
          </div>
          <div>
            <p className="font-medium text-neutral-800">Tu fecha de nacimiento</p>
            <p className="text-xs text-neutral-500">Debes ser mayor de 18 años</p>
          </div>
        </div>

        {/* Selects row */}
        <div className="grid grid-cols-3 gap-3">
          <Select
            label="Dia"
            placeholder="DD"
            selectedKeys={day ? [day] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;
              setDay(selected);
            }}
            classNames={{
              trigger: 'bg-white border border-neutral-200 shadow-none',
              value: 'text-neutral-800',
            }}
          >
            {days.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </Select>

          <Select
            label="Mes"
            placeholder="Mes"
            selectedKeys={month ? [month] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;
              setMonth(selected);
            }}
            classNames={{
              trigger: 'bg-white border border-neutral-200 shadow-none',
              value: 'text-neutral-800',
            }}
          >
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </Select>

          <Select
            label="Año"
            placeholder="AAAA"
            selectedKeys={year ? [year] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;
              setYear(selected);
            }}
            classNames={{
              trigger: 'bg-white border border-neutral-200 shadow-none',
              value: 'text-neutral-800',
            }}
          >
            {years.map((y) => (
              <SelectItem key={y.value} value={y.value}>
                {y.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Status indicator */}
        {isComplete && age !== null && (
          <div className="mt-4 flex items-center justify-between p-3 bg-[#22c55e]/10 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#22c55e]" />
              <span className="text-sm font-medium text-[#22c55e]">Fecha valida</span>
            </div>
            <span className="text-sm font-bold text-neutral-800">{age} años</span>
          </div>
        )}

        {!isComplete && (day || month || year) && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <span className="text-sm text-amber-700">Completa todos los campos</span>
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
          {selectContent}
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
          {selectContent}
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
        {selectContent}
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
      {selectContent}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default DatePickerFieldV4;
