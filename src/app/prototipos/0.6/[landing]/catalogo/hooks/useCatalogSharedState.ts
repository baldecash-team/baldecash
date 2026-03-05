'use client';

/**
 * useCatalogSharedState - Hook para estado compartido entre catálogo y detalle de producto
 * Lee/escribe en localStorage para persistencia entre páginas
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

// Dynamic storage keys based on landing slug
const getWishlistKey = (landing: string) => `baldecash-${landing}-wishlist`;
const getCartKey = (landing: string) => `baldecash-${landing}-cart`;

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

export function useCatalogSharedState(landingSlug: string): UseCatalogSharedStateReturn {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Memoize storage keys based on landing
  const wishlistKey = useMemo(() => getWishlistKey(landingSlug), [landingSlug]);
  const cartKey = useMemo(() => getCartKey(landingSlug), [landingSlug]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem(wishlistKey);
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }

      const savedCart = localStorage.getItem(cartKey);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
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
