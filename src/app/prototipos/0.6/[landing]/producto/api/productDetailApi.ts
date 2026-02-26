/**
 * Product Detail API Client
 * Fetches product detail data from backend and transforms to frontend types
 */

import {
  ProductDetail,
  PaymentPlan,
  InitialPaymentOption,
  SimilarProduct,
  SimilarProductImage,
  ProductLimitation,
  Certification,
  ProductImage,
  ProductColor,
  ProductSpec,
  SpecItem,
  ProductPort,
  ProductSoftware,
  ProductFeature,
  ProductBadge,
  SimilarProductColor,
  InitialPaymentPercentage,
} from '../types/detail';

// API base URL - uses environment variable or falls back to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1';

// ============================================
// API Response Types (from backend)
// ============================================

interface ApiProductImage {
  id: number;
  url: string;
  alt: string;
  type: string;
  variant_id?: number;
}

interface ApiProductColor {
  id: string;
  name: string;
  hex: string;
}

interface ApiProductBadge {
  type: string;
  icon: string | null;
  text: string;
  variant: string;
}

interface ApiSpecItem {
  label: string;
  value: string;
  tooltip: string | null;
  highlight: boolean;
}

interface ApiSpecCategory {
  category: string;
  icon: string;
  specs: ApiSpecItem[];
}

interface ApiProductPort {
  name: string;
  icon: string;
  count: number;
  position: string;
}

interface ApiProductSoftware {
  name: string;
  icon: string;
  included: boolean;
  description: string | null;
}

interface ApiProductFeature {
  icon: string;
  title: string;
  description: string;
}

interface ApiProductData {
  id: string;
  slug: string;
  name: string;
  display_name: string;
  brand: string;
  category: string;
  price: string;
  original_price: string | null;
  discount: string | null;
  lowest_quota: string;
  original_quota: string | null;
  images: ApiProductImage[];
  colors: ApiProductColor[];
  description: string;
  short_description: string;
  badges: ApiProductBadge[];
  specs: ApiSpecCategory[];
  ports: ApiProductPort[];
  software: ApiProductSoftware[];
  features: ApiProductFeature[];
  battery_life: string | null;
  fast_charge: string | null;
  has_os: boolean;
  os_name: string | null;
  warranty: string | null;
  stock: number;
  rating: number | null;
  review_count: number;
}

interface ApiInitialPaymentOption {
  initial_percent: number;
  initial_amount: string;
  monthly_quota: string;
  original_quota: string | null;
}

interface ApiPaymentPlan {
  term: number;
  options: ApiInitialPaymentOption[];
}

interface ApiSimilarProductColor {
  id: string;
  name: string;
  hex: string;
}

/** Imagen de producto similar - puede venir como string o como objeto con variant_id */
interface ApiSimilarProductImage {
  url: string;
  variant_id?: number;
}

interface ApiSimilarProduct {
  id: string;
  name: string;
  display_name: string;
  brand: string;
  thumbnail: string;
  images: (string | ApiSimilarProductImage)[];  // Soporta ambos formatos
  colors: ApiSimilarProductColor[];
  monthly_quota: string;
  quota_difference: number;
  match_score: number;
  differentiators: string[];
  slug: string;
  specs: null;
}

interface ApiLimitation {
  category: string;
  description: string;
  severity: string;
  alternative: string | null;
  icon: string;
}

interface ApiCertification {
  code: string;
  name: string;
  logo: string | null;
  description: string | null;
  learn_more_url: string | null;
}

interface ApiProductDetailResponse {
  product: ApiProductData;
  payment_plans: ApiPaymentPlan[];
  similar_products: ApiSimilarProduct[];
  limitations: ApiLimitation[];
  certifications: ApiCertification[];
}

// ============================================
// Transform Functions
// ============================================

function transformImage(apiImage: ApiProductImage): ProductImage {
  return {
    id: String(apiImage.id),
    url: apiImage.url,
    alt: apiImage.alt,
    type: (apiImage.type as ProductImage['type']) || 'gallery',
    variantId: apiImage.variant_id,
  };
}

function transformColor(apiColor: ApiProductColor): ProductColor {
  return {
    id: apiColor.id,
    name: apiColor.name,
    hex: apiColor.hex,
  };
}

function transformBadge(apiBadge: ApiProductBadge): ProductBadge {
  return {
    type: apiBadge.type as ProductBadge['type'],
    icon: apiBadge.icon || undefined,
    text: apiBadge.text,
    variant: (apiBadge.variant as ProductBadge['variant']) || 'primary',
  };
}

function transformSpecItem(apiSpec: ApiSpecItem): SpecItem {
  return {
    label: apiSpec.label,
    value: apiSpec.value,
    tooltip: apiSpec.tooltip || undefined,
    highlight: apiSpec.highlight || false,
  };
}

function transformSpecCategory(apiCategory: ApiSpecCategory): ProductSpec {
  return {
    category: apiCategory.category,
    icon: apiCategory.icon,
    specs: apiCategory.specs.map(transformSpecItem),
  };
}

function transformPort(apiPort: ApiProductPort): ProductPort {
  return {
    name: apiPort.name,
    icon: apiPort.icon,
    count: apiPort.count,
    position: apiPort.position as ProductPort['position'],
  };
}

function transformSoftware(apiSoftware: ApiProductSoftware): ProductSoftware {
  return {
    name: apiSoftware.name,
    icon: apiSoftware.icon,
    included: apiSoftware.included,
    description: apiSoftware.description || undefined,
  };
}

