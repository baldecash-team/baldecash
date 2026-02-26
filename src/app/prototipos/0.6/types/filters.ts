/**
 * Types for dynamic catalog filters
 * These types match the API response from /public/landing/{slug}/filters
 */

// ============================================================================
// FILTER VALUE TYPES
// ============================================================================

/** A single value option for a spec filter */
export interface SpecFilterValue {
  value: string | number | boolean;
  display: string;
  count: number;
}

/** A spec filter definition from the API */
export interface SpecFilter {
  name: string;
  data_type: 'string' | 'number' | 'boolean';
  unit?: string | null;
  icon?: string | null;
  tooltip?: string | null;
  group: string;
  values: SpecFilterValue[];
}

/** A group of specs for UI organization */
export interface SpecGroup {
  code: string;
  name: string;
  icon: string;
  order: number;
}

// ============================================================================
// BASIC FILTER TYPES
// ============================================================================

/** Brand filter option */
export interface BrandFilter {
  id: number;
  name: string;
  slug: string;
  logo_url?: string | null;
  count: number;
}

/** Product type filter option */
export interface TypeFilter {
  value: string;
  label: string;
  count: number;
}

/** Product condition filter option */
export interface ConditionFilter {
  value: string;
  label: string;
  count: number;
}

/** Product gama (tier) filter option */
export interface GamaFilter {
  value: string;
  label: string;
  count: number;
}

/** Product usage filter option */
export interface UsageFilter {
  value: string;
  label: string;
  icon: string;
  count: number;
}

/** Product label/tag filter option */
export interface LabelFilter {
  id: number;
  code: string;
  name: string;
  color: string;
  count: number;
}

/** Sort option */
export interface SortOption {
  value: string;
  label: string;
  is_default: boolean;
}

/** Price range */
export interface PriceRange {
  min: number;
  max: number;
  currency: string;
}

/** Quota range (monthly payment) */
export interface QuotaRange {
  min: number;
  max: number;
  term_months: number;
  initial_percent: number;
  description: string;
}

// ============================================================================
// API RESPONSE TYPE
// ============================================================================

/** Complete response from /public/landing/{slug}/filters */
export interface CatalogFiltersResponse {
  brands: BrandFilter[];
  types: TypeFilter[];
  price_range: PriceRange;
  quota_range: QuotaRange;
  conditions: ConditionFilter[];
  gamas: GamaFilter[];
  usages: UsageFilter[];
  labels: LabelFilter[];
  specs: Record<string, SpecFilter>;
  spec_groups: SpecGroup[];
  sort_options: SortOption[];
}

// ============================================================================
// SELECTED FILTERS STATE
// ============================================================================

/** State of currently selected filters */
export interface SelectedFilters {
  brands: number[];
  types: string[];
  priceRange: [number, number];
  quotaRange: [number, number];
  conditions: string[];
  labels: string[];
  specs: Record<string, (string | number | boolean)[]>;
  sortBy: string;
}

/** Initial/empty state for selected filters */
export const EMPTY_SELECTED_FILTERS: SelectedFilters = {
  brands: [],
  types: [],
  priceRange: [0, Infinity],
  quotaRange: [0, Infinity],
  conditions: [],
  labels: [],
  specs: {},
  sortBy: 'display_order',
};

// ============================================================================
// FILTER COUNTS (calculated locally from products)
// ============================================================================

/** Counts calculated from filtered products */
export interface FilterCounts {
  brands: Record<number, number>;
  types: Record<string, number>;
  conditions: Record<string, number>;
  labels: Record<string, number>;
  specs: Record<string, Record<string | number, number>>;
  total: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/** Check if a filter has any active selections */
export function hasActiveFilters(filters: SelectedFilters): boolean {
  return (
    filters.brands.length > 0 ||
    filters.types.length > 0 ||
    filters.conditions.length > 0 ||
    filters.labels.length > 0 ||
    Object.keys(filters.specs).some(key => filters.specs[key].length > 0) ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < Infinity ||
    filters.quotaRange[0] > 0 ||
    filters.quotaRange[1] < Infinity
  );
}

/** Count total number of active filter selections */
export function countActiveFilters(filters: SelectedFilters): number {
  let count = 0;
  count += filters.brands.length;
  count += filters.types.length;
  count += filters.conditions.length;
  count += filters.labels.length;

  Object.values(filters.specs).forEach(values => {
    count += values.length;
  });

  if (filters.priceRange[0] > 0 || filters.priceRange[1] < Infinity) {
    count += 1;
  }
  if (filters.quotaRange[0] > 0 || filters.quotaRange[1] < Infinity) {
    count += 1;
  }

  return count;
}

/** Build query string from selected filters */
export function buildFilterQueryString(filters: SelectedFilters): string {
  const params = new URLSearchParams();

  if (filters.brands.length > 0) {
    params.set('brand_ids', filters.brands.join(','));
  }
  if (filters.types.length > 0) {
    params.set('types', filters.types.join(','));
  }
  if (filters.conditions.length > 0) {
    params.set('conditions', filters.conditions.join(','));
  }
  if (filters.labels.length > 0) {
    params.set('labels', filters.labels.join(','));
  }
  if (filters.priceRange[0] > 0) {
    params.set('min_price', filters.priceRange[0].toString());
  }
  if (filters.priceRange[1] < Infinity) {
    params.set('max_price', filters.priceRange[1].toString());
  }
  if (filters.quotaRange[0] > 0) {
    params.set('min_quota', filters.quotaRange[0].toString());
  }
  if (filters.quotaRange[1] < Infinity) {
    params.set('max_quota', filters.quotaRange[1].toString());
  }
  if (Object.keys(filters.specs).length > 0) {
    // Only include specs that have selections
    const activeSpecs: Record<string, (string | number | boolean)[]> = {};
    Object.entries(filters.specs).forEach(([key, values]) => {
      if (values.length > 0) {
        activeSpecs[key] = values;
      }
    });
    if (Object.keys(activeSpecs).length > 0) {
      params.set('specs', JSON.stringify(activeSpecs));
    }
  }
  if (filters.sortBy && filters.sortBy !== 'display_order') {
    params.set('sort_by', filters.sortBy);
  }

  return params.toString();
}
