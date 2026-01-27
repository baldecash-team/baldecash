'use client';

/**
 * useCatalogSharedState - Hook para estado compartido entre catálogo y detalle de producto
 * Lee/escribe en localStorage para persistencia entre páginas
 */

import { useState, useEffect, useCallback } from 'react';

const WISHLIST_KEY = 'baldecash-wishlist';
const CART_KEY = 'baldecash-cart';

interface UseCatalogSharedStateReturn {
  // Wishlist
  wishlist: string[];
  wishlistCount: number;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;

  // Cart
  cart: string[];
  cartCount: number;
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  isInCart: (productId: string) => boolean;
  clearCart: () => void;

  // Hydration
  isHydrated: boolean;
}

export function useCatalogSharedState(): UseCatalogSharedStateReturn {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem(WISHLIST_KEY);
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }

      const savedCart = localStorage.getItem(CART_KEY);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error('Error loading catalog state from localStorage:', e);
    }
    setIsHydrated(true);
  }, []);

  // Persist wishlist to localStorage
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
      } catch (e) {
        console.error('Error saving wishlist to localStorage:', e);
      }
    }
  }, [wishlist, isHydrated]);

  // Persist cart to localStorage
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
      } catch (e) {
        console.error('Error saving cart to localStorage:', e);
      }
    }
  }, [cart, isHydrated]);

  // Wishlist actions
  const addToWishlist = useCallback((productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) return prev;
      return [...prev, productId];
    });
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist((prev) => prev.filter((id) => id !== productId));
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      return [...prev, productId];
    });
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist]
  );

  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  // Cart actions
  const addToCart = useCallback((productId: string) => {
    setCart((prev) => {
      if (prev.includes(productId)) return prev;
      return [...prev, productId];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((id) => id !== productId));
  }, []);

  const isInCart = useCallback(
    (productId: string) => cart.includes(productId),
    [cart]
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  return {
    // Wishlist
    wishlist,
    wishlistCount: wishlist.length,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,

    // Cart
    cart,
    cartCount: cart.length,
    addToCart,
    removeFromCart,
    isInCart,
    clearCart,

    // Hydration
    isHydrated,
  };
}

export default useCatalogSharedState;
