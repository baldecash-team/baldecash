/**
 * useCatalogProducts - Hook para cargar productos del catálogo
 *
 * Intenta cargar productos desde la API del backend.
 * Si falla o la API no está disponible, usa mockProducts como fallback.
 *
 * Esto permite una migración gradual sin romper la funcionalidad existente.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { CatalogProduct } from '../types/catalog';
import { mockProducts } from '../data/mockCatalogData';
import {
  fetchCatalogData,
  calculateInstallment,
  type ApiInstallmentResult,
} from '../../../services/catalogApi';

export interface UseCatalogProductsOptions {
  landingSlug: string;
  /** If true, skip API and use mock data directly */
  useMockData?: boolean;
}

export interface UseCatalogProductsResult {
  /** All products available for the catalog */
  products: CatalogProduct[];
  /** Whether products are being loaded from API */
  isLoading: boolean;
  /** Whether the data came from the API (true) or mock (false) */
  isFromApi: boolean;
  /** Error message if API failed */
  error: string | null;
  /** Refresh products from API */
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
 */
export function useCatalogProducts({
  landingSlug,
  useMockData = false,
}: UseCatalogProductsOptions): UseCatalogProductsResult {
  const [products, setProducts] = useState<CatalogProduct[]>(mockProducts);
  const [isLoading, setIsLoading] = useState(!useMockData);
  const [isFromApi, setIsFromApi] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track if we've already attempted to load
  const hasLoadedRef = useRef(false);

  const loadProducts = useCallback(async () => {
    if (useMockData) {
      setProducts(mockProducts);
      setIsFromApi(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch all products (backend allows up to 200)
      const result = await fetchCatalogData(landingSlug, {
        page_size: 200,
      });

      if (result && result.products.length > 0) {
        console.log(`[Catalog] Loaded ${result.products.length} products from API`);
        setProducts(result.products);
        setIsFromApi(true);
      } else {
        // API returned empty or null - fallback to mock
        console.log('[Catalog] API returned no products, using mock data');
        setProducts(mockProducts);
        setIsFromApi(false);
      }
    } catch (err) {
      // API failed - fallback to mock
      console.error('[Catalog] API error, using mock data:', err);
      setError(err instanceof Error ? err.message : 'Error loading products');
      setProducts(mockProducts);
      setIsFromApi(false);
    } finally {
      setIsLoading(false);
    }
  }, [landingSlug, useMockData]);

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
    isLoading,
    isFromApi,
    error,
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
