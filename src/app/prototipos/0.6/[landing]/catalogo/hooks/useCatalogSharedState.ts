'use client';

/**
 * useCatalogSharedState - Hook para estado compartido entre catálogo y detalle de producto
 * Lee/escribe en localStorage para persistencia entre páginas
 *
 * v0.6.1: Actualizado para usar CartItem[] y WishlistItem[] con datos completos
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { fetchProductsByIds } from '@/app/prototipos/0.6/services/catalogApi';
import type {
  CartItem,
  WishlistItem,
  TermMonths,
  InitialPaymentPercent,
} from '../types/catalog';
import { migrateCartData, migrateWishlistData } from '../types/catalog';

// Dynamic storage keys based on landing slug
const getWishlistKey = (landing: string) => `baldecash-${landing}-wishlist`;
const getCartKey = (landing: string) => `baldecash-${landing}-cart`;

interface UseCatalogSharedStateReturn {
  // Wishlist - Estructura completa
  wishlist: WishlistItem[];
  wishlistCount: number;
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  getWishlistItem: (productId: string) => WishlistItem | undefined;

  // Cart - Estructura completa
  cart: CartItem[];
  cartCount: number;
  addToCart: (item: CartItem) => void;
  updateCartItem: (productId: string, updates: Partial<CartItem>) => void;
  removeFromCart: (productId: string) => void;
  isInCart: (productId: string) => boolean;
  clearCart: () => void;
  getCartItem: (productId: string) => CartItem | undefined;

  // Move from wishlist to cart
  moveToCart: (
    productId: string,
    config: { months: TermMonths; initialPercent: InitialPaymentPercent; monthlyPayment: number; initialAmount: number }
  ) => void;

  // Hydration
  isHydrated: boolean;

  // Unavailable product IDs (disabled after being added)
  unavailableCartIds: string[];
  unavailableWishlistIds: string[];

  // Legacy support: get product IDs only
  wishlistIds: string[];
  cartIds: string[];
}

export function useCatalogSharedState(landingSlug: string): UseCatalogSharedStateReturn {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Memoize storage keys based on landing
  const wishlistKey = useMemo(() => getWishlistKey(landingSlug), [landingSlug]);
  const cartKey = useMemo(() => getCartKey(landingSlug), [landingSlug]);

  // Load from localStorage on mount (with migration support)
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem(wishlistKey);
      if (savedWishlist) {
        const migrated = migrateWishlistData(savedWishlist);
        setWishlist(migrated);
        // If migration cleared data (old format), remove from storage
        if (migrated.length === 0 && savedWishlist !== '[]') {
          localStorage.removeItem(wishlistKey);
        }
      }

      const savedCart = localStorage.getItem(cartKey);
      if (savedCart) {
        const migrated = migrateCartData(savedCart);
        setCart(migrated);
        // If migration cleared data (old format), remove from storage
        if (migrated.length === 0 && savedCart !== '[]') {
          localStorage.removeItem(cartKey);
        }
      }
    } catch (e) {
      console.error('Error loading catalog state from localStorage:', e);
    }
    setIsHydrated(true);
  }, [wishlistKey, cartKey]);

  // Persist wishlist to localStorage
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
      } catch (e) {
        console.error('Error saving wishlist to localStorage:', e);
      }
    }
  }, [wishlist, isHydrated, wishlistKey]);

  // Persist cart to localStorage
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(cartKey, JSON.stringify(cart));
      } catch (e) {
        console.error('Error saving cart to localStorage:', e);
      }
    }
  }, [cart, isHydrated, cartKey]);

  // ============================================
  // Wishlist actions
  // ============================================

  const addToWishlist = useCallback((item: WishlistItem) => {
    setWishlist((prev) => {
      const exists = prev.find((w) => w.productId === item.productId);
      if (exists) {
        // Update existing item (e.g., if color changed)
        return prev.map((w) =>
          w.productId === item.productId ? { ...w, ...item, addedAt: w.addedAt } : w
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist((prev) => prev.filter((w) => w.productId !== productId));
    setUnavailableWishlistIds((prev) => prev.filter((id) => id !== productId));
  }, []);

  const toggleWishlist = useCallback((item: WishlistItem) => {
    setWishlist((prev) => {
      const exists = prev.find((w) => w.productId === item.productId);
      if (exists) {
        return prev.filter((w) => w.productId !== item.productId);
      }
      return [...prev, item];
    });
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => wishlist.some((w) => w.productId === productId),
    [wishlist]
  );

  const getWishlistItem = useCallback(
    (productId: string) => wishlist.find((w) => w.productId === productId),
    [wishlist]
  );

  const clearWishlist = useCallback(() => {
    setWishlist([]);
    setUnavailableWishlistIds([]);
  }, []);

  // ============================================
  // Cart actions
  // ============================================

  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const exists = prev.find((c) => c.productId === item.productId);
      if (exists) {
        // Update existing item with new configuration
        return prev.map((c) =>
          c.productId === item.productId ? { ...item, addedAt: c.addedAt } : c
        );
      }
      return [...prev, item];
    });
  }, []);

  const updateCartItem = useCallback(
    (productId: string, updates: Partial<CartItem>) => {
      setCart((prev) =>
        prev.map((c) => (c.productId === productId ? { ...c, ...updates } : c))
      );
    },
    []
  );

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
    setUnavailableCartIds((prev) => prev.filter((id) => id !== productId));
  }, []);

  const isInCart = useCallback(
    (productId: string) => cart.some((c) => c.productId === productId),
    [cart]
  );

  const getCartItem = useCallback(
    (productId: string) => cart.find((c) => c.productId === productId),
    [cart]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setUnavailableCartIds([]);
  }, []);

  // ============================================
  // Move from wishlist to cart
  // ============================================

  const moveToCart = useCallback(
    (
      productId: string,
      config: { months: TermMonths; initialPercent: InitialPaymentPercent; monthlyPayment: number; initialAmount: number }
    ) => {
      const wishlistItem = wishlist.find((w) => w.productId === productId);
      if (!wishlistItem) return;

      // Create cart item from wishlist item + config
      const cartItem: CartItem = {
        productId: wishlistItem.productId,
        name: wishlistItem.name,
        shortName: wishlistItem.shortName,
        brand: wishlistItem.brand,
        price: wishlistItem.price,
        image: wishlistItem.image,
        type: wishlistItem.type,
        variantId: wishlistItem.variantId,
        colorName: wishlistItem.colorName,
        colorHex: wishlistItem.colorHex,
        months: config.months,
        initialPercent: config.initialPercent,
        initialAmount: config.initialAmount,
        monthlyPayment: config.monthlyPayment,
        addedAt: Date.now(),
      };

      // Add to cart and remove from wishlist
      setCart((prev) => {
        const exists = prev.find((c) => c.productId === productId);
        if (exists) {
          return prev.map((c) => (c.productId === productId ? cartItem : c));
        }
        return [...prev, cartItem];
      });

      setWishlist((prev) => prev.filter((w) => w.productId !== productId));
    },
    [wishlist]
  );

  // ============================================
  // Unavailable product detection
  // ============================================

  const [unavailableCartIds, setUnavailableCartIds] = useState<string[]>([]);
  const [unavailableWishlistIds, setUnavailableWishlistIds] = useState<string[]>([]);
  const hasValidatedRef = useRef(false);

  useEffect(() => {
    if (!isHydrated || hasValidatedRef.current) return;

    const allIds = [...cart.map(c => c.productId), ...wishlist.map(w => w.productId)];
    if (allIds.length === 0) return;

    hasValidatedRef.current = true;
    const uniqueIds = [...new Set(allIds)];

    fetchProductsByIds(landingSlug, uniqueIds)
      .then(activeProducts => {
        const activeIds = new Set(activeProducts.map(p => p.id));
        setUnavailableCartIds(cart.map(c => c.productId).filter(id => !activeIds.has(id)));
        setUnavailableWishlistIds(wishlist.map(w => w.productId).filter(id => !activeIds.has(id)));
      })
      .catch(() => {
        // If API fails, don't block — backend is the final barrier
        setUnavailableCartIds([]);
        setUnavailableWishlistIds([]);
      });
  }, [isHydrated, cart, wishlist, landingSlug]);

  // ============================================
  // Legacy support: product IDs only
  // ============================================

  const wishlistIds = useMemo(
    () => wishlist.map((w) => w.productId),
    [wishlist]
  );

  const cartIds = useMemo(() => cart.map((c) => c.productId), [cart]);

  return {
    // Wishlist
    wishlist,
    wishlistCount: wishlist.length,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    getWishlistItem,

    // Cart
    cart,
    cartCount: cart.length,
    addToCart,
    updateCartItem,
    removeFromCart,
    isInCart,
    clearCart,
    getCartItem,

    // Move
    moveToCart,

    // Hydration
    isHydrated,

    // Unavailable
    unavailableCartIds,
    unavailableWishlistIds,

    // Legacy
    wishlistIds,
    cartIds,
  };
}

export default useCatalogSharedState;
