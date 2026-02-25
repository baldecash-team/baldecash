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

import { calculateQuotaForTerm, DEFAULT_TEA } from '../[landing]/catalogo/types/catalog';

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
    accesorio: 'accesorio',
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
    brand: apiProduct.brand.name.toLowerCase(),
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
 * Create specs for a product by parsing short_description and product name.
 * short_description format: '15.6" FHD, Ryzen 5 7520U, 16GB, 512GB SSD'
 */
function createDefaultSpecs(apiProduct: ApiCatalogProduct): ProductSpecs {
  const desc = (apiProduct.short_description || '').toLowerCase();
  const nameLower = apiProduct.name.toLowerCase();
  const combined = `${nameLower} ${desc}`;
  const isLaptop = apiProduct.type === 'laptop';
  const isTablet = apiProduct.type === 'tablet';
  const isCelular = apiProduct.type === 'celular';

  // Accessories: only return specs that exist in description
  if (apiProduct.type === 'accesorio') {
    return {};
  }

  // --- Parse processor from description ---
  const processorBrand: 'intel' | 'amd' | 'apple' =
    combined.includes('ryzen') || combined.includes('amd') ? 'amd'
    : combined.includes('apple') || combined.includes('m2') || combined.includes('m1') || combined.includes('a16 bionic') ? 'apple'
    : combined.includes('helio') || combined.includes('snapdragon') || combined.includes('exynos') ? 'amd' // mobile chipsets
    : 'intel';

  // Extract processor model from short_description
  let processorModel = '';
  const procPatterns = [
    /ryzen\s*\d+\s*\w*/i,
    /core\s*i\d+-?\w*/i,
    /core\s*\d+\s*\w*/i,
    /celeron\s*\w*/i,
    /snapdragon\s*\d*\s*\w*\s*\d*/i,
    /exynos\s*\d*/i,
    /helio\s*\w*[-]?\w*/i,
    /apple\s*m\d/i,
    /a16\s*bionic/i,
  ];
  for (const pat of procPatterns) {
    const match = combined.match(pat);
    if (match) {
      processorModel = match[0].trim();
      // Capitalize first letter of each word
      processorModel = processorModel.replace(/\b\w/g, c => c.toUpperCase());
      break;
    }
  }
  if (!processorModel) {
    processorModel = processorBrand === 'amd' ? 'AMD' : processorBrand === 'apple' ? 'Apple' : 'Intel';
  }

  // --- Parse RAM ---
  let ramSize = 8;
  const ramMatch = desc.match(/(\d+)\s*gb(?:\s+(?:ddr|lpddr))?/i) || nameLower.match(/(\d+)\s*gb/i);
  if (ramMatch) ramSize = parseInt(ramMatch[1], 10);
  // Detect RAM type
  let ramType = 'DDR4';
  if (combined.includes('ddr5') || combined.includes('lpddr5')) ramType = 'DDR5';
  else if (combined.includes('lpddr4')) ramType = 'LPDDR4';

  // --- Parse storage ---
  let storageSize = 256;
  let storageType: 'ssd' | 'hdd' | 'emmc' = 'ssd';
  const storageMatch = desc.match(/(\d+)\s*(?:gb|tb)\s*(ssd|hdd|emmc)?/ig);
  if (storageMatch) {
    // Pick the storage entry (usually the second number, or the one with SSD/HDD)
    for (const s of storageMatch) {
      const m = s.match(/(\d+)\s*(gb|tb)\s*(ssd|hdd|emmc)?/i);
      if (m) {
        const val = parseInt(m[1], 10);
        const unit = m[2].toLowerCase();
        const type = (m[3] || '').toLowerCase();
        if (type === 'ssd' || type === 'hdd' || type === 'emmc') {
          storageSize = unit === 'tb' ? val * 1024 : val;
          storageType = type as 'ssd' | 'hdd' | 'emmc';
          break;
        }
        // If no type specified but value looks like storage (>= 64GB, not RAM)
        if (val >= 64 && val !== ramSize) {
          storageSize = unit === 'tb' ? val * 1024 : val;
        }
      }
    }
  }
  // Fix: for some descriptions like "16GB, 512GB" - second is storage
  const allNumbers = [...desc.matchAll(/(\d+)\s*gb/gi)].map(m => parseInt(m[1], 10));
  if (allNumbers.length >= 2) {
    ramSize = allNumbers[0];
    storageSize = allNumbers[1];
  }
  if (desc.includes('1tb')) storageSize = 1024;
  if (desc.includes('emmc')) storageType = 'emmc';

  // --- Parse display ---
  let displaySize = isLaptop ? 15.6 : isCelular ? 6.5 : 10;
  const displayMatch = desc.match(/([\d.]+)[""]/);
  if (displayMatch) displaySize = parseFloat(displayMatch[1]);

  let resolution: 'hd' | 'fhd' | 'qhd' | '4k' = 'fhd';
  if (desc.includes('4k') || desc.includes('2160')) resolution = '4k';
  else if (desc.includes('qhd') || desc.includes('2k') || desc.includes('1440')) resolution = 'qhd';
  else if (desc.includes('fhd') || desc.includes('1080') || desc.includes('full hd')) resolution = 'fhd';
  else if (desc.includes(' hd') && !desc.includes('fhd')) resolution = 'hd';

  let displayType: 'ips' | 'tn' | 'oled' | 'va' = 'ips';
  if (desc.includes('amoled') || desc.includes('oled')) displayType = 'oled';
  else if (desc.includes('tn')) displayType = 'tn';
  else if (desc.includes('va')) displayType = 'va';

  let refreshRate = 60;
  const rrMatch = desc.match(/(\d+)\s*hz/i);
  if (rrMatch) refreshRate = parseInt(rrMatch[1], 10);

  // --- Parse GPU ---
  let gpuType: 'integrated' | 'dedicated' = 'integrated';
  let gpuBrand = processorBrand === 'amd' ? 'AMD' : 'Intel';
  let gpuModel = processorBrand === 'amd' ? 'Radeon Graphics' : 'UHD Graphics';
  let gpuVram: number | undefined;

  const rtxMatch = combined.match(/rtx\s*(\d+)\s*(?:ti)?/i);
  const gtxMatch = combined.match(/gtx\s*(\d+)\s*(?:ti)?/i);
  if (rtxMatch) {
    gpuType = 'dedicated';
    gpuBrand = 'NVIDIA';
    gpuModel = `RTX ${rtxMatch[1]}`;
    const vramMatch = desc.match(/rtx\s*\d+\s*(?:ti)?\s*(\d+)\s*gb/i);
    if (vramMatch) gpuVram = parseInt(vramMatch[1], 10);
  } else if (gtxMatch) {
    gpuType = 'dedicated';
    gpuBrand = 'NVIDIA';
    gpuModel = `GTX ${gtxMatch[1]}`;
  }

  return {
    processor: {
      brand: processorBrand,
      model: processorModel,
      cores: isLaptop ? 6 : 8,
      speed: '3.5 GHz',
    },
    ram: {
      size: ramSize,
      type: ramType,
      maxSize: ramSize * 2,
      expandable: isLaptop,
    },
    storage: {
      size: storageSize,
      type: storageType,
      hasSecondSlot: isLaptop,
    },
    display: {
      size: displaySize,
      resolution,
      resolutionPixels: resolution === 'fhd' ? '1920x1080' : resolution === 'hd' ? '1366x768' : resolution === 'qhd' ? '2560x1440' : '3840x2160',
      type: displayType,
      refreshRate,
      touchScreen: !isLaptop || desc.includes('tactil') || desc.includes('touch'),
    },
    gpu: {
      type: gpuType,
      brand: gpuBrand,
      model: gpuModel,
      vram: gpuVram,
    },
    connectivity: {
      wifi: 'Wi-Fi 6',
      bluetooth: '5.0',
      hasEthernet: isLaptop,
    },
    ports: {
      usb: isLaptop ? 2 : 0,
      usbC: 1,
      hdmi: isLaptop,
      thunderbolt: false,
      sdCard: isLaptop || isTablet,
      headphone: true,
    },
    keyboard: {
      backlit: isLaptop,
      numericPad: false,
      language: 'Español Latino',
    },
    security: {
      fingerprint: isLaptop || isCelular,
      facialRecognition: false,
      tpmChip: isLaptop,
    },
    os: {
      hasWindows: isLaptop && processorBrand !== 'apple',
      windowsVersion: isLaptop && processorBrand !== 'apple' ? 'Windows 11 Home' : undefined,
    },
    battery: {
      capacity: isLaptop ? '45Wh' : isCelular ? '5000mAh' : '8000mAh',
      life: isLaptop ? '8 horas' : '24 horas',
    },
    dimensions: {
      weight: isLaptop ? 1.8 : isCelular ? 0.2 : 0.5,
      thickness: isLaptop ? 19.9 : isCelular ? 8.5 : 7.0,
    },
  };
}

