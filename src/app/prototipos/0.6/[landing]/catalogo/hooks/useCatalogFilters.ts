/**
 * Hook for loading and managing catalog filters from the API
 *
 * Features:
 * - Loads filter options from the API on mount
 * - Falls back to empty defaults if API fails
 * - Provides loading and error states
 * - Caches results to prevent duplicate requests
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { getCatalogFilters, AppliedFiltersForCounts } from '../../../services/catalogApi';
import type { CatalogFiltersResponse } from '../../../types/filters';

// ============================================================================
// FALLBACK DATA (used when API is unavailable)
// ============================================================================

const FALLBACK_FILTERS: CatalogFiltersResponse = {
  brands: [],
  types: [
    { value: 'laptop', label: 'Laptop', count: 0 },
    { value: 'tablet', label: 'Tablet', count: 0 },
    { value: 'celular', label: 'Celular', count: 0 },
  ],
  price_range: { min: 800, max: 8000, currency: 'PEN' },
  quota_range: {
    min: 25,
    max: 500,
    term_months: 24,
    initial_percent: 10,
    description: 'Cuota mensual aproximada',
  },
  conditions: [
    { value: 'nueva', label: 'Nuevo', count: 0 },
    { value: 'reacondicionada', label: 'Reacondicionado', count: 0 },
  ],
  gamas: [
    { value: 'economica', label: 'Económica', count: 0 },
    { value: 'estudiante', label: 'Estudiante', count: 0 },
    { value: 'profesional', label: 'Profesional', count: 0 },
    { value: 'creativa', label: 'Creativa', count: 0 },
    { value: 'gamer', label: 'Gamer', count: 0 },
  ],
  usages: [
    { value: 'estudios', label: 'Para estudiar', icon: 'GraduationCap', count: 0 },
    { value: 'gaming', label: 'Para jugar', icon: 'Gamepad2', count: 0 },
    { value: 'diseno', label: 'Para crear', icon: 'Palette', count: 0 },
    { value: 'oficina', label: 'Para trabajar', icon: 'Briefcase', count: 0 },
    { value: 'programacion', label: 'Programación', icon: 'Code', count: 0 },
  ],
  labels: [],
  specs: {},
  spec_groups: [],
  sort_options: [
    { value: 'display_order', label: 'Recomendados', is_default: true },
    { value: 'price_asc', label: 'Menor precio', is_default: false },
    { value: 'price_desc', label: 'Mayor precio', is_default: false },
    { value: 'featured', label: 'Destacados', is_default: false },
  ],
};

// ============================================================================
// HOOK TYPES
// ============================================================================

export interface UseCatalogFiltersOptions {
  /** Applied filters to get contextual counts */
  appliedFilters?: AppliedFiltersForCounts;
}

export interface UseCatalogFiltersResult {
  /** The loaded filter options (or fallback) */
  filters: CatalogFiltersResponse;
  /** Whether the filters are currently loading */
  isLoading: boolean;
  /** Whether the filters came from the API (vs fallback) */
  isFromApi: boolean;
  /** Error message if loading failed */
  error: string | null;
  /** Reload filters from the API */
  refresh: () => Promise<void>;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Hook to load catalog filter options from the API with contextual counts
 *
 * @param landingSlug - The landing page slug
 * @param options - Optional settings including applied filters for contextual counts
 * @returns Filter options, loading state, and refresh function
 *
 * @example
 * ```tsx
 * const { filters, isLoading, isFromApi } = useCatalogFilters('senati', {
 *   appliedFilters: {
 *     types: ['celular'],
 *     brand_ids: [1, 2],
 *   }
 * });
 *
 * // Counts will be contextual:
 * // - types: shows all types with total counts
 * // - brands: shows only brands with celulares
 * ```
 */
export function useCatalogFilters(
  landingSlug: string,
  options?: UseCatalogFiltersOptions
): UseCatalogFiltersResult {
  const [filters, setFilters] = useState<CatalogFiltersResponse>(FALLBACK_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const [isFromApi, setIsFromApi] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track current state for comparison
  const currentSlugRef = useRef(landingSlug);
  const lastAppliedFiltersRef = useRef<string>('');

  // Serialize applied filters for comparison
  const appliedFiltersKey = JSON.stringify(options?.appliedFilters || {});

  const loadFilters = useCallback(async (appliedFilters?: AppliedFiltersForCounts) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getCatalogFilters(landingSlug, appliedFilters);

      if (data) {
        // Validate the response has the expected structure
        if (data.brands && data.specs && data.sort_options) {
          setFilters(data);
          setIsFromApi(true);
        } else {
          console.warn('[useCatalogFilters] API response missing expected fields, using fallback');
          setFilters(FALLBACK_FILTERS);
          setIsFromApi(false);
        }
      } else {
        setFilters(FALLBACK_FILTERS);
        setIsFromApi(false);
      }
    } catch (err) {
      console.error('[useCatalogFilters] Error loading filters:', err);
      setError(err instanceof Error ? err.message : 'Error loading filters');
      setFilters(FALLBACK_FILTERS);
      setIsFromApi(false);
    } finally {
      setIsLoading(false);
    }
  }, [landingSlug]);

  // Load filters on mount and when landing or applied filters change
  useEffect(() => {
    const shouldReload =
      currentSlugRef.current !== landingSlug ||
      lastAppliedFiltersRef.current !== appliedFiltersKey;

    if (shouldReload) {
      currentSlugRef.current = landingSlug;
      lastAppliedFiltersRef.current = appliedFiltersKey;
      loadFilters(options?.appliedFilters);
    }
  }, [landingSlug, appliedFiltersKey, loadFilters, options?.appliedFilters]);

  // Initial load
  useEffect(() => {
    if (lastAppliedFiltersRef.current === '') {
      lastAppliedFiltersRef.current = appliedFiltersKey;
      loadFilters(options?.appliedFilters);
    }
  }, []);

  return {
    filters,
    isLoading,
    isFromApi,
    error,
    refresh: () => loadFilters(options?.appliedFilters),
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get sorted spec groups based on the group order
 */
export function getSortedSpecGroups(filters: CatalogFiltersResponse): string[] {
  if (!filters.spec_groups || filters.spec_groups.length === 0) {
    // Return unique groups from specs
    const groups = new Set<string>();
    Object.values(filters.specs).forEach(spec => {
      if (spec.group) groups.add(spec.group);
    });
    return Array.from(groups);
  }

  return filters.spec_groups
    .sort((a, b) => a.order - b.order)
    .map(g => g.code);
}

/**
 * Get specs for a specific group
 */
export function getSpecsByGroup(
  filters: CatalogFiltersResponse,
  groupCode: string
): Array<{ code: string; spec: CatalogFiltersResponse['specs'][string] }> {
  return Object.entries(filters.specs)
    .filter(([, spec]) => spec.group === groupCode)
    .map(([code, spec]) => ({ code, spec }));
}

/**
 * Check if any spec filters have values (for showing advanced filters section)
 */
export function hasSpecFilters(filters: CatalogFiltersResponse): boolean {
  return Object.keys(filters.specs).length > 0;
}

export default useCatalogFilters;