function transformFeature(apiFeature: ApiProductFeature): ProductFeature {
  return {
    icon: apiFeature.icon,
    title: apiFeature.title,
    description: apiFeature.description,
  };
}

function transformPaymentPlan(apiPlan: ApiPaymentPlan): PaymentPlan {
  return {
    term: apiPlan.term,
    options: apiPlan.options.map((opt): InitialPaymentOption => ({
      initialPercent: opt.initial_percent as InitialPaymentPercentage,
      initialAmount: parseFloat(opt.initial_amount),
      monthlyQuota: parseFloat(opt.monthly_quota),
      originalQuota: opt.original_quota ? parseFloat(opt.original_quota) : undefined,
    })),
  };
}

function transformSimilarProduct(apiProduct: ApiSimilarProduct): SimilarProduct {
  // Transformar imágenes: soporta tanto string[] como objeto[] con variant_id
  const transformedImages: SimilarProductImage[] = apiProduct.images.map((img) => {
    if (typeof img === 'string') {
      return { url: img };
    }
    return {
      url: img.url,
      variantId: img.variant_id,
    };
  });

  return {
    id: apiProduct.id,
    name: apiProduct.name,
    displayName: apiProduct.display_name || apiProduct.name,
    brand: apiProduct.brand,
    thumbnail: apiProduct.thumbnail,
    images: transformedImages,
    colors: apiProduct.colors.map((c): SimilarProductColor => ({
      id: c.id,
      name: c.name,
      hex: c.hex,
    })),
    monthlyQuota: parseFloat(apiProduct.monthly_quota),
    quotaDifference: apiProduct.quota_difference,
    matchScore: apiProduct.match_score,
    differentiators: apiProduct.differentiators,
    slug: apiProduct.slug,
    specs: undefined,
  };
}

function transformLimitation(apiLimitation: ApiLimitation): ProductLimitation {
  return {
    category: apiLimitation.category,
    description: apiLimitation.description,
    severity: apiLimitation.severity as ProductLimitation['severity'],
    alternative: apiLimitation.alternative || undefined,
    icon: apiLimitation.icon,
  };
}

function transformCertification(apiCert: ApiCertification): Certification {
  return {
    code: apiCert.code,
    name: apiCert.name,
    logo: apiCert.logo || '',
    description: apiCert.description || '',
    learnMoreUrl: apiCert.learn_more_url || undefined,
  };
}

function transformProductData(apiProduct: ApiProductData): ProductDetail {
  return {
    id: apiProduct.id,
    slug: apiProduct.slug,
    name: apiProduct.name,
    displayName: apiProduct.display_name,
    brand: apiProduct.brand,
    category: apiProduct.category,
    price: parseFloat(apiProduct.price),
    originalPrice: apiProduct.original_price ? parseFloat(apiProduct.original_price) : undefined,
    discount: apiProduct.discount ? parseFloat(apiProduct.discount) : undefined,
    lowestQuota: parseFloat(apiProduct.lowest_quota),
    originalQuota: apiProduct.original_quota ? parseFloat(apiProduct.original_quota) : undefined,
    images: apiProduct.images.map(transformImage),
    colors: apiProduct.colors.map(transformColor),
    description: apiProduct.description,
    shortDescription: apiProduct.short_description,
    specs: apiProduct.specs.map(transformSpecCategory),
    ports: apiProduct.ports.map(transformPort),
    software: apiProduct.software.map(transformSoftware),
    features: apiProduct.features.map(transformFeature),
    badges: apiProduct.badges.map(transformBadge),
    batteryLife: apiProduct.battery_life || '',
    fastCharge: apiProduct.fast_charge || undefined,
    hasOS: apiProduct.has_os,
    osName: apiProduct.os_name || undefined,
    warranty: apiProduct.warranty || '1 año de garantía',
    stock: apiProduct.stock,
    rating: apiProduct.rating || 0,
    reviewCount: apiProduct.review_count,
  };
}

// ============================================
// API Result Types
// ============================================

export interface ProductDetailResult {
  product: ProductDetail;
  paymentPlans: PaymentPlan[];
  similarProducts: SimilarProduct[];
  limitations: ProductLimitation[];
  certifications: Certification[];
}

export interface FetchError {
  message: string;
  status?: number;
}

// ============================================
// API Functions
// ============================================

/**
 * Fetch product detail from API
 * @param slug - Product slug
 * @returns Product detail data or null if not found
 */
export async function fetchProductDetail(slug: string): Promise<ProductDetailResult | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${slug}/detail`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data: ApiProductDetailResponse = await response.json();

    return {
      product: transformProductData(data.product),
      paymentPlans: data.payment_plans.map(transformPaymentPlan),
      similarProducts: data.similar_products.map(transformSimilarProduct),
      limitations: data.limitations.map(transformLimitation),
      certifications: data.certifications.map(transformCertification),
    };
  } catch (error) {
    console.error('Error fetching product detail:', error);
    throw error;
  }
}

/**
 * Hook-friendly fetch with loading/error states
 */
export async function getProductDetail(slug: string): Promise<{
  data: ProductDetailResult | null;
  error: FetchError | null;
}> {
  try {
    const data = await fetchProductDetail(slug);
    return { data, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      data: null,
      error: { message },
    };
  }
}
