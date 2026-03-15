'use client';

/**
 * ProductContext - Selected product state for wizard
 * Stores the product selected before starting the wizard
 * Persists to localStorage for refresh survival
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, useMemo, useRef } from 'react';
import type { Accessory, InsurancePlan } from '../types/upsell';
import { calculateQuotaWithInitial, type TermMonths, type InitialPaymentPercent } from '@/app/prototipos/0.6/[landing]/catalogo/types/catalog';

// Dynamic storage keys based on landing slug
const getStorageKey = (landing: string) => `baldecash-${landing}-solicitar-selected-product`;
const getCartProductsKey = (landing: string) => `baldecash-${landing}-solicitar-cart-products`;
const getAccessoriesKey = (landing: string) => `baldecash-${landing}-solicitar-selected-accessories`;
const getInsuranceKey = (landing: string) => `baldecash-${landing}-solicitar-selected-insurance`;
const getCouponKey = (landing: string) => `baldecash-${landing}-solicitar-applied-coupon`;

// Maximum monthly quota limit from env
const MAX_MONTHLY_QUOTA = Number(process.env.NEXT_PUBLIC_MAX_MONTHLY_QUOTA) || 600;

// Payment plan option for a specific initial percentage
export interface PaymentPlanOption {
  initialPercent: number;  // 0, 10, 20, 30
  initialAmount: number;
  monthlyQuota: number;
  originalQuota?: number;
}

// Payment plan for a specific term
export interface PaymentPlan {
  term: number;  // 12, 18, 24, 36
  options: PaymentPlanOption[];
}

export interface SelectedProduct {
  id: string;
  name: string;
  shortName: string;
  brand: string;
  price: number;
  monthlyPayment: number;
  months: number;
  initialPercent: number;  // 0, 10, 20, 30 - percentage of initial payment
  initialAmount: number;   // Calculated initial payment amount
  image: string;
  type?: string;           // Product type: "celular", "laptop", "tablet", etc. Used for accessory compatibility
  specs?: {
    processor?: string;
    ram?: string;
    storage?: string;
  };
  // Variant/Color information
  variantId?: string;
  colorName?: string;
  colorHex?: string;
  // Payment plans from API (for term standardization)
  paymentPlans?: PaymentPlan[];
}

export type { Accessory, InsurancePlan };

export interface AppliedCoupon {
  code: string;
  discount: number;
  label: string;
  couponType?: 'fixed' | 'percent_quotas';
  quotasAffected?: number;
}

interface ProductContextValue {
  selectedProduct: SelectedProduct | null;
  setSelectedProduct: (product: SelectedProduct | null) => void;
  clearProduct: () => void;
  // Multi-product cart for wizard
  cartProducts: SelectedProduct[];
  setCartProducts: (products: SelectedProduct[]) => void;
  clearCartProducts: () => void;
  selectedAccessories: Accessory[];
  setSelectedAccessories: (accessories: Accessory[]) => void;
  toggleAccessory: (accessory: Accessory) => void;
  clearAccessories: () => void;
  appliedCoupon: AppliedCoupon | null;
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void;
  clearCoupon: () => void;
  // Insurance
  selectedInsurance: InsurancePlan | null;
  setSelectedInsurance: (insurance: InsurancePlan | null) => void;
  clearInsurance: () => void;
  getTotalPrice: () => number;
  getTotalMonthlyPayment: () => number;
  getDiscountAmount: () => number;
  getDiscountedMonthlyPayment: () => number;
  isHydrated: boolean;
  // Estado de la barra de producto (mobile)
  isProductBarExpanded: boolean;
  setIsProductBarExpanded: (expanded: boolean) => void;
  // Quota limit validation
  isOverQuotaLimit: boolean;
  maxMonthlyQuota: number;
  // Get all products (cart or single)
  getAllProducts: () => SelectedProduct[];
  // Term standardization for multi-product cart
  hasUnifiedTerms: () => boolean;
  getAvailableTerms: () => number[];
  updateAllProductsToTerm: (term: number) => void;
  // Initial payment per product
  updateProductInitial: (productId: string, newInitialPercent: number) => void;
  getInitialOptionsForProduct: (productId: string) => { percent: number; amount: number; label: string }[];
}

const ProductContext = createContext<ProductContextValue | undefined>(undefined);

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};

/**
 * Optional version that returns null if no Provider is present.
 * Useful for components that may be rendered outside the provider (e.g., Quiz in Hero).
 */
