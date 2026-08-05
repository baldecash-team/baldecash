'use client';

import React from 'react';
import { FilterSection } from './FilterSection';
import { FilterOption, ProductCondition } from '../../../types/catalog';

interface ConditionRadioFilterProps {
  /** Opciones de condición del API. `null` mientras no respondió. */
  conditionOptions: FilterOption[] | null;
  selectedCondition: ProductCondition[];
  onConditionChange: (condition: ProductCondition[]) => void;
  /** Equipos que hay sin filtrar por condición: es el contador de "Todos los equipos". */
  totalProducts: number;
  showCounts?: boolean;
}

/** Opción sintética: no es una condición del API, es la ausencia de filtro. */
const ALL_VALUE = '';

interface ConditionRadioProps {
  label: string;
  count: number;
  isSelected: boolean;
  onSelect: () => void;
  showCount: boolean;
}

const ConditionRadio: React.FC<ConditionRadioProps> = ({
  label,
  count,
  isSelected,
  onSelect,
  showCount,
}) => (
  <button
    type="button"
    role="radio"
    aria-checked={isSelected}
    onClick={onSelect}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
      isSelected
        ? 'bg-[rgba(var(--color-primary-rgb),0.08)]'
        : 'hover:bg-[var(--surface-2,#f3f4f6)]'
    }`}
  >
    <span
      className={`w-[19px] h-[19px] rounded-full border-2 flex-none grid place-items-center transition-colors ${
        isSelected ? 'border-[var(--color-primary)]' : 'border-[var(--border-strong,#d1d5db)]'
      }`}
    >
      <span
        className={`w-[9px] h-[9px] rounded-full bg-[var(--color-primary)] transition-transform ${
          isSelected ? 'scale-100' : 'scale-0'
        }`}
      />
    </span>

    <span
      className={`flex-1 text-sm ${
        isSelected
          ? 'font-semibold text-[var(--text-strong,#1f2937)]'
          : 'text-[var(--text,#374151)]'
      }`}
    >
      {label}
    </span>

    {showCount && (
      <span
        className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${
          isSelected
            ? 'bg-[rgba(var(--color-primary-rgb),0.14)] text-[var(--color-primary)]'
            : 'bg-[var(--surface-2,#f3f4f6)] text-[var(--text-faint,#9ca3af)]'
        }`}
      >
        {count}
      </span>
    )}
  </button>
);

/**
 * Filtro de condición como grupo de radios, con "Todos los equipos" arriba.
 *
 * Es la variante de Family Farms: reemplaza a "Destacados" en el sidebar y lleva
 * la condición al segundo lugar, que es la segunda pregunta de la atención
 * presencial ("¿lo querés nuevo o semi nuevo?"). A diferencia del filtro de
 * condición de los filtros técnicos, acá la selección es única: elegir una
 * condición reemplaza a la anterior y "Todos los equipos" la limpia.
 */
export const ConditionRadioFilter: React.FC<ConditionRadioFilterProps> = ({
  conditionOptions,
  selectedCondition,
  onConditionChange,
  totalProducts,
  showCounts = true,
}) => {
  // Con una sola condición no hay nada que elegir; la sección sobra. Mismo
  // criterio que el filtro de condición de TechnicalFiltersStyled.
  if (Array.isArray(conditionOptions) && conditionOptions.length <= 1) return null;

  // `string`, no `ProductCondition`: el enum del front dice 'nuevo'/'reacondicionado'
  // pero el facet del API manda 'nueva'/'reacondicionada' (ver utils/condition.ts).
  // El resto del catálogo resuelve el desajuste casteando; acá se hace igual.
  const selectedValue: string = selectedCondition[0] ?? ALL_VALUE;

  const select = (value: string) => {
    if (value === selectedValue) return;
    onConditionChange(value === ALL_VALUE ? [] : [value as ProductCondition]);
  };

  return (
    <FilterSection title="Estado del equipo" defaultExpanded={true} filterCode="condition">
      {conditionOptions === null ? (
        <div className="flex flex-col gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={`skel-condition-${i}`}
              className="h-10 rounded-xl bg-[var(--surface-2,#f3f4f6)] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div role="radiogroup" aria-label="Estado del equipo" className="flex flex-col gap-0.5">
          <ConditionRadio
            label="Todos los equipos"
            count={totalProducts}
            isSelected={selectedValue === ALL_VALUE}
            onSelect={() => select(ALL_VALUE)}
            showCount={showCounts}
          />
          {conditionOptions.map((opt) => (
            <ConditionRadio
              key={opt.value}
              label={opt.label}
              count={opt.count}
              isSelected={selectedValue === opt.value}
              onSelect={() => select(opt.value)}
              showCount={showCounts}
            />
          ))}
        </div>
      )}
    </FilterSection>
  );
};
