/**
 * useCatalogProducts - Hook para cargar productos del catálogo
 *
 * Carga productos de forma incremental:
 * - Carga inicial: 16 productos
 * - "Load more": 8 productos adicionales
 *
 * POLÍTICA: Solo API, sin mock fallback. Si la API falla, muestra error.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { CatalogProduct } from '../types/catalog';
import {
  fetchCatalogData,
  calculateInstallment,
  INITIAL_LOAD_LIMIT,
  LOAD_MORE_LIMIT,
  type ApiInstallmentResult,
  type CatalogFilters,
  type SortBy,
  type SearchSuggestion,
  type SearchCorrected,
} from '../../../services/catalogApi';
import { roundToColumns } from './useGridColumns';

export interface UseCatalogProductsOptions {
  landingSlug: string;
  /** Filters to apply when fetching products */
  filters?: CatalogFilters;
  /** Sort order */
  sortBy?: SortBy;
  /** Whether the hook should start fetching (default: true). Use to delay fetch until dependencies are ready. */
  enabled?: boolean;
  /** Preview key for accessing unpublished landings */
  previewKey?: string | null;
  /** Number of grid columns - used to round limits so rows are always complete */
  gridColumns?: number;
}

export interface UseCatalogProductsResult {
  /** Products loaded so far (accumulated) */
  products: CatalogProduct[];
  /** Total products available in backend */
  total: number;
  /** Whether initial products are being loaded */
  isLoading: boolean;
  /** Whether more products are being loaded */
  isLoadingMore: boolean;
  /** Whether there are more products to load */
  hasMore: boolean;
  /** Whether the data came from the API (true) or mock (false) */
  isFromApi: boolean;
  /** Error message if API failed */
  error: string | null;
  /** Search suggestions when no results found (e.g., "Did you mean: redmi?") */
  suggestions: SearchSuggestion[];
  /** Search correction info when fuzzy search was applied (e.g., "readmi" -> "redmi") */
  searchCorrected: SearchCorrected | null;
  /** Load more products (8 at a time) */
  loadMore: () => Promise<void>;
  /** Refresh products from API (resets to initial load) */
  refresh: () => Promise<void>;
  /** Calculate installment on-demand */
  getInstallment: (
    productId: string,
    term: number,
    initial: number,
    variantId?: number
  ) => Promise<ApiInstallmentResult | null>;
}

/**
 * Hook to load catalog products from API only (NO mock fallback)
 * Implements incremental loading: 16 initial + 8 per "load more"
 * Re-fetches when filters change
 */
