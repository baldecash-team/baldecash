// types/upsell.ts - BaldeCash v0.6 Upsell Types

export type AccessoryCategory = 'audio' | 'perifericos' | 'proteccion' | 'impresoras' | 'accesorios';

export const ACCESSORY_CATEGORY_LABELS: Record<AccessoryCategory, string> = {
  'audio': 'Audio',
  'perifericos': 'Periféricos',
  'proteccion': 'Protección',
  'impresoras': 'Impresoras',
  'accesorios': 'Accesorios',
};

/**
 * Auto-classify an accessory by product name keywords.
 * Used when the backend returns a generic category (e.g. "accesorios" for all).
 */
const CATEGORY_KEYWORDS: { category: AccessoryCategory; keywords: string[] }[] = [
  { category: 'audio', keywords: ['airpods', 'audífono', 'audifono', 'auricular', 'speaker', 'parlante', 'headset', 'headphone', 'earbuds', 'earphone'] },
  { category: 'impresoras', keywords: ['impresora', 'multifunción', 'multifuncion', 'printer'] },
  { category: 'perifericos', keywords: ['mouse', 'teclado', 'keyboard', 'ratón', 'raton', 'combo gamer', 'lápiz', 'lapiz', 'stylus', 'monitor', 'pantalla'] },
  { category: 'proteccion', keywords: ['funda', 'case', 'mochila', 'protector', 'estuche', 'cover'] },
];

export function classifyAccessory(name: string): AccessoryCategory {
  const lower = name.toLowerCase();
  for (const { category, keywords } of CATEGORY_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }
  return 'accesorios';
}

export interface AccessorySpec {
  label: string;
  value: string;
}

export interface Accessory {
  id: string;
  name: string;
  description: string;
  price: number;
  monthlyQuota: number;
  image: string;
  thumbnailUrl?: string;
  category: AccessoryCategory;
  term?: number;
  isRecommended: boolean;
  compatibleWith: string[];
  specs?: AccessorySpec[];
  brand?: { name: string; slug: string } | null;
}

export type InsuranceTier = 'basic' | 'standard' | 'premium';

export interface CoverageItem {
  name: string;
  description: string;
  icon: string;
  maxAmount?: number;
}

export interface InsurancePlan {
  id: string;
  code: string;
  name: string;
  description: string;
  monthlyPrice: number;
  totalPrice: number;
  paymentMonths: number;
  insuranceType: string;
  coverage: CoverageItem[];
  exclusions: string[];
  isRecommended: boolean;
  tier: InsuranceTier;
  durationMonths: number;
  provider?: { name: string; code: string } | null;
}

export interface UpsellState {
  selectedAccessories: string[];
  selectedInsurance: string | null;
  totalProductPrice: number;
  totalAccessoriesPrice: number;
  totalInsurancePrice: number;
  grandTotal: number;
  monthlyQuota: number;
}

// Mock product for context
export interface ProductContext {
  id: string;
  name: string;
  price: number;
  monthlyQuota: number;
  term: number;
}
