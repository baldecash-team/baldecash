/**
 * Catalog API Service - BaldeCash v0.6
 *
 * Service for consuming product catalog data from the backend.
 * Uses the 3-level pricing system:
 * 1. LandingVariantPricing (variant + landing specific)
 * 2. LandingPricingRule (landing-level TEA rules)
 * 3. PricingRule (global TEA rules)
 */

import type {
  CatalogProduct,
  CatalogDeviceType,
  ProductCondition,
  StockStatus,
  GamaTier,
  ProductTagType,
  ProductSpecs,
  ProductColor,
  TermMonths,
  InitialPaymentPercent,
} from '../[landing]/catalogo/types/catalog';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1';

// Pagination constants
export const INITIAL_LOAD_LIMIT = 16;
export const LOAD_MORE_LIMIT = 8;

// ============================================
// API Response Types
// ============================================

export interface ApiPricingHook {
  monthly_price: number;
  term_months: number;
  initial_percent: number;
  tea: number;
}

export interface ApiProductPricing {
  list_price: number;
  final_price: number;
  discount_percent: number;
  currency: string;
  hook: ApiPricingHook;
  available_terms: number[];
  available_initials: number[];
}

export interface ApiBrand {
  id: number;
  name: string;
  slug: string;
  logo_url?: string;
}

export interface ApiProductColor {
  id: string;
  name: string;
  hex: string;
  image_url?: string;  // URL de imagen principal para esta variante
  images?: string[];   // Array de URLs de imágenes para carousel
}

export interface ApiCatalogProduct {
  id: number;
  sku: string;
  name: string;
  slug: string;
  type: string;
  condition: string;
  short_description?: string;
  brand: ApiBrand;
  display_order: number;
  is_featured: boolean;
  promo_tag?: string;
  badge_text?: string;
  pricing: ApiProductPricing;
  image_url?: string;
  colors?: ApiProductColor[];
}

