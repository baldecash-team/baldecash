/**
 * useCatalogProducts - Hook para cargar productos del catálogo
 *
 * Carga productos de forma incremental:
 * - Carga inicial: 16 productos
 * - "Load more": 8 productos adicionales
 *
 * Si la API falla, usa mockProducts como fallback.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { CatalogProduct } from '../types/catalog';
import { mockProducts } from '../data/mockCatalogData';
import {
  fetchCatalogData,
  calculateInstallment,
  INITIAL_LOAD_LIMIT,
  LOAD_MORE_LIMIT,
  type ApiInstallmentResult,
} from '../../../services/catalogApi';

export interface UseCatalogProductsOptions {
  landingSlug: string;
  /** If true, skip API and use mock data directly */
  useMockData?: boolean;
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
 * Hook to load catalog products with API + mock fallback
 * Implements incremental loading: 16 initial + 8 per "load more"
 */
export function useCatalogProducts({
  landingSlug,
  useMockData = false,
}: UseCatalogProductsOptions): UseCatalogProductsResult {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(!useMockData);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFromApi, setIsFromApi] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track if we've already attempted to load
  const hasLoadedRef = useRef(false);

  // Initial load (16 products)
  const loadProducts = useCallback(async () => {
    if (useMockData) {
      setProducts(mockProducts.slice(0, INITIAL_LOAD_LIMIT));
      setTotal(mockProducts.length);
      setOffset(INITIAL_LOAD_LIMIT);
      setHasMore(mockProducts.length > INITIAL_LOAD_LIMIT);
      setIsFromApi(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchCatalogData(landingSlug, {
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
        // API returned empty or null - fallback to mock
        console.log('[Catalog] API returned no products, using mock data');
        setProducts(mockProducts.slice(0, INITIAL_LOAD_LIMIT));
        setTotal(mockProducts.length);
        setOffset(INITIAL_LOAD_LIMIT);
        setHasMore(mockProducts.length > INITIAL_LOAD_LIMIT);
        setIsFromApi(false);
      }
    } catch (err) {
      // API failed - fallback to mock
      console.error('[Catalog] API error, using mock data:', err);
      setError(err instanceof Error ? err.message : 'Error loading products');
      setProducts(mockProducts.slice(0, INITIAL_LOAD_LIMIT));
      setTotal(mockProducts.length);
      setOffset(INITIAL_LOAD_LIMIT);
      setHasMore(mockProducts.length > INITIAL_LOAD_LIMIT);
      setIsFromApi(false);
    } finally {
      setIsLoading(false);
    }
  }, [landingSlug, useMockData]);

  // Load more products (8 at a time)
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;

    if (!isFromApi) {
      // Mock data - just slice more
      const nextProducts = mockProducts.slice(offset, offset + LOAD_MORE_LIMIT);
      setProducts(prev => [...prev, ...nextProducts]);
      setOffset(prev => prev + nextProducts.length);
      setHasMore(offset + nextProducts.length < mockProducts.length);
      return;
    }

    setIsLoadingMore(true);

    try {
      const result = await fetchCatalogData(landingSlug, {
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
      setError(err instanceof Error ? err.message : 'Error loading more products');
    } finally {
      setIsLoadingMore(false);
    }
  }, [landingSlug, offset, hasMore, isLoadingMore, isFromApi]);

  // Load products on mount
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadProducts();
    }
  }, [loadProducts]);

  // Calculate installment on-demand
  const getInstallment = useCallback(
    async (
      productId: string,
      term: number,
      initial: number,
      variantId?: number
    ): Promise<ApiInstallmentResult | null> => {
      if (!isFromApi) {
        // If using mock data, return null (frontend will calculate locally)
        return null;
      }

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
    [landingSlug, isFromApi]
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
 * Hook to get dynamic filter options from the API
 * Returns brands, price range, quota range, and product types
 */
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
};

export function useCatalogFilters(landingSlug: string): UseCatalogFiltersResult {
  const [filters, setFilters] = useState<UseCatalogFiltersResult>({
    ...DEFAULT_FILTERS,
    isLoading: true,
  });
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadFilters = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1'}/public/landing/${landingSlug}/filters`
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        setFilters({
          brands: data.brands || [],
          priceRange: data.price_range || DEFAULT_FILTERS.priceRange,
          quotaRange: {
            min: data.quota_range?.min || DEFAULT_FILTERS.quotaRange.min,
            max: data.quota_range?.max || DEFAULT_FILTERS.quotaRange.max,
          },
          types: data.types || DEFAULT_FILTERS.types,
          sortOptions: data.sort_options || DEFAULT_FILTERS.sortOptions,
          isLoading: false,
          isFromApi: true,
          error: null,
        });

        console.log('[Catalog Filters] Loaded from API:', {
          brands: data.brands?.length,
          priceRange: data.price_range,
          quotaRange: data.quota_range,
        });
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
  }, [landingSlug]);

  return filters;
}