export function useCatalogProducts({
  landingSlug,
  filters,
  sortBy,
  enabled = true,
  previewKey,
  gridColumns,
}: UseCatalogProductsOptions): UseCatalogProductsResult {
  // Round limits to fill complete rows
  const initialLimit = gridColumns ? roundToColumns(INITIAL_LOAD_LIMIT, gridColumns) : INITIAL_LOAD_LIMIT;
  const loadMoreLimit = gridColumns ? roundToColumns(LOAD_MORE_LIMIT, gridColumns) : LOAD_MORE_LIMIT;
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFromApi, setIsFromApi] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchCorrected, setSearchCorrected] = useState<SearchCorrected | null>(null);

  // Track if we've already attempted to load
  const hasLoadedRef = useRef(false);
  // Track if enabled changed from false to true
  const wasEnabledRef = useRef(enabled);

  // Track filter changes to trigger re-fetch
  const filtersKey = JSON.stringify(filters || {});
  const lastFiltersKeyRef = useRef<string>(filtersKey);

  // AbortController to cancel in-flight requests when filters change
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initial load (16 products)
  const loadProducts = useCallback(async () => {
    // Cancel any in-flight request before starting a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);
    setSuggestions([]); // Clear previous suggestions
    setSearchCorrected(null); // Clear previous search correction

    try {
      const result = await fetchCatalogData(landingSlug, {
        filters,
        sort_by: sortBy,
        limit: initialLimit,
        offset: 0,
        previewKey,
      });

      // If this request was aborted, ignore its results
      if (controller.signal.aborted) return;

      if (result && result.products.length > 0) {
        setProducts(result.products);
        setTotal(result.total);
        setOffset(result.products.length);
        setHasMore(result.hasMore);
        setIsFromApi(true);
        setSuggestions([]); // Clear suggestions when there are results
        // Store search correction info if fuzzy search was applied
        if (result.searchCorrected) {
          setSearchCorrected(result.searchCorrected);
        } else {
          setSearchCorrected(null);
        }
      } else {
        // API returned empty or null - show EmptyState (not an error)
        setProducts([]);
        setTotal(0);
        setOffset(0);
        setHasMore(false);
        setIsFromApi(true);
        // Store suggestions for "Did you mean?" UI
        if (result?.suggestions && result.suggestions.length > 0) {
          setSuggestions(result.suggestions);
        }
      }
    } catch (err) {
      // Ignore aborted requests - a newer request replaced this one
      if (controller.signal.aborted) return;
      // API failed - NO fallback, show error
      console.error('[Catalog] API error:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
      setProducts([]);
      setTotal(0);
      setHasMore(false);
      setIsFromApi(false);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [landingSlug, filters, sortBy, previewKey, initialLimit]);

  // Load more products
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || !isFromApi) return;

    setIsLoadingMore(true);

    try {
      const result = await fetchCatalogData(landingSlug, {
        filters,
        sort_by: sortBy,
        limit: loadMoreLimit,
        offset: offset,
        previewKey,
      });

      if (result && result.products.length > 0) {
        setProducts(prev => [...prev, ...result.products]);
        setOffset(prev => prev + result.products.length);
        setHasMore(result.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('[Catalog] Error loading more products:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar más productos');
    } finally {
      setIsLoadingMore(false);
    }
  }, [landingSlug, filters, sortBy, offset, hasMore, isLoadingMore, isFromApi, loadMoreLimit]);

  // Load products on mount (only if enabled)
  useEffect(() => {
    if (!enabled) {
      // Reset loading state while waiting
      return;
    }
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      // Update lastFiltersKey to current filters to prevent duplicate fetch
      lastFiltersKeyRef.current = filtersKey;
      loadProducts();
    }
  }, [loadProducts, enabled, filtersKey]);

  // Re-fetch when filters change (only if enabled and already loaded once)
  useEffect(() => {
    if (!enabled || !hasLoadedRef.current) {
      return;
    }
    if (lastFiltersKeyRef.current !== filtersKey) {
      lastFiltersKeyRef.current = filtersKey;
      loadProducts();
    }
  }, [filtersKey, loadProducts, enabled]);

  // Handle enabled changing from false to true (trigger initial load)
  useEffect(() => {
    if (enabled && !wasEnabledRef.current && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      lastFiltersKeyRef.current = filtersKey;
      loadProducts();
    }
    wasEnabledRef.current = enabled;
  }, [enabled, filtersKey, loadProducts]);

  // Calculate installment on-demand (API only)
  const getInstallment = useCallback(
    async (
      productId: string,
      term: number,
      initial: number,
      variantId?: number
    ): Promise<ApiInstallmentResult | null> => {
      try {
        const result = await calculateInstallment(
          landingSlug,
          parseInt(productId, 10),
          term,
          initial,
          variantId
        );
        return result;
      } catch (err) {
        console.error('[Catalog] Error calculating installment:', err);
        return null;
      }
    },
    [landingSlug]
  );

  return {
    products,
    total,
    isLoading,
    isLoadingMore,
    hasMore,
    isFromApi,
    error,
    suggestions,
    searchCorrected,
    loadMore,
    refresh: loadProducts,
    getInstallment,
  };
}

/**
 * Hook to get a single product by ID
 * Searches in the provided products array
 */
export function useProductById(
  products: CatalogProduct[],
  productId: string | null
): CatalogProduct | null {
  if (!productId) return null;
  return products.find((p) => p.id === productId) || null;
}

/**
 * Hook to get multiple products by IDs
 * Useful for cart, wishlist, and comparison
 */
export function useProductsByIds(
  products: CatalogProduct[],
  productIds: string[]
): CatalogProduct[] {
  return productIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is CatalogProduct => p !== undefined);
}

/**
 * Hook to get dynamic filter options from the API with contextual counts
 * Returns brands, price range, quota range, product types, specs, and more
 *
 * When appliedFilters are provided, the counts update contextually:
 * - For the SAME dimension: shows total counts (so user can switch)
 * - For OTHER dimensions: shows counts filtered by applied filters
 */
import type { CatalogFiltersResponse } from '../../../types/filters';

export interface AppliedFiltersForCounts {
  types?: string[];
  brand_ids?: number[];
  conditions?: string[];
  gamas?: string[];
  labels?: string[];
  usages?: string[];
  min_price?: number;
  max_price?: number;
  min_quota?: number;
  max_quota?: number;
  specs?: Record<string, (string | number | boolean)[]>;
}

export interface UseCatalogFiltersResult {
  /** Available brands for filtering */
  brands: { id: number; name: string; slug: string }[];
  /** Price range (min/max) of products */
  priceRange: { min: number; max: number };
  /** Quota range (min/max monthly payment) */
  quotaRange: { min: number; max: number };
  /** Available product types */
  types: string[];
  /** Sort options */
  sortOptions: { value: string; label: string }[];
  /** Whether filters are being loaded */
  isLoading: boolean;
  /** Whether filters came from API */
  isFromApi: boolean;
  /** Error message if API failed */
  error: string | null;
  /** Full API response for advanced filtering (specs, conditions, labels, etc.) */
  apiFilters: CatalogFiltersResponse | null;
}

