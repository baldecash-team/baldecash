// types/upsell.ts - BaldeCash v0.5 Upsell Types (Simplificado)

export type AccessoryCategory = 'protección' | 'audio' | 'almacenamiento' | 'conectividad';

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
  category: AccessoryCategory;
  isRecommended: boolean;
  compatibleWith: string[];
  specs?: AccessorySpec[];
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
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  coverage: CoverageItem[];
  exclusions: string[];
  isRecommended: boolean;
  tier: InsuranceTier;
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
