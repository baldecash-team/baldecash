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
}

export interface ApiCatalogResponse {
  items: ApiCatalogProduct[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  filters_applied: Record<string, unknown>;
}

export interface ApiFilterOptions {
  brands: { id: number; name: string; slug: string }[];
  price_range: { min: number; max: number };
  types: string[];
  sort_options: { value: string; label: string }[];
}

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
  brand_id?: number;
  type?: string;
  min_price?: number;
  max_price?: number;
  is_featured?: boolean;
}

export type SortBy = 'display_order' | 'price_asc' | 'price_desc' | 'featured';

// ============================================
// API Functions
// ============================================

/**
 * Get products for a landing page catalog
 */
export async function getCatalogProducts(
  landingSlug: string,
  options: {
    filters?: CatalogFilters;
    sort_by?: SortBy;
    page?: number;
    page_size?: number;
  } = {}
): Promise<ApiCatalogResponse | null> {
  try {
    const params = new URLSearchParams();

    if (options.filters) {
      if (options.filters.brand_id) params.set('brand_id', String(options.filters.brand_id));
      if (options.filters.type) params.set('type', options.filters.type);
      if (options.filters.min_price) params.set('min_price', String(options.filters.min_price));
      if (options.filters.max_price) params.set('max_price', String(options.filters.max_price));
      if (options.filters.is_featured !== undefined) params.set('is_featured', String(options.filters.is_featured));
    }

    if (options.sort_by) params.set('sort_by', options.sort_by);
    if (options.page) params.set('page', String(options.page));
    if (options.page_size) params.set('page_size', String(options.page_size));

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
 * Get available filter options for a landing
 */
export async function getCatalogFilters(landingSlug: string): Promise<ApiFilterOptions | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/landing/${landingSlug}/filters`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
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
    colors: undefined, // Not available in list view
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
} {
  return {
    products: response.items.map(mapApiProductToCatalogProduct),
    total: response.total,
    page: response.page,
    pageSize: response.page_size,
    totalPages: response.total_pages,
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
      usage.push('diseño');
    }
    if (nameLower.includes('pro') || nameLower.includes('business')) {
      usage.push('oficina');
    }
  } else if (type === 'tablet') {
    usage.push('estudios');
    usage.push('diseño');
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
  } = {}
): Promise<{
  products: CatalogProduct[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
} | null> {
  const response = await getCatalogProducts(landingSlug, options);

  if (!response) {
    return null;
  }

  return mapApiCatalogResponse(response);
}
