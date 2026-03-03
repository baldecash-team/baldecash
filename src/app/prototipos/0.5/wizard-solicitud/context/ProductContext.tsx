'use client';

/**
 * ProductContext - Selected product state for wizard
 * Stores the product selected before starting the wizard
 * Persists to localStorage for refresh survival
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { Accessory } from '@/app/prototipos/0.5/upsell/types/upsell';

const STORAGE_KEY = 'baldecash-wizard-selected-product';
const CART_PRODUCTS_STORAGE_KEY = 'baldecash-wizard-cart-products';
const ACCESSORIES_STORAGE_KEY = 'baldecash-wizard-selected-accessories';
const COUPON_STORAGE_KEY = 'baldecash-wizard-applied-coupon';

export interface SelectedProduct {
  id: string;
  name: string;
  shortName: string;
  brand: string;
  price: number;
  monthlyPayment: number;
  months: number;
  image: string;
  specs?: {
    processor?: string;
    ram?: string;
    storage?: string;
  };
}

export type { Accessory };

export interface AppliedCoupon {
  code: string;
  discount: number;
  label: string;
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
  getTotalPrice: () => number;
  getTotalMonthlyPayment: () => number;
  getDiscountedMonthlyPayment: () => number;
  isHydrated: boolean;
  // Estado de la barra de producto (mobile)
  isProductBarExpanded: boolean;
  setIsProductBarExpanded: (expanded: boolean) => void;
}

const ProductContext = createContext<ProductContextValue | undefined>(undefined);

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const [selectedProduct, setSelectedProductState] = useState<SelectedProduct | null>(null);
  const [cartProducts, setCartProductsState] = useState<SelectedProduct[]>([]);
  const [selectedAccessories, setSelectedAccessoriesState] = useState<Accessory[]>([]);
  const [appliedCoupon, setAppliedCouponState] = useState<AppliedCoupon | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isProductBarExpanded, setIsProductBarExpanded] = useState(false);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const storedProduct = localStorage.getItem(STORAGE_KEY);
      if (storedProduct) {
        setSelectedProductState(JSON.parse(storedProduct));
      }
      const storedCartProducts = localStorage.getItem(CART_PRODUCTS_STORAGE_KEY);
      if (storedCartProducts) {
        setCartProductsState(JSON.parse(storedCartProducts));
      }
      const storedAccessories = localStorage.getItem(ACCESSORIES_STORAGE_KEY);
      if (storedAccessories) {
        setSelectedAccessoriesState(JSON.parse(storedAccessories));
      }
      const storedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
      if (storedCoupon) {
        setAppliedCouponState(JSON.parse(storedCoupon));
      }
    } catch {
      // localStorage not available or invalid JSON
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage when product changes
  const setSelectedProduct = useCallback((product: SelectedProduct | null) => {
    setSelectedProductState(product);
    try {
      if (product) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(product));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  const clearProduct = useCallback(() => {
    setSelectedProductState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage not available
    }
  }, []);

  // Cart products functions (multi-product)
  const setCartProducts = useCallback((products: SelectedProduct[]) => {
    setCartProductsState(products);
    try {
      if (products.length > 0) {
        localStorage.setItem(CART_PRODUCTS_STORAGE_KEY, JSON.stringify(products));
      } else {
        localStorage.removeItem(CART_PRODUCTS_STORAGE_KEY);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  const clearCartProducts = useCallback(() => {
    setCartProductsState([]);
    try {
      localStorage.removeItem(CART_PRODUCTS_STORAGE_KEY);
    } catch {
      // localStorage not available
    }
  }, []);

  // Accessories functions
  const setSelectedAccessories = useCallback((accessories: Accessory[]) => {
    setSelectedAccessoriesState(accessories);
    try {
      if (accessories.length > 0) {
        localStorage.setItem(ACCESSORIES_STORAGE_KEY, JSON.stringify(accessories));
      } else {
        localStorage.removeItem(ACCESSORIES_STORAGE_KEY);
      }
    } catch {
      // localStorage not available
    }
  }, []);

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
        localStorage.setItem(ACCESSORIES_STORAGE_KEY, JSON.stringify(selectedAccessories));
      } else {
        localStorage.removeItem(ACCESSORIES_STORAGE_KEY);
      }
    } catch {
      // localStorage not available
    }
  }, [selectedAccessories, isHydrated]);

  const clearAccessories = useCallback(() => {
    setSelectedAccessoriesState([]);
    try {
      localStorage.removeItem(ACCESSORIES_STORAGE_KEY);
    } catch {
      // localStorage not available
    }
  }, []);

  // Coupon functions
  const setAppliedCoupon = useCallback((coupon: AppliedCoupon | null) => {
    setAppliedCouponState(coupon);
    try {
      if (coupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  const clearCoupon = useCallback(() => {
    setAppliedCouponState(null);
    try {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    } catch {
      // localStorage not available
    }
  }, []);

  // Calculate totals
  const getTotalPrice = useCallback(() => {
    const productPrice = selectedProduct?.price || 0;
    const accessoriesPrice = selectedAccessories.reduce((sum, acc) => sum + acc.price, 0);
    return productPrice + accessoriesPrice;
  }, [selectedProduct, selectedAccessories]);

  const getTotalMonthlyPayment = useCallback(() => {
    const productMonthly = selectedProduct?.monthlyPayment || 0;
    const accessoriesMonthly = selectedAccessories.reduce((sum, acc) => sum + acc.monthlyQuota, 0);
    return productMonthly + accessoriesMonthly;
  }, [selectedProduct, selectedAccessories]);

  const getDiscountedMonthlyPayment = useCallback(() => {
    const total = getTotalMonthlyPayment();
    const discount = appliedCoupon?.discount || 0;
    return Math.max(0, total - discount);
  }, [getTotalMonthlyPayment, appliedCoupon]);

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
        getTotalPrice,
        getTotalMonthlyPayment,
        getDiscountedMonthlyPayment,
        isHydrated,
        isProductBarExpanded,
        setIsProductBarExpanded,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export default ProductProvider;
