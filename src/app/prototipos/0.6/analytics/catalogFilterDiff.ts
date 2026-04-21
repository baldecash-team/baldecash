/**
 * catalogFilterDiff - Compara dos FilterState y emite eventos de analytics
 * por cada diferencia. Se usa desde un wrapper de setFilters para no tener
 * que tocar cada componente de filtro.
 *
 * Convenciones:
 * - Arrays: emite `filter_toggle` por cada elemento agregado/quitado.
 * - Booleanos tri-estado (true/false/null): emite `filter_toggle` cuando
 *   cambia, usando value=true|false y active=(next !== null).
 * - Rangos: emite `filter_range_change` (debounced en el hook).
 * - Si next === prev, no emite nada.
 */

import type { FilterState } from '@/app/prototipos/0.6/[landing]/catalogo/types/catalog';
import type { FilterCode, UseAnalyticsReturn } from './useAnalytics';

// Campos de FilterState que son arrays de opciones. Se excluye `quotaRange`
// porque, aunque es asignable a `(string | number)[]`, es una tupla de rango
// que se emite como `filter_range_change` (sección 4), no como toggle.
type ArrayFilterKey = Exclude<
  {
    [K in keyof FilterState]: FilterState[K] extends (string | number)[] ? K : never;
  }[keyof FilterState],
  'quotaRange'
>;

type BoolTriKey = {
  [K in keyof FilterState]: FilterState[K] extends boolean | null ? K : never;
}[keyof FilterState];

// Mapping entre campo de FilterState y código de filtro para analytics.
const ARRAY_FIELD_TO_CODE: Record<ArrayFilterKey, FilterCode> = {
  deviceTypes: 'device_types',
  brands: 'brand',
  usage: 'usage',
  ram: 'ram',
  storage: 'storage',
  storageType: 'storage',
  processorBrand: 'brand',
  processorModel: 'brand',
  gpuType: 'gpu_type',
  displaySize: 'display_size',
  displayType: 'display_size',
  resolution: 'display_size',
  refreshRate: 'display_size',
  condition: 'condition',
  stock: 'stock',
  gama: 'gama',
  tags: 'tags',
};

const BOOL_FIELD_TO_CODE: Partial<Record<BoolTriKey, FilterCode>> = {
  ramExpandable: 'ram',
  touchScreen: 'display_size',
  backlitKeyboard: 'tags',
  numericKeypad: 'tags',
  fingerprint: 'tags',
  hasWindows: 'tags',
  hasThunderbolt: 'tags',
  hasEthernet: 'tags',
  hasSDCard: 'tags',
  hasHDMI: 'tags',
};

/**
 * Emite eventos por cada diferencia entre `prev` y `next`.
 * Llamar desde un wrapper de setFilters — no cambia el state, solo observa.
 */
export function diffAndEmitFilterChanges(
  prev: FilterState,
  next: FilterState,
  analytics: UseAnalyticsReturn,
  apiQuotaFullRange: [number, number]
): void {
  // 1. Arrays — diff por elemento
  for (const [key, code] of Object.entries(ARRAY_FIELD_TO_CODE) as [ArrayFilterKey, FilterCode][]) {
    const prevArr = (prev[key] || []) as readonly (string | number)[];
    const nextArr = (next[key] || []) as readonly (string | number)[];
    const prevSet = new Set(prevArr);
    const nextSet = new Set(nextArr);

    for (const value of nextArr) {
      if (!prevSet.has(value)) {
        analytics.trackFilterToggle({ filter_code: code, value, active: true });
      }
    }
    for (const value of prevArr) {
      if (!nextSet.has(value)) {
        analytics.trackFilterToggle({ filter_code: code, value, active: false });
      }
    }
  }

  // 2. Booleanos tri-estado
  for (const [key, code] of Object.entries(BOOL_FIELD_TO_CODE) as [BoolTriKey, FilterCode][]) {
    const before = prev[key];
    const after = next[key];
    if (before !== after) {
      analytics.trackFilterToggle({
        filter_code: code,
        value: after === null ? 'any' : String(after),
        active: after !== null,
      });
    }
  }

  // 3. minUSBPorts (number | null)
  if (prev.minUSBPorts !== next.minUSBPorts) {
    analytics.trackFilterToggle({
      filter_code: 'tags',
      value: next.minUSBPorts ?? 'any',
      active: next.minUSBPorts !== null,
    });
  }

  // 4. quotaRange (range)
  const [prevMin, prevMax] = prev.quotaRange;
  const [nextMin, nextMax] = next.quotaRange;
  if (prevMin !== nextMin || prevMax !== nextMax) {
    const [fullMin, fullMax] = apiQuotaFullRange;
    const isFullRange = nextMin <= fullMin && nextMax >= fullMax;
    analytics.trackFilterRangeChange({
      filter_code: 'quota_range',
      min: nextMin,
      max: nextMax,
      is_full_range: isFullRange,
    });
  }

  // 5. quotaFrequency
  if (prev.quotaFrequency !== next.quotaFrequency) {
    analytics.trackFilterToggle({
      filter_code: 'quota_range',
      value: next.quotaFrequency,
      active: true,
    });
  }
}
