'use client';

/**
 * CatalogSecondaryNavbar - Barra secundaria con buscador, favoritos y carrito
 * Se muestra debajo del navbar principal en catálogo y detalle de producto
 */

import React, { useEffect, useRef } from 'react';
import { CatalogProduct, CartItem, WishlistItem } from '../../types/catalog';
import type { CatalogSecondaryNavbarData } from '@/app/prototipos/0.6/types/hero';
import {
  NavbarSearch,
  NavbarWishlist,
  NavbarCart,
  NavbarSearchButton,
  NavbarWishlistButton,
  NavbarCartButton,
} from './NavbarActions';

interface CatalogSecondaryNavbarProps {
  // Layout
  hidePromoBanner?: boolean;
  fullWidth?: boolean;

  // Search
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  onSearchSubmit?: () => void;

  // Wishlist - v0.6.2: Now receives WishlistItem[] from localStorage
  wishlistItems: WishlistItem[];
  onWishlistRemove: (productId: string) => void;
  onWishlistClear: () => void;
  onWishlistViewProduct: (productId: string) => void;

  // Cart - v0.6.2: Now receives CartItem[] to preserve user's pricing config
  cartItems: CartItem[];
  onCartRemove: (productId: string) => void;
  onCartClear: () => void;
  onCartContinue: () => void;
  onCartViewProduct?: (productId: string) => void;
  isCartOverLimit?: boolean;

  // Mobile callbacks (for opening drawers)
  onMobileSearchClick?: () => void;
  onMobileWishlistClick?: () => void;
  onMobileCartClick?: () => void;

  // State for mobile buttons
  isSearchActive?: boolean;

  // Unavailable product IDs
  unavailableCartIds?: string[];
  unavailableWishlistIds?: string[];

  // Config from API
  config?: CatalogSecondaryNavbarData | null;

  // Preview banner offset (pixels to shift down when preview banner is visible)
  previewBannerOffset?: number;

  // Hide cart UI (icon, button). Defaults to true.
  showCart?: boolean;
}

export const CatalogSecondaryNavbar: React.FC<CatalogSecondaryNavbarProps> = ({
  hidePromoBanner = false,
  fullWidth = false,
  searchQuery,
  onSearchChange,
  onSearchClear,
  onSearchSubmit,
  wishlistItems,
  onWishlistRemove,
  onWishlistClear,
  onWishlistViewProduct,
  cartItems,
  onCartRemove,
  onCartClear,
  onCartContinue,
  onCartViewProduct,
  isCartOverLimit = false,
  onMobileSearchClick,
  onMobileWishlistClick,
  onMobileCartClick,
  isSearchActive = false,
  unavailableCartIds = [],
  unavailableWishlistIds = [],
  config,
  previewBannerOffset: previewBannerOffsetProp,
  showCart = true,
}) => {
  // NOTE: previewBannerOffsetProp is still accepted for API compatibility but
  // is no longer required — the --header-total-height CSS variable already
  // accounts for the preview banner via Navbar.tsx.
  void previewBannerOffsetProp;

  // Position below navbar using the --header-total-height CSS variable exposed
  // by the Navbar component (preview banner + promo banner + main navbar).
  // If `hidePromoBanner` is true, subtract the promo banner height manually.
  const topPosition = hidePromoBanner
    ? `calc(var(--header-total-height, 6.5rem) - var(--promo-banner-height, 0px))`
    : `var(--header-total-height, 6.5rem)`;

  // Expose this navbar's own height as a CSS variable so downstream layouts
  // (sticky sidebar, main content padding) can compensate for it dynamically.
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const updateHeight = () => {
      const h = el.offsetHeight;
      document.documentElement.style.setProperty('--catalog-secondary-height', `${h}px`);
    };
    updateHeight();
    const ro = new ResizeObserver(updateHeight);
    ro.observe(el);
    window.addEventListener('resize', updateHeight);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateHeight);
      document.documentElement.style.removeProperty('--catalog-secondary-height');
    };
  }, []);

  return (
    <div
      ref={barRef}
      className="fixed left-0 right-0 z-40 bg-white border-b border-neutral-200"
      style={{ top: topPosition }}
    >
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${fullWidth ? '' : 'max-w-7xl'}`}>
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Left spacer for desktop (balance) */}
          <div className="hidden lg:flex items-center gap-2 w-24">
            {/* Empty for balance */}
          </div>

          {/* Mobile: Search button */}
          <div className="lg:hidden">
            <NavbarSearchButton
              isActive={isSearchActive || searchQuery.length > 0}
              onClick={onMobileSearchClick || (() => {})}
            />
          </div>

          {/* Center: Search bar (desktop) */}
          <div className="hidden lg:flex flex-1 justify-center">
            <NavbarSearch
              value={searchQuery}
              onChange={onSearchChange}
              onClear={onSearchClear}
              onSubmit={onSearchSubmit}
              placeholder={config?.search?.placeholder}
            />
          </div>

          {/* Spacer for mobile */}
          <div className="flex-1 lg:hidden" />

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Desktop: Dropdowns */}
            <div className="hidden lg:flex items-center gap-2">
              <NavbarWishlist
                id="onboarding-wishlist"
                items={wishlistItems}
                onRemoveItem={onWishlistRemove}
                onClearAll={onWishlistClear}
                onViewProduct={onWishlistViewProduct}
                config={config?.wishlist}
                unavailableIds={unavailableWishlistIds}
              />
              {showCart && (
                <NavbarCart
                  id="onboarding-cart"
                  items={cartItems}
                  onRemoveItem={onCartRemove}
                  onClearAll={onCartClear}
                  onContinue={onCartContinue}
                  onViewProduct={onCartViewProduct}
                  config={config?.cart}
                  isOverLimit={isCartOverLimit}
                  unavailableIds={unavailableCartIds}
                />
              )}
            </div>

            {/* Mobile: Buttons */}
            <div className="flex lg:hidden items-center gap-2">
              <NavbarWishlistButton
                id="onboarding-wishlist-mobile"
                count={wishlistItems.length}
                onClick={onMobileWishlistClick || (() => {})}
              />
              {showCart && (
                <NavbarCartButton
                  id="onboarding-cart-mobile"
                  count={cartItems.length}
                  onClick={onMobileCartClick || (() => {})}
                  isOverLimit={isCartOverLimit}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogSecondaryNavbar;
