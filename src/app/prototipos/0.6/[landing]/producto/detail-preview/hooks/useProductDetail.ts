/**
 * useProductDetail - Hook para cargar un producto individual del API
 *
 * Nivel 1: GET /public/catalog/products/{id} (detalle directo)
 * Nivel 2: GET /public/catalog/products (buscar en listado)
 * Nivel 3: Mock data como fallback
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { CatalogProduct } from '../../../catalogo/types/catalog';
import { mockProducts } from '../../../catalogo/data/mockCatalogData';
import {
  type DirectApiProduct,
  mapDirectApiProductToCatalogProduct,
} from '../../../../services/catalogApi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1';

export type DetailDataSource = 'detail-api' | 'list-api' | 'mock';

export interface UseProductDetailResult {
  product: CatalogProduct | null;
  similarProducts: CatalogProduct[];
  isLoading: boolean;
  isFromApi: boolean;
  dataSource: DetailDataSource;
  error: string | null;
}

/**
 * Fetch a single product by ID with 3-level fallback.
 * Also returns similar products (same category/type) for the "Productos similares" section.
 */
export function useProductDetail(
  productId: string | null,
  landingSlug: string
): UseProductDetailResult {
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [similarProducts, setSimilarProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFromApi, setIsFromApi] = useState(false);
  const [dataSource, setDataSource] = useState<DetailDataSource>('mock');
  const [error, setError] = useState<string | null>(null);

  const hasLoadedRef = useRef(false);
  const lastProductIdRef = useRef<string | null>(null);

  const loadProduct = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Level 1: Try detail endpoint
    if (productId) {
      try {
        const url = `${API_BASE_URL}/public/catalog/products/${productId}`;
        const response = await fetch(url);

        if (response.ok) {
          const data: DirectApiProduct = await response.json();
          const mapped = mapDirectApiProductToCatalogProduct(data);
          setProduct(mapped);
          setIsFromApi(true);
          setDataSource('detail-api');
          console.log(`[ProductDetail] Level 1: Loaded product ${productId} from detail API`);

          // Load similar products from list API
          await loadSimilarProducts(mapped);
          setIsLoading(false);
          return;
        }

        console.warn(`[ProductDetail] Level 1: Detail API returned ${response.status}`);
      } catch (err) {
        console.warn('[ProductDetail] Level 1: Detail API failed:', err instanceof Error ? err.message : err);
      }
    }

    // Level 2: Try list endpoint, find product in it
    try {
      const url = `${API_BASE_URL}/public/catalog/products`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        const allProducts: DirectApiProduct[] = data.products || [];

        if (allProducts.length > 0) {
          const allMapped = allProducts.map(mapDirectApiProductToCatalogProduct);

          // Find the specific product, or use the first one
          const found = productId
            ? allMapped.find((p) => p.id === productId)
            : allMapped[0];

          if (found) {
            setProduct(found);
            setIsFromApi(true);
            setDataSource('list-api');

            // Set similar products (same type, excluding current)
            const similar = allMapped
              .filter((p) => p.id !== found.id && p.deviceType === found.deviceType)
              .slice(0, 4);
            setSimilarProducts(similar);

            console.log(`[ProductDetail] Level 2: Found product in list API (${allMapped.length} products)`);
            setIsLoading(false);
            return;
          }
        }
      }

      console.warn('[ProductDetail] Level 2: List API did not have the product');
    } catch (err) {
      console.warn('[ProductDetail] Level 2: List API failed:', err instanceof Error ? err.message : err);
    }

    // Level 3: Mock data fallback
    console.log('[ProductDetail] Level 3: Using mock data');
    const mockProduct = productId
      ? mockProducts.find((p) => p.id === productId) || mockProducts[0]
      : mockProducts[0];

    setProduct(mockProduct);
    setSimilarProducts(
      mockProducts
        .filter((p) => p.id !== mockProduct.id && p.deviceType === mockProduct.deviceType)
        .slice(0, 4)
    );
    setIsFromApi(false);
    setDataSource('mock');
    setError('API no disponible - mostrando datos de demo');
    setIsLoading(false);
  }, [productId]);

  // Load similar products when we got the product from detail API
  const loadSimilarProducts = async (currentProduct: CatalogProduct) => {
    try {
      const url = `${API_BASE_URL}/public/catalog/products`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        const allProducts: DirectApiProduct[] = data.products || [];
        const allMapped = allProducts.map(mapDirectApiProductToCatalogProduct);

        const similar = allMapped
          .filter((p) => p.id !== currentProduct.id && p.deviceType === currentProduct.deviceType)
          .slice(0, 4);
        setSimilarProducts(similar);
        return;
      }
    } catch {
      // Silently fail - similar products are not critical
    }

    // Fallback to mock similar products
    setSimilarProducts(
      mockProducts
        .filter((p) => p.id !== currentProduct.id && p.deviceType === currentProduct.deviceType)
        .slice(0, 4)
    );
  };

  // Load on mount or when productId changes
  useEffect(() => {
    if (!hasLoadedRef.current || lastProductIdRef.current !== productId) {
      hasLoadedRef.current = true;
      lastProductIdRef.current = productId;
      loadProduct();
    }
  }, [loadProduct, productId]);

  return {
    product,
    similarProducts,
    isLoading,
    isFromApi,
    dataSource,
    error,
  };
}
