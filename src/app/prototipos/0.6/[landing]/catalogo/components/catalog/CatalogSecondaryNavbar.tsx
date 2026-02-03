'use client';

/**
 * CatalogSecondaryNavbar - Barra secundaria con buscador, favoritos y carrito
 * Se muestra debajo del navbar principal en catálogo y detalle de producto
 */

import React from 'react';
import { CatalogProduct } from '../../types/catalog';
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

  // Wishlist
  wishlistItems: CatalogProduct[];
  onWishlistRemove: (productId: string) => void;
  onWishlistClear: () => void;
  onWishlistViewProduct: (productId: string) => void;

  // Cart
  cartItems: CatalogProduct[];
  onCartRemove: (productId: string) => void;
  onCartClear: () => void;
  onCartContinue: () => void;

  // Mobile callbacks (for opening drawers)
  onMobileSearchClick?: () => void;
  onMobileWishlistClick?: () => void;
  onMobileCartClick?: () => void;

  // State for mobile buttons
  isSearchActive?: boolean;

  // Config from API
  config?: CatalogSecondaryNavbarData | null;
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
  onMobileSearchClick,
  onMobileWishlistClick,
  onMobileCartClick,
  isSearchActive = false,
  config,
}) => {
  // Position below navbar: 64px navbar + 40px promo banner (if visible)
  const topPosition = hidePromoBanner ? '64px' : '104px';

  return (
    <div
      className="fixed left-0 right-0 z-[90] bg-neutral-100 border-b border-neutral-200"
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
                id="secondary-navbar-wishlist"
                items={wishlistItems}
                onRemoveItem={onWishlistRemove}
                onClearAll={onWishlistClear}
                onViewProduct={onWishlistViewProduct}
                config={config?.wishlist}
              />
              <NavbarCart
                id="secondary-navbar-cart"
                items={cartItems}
                onRemoveItem={onCartRemove}
                onClearAll={onCartClear}
                onContinue={onCartContinue}
                config={config?.cart}
              />
            </div>

            {/* Mobile: Buttons */}
            <div className="flex lg:hidden items-center gap-2">
              <NavbarWishlistButton
                id="secondary-navbar-wishlist-mobile"
                count={wishlistItems.length}
                onClick={onMobileWishlistClick || (() => {})}
              />
              <NavbarCartButton
                id="secondary-navbar-cart-mobile"
                count={cartItems.length}
                onClick={onMobileCartClick || (() => {})}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogSecondaryNavbar;