// Default filter values (fallback if API fails)
const DEFAULT_FILTERS: UseCatalogFiltersResult = {
  brands: [],
  priceRange: { min: 800, max: 8000 },
  quotaRange: { min: 25, max: 500 },
  types: ['laptop', 'celular', 'tablet'],
  sortOptions: [
    { value: 'display_order', label: 'Recomendados' },
    { value: 'price_asc', label: 'Menor precio' },
    { value: 'price_desc', label: 'Mayor precio' },
    { value: 'featured', label: 'Destacados' },
  ],
  isLoading: false,
  isFromApi: false,
  error: null,
  apiFilters: null,
};

const FILTERS_DEBOUNCE_MS = 300;

export function useCatalogFilters(
  landingSlug: string,
  appliedFilters?: AppliedFiltersForCounts
): UseCatalogFiltersResult {
  const [filters, setFilters] = useState<UseCatalogFiltersResult>({
    ...DEFAULT_FILTERS,
    isLoading: true,
  });

  // Track last applied filters to trigger re-fetch
  const lastFiltersKey = useRef<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appliedFiltersKey = JSON.stringify(appliedFilters || {});
  const isInitialFetch = useRef(true);

  useEffect(() => {
    // Skip if nothing changed and we already have API data
    const shouldFetch = lastFiltersKey.current !== appliedFiltersKey;
    if (!shouldFetch && filters.isFromApi) {
      return;
    }

    lastFiltersKey.current = appliedFiltersKey;

    const loadFilters = async (signal: AbortSignal) => {
      try {
        // Build query params for contextual counts
        const params = new URLSearchParams();
        if (appliedFilters) {
          if (appliedFilters.types?.length) {
            params.set('types', appliedFilters.types.join(','));
          }
          if (appliedFilters.brand_ids?.length) {
            params.set('brand_ids', appliedFilters.brand_ids.join(','));
          }
          if (appliedFilters.conditions?.length) {
            params.set('conditions', appliedFilters.conditions.join(','));
          }
          if (appliedFilters.gamas?.length) {
            params.set('gamas', appliedFilters.gamas.join(','));
          }
          if (appliedFilters.labels?.length) {
            params.set('labels', appliedFilters.labels.join(','));
          }
          if (appliedFilters.usages?.length) {
            params.set('usages', appliedFilters.usages.join(','));
          }
          if (appliedFilters.min_price !== undefined) {
            params.set('min_price', String(appliedFilters.min_price));
          }
          if (appliedFilters.max_price !== undefined) {
            params.set('max_price', String(appliedFilters.max_price));
          }
          if (appliedFilters.min_quota !== undefined) {
            params.set('min_quota', String(appliedFilters.min_quota));
          }
          if (appliedFilters.max_quota !== undefined) {
            params.set('max_quota', String(appliedFilters.max_quota));
          }
          if (appliedFilters.specs && Object.keys(appliedFilters.specs).length > 0) {
            params.set('specs', JSON.stringify(appliedFilters.specs));
          }
        }

        const queryString = params.toString();
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1'}/public/landing/${landingSlug}/filters${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
          cache: 'no-store',
          signal,
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data: CatalogFiltersResponse = await response.json();

        setFilters({
          brands: data.brands || [],
          priceRange: data.price_range || DEFAULT_FILTERS.priceRange,
          quotaRange: {
            min: data.quota_range?.min || DEFAULT_FILTERS.quotaRange.min,
            max: data.quota_range?.max || DEFAULT_FILTERS.quotaRange.max,
          },
          types: data.types?.map(t => t.value) || DEFAULT_FILTERS.types,
          sortOptions: data.sort_options?.map(s => ({ value: s.value, label: s.label })) || DEFAULT_FILTERS.sortOptions,
          isLoading: false,
          isFromApi: true,
          error: null,
          apiFilters: data,
        });
      } catch (err) {
        // Silently ignore aborted requests (from debounce/unmount)
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        // Network errors (API down) — also ignore silently, keep previous data or defaults
        if (err instanceof TypeError && (err.message === 'Failed to fetch' || err.message === 'Load failed')) {
          setFilters((prev) => prev.isFromApi ? prev : { ...DEFAULT_FILTERS, isLoading: false });
          return;
        }
        console.warn('[Catalog Filters] Error loading filters:', err);
        // Stale-while-revalidate: keep previous data if available, only fallback to defaults on first load
        setFilters((prev) => ({
          ...(prev.isFromApi ? prev : DEFAULT_FILTERS),
          isLoading: false,
          error: err instanceof Error ? err.message : 'Error loading filters',
        }));
      }
    };

    // Cancel any in-flight request
    abortControllerRef.current?.abort();

    // Clear any pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const executeRequest = () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      loadFilters(controller.signal);
    };

    // First fetch: immediate. Subsequent fetches: debounced.
    if (isInitialFetch.current) {
      isInitialFetch.current = false;
      executeRequest();
    } else {
      debounceTimerRef.current = setTimeout(executeRequest, FILTERS_DEBOUNCE_MS);
    }

    return () => {
      abortControllerRef.current?.abort();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [landingSlug, appliedFiltersKey]);

  return filters;
}
