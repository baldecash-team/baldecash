// types/upsell.ts - BaldeCash v0.6 Upsell Types

export type AccessoryCategory = 'protección' | 'audio' | 'almacenamiento' | 'conectividad' | 'accesorios';

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
