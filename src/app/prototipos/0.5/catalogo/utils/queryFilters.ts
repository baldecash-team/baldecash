/**
 * Query Params <-> Filters utilities
 * Sincroniza filtros del catálogo con la URL
 */

import {
  FilterState,
  defaultFilterState,
  SortOption,
  UsageType,
  GamaTier,
  CatalogDeviceType,
} from '../types/catalog';

// Filtros que se sincronizan con la URL
type SyncedFilterKey =
  | 'deviceTypes'
  | 'brands'
  | 'usage'
  | 'priceRange'
  | 'quotaRange'
  | 'ram'
  | 'storage'
  | 'gama';

// Mapeo de query param name -> filter key
const PARAM_MAP: Record<string, SyncedFilterKey> = {
  device: 'deviceTypes',
  brand: 'brands',
  usage: 'usage',
  price: 'priceRange',
  quota: 'quotaRange',
  ram: 'ram',
  storage: 'storage',
  gama: 'gama',
};

/**
 * Parsea los query params de la URL y retorna filtros parciales
 */
export const parseFiltersFromParams = (
  searchParams: URLSearchParams
): Partial<FilterState> & { sort?: SortOption } => {
  const filters: Partial<FilterState> & { sort?: SortOption } = {};

  // Device types (array de strings)
  const device = searchParams.get('device');
  if (device) {
    filters.deviceTypes = device.split(',').filter(Boolean) as CatalogDeviceType[];
  }

  // Brands (array de strings)
  const brand = searchParams.get('brand');
  if (brand) {
    filters.brands = brand.split(',').filter(Boolean);
  }

  // Usage (array de strings)
  const usage = searchParams.get('usage');
  if (usage) {
    // Mapear valores del quiz a valores del catálogo
    const usageMap: Record<string, UsageType> = {
      estudios: 'estudios',
      study: 'estudios',
      gaming: 'gaming',
      diseno: 'diseño',
      design: 'diseño',
      oficina: 'oficina',
      office: 'oficina',
      programacion: 'programacion',
      coding: 'programacion',
      // Valores directos del catálogo
      'diseño': 'diseño',
    };
    filters.usage = usage
      .split(',')
      .map((u) => usageMap[u.toLowerCase()] || u)
      .filter(Boolean) as UsageType[];
  }

  // Price range (formato: min-max)
  const price = searchParams.get('price');
  if (price) {
    const [min, max] = price.split('-').map(Number);
    if (!isNaN(min) && !isNaN(max)) {
      filters.priceRange = [min, max];
    }
  }

  // Quota range (formato: min-max)
  const quota = searchParams.get('quota');
  if (quota) {
    const [min, max] = quota.split('-').map(Number);
    if (!isNaN(min) && !isNaN(max)) {
      filters.quotaRange = [min, max];
    }
  }

  // RAM (array de números)
  const ram = searchParams.get('ram');
  if (ram) {
    filters.ram = ram
      .split(',')
      .map(Number)
      .filter((n) => !isNaN(n));
  }

  // Storage (array de números)
  const storage = searchParams.get('storage');
  if (storage) {
    filters.storage = storage
      .split(',')
      .map(Number)
      .filter((n) => !isNaN(n));
  }

  // Gama (array de strings)
  const gama = searchParams.get('gama');
  if (gama) {
    filters.gama = gama.split(',').filter(Boolean) as GamaTier[];
  }

  // Sort
  const sort = searchParams.get('sort');
  if (sort) {
    const validSorts: SortOption[] = [
      'recommended',
      'price_asc',
      'price_desc',
      'newest',
      'quota_asc',
      'popular',
    ];
    if (validSorts.includes(sort as SortOption)) {
      filters.sort = sort as SortOption;
    }
  }

  // Budget del quiz -> mapear a priceRange
  const budget = searchParams.get('budget');
  if (budget && !price) {
    const budgetMap: Record<string, [number, number]> = {
      low: [600, 2000],
      medium: [2000, 3500],
      high: [3500, 5000],
      premium: [5000, 8000],
    };
    if (budgetMap[budget]) {
      filters.priceRange = budgetMap[budget];
    }
  }

  return filters;
};

/**
 * Construye query params a partir de los filtros actuales
 * Solo incluye valores que difieren del default
 */
export const buildParamsFromFilters = (
  filters: FilterState,
  sort: SortOption
): URLSearchParams => {
  const params = new URLSearchParams();

  // Device types
  if (filters.deviceTypes.length > 0) {
    params.set('device', filters.deviceTypes.join(','));
  }

  // Brands
  if (filters.brands.length > 0) {
    params.set('brand', filters.brands.join(','));
  }

  // Usage
  if (filters.usage.length > 0) {
    params.set('usage', filters.usage.join(','));
  }

  // Price range (solo si difiere del default)
  if (
    filters.priceRange[0] !== defaultFilterState.priceRange[0] ||
    filters.priceRange[1] !== defaultFilterState.priceRange[1]
  ) {
    params.set('price', `${filters.priceRange[0]}-${filters.priceRange[1]}`);
  }

  // Quota range (solo si difiere del default)
  if (
    filters.quotaRange[0] !== defaultFilterState.quotaRange[0] ||
    filters.quotaRange[1] !== defaultFilterState.quotaRange[1]
  ) {
    params.set('quota', `${filters.quotaRange[0]}-${filters.quotaRange[1]}`);
  }

  // RAM
  if (filters.ram.length > 0) {
    params.set('ram', filters.ram.join(','));
  }

  // Storage
  if (filters.storage.length > 0) {
    params.set('storage', filters.storage.join(','));
  }

  // Gama
  if (filters.gama.length > 0) {
    params.set('gama', filters.gama.join(','));
  }

  // Sort (solo si no es el default)
  if (sort !== 'recommended') {
    params.set('sort', sort);
  }

  return params;
};

/**
 * Combina filtros de URL con el estado default
 */
export const mergeFiltersWithDefaults = (
  urlFilters: Partial<FilterState>
): FilterState => {
  return {
    ...defaultFilterState,
    ...urlFilters,
  };
};

/**
 * Verifica si hay filtros activos (distintos del default)
 */
export const hasActiveFilters = (filters: FilterState): boolean => {
  return (
    filters.deviceTypes.length > 0 ||
    filters.brands.length > 0 ||
    filters.usage.length > 0 ||
    filters.priceRange[0] !== defaultFilterState.priceRange[0] ||
    filters.priceRange[1] !== defaultFilterState.priceRange[1] ||
    filters.quotaRange[0] !== defaultFilterState.quotaRange[0] ||
    filters.quotaRange[1] !== defaultFilterState.quotaRange[1] ||
    filters.ram.length > 0 ||
    filters.storage.length > 0 ||
    filters.gama.length > 0
  );
};
