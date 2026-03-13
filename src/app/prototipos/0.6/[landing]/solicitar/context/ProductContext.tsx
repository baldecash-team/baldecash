'use client';

/**
 * ProductContext - Selected product state for wizard
 * Stores the product selected before starting the wizard
 * Persists to localStorage for refresh survival
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, useMemo, useRef } from 'react';
import type { Accessory, InsurancePlan } from '../types/upsell';

// Dynamic storage keys based on landing slug
const getStorageKey = (landing: string) => `baldecash-${landing}-solicitar-selected-product`;
const getCartProductsKey = (landing: string) => `baldecash-${landing}-solicitar-cart-products`;
const getAccessoriesKey = (landing: string) => `baldecash-${landing}-solicitar-selected-accessories`;
const getInsuranceKey = (landing: string) => `baldecash-${landing}-solicitar-selected-insurance`;
const getCouponKey = (landing: string) => `baldecash-${landing}-solicitar-applied-coupon`;

// Maximum monthly quota limit from env
const MAX_MONTHLY_QUOTA = Number(process.env.NEXT_PUBLIC_MAX_MONTHLY_QUOTA) || 600;

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
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export default ProductProvider;