export const useProductOptional = () => {
  return useContext(ProductContext);
};

interface ProductProviderProps {
  children: ReactNode;
  landingSlug: string;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children, landingSlug }) => {
  const [selectedProduct, setSelectedProductState] = useState<SelectedProduct | null>(null);
  const [cartProducts, setCartProductsState] = useState<SelectedProduct[]>([]);
  const [selectedAccessories, setSelectedAccessoriesState] = useState<Accessory[]>([]);
  const [selectedInsurance, setSelectedInsuranceState] = useState<InsurancePlan | null>(null);
  const [appliedCoupon, setAppliedCouponState] = useState<AppliedCoupon | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isProductBarExpanded, setIsProductBarExpanded] = useState(false);

  // Memoize storage keys based on landing
  const storageKey = useMemo(() => getStorageKey(landingSlug), [landingSlug]);
  const cartProductsKey = useMemo(() => getCartProductsKey(landingSlug), [landingSlug]);
  const accessoriesKey = useMemo(() => getAccessoriesKey(landingSlug), [landingSlug]);
  const insuranceKey = useMemo(() => getInsuranceKey(landingSlug), [landingSlug]);
  const couponKey = useMemo(() => getCouponKey(landingSlug), [landingSlug]);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const storedProduct = localStorage.getItem(storageKey);
      if (storedProduct) {
        setSelectedProductState(JSON.parse(storedProduct));
      }
      const storedCartProducts = localStorage.getItem(cartProductsKey);
      if (storedCartProducts) {
        setCartProductsState(JSON.parse(storedCartProducts));
      }
      const storedAccessories = localStorage.getItem(accessoriesKey);
      if (storedAccessories) {
        setSelectedAccessoriesState(JSON.parse(storedAccessories));
      }
      const storedInsurance = localStorage.getItem(insuranceKey);
      if (storedInsurance) {
        setSelectedInsuranceState(JSON.parse(storedInsurance));
      }
      const storedCoupon = localStorage.getItem(couponKey);
      if (storedCoupon) {
        setAppliedCouponState(JSON.parse(storedCoupon));
      }
    } catch {
      // localStorage not available or invalid JSON
    }
    setIsHydrated(true);
  }, [storageKey, cartProductsKey, accessoriesKey, insuranceKey, couponKey]);

  // Save to localStorage when product changes
  const setSelectedProduct = useCallback((product: SelectedProduct | null) => {
    setSelectedProductState(product);
    try {
      if (product) {
        localStorage.setItem(storageKey, JSON.stringify(product));
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch {
      // localStorage not available
    }
  }, [storageKey]);

  const clearProduct = useCallback(() => {
    setSelectedProductState(null);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // localStorage not available
    }
  }, [storageKey]);

  // Cart products functions (multi-product)
  const setCartProducts = useCallback((products: SelectedProduct[]) => {
    setCartProductsState(products);
    try {
      if (products.length > 0) {
        localStorage.setItem(cartProductsKey, JSON.stringify(products));
      } else {
        localStorage.removeItem(cartProductsKey);
      }
    } catch {
      // localStorage not available
    }
  }, [cartProductsKey]);

  const clearCartProducts = useCallback(() => {
    setCartProductsState([]);
    try {
      localStorage.removeItem(cartProductsKey);
    } catch {
      // localStorage not available
    }
  }, [cartProductsKey]);

  // Accessories functions
  const setSelectedAccessories = useCallback((accessories: Accessory[]) => {
    setSelectedAccessoriesState(accessories);
    try {
      if (accessories.length > 0) {
        localStorage.setItem(accessoriesKey, JSON.stringify(accessories));
      } else {
        localStorage.removeItem(accessoriesKey);
      }
    } catch {
      // localStorage not available
    }
  }, [accessoriesKey]);

  const toggleAccessory = useCallback((accessory: Accessory) => {
    setSelectedAccessoriesState((prev) => {
      const exists = prev.find((a) => a.id === accessory.id);
      return exists
        ? prev.filter((a) => a.id !== accessory.id)
        : [...prev, accessory];
    });
  }, []);

  // Sync accessories to localStorage via useEffect (async, doesn't block animation)
  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (selectedAccessories.length > 0) {
        localStorage.setItem(accessoriesKey, JSON.stringify(selectedAccessories));
      } else {
        localStorage.removeItem(accessoriesKey);
      }
    } catch {
      // localStorage not available
    }
  }, [selectedAccessories, isHydrated, accessoriesKey]);

  const clearAccessories = useCallback(() => {
    setSelectedAccessoriesState([]);
    try {
      localStorage.removeItem(accessoriesKey);
    } catch {
      // localStorage not available
    }
  }, [accessoriesKey]);

  // Insurance functions
  const setSelectedInsurance = useCallback((insurance: InsurancePlan | null) => {
    setSelectedInsuranceState(insurance);
    try {
      if (insurance) {
        localStorage.setItem(insuranceKey, JSON.stringify(insurance));
      } else {
        localStorage.removeItem(insuranceKey);
      }
    } catch {
      // localStorage not available
    }
  }, [insuranceKey]);

  const clearInsurance = useCallback(() => {
    setSelectedInsuranceState(null);
    try {
      localStorage.removeItem(insuranceKey);
    } catch {
      // localStorage not available
    }
  }, [insuranceKey]);

  // Coupon functions
  const setAppliedCoupon = useCallback((coupon: AppliedCoupon | null) => {
    setAppliedCouponState(coupon);
    try {
      if (coupon) {
        localStorage.setItem(couponKey, JSON.stringify(coupon));
      } else {
        localStorage.removeItem(couponKey);
      }
    } catch {
      // localStorage not available
    }
  }, [couponKey]);

  const clearCoupon = useCallback(() => {
    setAppliedCouponState(null);
    try {
      localStorage.removeItem(couponKey);
    } catch {
      // localStorage not available
    }
  }, [couponKey]);

  // Track previous product ID to detect changes
  const prevProductIdRef = useRef<string | null>(null);

  // Clear coupon when product changes (coupon may not be valid for new product)
  useEffect(() => {
    if (!isHydrated) return;

    const currentProductId = selectedProduct?.id || cartProducts[0]?.id || null;

    // Only clear if product CHANGED (not on initial load)
    if (
      prevProductIdRef.current !== null &&
      prevProductIdRef.current !== currentProductId &&
      appliedCoupon
    ) {
      clearCoupon();
    }

    prevProductIdRef.current = currentProductId;
  }, [selectedProduct?.id, cartProducts, isHydrated, appliedCoupon, clearCoupon]);

  // Get all products (cart or single)
  const getAllProducts = useCallback((): SelectedProduct[] => {
    if (cartProducts.length > 0) return cartProducts;
    if (selectedProduct) return [selectedProduct];
    return [];
  }, [cartProducts, selectedProduct]);

  // Calculate totals - considers both cartProducts and selectedProduct
  const getTotalPrice = useCallback(() => {
    const products = getAllProducts();
    const productsPrice = products.reduce((sum, p) => sum + p.price, 0);
    const accessoriesPrice = selectedAccessories.reduce((sum, acc) => sum + acc.price, 0);
    const insurancePrice = selectedInsurance?.yearlyPrice || 0;
    return productsPrice + accessoriesPrice + insurancePrice;
  }, [getAllProducts, selectedAccessories, selectedInsurance]);

  const getTotalMonthlyPayment = useCallback(() => {
    const products = getAllProducts();
    const productsMonthly = products.reduce((sum, p) => sum + p.monthlyPayment, 0);
    const accessoriesMonthly = selectedAccessories.reduce((sum, acc) => sum + acc.monthlyQuota, 0);
    const insuranceMonthly = selectedInsurance?.monthlyPrice || 0;
    return productsMonthly + accessoriesMonthly + insuranceMonthly;
  }, [getAllProducts, selectedAccessories, selectedInsurance]);

  /**
   * Calculate the discount amount based on coupon type
   * - fixed: discount is a fixed amount (e.g., S/50)
   * - percent_quotas: discount is a percentage (e.g., 10 = 10%)
   */
  const getDiscountAmount = useCallback(() => {
    const total = getTotalMonthlyPayment();

    if (!appliedCoupon) return 0;

    if (appliedCoupon.couponType === 'fixed') {
      // Fixed amount: return as-is
      return appliedCoupon.discount;
    } else if (appliedCoupon.couponType === 'percent_quotas') {
      // Percentage: calculate amount based on total
      return total * (appliedCoupon.discount / 100);
    }

    // Fallback: treat as fixed amount (backwards compatibility)
    return appliedCoupon.discount;
  }, [getTotalMonthlyPayment, appliedCoupon]);

  const getDiscountedMonthlyPayment = useCallback(() => {
    const total = getTotalMonthlyPayment();
    const discountAmount = getDiscountAmount();
    return Math.max(0, total - discountAmount);
  }, [getTotalMonthlyPayment, getDiscountAmount]);

  // Check if over quota limit
  const isOverQuotaLimit = getTotalMonthlyPayment() > MAX_MONTHLY_QUOTA;

  // ============================================
  // Term Standardization Functions
  // ============================================

  /**
   * Check if all products have the same term (months)
   * Returns true if single product or all products have same term
   */
  const hasUnifiedTerms = useCallback((): boolean => {
    const products = getAllProducts();
    if (products.length <= 1) return true;
    const firstTerm = products[0].months;
    return products.every(p => p.months === firstTerm);
  }, [getAllProducts]);

  /**
   * Get available terms that ALL products support
   * Returns intersection of terms from all products' paymentPlans
   */
  const getAvailableTerms = useCallback((): number[] => {
    const products = getAllProducts();
    if (products.length === 0) return [12, 18, 24, 36]; // Default terms

    // Get terms for each product
    const termsPerProduct = products.map(p => {
      if (p.paymentPlans && p.paymentPlans.length > 0) {
        return p.paymentPlans.map(plan => plan.term);
      }
      // Fallback: if no plans, assume all standard terms are available
      return [12, 18, 24, 36];
    });

    // Find intersection of all terms
    const intersection = termsPerProduct.reduce((acc, terms) => {
      return acc.filter(t => terms.includes(t));
    });

    return intersection.sort((a, b) => a - b);
  }, [getAllProducts]);

  /**
   * Update all products to use the same term
   * Recalculates monthlyPayment and initialAmount using paymentPlans
   * Falls back to calculateQuotaWithInitial if no plans available
   */
  const updateAllProductsToTerm = useCallback((term: number) => {
    const products = getAllProducts();
    if (products.length === 0) return;

    const updatedProducts = products.map(p => {
      // Find the payment plan for this term
      const plan = p.paymentPlans?.find(pl => pl.term === term);

      if (plan) {
        // Use real API data
        // Find the option matching current initialPercent, or default to 0%
        const option = plan.options.find(opt => opt.initialPercent === p.initialPercent)
          || plan.options.find(opt => opt.initialPercent === 0)
          || plan.options[0];

        if (option) {
          return {
            ...p,
            months: term,
            monthlyPayment: option.monthlyQuota,
            initialAmount: option.initialAmount,
            initialPercent: option.initialPercent,
          };
        }
      }

      // Fallback: calculate using formula (may not match exact API values but better than nothing)
      // This handles products added before paymentPlans were saved
      const validInitialPercent = [0, 10, 20, 30].includes(p.initialPercent)
        ? p.initialPercent as InitialPaymentPercent
        : 0;
      const validTerm = [12, 18, 24, 36].includes(term)
        ? term as TermMonths
        : 24;

      const { quota, initialAmount } = calculateQuotaWithInitial(
        p.price,
        validTerm,
        validInitialPercent
      );

      return {
        ...p,
        months: term,
        monthlyPayment: quota,
        initialAmount: initialAmount,
        initialPercent: validInitialPercent,
      };
    });

    // Update state
    if (cartProducts.length > 0) {
      setCartProducts(updatedProducts);
    }
    if (selectedProduct) {
      setSelectedProduct(updatedProducts[0]);
    }
  }, [getAllProducts, cartProducts, selectedProduct, setCartProducts, setSelectedProduct]);

  /**
   * Get available initial payment options for a specific product
   * Returns array of { percent, amount, label } based on current term
   * Falls back to calculated values if paymentPlans not available
   */
  const getInitialOptionsForProduct = useCallback((productId: string): { percent: number; amount: number; label: string }[] => {
    const products = getAllProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return [];

    // Try to use paymentPlans data first
    if (product.paymentPlans && product.paymentPlans.length > 0) {
      const plan = product.paymentPlans.find(p => p.term === product.months);
      if (plan?.options) {
        return plan.options.map(opt => ({
          percent: opt.initialPercent,
          amount: opt.initialAmount,
          label: opt.initialPercent === 0
            ? 'Sin inicial'
            : `S/${Math.floor(opt.initialAmount).toLocaleString()}`,
        }));
      }
    }

    // Fallback: Calculate options based on product price
    const initialPercentages = [0, 10, 20, 30] as const;
    return initialPercentages.map(percent => {
      const amount = Math.floor(product.price * (percent / 100));
      return {
        percent,
        amount,
        label: percent === 0 ? 'Sin inicial' : `S/${amount.toLocaleString()}`,
      };
    });
  }, [getAllProducts]);

  /**
   * Update initial payment for a specific product
   * Recalculates monthlyPayment based on paymentPlans or calculation fallback
   */
  const updateProductInitial = useCallback((productId: string, newInitialPercent: number) => {
    const updateProduct = (product: SelectedProduct): SelectedProduct => {
      if (product.id !== productId) return product;

      // Try to use paymentPlans data first
      const plan = product.paymentPlans?.find(p => p.term === product.months);
      if (plan?.options) {
        const option = plan.options.find(o => o.initialPercent === newInitialPercent);
        if (option) {
          return {
            ...product,
            initialPercent: newInitialPercent,
            initialAmount: option.initialAmount,
            monthlyPayment: option.monthlyQuota,
          };
        }
      }

      // Fallback: Calculate using formula
      const validInitialPercent = [0, 10, 20, 30].includes(newInitialPercent)
        ? newInitialPercent as InitialPaymentPercent
        : 0;
      const validTerm = [12, 18, 24, 36].includes(product.months)
        ? product.months as TermMonths
        : 24;

      const { quota, initialAmount } = calculateQuotaWithInitial(
        product.price,
        validTerm,
        validInitialPercent
      );

      return {
        ...product,
        initialPercent: newInitialPercent,
        initialAmount: initialAmount,
        monthlyPayment: quota,
      };
    };

    // Update cart products
    if (cartProducts.length > 0) {
      setCartProducts(cartProducts.map(updateProduct));
    }

    // Update selected product if it matches
    if (selectedProduct?.id === productId) {
      setSelectedProduct(updateProduct(selectedProduct));
    }
  }, [cartProducts, selectedProduct, setCartProducts, setSelectedProduct]);

  return (
    <ProductContext.Provider
      value={{
        selectedProduct,
        setSelectedProduct,
        clearProduct,
        cartProducts,
        setCartProducts,
        clearCartProducts,
        selectedAccessories,
        setSelectedAccessories,
        toggleAccessory,
        clearAccessories,
        appliedCoupon,
        setAppliedCoupon,
        clearCoupon,
        selectedInsurance,
        setSelectedInsurance,
        clearInsurance,
        getTotalPrice,
        getTotalMonthlyPayment,
        getDiscountAmount,
        getDiscountedMonthlyPayment,
        isHydrated,
        isProductBarExpanded,
        setIsProductBarExpanded,
        isOverQuotaLimit,
        maxMonthlyQuota: MAX_MONTHLY_QUOTA,
        getAllProducts,
        hasUnifiedTerms,
        getAvailableTerms,
        updateAllProductsToTerm,
        updateProductInitial,
        getInitialOptionsForProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export default ProductProvider;