// ============================================
// Direct Catalog Endpoint (no landing required)
// ============================================

/**
 * Response types for /public/catalog/products
 */
export interface DirectApiProduct {
  id: number;
  sku: string;
  name: string;
  short_name?: string;
  slug: string;
  type: string | null;
  condition: string | null;
  short_description?: string;
  brand: {
    slug: string | null;
    name: string | null;
    logo_url: string | null;
  };
  category: {
    slug: string;
    name: string;
  } | null;
  price: number;
  is_featured: boolean;
  stock_available: number;
  specs: Record<string, string | number | boolean>;
  colors: { id: string; name: string; hex: string }[];
  images: string[];
  labels: string[];
}

export interface DirectCatalogResponse {
  products: DirectApiProduct[];
  total: number;
}

/**
 * Fetch all products directly (no landing context needed).
 * Uses GET /public/catalog/products which returns all active/visible products.
 */
export async function getDirectCatalogProducts(): Promise<DirectCatalogResponse | null> {
  try {
    const url = `${API_BASE_URL}/public/catalog/products`;

    const response = await fetch(url, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      let errorDetail = '';
      try {
        const errorBody = await response.json();
        errorDetail = JSON.stringify(errorBody);
      } catch {
        errorDetail = response.statusText;
      }
      console.error(`[Catalog API Direct] Error ${response.status}:`, errorDetail);
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[Catalog API Direct] Error fetching products:', error);
    return null;
  }
}

/**
 * Map a direct API product to frontend CatalogProduct.
 * Uses real specs from the EAV model when available.
 */
export function mapDirectApiProductToCatalogProduct(apiProduct: DirectApiProduct): CatalogProduct {
  const specs = apiProduct.specs || {};
  const price = apiProduct.price || 0;

  // Calculate quotas using real French amortization formula (TEA 75%, 24 months default)
  const quotaMonthly = price > 0 ? calculateQuotaForTerm(price, 24) : 0;
  const quotaBiweekly = Math.round(quotaMonthly / 2);
  const quotaWeekly = Math.round(quotaMonthly / 4);

  // Determine tags from labels and features
  const tags: ProductTagType[] = [];
  if (apiProduct.is_featured) tags.push('recomendado');
  if (apiProduct.labels.includes('destacado')) tags.push('mas_vendido');
  if (quotaMonthly > 0 && quotaMonthly < 150) tags.push('cuota_baja');

  // Map real specs from EAV to ProductSpecs structure
  const productSpecs = createSpecsFromEav(specs, apiProduct.type || 'laptop');

  // Map colors to ProductColor format (deduplicate by hex)
  const seenHex = new Set<string>();
  const colors: ProductColor[] = [];
  for (const c of apiProduct.colors) {
    if (!seenHex.has(c.hex)) {
      seenHex.add(c.hex);
      colors.push({ id: c.id, name: c.name, hex: c.hex });
    }
  }

  return {
    id: String(apiProduct.id),
    slug: apiProduct.slug || `product-${apiProduct.id}`,
    name: apiProduct.name,
    displayName: apiProduct.short_name || apiProduct.name,
    brand: (apiProduct.brand.name || 'Sin marca').toLowerCase(),
    brandLogo: apiProduct.brand.logo_url || undefined,
    thumbnail: apiProduct.images[0] || '/images/products/placeholder.jpg',
    images: apiProduct.images.length > 0 ? apiProduct.images : ['/images/products/placeholder.jpg'],
    colors: colors.length > 0 ? colors : undefined,
    deviceType: mapDeviceType(apiProduct.type || 'laptop'),
    price,
    originalPrice: undefined,
    discount: undefined,
    quotaMonthly,
    quotaBiweekly,
    quotaWeekly,
    maxTermMonths: 24,
    gama: inferGamaTier(price),
    condition: mapCondition(apiProduct.condition || 'nuevo'),
    stock: apiProduct.stock_available > 0 ? 'available' as StockStatus : 'out_of_stock' as StockStatus,
    stockQuantity: apiProduct.stock_available,
    usage: inferUsage(apiProduct.type || 'laptop', apiProduct.name),
    isFeatured: apiProduct.is_featured,
    isNew: apiProduct.labels.includes('nuevo'),
    tags,
    specs: productSpecs,
    rawSpecs: Object.keys(specs).length > 0 ? specs : undefined,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Create ProductSpecs from real EAV spec values.
 * Maps flat spec dict (e.g. { processor: "AMD Ryzen 5", ram: 16 }) to structured ProductSpecs.
 *
 * For accessories: only returns sub-objects when real data exists (no invented defaults).
 * For laptops/celulares/tablets: maintains current behavior with reasonable defaults.
 */
export function createSpecsFromEav(specs: Record<string, string | number | boolean>, type: string): ProductSpecs {
  // Accessories: only return specs that actually exist in the EAV data
  if (type === 'accesorio') {
    return createAccessorySpecs(specs);
  }

  const isLaptop = type === 'laptop';
  const isCelular = type === 'celular';

  // Extract processor info
  const processorStr = String(specs.processor || specs.cpu || '');
  const processorBrand: 'intel' | 'amd' | 'apple' = processorStr.toLowerCase().includes('amd') || processorStr.toLowerCase().includes('ryzen')
    ? 'amd'
    : processorStr.toLowerCase().includes('apple') || processorStr.toLowerCase().includes('m1') || processorStr.toLowerCase().includes('m2') || processorStr.toLowerCase().includes('m3')
      ? 'apple'
      : 'intel';

  const ram = Number(specs.ram || specs.ram_gb || 8);
  const storage = Number(specs.storage || specs.storage_gb || specs.ssd || 256);
  const screenSize = Number(specs.screen_size || specs.display_size || (isLaptop ? 15.6 : isCelular ? 6.5 : 10));

  return {
    processor: {
      brand: processorBrand,
      model: processorStr || (processorBrand === 'amd' ? 'Ryzen 5' : 'Core i5'),
      cores: Number(specs.cores || specs.cpu_cores || 4),
      speed: String(specs.cpu_speed || specs.speed || '3.5 GHz'),
    },
    ram: {
      size: ram,
      type: String(specs.ram_type || 'DDR4'),
      maxSize: Number(specs.ram_max || ram * 2),
      expandable: specs.ram_expandable !== false,
    },
    storage: {
      size: storage,
      type: (String(specs.storage_type || 'ssd').toLowerCase() as 'ssd' | 'hdd' | 'emmc') || 'ssd',
      hasSecondSlot: Boolean(specs.has_second_slot || isLaptop),
    },
    display: {
      size: screenSize,
      resolution: mapResolution(String(specs.resolution || specs.display_resolution || 'fhd')),
      resolutionPixels: String(specs.resolution_pixels || (screenSize > 10 ? '1920x1080' : '1080x2400')),
      type: (String(specs.display_type || specs.panel_type || 'ips').toLowerCase() as 'ips' | 'tn' | 'oled' | 'va') || 'ips',
      refreshRate: Number(specs.refresh_rate || 60),
      touchScreen: Boolean(specs.touch_screen || isCelular),
    },
    gpu: {
      type: specs.gpu_dedicated ? 'dedicated' : 'integrated' as 'integrated' | 'dedicated',
      brand: String(specs.gpu_brand || (processorBrand === 'amd' ? 'AMD' : 'Intel')),
      model: String(specs.gpu || specs.gpu_model || (processorBrand === 'amd' ? 'Radeon Graphics' : 'UHD Graphics')),
      vram: specs.gpu_vram ? Number(specs.gpu_vram) : undefined,
    },
    connectivity: {
      wifi: String(specs.wifi || 'Wi-Fi 6'),
      bluetooth: String(specs.bluetooth || '5.0'),
      hasEthernet: Boolean(specs.has_ethernet ?? isLaptop),
    },
    ports: {
      usb: Number(specs.usb_ports || (isLaptop ? 2 : 0)),
      usbC: Number(specs.usb_c_ports || 1),
      hdmi: Boolean(specs.has_hdmi ?? isLaptop),
      thunderbolt: Boolean(specs.has_thunderbolt || false),
      sdCard: Boolean(specs.has_sd_card ?? isLaptop),
      headphone: true,
    },
    keyboard: {
      backlit: Boolean(specs.backlit_keyboard ?? isLaptop),
      numericPad: Boolean(specs.numeric_pad || false),
      language: 'Español Latino',
    },
    security: {
      fingerprint: Boolean(specs.fingerprint ?? true),
      facialRecognition: Boolean(specs.facial_recognition || false),
      tpmChip: Boolean(specs.tpm_chip ?? isLaptop),
    },
    os: {
      hasWindows: Boolean(specs.has_windows ?? isLaptop),
      windowsVersion: specs.windows_version ? String(specs.windows_version) : (isLaptop ? 'Windows 11 Home' : undefined),
    },
    battery: {
      capacity: String(specs.battery_capacity || specs.battery || (isLaptop ? '45Wh' : '5000mAh')),
      life: String(specs.battery_life || (isLaptop ? '8 horas' : '24 horas')),
    },
    dimensions: {
      weight: Number(specs.weight || (isLaptop ? 1.8 : 0.2)),
      thickness: Number(specs.thickness || (isLaptop ? 19.9 : 8.5)),
    },
  };
}

/**
 * Create specs for accessories - only populate sub-objects when real EAV data exists.
 * No invented defaults (no fake processor, RAM, etc.).
 */
function createAccessorySpecs(specs: Record<string, string | number | boolean>): ProductSpecs {
  const result: ProductSpecs = {};

  // Display - only if screen-related specs exist
  const hasDisplay = specs.screen_size || specs.display_size || specs.screen_resolution || specs.resolution_pixels;
  if (hasDisplay) {
    const screenSize = Number(specs.screen_size || specs.display_size || 0);
    result.display = {
      size: screenSize,
      resolution: mapResolution(String(specs.screen_resolution || specs.resolution || 'fhd')),
      resolutionPixels: String(specs.resolution_pixels || specs.screen_resolution || ''),
      type: (String(specs.panel_type || specs.display_type || 'ips').toLowerCase() as 'ips' | 'tn' | 'oled' | 'va'),
      refreshRate: Number(specs.refresh_rate || 60),
      touchScreen: Boolean(specs.touch_screen || false),
    };
  }

  // Connectivity - only if bluetooth or wifi exist
  const hasConnectivity = specs.bluetooth_version || specs.bluetooth || specs.wifi;
  if (hasConnectivity) {
    result.connectivity = {
      wifi: specs.wifi ? String(specs.wifi) : '',
      bluetooth: String(specs.bluetooth_version || specs.bluetooth || ''),
      hasEthernet: Boolean(specs.has_ethernet || false),
    };
  }

  // Battery - only if battery specs exist
  const hasBattery = specs.battery_capacity || specs.battery || specs.battery_life;
  if (hasBattery) {
    result.battery = {
      capacity: String(specs.battery_capacity || specs.battery || ''),
      life: String(specs.battery_life || ''),
    };
  }

  // Dimensions - only if weight or thickness exist
  if (specs.weight || specs.thickness) {
    result.dimensions = {
      weight: Number(specs.weight || 0),
      thickness: Number(specs.thickness || 0),
    };
  }

  // OS - only if explicitly present
  if (specs.operating_system || specs.has_windows) {
    result.os = {
      hasWindows: Boolean(specs.has_windows || false),
      windowsVersion: specs.windows_version ? String(specs.windows_version) : undefined,
    };
  }

  return result;
}

/**
 * Map resolution string to Resolution type
 */
function mapResolution(res: string): 'hd' | 'fhd' | 'qhd' | '4k' {
  const lower = res.toLowerCase();
  if (lower.includes('4k') || lower.includes('2160') || lower.includes('uhd')) return '4k';
  if (lower.includes('qhd') || lower.includes('2k') || lower.includes('1440')) return 'qhd';
  if (lower.includes('fhd') || lower.includes('1080') || lower.includes('full')) return 'fhd';
  return 'hd';
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

/**
 * Fetch products directly without landing context.
 * Returns products mapped to frontend format.
 */
export async function fetchDirectCatalogData(): Promise<{
  products: CatalogProduct[];
  total: number;
} | null> {
  const response = await getDirectCatalogProducts();

  if (!response || response.products.length === 0) {
    return null;
  }

  return {
    products: response.products.map(mapDirectApiProductToCatalogProduct),
    total: response.total,
  };
}
