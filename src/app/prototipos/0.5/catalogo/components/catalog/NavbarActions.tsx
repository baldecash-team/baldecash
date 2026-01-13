'use client';

/**
 * NavbarActions - Componentes para el navbar del catálogo (solo desktop)
 * Incluye: Buscador, Favoritos y Carrito
 */

import React, { useState, useRef, useEffect } from 'react';
import { Search, Heart, ShoppingCart, X, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@nextui-org/react';
import { motion, AnimatePresence } from 'framer-motion';
import { CatalogProduct, calculateQuotaWithInitial } from '../../types/catalog';
import { formatMoney } from '../../../utils/formatMoney';

// Configuración fija igual que ProductCard
const SELECTED_TERM = 24;
const SELECTED_INITIAL = 10;

/**
 * NavbarSearch - Buscador en el navbar
 */
interface NavbarSearchProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onSubmit?: () => void;
}

export const NavbarSearch: React.FC<NavbarSearchProps> = ({
  value,
  onChange,
  onClear,
  onSubmit,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      e.preventDefault();
      onSubmit?.();
    }
  };

  return (
    <div
      className={`relative flex items-center transition-all duration-200 ${
        isFocused ? 'w-[480px]' : 'w-96'
      }`}
    >
      <div
        className={`flex items-center w-full bg-neutral-100 rounded-xl border-2 transition-colors ${
          isFocused ? 'border-[#4654CD] bg-white' : 'border-transparent'
        }`}
      >
        <Search className="w-4 h-4 text-neutral-400 ml-3 flex-shrink-0" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Buscar equipos..."
          className="flex-1 bg-transparent px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 outline-none"
        />
        {value && (
          <button
            onClick={onClear}
            className="p-1.5 mr-1 rounded-lg hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * NavbarFavorites - Botón de favoritos en el navbar
 */
interface NavbarFavoritesProps {
  count: number;
  isActive: boolean;
  onClick: () => void;
}

export const NavbarFavorites: React.FC<NavbarFavoritesProps> = ({
  count,
  isActive,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all cursor-pointer ${
        isActive
          ? 'bg-[#4654CD] text-white'
          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
      }`}
    >
      <Heart className={`w-5 h-5 ${isActive || count > 0 ? 'fill-current' : ''}`} />
      {count > 0 && (
        <span
          className={`absolute -top-1 -right-1 text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 ${
            isActive ? 'bg-white text-[#4654CD]' : 'bg-[#4654CD] text-white'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};

/**
 * NavbarSearchButton - Botón simple de búsqueda para mobile (abre SearchDrawer)
 */
interface NavbarSearchButtonProps {
  isActive?: boolean;
  onClick: () => void;
}

export const NavbarSearchButton: React.FC<NavbarSearchButtonProps> = ({
  isActive = false,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all cursor-pointer ${
        isActive
          ? 'bg-[#4654CD] text-white'
          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
      }`}
    >
      <Search className="w-5 h-5" />
    </button>
  );
};

/**
 * NavbarCartButton - Botón simple de carrito para mobile (abre CartDrawer)
 */
interface NavbarCartButtonProps {
  count: number;
  onClick: () => void;
}

export const NavbarCartButton: React.FC<NavbarCartButtonProps> = ({
  count,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all cursor-pointer ${
        count > 0
          ? 'bg-[#4654CD] text-white'
          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
      }`}
    >
      <ShoppingCart className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-white text-[#4654CD]">
          {count}
        </span>
      )}
    </button>
  );
};

/**
 * NavbarWishlistButton - Botón simple de favoritos para mobile (abre WishlistDrawer)
 */
interface NavbarWishlistButtonProps {
  count: number;
  onClick: () => void;
}

export const NavbarWishlistButton: React.FC<NavbarWishlistButtonProps> = ({
  count,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all cursor-pointer ${
        count > 0
          ? 'bg-[#4654CD] text-white'
          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
      }`}
    >
      <Heart className={`w-5 h-5 ${count > 0 ? 'fill-current' : ''}`} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-white text-[#4654CD]">
          {count}
        </span>
      )}
    </button>
  );
};

/**
 * NavbarWishlist - Botón de favoritos con dropdown en el navbar (desktop)
 */
interface NavbarWishlistProps {
  items: CatalogProduct[];
  onRemoveItem: (productId: string) => void;
  onClearAll: () => void;
  onViewProduct: (productId: string) => void;
}

export const NavbarWishlist: React.FC<NavbarWishlistProps> = ({
  items,
  onRemoveItem,
  onClearAll,
  onViewProduct,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Wishlist Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all cursor-pointer ${
          items.length > 0
            ? 'bg-[#4654CD] text-white'
            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
        }`}
      >
        <Heart className={`w-5 h-5 ${items.length > 0 ? 'fill-current' : ''}`} />
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-white text-[#4654CD]">
            {items.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#4654CD] fill-[#4654CD]" />
                <span className="text-sm font-semibold text-neutral-800">
                  Mis favoritos ({items.length})
                </span>
              </div>
              {items.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-xs text-neutral-500 hover:text-red-500 transition-colors cursor-pointer"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Items */}
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Heart className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">Sin favoritos aún</p>
              </div>
            ) : (
              <div className="max-h-[280px] overflow-y-auto">
                <div className="p-3 space-y-2">
                  {items.map((item) => {
                    const { quota } = calculateQuotaWithInitial(item.price, SELECTED_TERM, SELECTED_INITIAL);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-2 bg-neutral-50 rounded-lg group"
                      >
                        <div
                          onClick={() => {
                            onViewProduct(item.id);
                            setIsOpen(false);
                          }}
                          className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-neutral-200 cursor-pointer hover:border-[#4654CD] transition-colors"
                        >
                          <img
                            src={item.thumbnail}
                            alt={item.displayName}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-neutral-500 uppercase">
                            {item.brand}
                          </p>
                          <p
                            onClick={() => {
                              onViewProduct(item.id);
                              setIsOpen(false);
                            }}
                            className="text-sm font-medium text-neutral-800 truncate cursor-pointer hover:text-[#4654CD] transition-colors"
                          >
                            {item.displayName}
                          </p>
                          <p className="text-sm font-bold text-[#4654CD]">
                            S/{formatMoney(quota)}/mes
                          </p>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * NavbarCart - Botón de carrito con dropdown en el navbar
 */
interface NavbarCartProps {
  items: CatalogProduct[];
  onRemoveItem: (productId: string) => void;
  onClearAll: () => void;
  onContinue: () => void;
}

export const NavbarCart: React.FC<NavbarCartProps> = ({
  items,
  onRemoveItem,
  onClearAll,
  onContinue,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all cursor-pointer ${
          items.length > 0
            ? 'bg-[#4654CD] text-white'
            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
        }`}
      >
        <ShoppingCart className="w-5 h-5" />
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-white text-[#4654CD]">
            {items.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-[#4654CD]" />
                <span className="text-sm font-semibold text-neutral-800">
                  Mi carrito ({items.length})
                </span>
              </div>
              {items.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-xs text-neutral-500 hover:text-red-500 transition-colors cursor-pointer"
                >
                  Vaciar
                </button>
              )}
            </div>

            {/* Items */}
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <ShoppingCart className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">Tu carrito está vacío</p>
              </div>
            ) : (
              <>
                <div className="max-h-[280px] overflow-y-auto">
                  <div className="p-3 space-y-2">
                    {items.map((item) => {
                      const { quota } = calculateQuotaWithInitial(item.price, SELECTED_TERM, SELECTED_INITIAL);
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-2 bg-neutral-50 rounded-lg"
                        >
                          <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-neutral-200">
                            <img
                              src={item.thumbnail}
                              alt={item.displayName}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-neutral-500 uppercase">
                              {item.brand}
                            </p>
                            <p className="text-sm font-medium text-neutral-800 truncate">
                              {item.displayName}
                            </p>
                            <p className="text-sm font-bold text-[#4654CD]">
                              S/{formatMoney(quota)}/mes
                            </p>
                          </div>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-neutral-100">
                  <Button
                    className="w-full bg-[#4654CD] text-white font-semibold cursor-pointer hover:bg-[#3a47b3]"
                    onPress={() => {
                      onContinue();
                      setIsOpen(false);
                    }}
                    endContent={<ArrowRight className="w-4 h-4" />}
                  >
                    Continuar
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
