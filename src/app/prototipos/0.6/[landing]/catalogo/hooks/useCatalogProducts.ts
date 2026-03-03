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
} from '../../../services/catalogApi';

export interface UseCatalogProductsOptions {
  landingSlug: string;
  /** Filters to apply when fetching products */
  filters?: CatalogFilters;
  /** Sort order */
  sortBy?: SortBy;
  /** Whether the hook should start fetching (default: true). Use to delay fetch until dependencies are ready. */
  enabled?: boolean;
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
}: UseCatalogProductsOptions): UseCatalogProductsResult {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFromApi, setIsFromApi] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track if we've already attempted to load
  const hasLoadedRef = useRef(false);
  // Track if enabled changed from false to true
  const wasEnabledRef = useRef(enabled);

  // Track filter changes to trigger re-fetch
  const filtersKey = JSON.stringify(filters || {});
  const lastFiltersKeyRef = useRef<string>(filtersKey);

  // Initial load (16 products)
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[Catalog] Loading products with filters:', filters, 'sortBy:', sortBy);
      const result = await fetchCatalogData(landingSlug, {
        filters,
        sort_by: sortBy,
        limit: INITIAL_LOAD_LIMIT,
        offset: 0,
      });

      if (result && result.products.length > 0) {
        console.log(`[Catalog] Loaded ${result.products.length} of ${result.total} products from API`);
        setProducts(result.products);
        setTotal(result.total);
        setOffset(result.products.length);
        setHasMore(result.hasMore);
        setIsFromApi(true);
      } else {
        // API returned empty or null - could be empty due to filters
        console.log('[Catalog] API returned no products (may be filtered)');
        setProducts([]);
        setTotal(0);
        setOffset(0);
        setHasMore(false);
        setIsFromApi(true);
        // Only show error if no filters applied (truly empty catalog)
        if (!filters || Object.keys(filters).length === 0) {
          setError('No hay productos disponibles en el catálogo');
        }
      }
    } catch (err) {
      // API failed - NO fallback, show error
      console.error('[Catalog] API error:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
      setProducts([]);
      setTotal(0);
      setHasMore(false);
      setIsFromApi(false);
    } finally {
      setIsLoading(false);
    }
  }, [landingSlug, filters, sortBy]);

  // Load more products (8 at a time)
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || !isFromApi) return;

    setIsLoadingMore(true);

    try {
      const result = await fetchCatalogData(landingSlug, {
        filters,
        sort_by: sortBy,
        limit: LOAD_MORE_LIMIT,
        offset: offset,
      });

      if (result && result.products.length > 0) {
        console.log(`[Catalog] Loaded ${result.products.length} more products (offset: ${offset})`);
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
  }, [landingSlug, filters, sortBy, offset, hasMore, isLoadingMore, isFromApi]);

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
      console.log('[Catalog] Filters changed, re-fetching products');
      lastFiltersKeyRef.current = filtersKey;
      loadProducts();
    }
  }, [filtersKey, loadProducts, enabled]);

  // Handle enabled changing from false to true (trigger initial load)
  useEffect(() => {
    if (enabled && !wasEnabledRef.current && !hasLoadedRef.current) {
      console.log('[Catalog] Enabled changed to true, triggering initial load');
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
  min_price?: number;
  max_price?: number;
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

export function useCatalogFilters(
  landingSlug: string,
  appliedFilters?: AppliedFiltersForCounts
): UseCatalogFiltersResult {
  console.log('[useCatalogFilters] 🔵 Hook called with appliedFilters:', appliedFilters);

  const [filters, setFilters] = useState<UseCatalogFiltersResult>({
    ...DEFAULT_FILTERS,
    isLoading: true,
  });

  // Track last applied filters to trigger re-fetch
  const lastFiltersKey = useRef<string>('');
  const appliedFiltersKey = JSON.stringify(appliedFilters || {});

  useEffect(() => {
    // Re-fetch when landing or applied filters change
    const shouldFetch = lastFiltersKey.current !== appliedFiltersKey;
    console.log('[useCatalogFilters] 🔄 Check refetch:', { shouldFetch, appliedFiltersKey, lastKey: lastFiltersKey.current, isFromApi: filters.isFromApi });
    if (!shouldFetch && filters.isFromApi) {
      console.log('[useCatalogFilters] ⏭️ SKIPPING refetch (no changes)');
      return;
    }
    console.log('[useCatalogFilters] ✅ WILL REFETCH!');

    lastFiltersKey.current = appliedFiltersKey;

    const loadFilters = async () => {
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
          if (appliedFilters.min_price !== undefined) {
            params.set('min_price', String(appliedFilters.min_price));
          }
          if (appliedFilters.max_price !== undefined) {
            params.set('max_price', String(appliedFilters.max_price));
          }
        }

        const queryString = params.toString();
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1'}/public/landing/${landingSlug}/filters${queryString ? `?${queryString}` : ''}`;
        console.log('[useCatalogFilters] Fetching:', url);

        const response = await fetch(url, {
          cache: 'no-store', // Don't cache - counts depend on filters
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data: CatalogFiltersResponse = await response.json();
        console.log('[useCatalogFilters] 📥 API Response received:', {
          brandsCount: data.brands?.length,
          typesWithCounts: data.types?.map(t => `${t.value}(${t.count})`),
        });

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
        console.log('[useCatalogFilters] ✅ State updated with new filters');
      } catch (err) {
        console.error('[Catalog Filters] Error loading, using defaults:', err);
        setFilters({
          ...DEFAULT_FILTERS,
          isLoading: false,
          isFromApi: false,
          error: err instanceof Error ? err.message : 'Error loading filters',
        });
      }
    };

    loadFilters();
  }, [landingSlug, appliedFiltersKey]);

  return filters;
}
