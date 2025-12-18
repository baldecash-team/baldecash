// Upsell Types - BaldeCash v0.3
// Generated from PROMPT_14_UPSELL.md

export interface Accessory {
  id: string;
  name: string;
  description: string;
  price: number;
  monthlyQuota: number;
  image: string;
  category: 'proteccion' | 'audio' | 'almacenamiento' | 'conectividad';
  isRecommended: boolean;
  compatibleWith: string[]; // IDs de productos
}

export interface InsurancePlan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  coverage: CoverageItem[];
  exclusions: string[];
  isRecommended: boolean;
  tier: 'basic' | 'standard' | 'premium';
}

export interface CoverageItem {
  name: string;
  description: string;
  icon: string;
  maxAmount?: number;
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

export interface UpsellConfig {
  // Layout versions
  accessoryCardVersion: 1 | 2 | 3;
  insurancePlanVersion: 1 | 2 | 3;

  // D.1: How to introduce accessories
  accessoriesIntro: 'subtle' | 'direct' | 'social_proof';

  // D.4: Accessory limit
  accessoryLimit: 'none' | 'max_three' | 'warning_total';

  // D.5: Selected state indicator
  selectedIndicator: 'checkmark' | 'badge' | 'button_change';

  // D.6: Remove accessory method
  removeMethod: 'x_button' | 'toggle' | 'click_deselect';

  // D.8: Price breakdown display
  breakdownDisplay: 'always_visible' | 'tooltip' | 'expandable';

  // E.1: Insurance framing
  insuranceFraming: 'protection' | 'peace_of_mind' | 'direct';

  // E.2: Protection icon
  protectionIcon: 'shield' | 'umbrella' | 'lock';

  // E.4: Recommended plan highlight
  recommendedHighlight: 'badge' | 'larger_card' | 'preselected';

  // E.5: Coverage display
  coverageDisplay: 'checklist' | 'tabs' | 'icons_hover';

  // E.7: Skip insurance modal tone
  skipModalTone: 'persuasive' | 'neutral' | 'last_offer';

  // E.8: Modal button style
  modalButtonStyle: 'symmetric' | 'highlight_add' | 'link_skip';
}

export const defaultUpsellConfig: UpsellConfig = {
  accessoryCardVersion: 1,
  insurancePlanVersion: 1,
  accessoriesIntro: 'subtle',
  accessoryLimit: 'none',
  selectedIndicator: 'checkmark',
  removeMethod: 'x_button',
  breakdownDisplay: 'always_visible',
  insuranceFraming: 'protection',
  protectionIcon: 'shield',
  recommendedHighlight: 'badge',
  coverageDisplay: 'checklist',
  skipModalTone: 'persuasive',
  modalButtonStyle: 'highlight_add',
};

export const defaultUpsellState: UpsellState = {
  selectedAccessories: [],
  selectedInsurance: null,
  totalProductPrice: 0,
  totalAccessoriesPrice: 0,
  totalInsurancePrice: 0,
  grandTotal: 0,
  monthlyQuota: 0,
};