export interface ApiCatalogResponse {
  items: ApiCatalogProduct[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  // Offset-based pagination fields
  limit: number;
  offset: number;
  has_more: boolean;
  filters_applied: Record<string, unknown>;
}

/** Legacy filter options type - kept for backwards compatibility */
export interface ApiFilterOptionsLegacy {
  brands: { id: number; name: string; slug: string }[];
  price_range: { min: number; max: number };
  quota_range: {
    min: number;
    max: number;
    term_months: number;
    initial_percent: number;
    description: string;
  };
  types: string[];
  sort_options: { value: string; label: string }[];
}

// Import new filter types
import type { CatalogFiltersResponse } from '../types/filters';
export type ApiFilterOptions = CatalogFiltersResponse;

export interface ApiInstallmentResult {
  product_id: number;
  variant_id: number | null;
  pricing: {
    list_price: number;
    final_price: number;
    initial_amount: number;
    financed_amount: number;
    term_months: number;
    initial_percent: number;
    tea: number;
    monthly_price: number;
    total_amount: number;
    total_interest: number;
  };
}

// ============================================
// Catalog Filters
// ============================================

export interface CatalogFilters {
  // Product IDs (for wishlist/cart)
  product_ids?: number[];
  // Single value filters (legacy)
  brand_id?: number;
  type?: string;
  // Multi-value filters (arrays)
  brand_ids?: number[];
  types?: string[];
  conditions?: string[];
  gamas?: string[];  // Gama/tier: economica, estudiante, profesional, creativa, gamer
  labels?: string[];  // Labels/tags: nuevo, premium, destacado, oferta, mas_vendido
  usages?: string[];  // Recommended use: estudios, gaming, diseno, oficina
  // Price range
  min_price?: number;
  max_price?: number;
  // Quota range (monthly payment)
  min_quota?: number;
  max_quota?: number;
  // Boolean
  is_featured?: boolean;
  // Specs (JSON object)
  specs?: Record<string, unknown>;
}

export type SortBy = 'display_order' | 'price_asc' | 'price_desc' | 'featured' | 'newest';

// ============================================
// API Functions
// ============================================

/**
 * Get products for a landing page catalog
 * Supports both page/page_size and limit/offset pagination
 */
export async function getCatalogProducts(
  landingSlug: string,
  options: {
    filters?: CatalogFilters;
    sort_by?: SortBy;
    page?: number;
    page_size?: number;
    // Offset-based pagination (preferred for "load more")
    limit?: number;
    offset?: number;
  } = {}
): Promise<ApiCatalogResponse | null> {
  try {
    const params = new URLSearchParams();

    if (options.filters) {
      // Product IDs filter (for wishlist/cart)
      if (options.filters.product_ids?.length) params.set('product_ids', options.filters.product_ids.join(','));
      // Single value filters (legacy)
      if (options.filters.brand_id) params.set('brand_id', String(options.filters.brand_id));
      if (options.filters.type) params.set('type', options.filters.type);
      // Multi-value filters (arrays - comma-separated)
      if (options.filters.brand_ids?.length) params.set('brand_ids', options.filters.brand_ids.join(','));
      if (options.filters.types?.length) params.set('types', options.filters.types.join(','));
      if (options.filters.conditions?.length) params.set('conditions', options.filters.conditions.join(','));
      if (options.filters.gamas?.length) params.set('gamas', options.filters.gamas.join(','));
      if (options.filters.labels?.length) params.set('labels', options.filters.labels.join(','));
      if (options.filters.usages?.length) params.set('usages', options.filters.usages.join(','));
      // Price range
      if (options.filters.min_price !== undefined) params.set('min_price', String(options.filters.min_price));
      if (options.filters.max_price !== undefined) params.set('max_price', String(options.filters.max_price));
      // Quota range
      if (options.filters.min_quota !== undefined) params.set('min_quota', String(options.filters.min_quota));
      if (options.filters.max_quota !== undefined) params.set('max_quota', String(options.filters.max_quota));
      // Boolean
      if (options.filters.is_featured !== undefined) params.set('is_featured', String(options.filters.is_featured));
      // Specs (JSON)
      if (options.filters.specs && Object.keys(options.filters.specs).length > 0) {
        params.set('specs', JSON.stringify(options.filters.specs));
      }
    }

    if (options.sort_by) params.set('sort_by', options.sort_by);

    // Prefer limit/offset over page/page_size
    if (options.limit !== undefined) params.set('limit', String(options.limit));
    if (options.offset !== undefined) params.set('offset', String(options.offset));
    if (options.page && options.limit === undefined) params.set('page', String(options.page));
    if (options.page_size && options.limit === undefined) params.set('page_size', String(options.page_size));

    const queryString = params.toString();
    const url = `${API_BASE_URL}/public/landing/${landingSlug}/products${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`[Catalog API] Landing "${landingSlug}" not found`);
        return null;
      }
      // Get error details for debugging
      let errorDetail = '';
      try {
        const errorBody = await response.json();
        errorDetail = JSON.stringify(errorBody);
      } catch {
        errorDetail = response.statusText;
      }
      console.error(`[Catalog API] Error ${response.status}:`, errorDetail);
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[Catalog API] Error fetching products:', error);
    return null;
  }
}

/**
 * Applied filters to send to /filters endpoint for contextual counts
 */
export interface AppliedFiltersForCounts {
  types?: string[];
  brand_ids?: number[];
  conditions?: string[];
  gamas?: string[];
  labels?: string[];
  min_price?: number;
  max_price?: number;
}

/**
 * Get available filter options for a landing with contextual counts
 *
 * When filters are applied, counts update to show:
 * - For the SAME dimension: total counts (so user can switch filters)
 * - For OTHER dimensions: counts filtered by applied filters
 */
export async function getCatalogFilters(
  landingSlug: string,
  appliedFilters?: AppliedFiltersForCounts
): Promise<ApiFilterOptions | null> {
  try {
    const params = new URLSearchParams();

    // Add applied filters as query params
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
    const url = `${API_BASE_URL}/public/landing/${landingSlug}/filters${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      cache: 'no-store', // Don't cache - counts depend on applied filters
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching catalog filters:', error);
    return null;
  }
}

/**
 * Calculate installment for specific term and initial payment
 * Called on-demand when user changes options in UI
 */
export async function calculateInstallment(
  landingSlug: string,
  productId: number,
  term: number,
  initial: number,
  variantId?: number
): Promise<ApiInstallmentResult | null> {
  try {
    const params = new URLSearchParams({
      term: String(term),
      initial: String(initial),
    });

    if (variantId) {
      params.set('variant_id', String(variantId));
    }

    const url = `${API_BASE_URL}/public/landing/${landingSlug}/products/${productId}/installment?${params.toString()}`;

    const response = await fetch(url, {
      cache: 'no-store', // Don't cache - always fresh calculation
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calculating installment:', error);
    return null;
  }
}

// ============================================
// Mappers: API Response -> Frontend Types
// ============================================

/**
 * Map API device type to frontend CatalogDeviceType
 */
function mapDeviceType(type: string): CatalogDeviceType {
  const typeMap: Record<string, CatalogDeviceType> = {
    laptop: 'laptop',
    celular: 'celular',
    tablet: 'tablet',
  };
  return typeMap[type.toLowerCase()] || 'laptop';
}

/**
 * Map API condition to frontend ProductCondition
 */
function mapCondition(condition: string): ProductCondition {
  const conditionMap: Record<string, ProductCondition> = {
    nueva: 'nuevo',
    new: 'nuevo',
    nuevo: 'nuevo',
    reacondicionada: 'reacondicionado',
    refurbished: 'reacondicionado',
    reacondicionado: 'reacondicionado',
  };
  return conditionMap[condition.toLowerCase()] || 'nuevo';
}

/**
 * Map API product to frontend CatalogProduct
 *
 * Note: The API doesn't return full specs in the catalog list.
 * Specs are available in the product detail endpoint.
 * We provide default specs here for compatibility with existing components.
 */
export function mapApiProductToCatalogProduct(apiProduct: ApiCatalogProduct): CatalogProduct {
  const pricing = apiProduct.pricing;
  const hook = pricing.hook;

  // Calculate biweekly and weekly from monthly
  const quotaMonthly = hook.monthly_price;
  const quotaBiweekly = Math.round(quotaMonthly / 2);
  const quotaWeekly = Math.round(quotaMonthly / 4);

  // Determine tags based on API data
  const tags: ProductTagType[] = [];
  if (apiProduct.is_featured) tags.push('recomendado');
  if (pricing.discount_percent > 0) tags.push('oferta');
  if (apiProduct.badge_text?.toLowerCase().includes('vendido')) tags.push('mas_vendido');
  if (hook.monthly_price < 150) tags.push('cuota_baja');

  // Create default specs (will be replaced when viewing product detail)
  const defaultSpecs = createDefaultSpecs(apiProduct);

  return {
    id: String(apiProduct.id),
    slug: apiProduct.slug,
    name: apiProduct.name,
    displayName: apiProduct.name,
    brand: apiProduct.brand.name,
    brandLogo: apiProduct.brand.logo_url,
    thumbnail: apiProduct.image_url || '/images/products/placeholder.jpg',
    images: apiProduct.image_url ? [apiProduct.image_url] : ['/images/products/placeholder.jpg'],
    colors: apiProduct.colors?.map(c => ({
      id: c.id,
      name: c.name,
      hex: c.hex,
      imageUrl: c.image_url,  // Imagen principal de variante
      images: c.images || (c.image_url ? [c.image_url] : []),  // Array para carousel
    })) || [],
    deviceType: mapDeviceType(apiProduct.type),
    price: pricing.final_price,
    originalPrice: pricing.list_price > pricing.final_price ? pricing.list_price : undefined,
    discount: pricing.discount_percent > 0 ? pricing.discount_percent : undefined,
    quotaMonthly,
    quotaBiweekly,
    quotaWeekly,
    maxTermMonths: Math.max(...pricing.available_terms) as TermMonths,
    gama: inferGamaTier(pricing.final_price),
    condition: mapCondition(apiProduct.condition),
    stock: 'available' as StockStatus, // Default - not in API response
    stockQuantity: 10, // Default - not in API response
    usage: inferUsage(apiProduct.type, apiProduct.name),
    isFeatured: apiProduct.is_featured,
    isNew: false, // Not in API response
    tags,
    specs: defaultSpecs,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Map API catalog response to frontend products array
 */
export function mapApiCatalogResponse(response: ApiCatalogResponse): {
  products: CatalogProduct[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  // Offset-based pagination
  limit: number;
  offset: number;
  hasMore: boolean;
} {
  return {
    products: response.items.map(mapApiProductToCatalogProduct),
    total: response.total,
    page: response.page,
    pageSize: response.page_size,
    totalPages: response.total_pages,
    limit: response.limit,
    offset: response.offset,
    hasMore: response.has_more,
  };
}

// ============================================
// Helper Functions
// ============================================

/**
 * Infer gama tier based on price
 */
function inferGamaTier(price: number): GamaTier {
  if (price < 1500) return 'economica';
  if (price < 2500) return 'estudiante';
  if (price < 4000) return 'profesional';
  if (price < 6000) return 'creativa';
  return 'gamer';
}

/**
 * Infer usage based on product type and name
 */
function inferUsage(type: string, name: string): import('../[landing]/catalogo/types/catalog').UsageType[] {
  const nameLower = name.toLowerCase();
  const usage: import('../[landing]/catalogo/types/catalog').UsageType[] = [];

  // Default usage by type
  if (type === 'laptop') {
    usage.push('estudios');
    if (nameLower.includes('gaming') || nameLower.includes('gamer')) {
      usage.push('gaming');
    }
    if (nameLower.includes('creator') || nameLower.includes('studio')) {
      usage.push('diseno');
    }
    if (nameLower.includes('pro') || nameLower.includes('business')) {
      usage.push('oficina');
    }
  } else if (type === 'tablet') {
    usage.push('estudios');
    usage.push('diseno');
  } else if (type === 'celular') {
    usage.push('estudios');
  }

  return usage.length > 0 ? usage : ['estudios'];
}

/**
 * Create default specs for a product
 * These are placeholders - real specs come from product detail
 */
function createDefaultSpecs(apiProduct: ApiCatalogProduct): ProductSpecs {
  const isLaptop = apiProduct.type === 'laptop';
  const nameLower = apiProduct.name.toLowerCase();

  // Try to infer some specs from the product name
  const hasRyzen = nameLower.includes('ryzen');
  const hasIntel = nameLower.includes('intel') || nameLower.includes('core');

  return {
    processor: {
      brand: hasRyzen ? 'amd' : 'intel',
      model: hasRyzen ? 'Ryzen 5' : 'Core i5',
      cores: 6,
      speed: '3.5 GHz',
    },
    ram: {
      size: 8,
      type: 'DDR4',
      maxSize: 32,
      expandable: true,
    },
    storage: {
      size: 512,
      type: 'ssd',
      hasSecondSlot: isLaptop,
    },
    display: {
      size: isLaptop ? 15.6 : 6.5,
      resolution: 'fhd',
      resolutionPixels: '1920x1080',
      type: 'ips',
      refreshRate: 60,
      touchScreen: !isLaptop,
    },
    gpu: {
      type: 'integrated',
      brand: hasRyzen ? 'AMD' : 'Intel',
      model: hasRyzen ? 'Radeon Graphics' : 'UHD Graphics',
    },
    connectivity: {
      wifi: 'Wi-Fi 6',
      bluetooth: '5.0',
      hasEthernet: isLaptop,
    },
    ports: {
      usb: 2,
      usbC: 1,
      hdmi: isLaptop,
      thunderbolt: false,
      sdCard: isLaptop,
      headphone: true,
    },
    keyboard: {
      backlit: true,
      numericPad: false,
      language: 'Español Latino',
    },
    security: {
      fingerprint: true,
      facialRecognition: false,
      tpmChip: true,
    },
    os: {
      hasWindows: isLaptop,
      windowsVersion: isLaptop ? 'Windows 11 Home' : undefined,
    },
    battery: {
      capacity: isLaptop ? '45Wh' : '5000mAh',
      life: isLaptop ? '8 horas' : '24 horas',
    },
    dimensions: {
      weight: isLaptop ? 1.8 : 0.2,
      thickness: isLaptop ? 19.9 : 8.5,
    },
  };
}

// ============================================
// Hook for Catalog Data
// ============================================

/**
 * Fetch catalog data with products mapped to frontend format
 */
export async function fetchCatalogData(
  landingSlug: string,
  options: {
    filters?: CatalogFilters;
    sort_by?: SortBy;
    page?: number;
    page_size?: number;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{
  products: CatalogProduct[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  limit: number;
  offset: number;
  hasMore: boolean;
} | null> {
  const response = await getCatalogProducts(landingSlug, options);

  if (!response) {
    return null;
  }

  return mapApiCatalogResponse(response);
}

/**
 * Fetch products by their IDs
 * Useful for getting wishlist/cart products
 */
export async function fetchProductsByIds(
  landingSlug: string,
  productIds: string[]
): Promise<CatalogProduct[]> {
  if (!productIds || productIds.length === 0) {
    return [];
  }

  try {
    // Convert string IDs to numbers
    const numericIds = productIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));

    if (numericIds.length === 0) {
      return [];
    }

    const response = await getCatalogProducts(landingSlug, {
      filters: { product_ids: numericIds },
      limit: numericIds.length,
    });

    if (!response || !response.items) {
      return [];
    }

    return response.items.map(mapApiProductToCatalogProduct);
  } catch (error) {
    console.error('[Catalog API] Error fetching products by IDs:', error);
    return [];
  }
}

// ============================================
// Product Search / Suggestions
// ============================================

export interface ProductSuggestion {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  price: number;
  image: string | null;
}

/**
 * Search products for autocomplete suggestions
 * Uses the /products/search endpoint
 */
export async function searchProductSuggestions(
  query: string,
  limit: number = 6
): Promise<ProductSuggestion[]> {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
    });

    const url = `${API_BASE_URL}/products/search?${params.toString()}`;

    const response = await fetch(url, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('[Search API] Error:', response.status);
      return [];
    }

    const data = await response.json();

    // Map API response to frontend format
    return data.map((item: {
      id: number;
      name: string;
      sku: string;
      slug: string;
      brand: string | null;
      category: string | null;
      list_price: number | null;
      image: string | null;
    }) => ({
      id: String(item.id),
      name: item.name,
      slug: item.slug,
      brand: item.brand || '',
      category: item.category || '',
      price: item.list_price || 0,
      image: item.image,
    }));
  } catch (error) {
    console.error('[Search API] Error searching products:', error);
    return [];
  }
}
