/**
 * useProductDetail - Hook para cargar un producto individual del API
 *
 * Nivel 1: GET /public/landing/{slug}/products/{id} (detalle landing-specific)
 * Nivel 2: GET /public/landing/{slug}/products?page_size=200 (buscar en listado)
 * Nivel 3: Mock data como fallback
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { CatalogProduct } from '../../../catalogo/types/catalog';
import { calculateQuotaForTerm } from '../../../catalogo/types/catalog';
import { mockProducts } from '../../../catalogo/data/mockCatalogData';
import {
  type ApiCatalogProduct,
  mapApiProductToCatalogProduct,
  createSpecsFromEav,
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
 * Map landing detail API response to CatalogProduct.
 * The detail endpoint returns specs as array, images as objects, etc.
 */
function mapLandingDetailToCatalogProduct(data: Record<string, unknown>): CatalogProduct {
  const pricing = data.pricing as Record<string, unknown> | undefined;
  const hook = pricing?.hook as Record<string, number> | undefined;
  const brand = data.brand as { id: number; name: string; slug: string; logo_url?: string } | null;

  // Convert specs array to flat dict for createSpecsFromEav compatibility
  const specsArray = (data.specs as Array<{ code: string; value: unknown }>) || [];
  const specsDict: Record<string, string | number | boolean> = {};
  for (const spec of specsArray) {
    if (spec.code && spec.value !== null && spec.value !== undefined) {
      specsDict[spec.code] = spec.value as string | number | boolean;
    }
  }

  // Extract images as URL strings
  const imagesData = (data.images as Array<{ url: string; alt?: string; type?: string }>) || [];
  const imageUrls = imagesData.map((img) => img.url);

  // Build colors from variants
  const variants = (data.variants as Array<{ id: number; color?: string; color_hex?: string }>) || [];
  const colors: { id: string; name: string; hex: string }[] = [];
  const seenHex = new Set<string>();
  for (const v of variants) {
    if (v.color && v.color_hex && !seenHex.has(v.color_hex)) {
      seenHex.add(v.color_hex);
      colors.push({ id: `variant-${v.id}`, name: v.color, hex: v.color_hex });
    }
  }

  const price = (pricing?.final_price as number) || (pricing?.list_price as number) || 0;
  const listPrice = (pricing?.list_price as number) || price;
  const discountPercent = (pricing?.discount_percent as number) || 0;

  const quotaMonthly = price > 0 ? (hook?.monthly_price || calculateQuotaForTerm(price, 24)) : 0;
  const quotaBiweekly = Math.round(quotaMonthly / 2);
  const quotaWeekly = Math.round(quotaMonthly / 4);

  const productType = (data.type as string) || 'laptop';

  const productSpecs = createSpecsFromEav(specsDict, productType);

  return {
    id: String(data.id),
    slug: (data.slug as string) || `product-${data.id}`,
    name: (data.name as string) || '',
    displayName: (data.short_name as string) || (data.name as string) || '',
    brand: (brand?.name || 'Sin marca').toLowerCase(),
    brandLogo: brand?.logo_url || undefined,
    thumbnail: imageUrls[0] || '/images/products/placeholder.jpg',
    images: imageUrls.length > 0 ? imageUrls : ['/images/products/placeholder.jpg'],
    colors: colors.length > 0 ? colors : undefined,
    deviceType: productType as CatalogProduct['deviceType'],
    price,
    originalPrice: listPrice > price ? listPrice : undefined,
    discount: discountPercent > 0 ? discountPercent : undefined,
    quotaMonthly,
    quotaBiweekly,
    quotaWeekly,
    maxTermMonths: 24,
    gama: price < 1500 ? 'economica' : price < 2500 ? 'estudiante' : price < 4000 ? 'profesional' : price < 6000 ? 'creativa' : 'gamer',
    condition: ((data.condition as string) || 'nueva').includes('reacondicion') ? 'reacondicionado' : 'nuevo',
    stock: 'available',
    stockQuantity: 10,
    usage: ['estudios'],
    isFeatured: (data.is_featured as boolean) || false,
    isNew: false,
    tags: [],
    specs: productSpecs,
    rawSpecs: Object.keys(specsDict).length > 0 ? specsDict : undefined,
    createdAt: new Date().toISOString(),
  };
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

    // Level 1: Try landing-specific detail endpoint
    if (productId) {
      try {
        const url = `${API_BASE_URL}/public/landing/${landingSlug}/products/${productId}`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          const mapped = mapLandingDetailToCatalogProduct(data);
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

    // Level 2: Try landing list endpoint, find product in it
    try {
      const url = `${API_BASE_URL}/public/landing/${landingSlug}/products?page_size=200`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        const allProducts: ApiCatalogProduct[] = data.items || [];

        if (allProducts.length > 0) {
          const allMapped = allProducts.map(mapApiProductToCatalogProduct);

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
  }, [productId, landingSlug]);

  // Load similar products when we got the product from detail API
  const loadSimilarProducts = async (currentProduct: CatalogProduct) => {
    try {
      const url = `${API_BASE_URL}/public/landing/${landingSlug}/products?page_size=200`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        const allProducts: ApiCatalogProduct[] = data.items || [];
        const allMapped = allProducts.map(mapApiProductToCatalogProduct);

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
