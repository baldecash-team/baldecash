'use client';

/**
 * NavbarActions - Componentes para el navbar del catálogo (solo desktop)
 * Incluye: Buscador con sugerencias, Favoritos y Carrito
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Search, Heart, ShoppingCart, X, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@nextui-org/react';
import { motion, AnimatePresence } from 'framer-motion';
import { CatalogProduct, calculateQuotaWithInitial } from '../../types/catalog';
import { formatMoney } from '../../utils/formatMoney';
import { searchProductSuggestions, ProductSuggestion } from '@/app/prototipos/0.6/services/catalogApi';

// Configuración fija igual que ProductCard
const SELECTED_TERM = 24;
const SELECTED_INITIAL = 10;

/**
 * NavbarSearch - Buscador en el navbar con sugerencias
 */
interface NavbarSearchProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onSubmit?: () => void;
  placeholder?: string;
}

export const NavbarSearch: React.FC<NavbarSearchProps> = ({
  value,
  onChange,
  onClear,
  onSubmit,
  placeholder = 'Buscar equipos...',
}) => {
  const router = useRouter();
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  const searchProducts = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchProductSuggestions(query, 6);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle input change with debounce
  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setSelectedIndex(-1);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchProducts(newValue);
    }, 300);
  };

  // Navigate to product detail
  const handleSelectSuggestion = (suggestion: ProductSuggestion) => {
    setShowSuggestions(false);
    onChange('');
    router.push(`/prototipos/0.6/${landing}/producto/${suggestion.slug}`);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else if (value.trim()) {
        setShowSuggestions(false);
        onSubmit?.();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center transition-all duration-200 ${
        isFocused ? 'w-[700px]' : 'w-[600px]'
      }`}
    >
      <div
        className={`flex items-center w-full bg-white rounded-xl border-2 transition-colors ${
          isFocused ? 'border-[var(--color-primary)]' : 'border-[rgba(var(--color-primary-rgb),0.3)]'
        }`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 text-[var(--color-primary)] ml-3 flex-shrink-0 animate-spin" />
        ) : (
          <Search className="w-4 h-4 text-neutral-400 ml-3 flex-shrink-0" />
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 outline-none"
        />
        {value && (
          <button
            onClick={() => {
              onClear();
              setSuggestions([]);
              setShowSuggestions(false);
            }}
            className="p-1.5 mr-1 rounded-lg hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden z-[100]"
          >
            <div className="py-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                    index === selectedIndex ? 'bg-[rgba(var(--color-primary-rgb),0.05)]' : 'hover:bg-neutral-50'
                  }`}
                >
                  {/* Product Image */}
                  <div className="w-10 h-10 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                    {suggestion.image ? (
                      <img
                        src={suggestion.image}
                        alt={suggestion.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Search className="w-4 h-4 text-neutral-300" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-500 uppercase">{suggestion.brand}</p>
                    <p className="text-sm font-medium text-neutral-800 truncate">
                      {suggestion.name}
                    </p>
                  </div>

                  {/* Monthly Quota */}
                  {suggestion.price > 0 && (
                    <span className="text-sm font-semibold text-[var(--color-primary)]">
                      S/{formatMoney(calculateQuotaWithInitial(suggestion.price, SELECTED_TERM, SELECTED_INITIAL).quota)}/mes
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Ver todos los resultados */}
            {value.trim() && (
              <div className="border-t border-neutral-100 px-4 py-2">
                <button
                  onClick={() => {
                    setShowSuggestions(false);
                    onSubmit?.();
                  }}
                  className="w-full flex items-center justify-center gap-2 text-sm text-[var(--color-primary)] font-medium hover:underline cursor-pointer py-1"
                >
                  Ver todos los resultados para "{value}"
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
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
          ? 'bg-[var(--color-primary)] text-white'
          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
      }`}
    >
      <Heart className={`w-5 h-5 ${isActive || count > 0 ? 'fill-current' : ''}`} />
      {count > 0 && (
        <span
          className={`absolute -top-1 -right-1 text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 ${
            isActive ? 'bg-white text-[var(--color-primary)]' : 'bg-[var(--color-primary)] text-white'
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
          ? 'bg-[var(--color-primary)] text-white'
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
  id?: string;
  isOverLimit?: boolean;
}

export const NavbarCartButton: React.FC<NavbarCartButtonProps> = ({
  count,
  onClick,
  id,
  isOverLimit = false,
}) => {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all cursor-pointer ${
        count > 0 && isOverLimit
          ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
          : count > 0
            ? 'bg-[var(--color-primary)] text-white'
            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
      }`}
    >
      <ShoppingCart className="w-5 h-5" />
      {count > 0 && (
        <span className={`absolute -top-1 -right-1 text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 ${
          isOverLimit ? 'bg-white text-red-600' : 'bg-white text-[var(--color-primary)]'
        }`}>
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
  id?: string;
}

export const NavbarWishlistButton: React.FC<NavbarWishlistButtonProps> = ({
  count,
  onClick,
  id,
}) => {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all cursor-pointer ${
        count > 0
          ? 'bg-[var(--color-primary)] text-white'
          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
      }`}
    >
      <Heart className={`w-5 h-5 ${count > 0 ? 'fill-current' : ''}`} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-white text-[var(--color-primary)]">
          {count}
        </span>
      )}
    </button>
  );
};

/**
 * NavbarWishlist - Botón de favoritos con dropdown en el navbar (desktop)
 */
interface NavbarWishlistConfig {
  title?: string;
  empty_title?: string;
  clear_button?: string;
}

interface NavbarWishlistProps {
  items: CatalogProduct[];
  onRemoveItem: (productId: string) => void;
  onClearAll: () => void;
  onViewProduct: (productId: string) => void;
  id?: string;
  config?: NavbarWishlistConfig;
}

export const NavbarWishlist: React.FC<NavbarWishlistProps> = ({
  items,
  onRemoveItem,
  onClearAll,
  onViewProduct,
  id,
  config,
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
    <div className="relative" ref={dropdownRef} id={id}>
      {/* Wishlist Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all cursor-pointer ${
          items.length > 0
            ? 'bg-[var(--color-primary)] text-white'
            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
        }`}
      >
        <Heart className={`w-5 h-5 ${items.length > 0 ? 'fill-current' : ''}`} />
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-white text-[var(--color-primary)]">
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
                <Heart className="w-4 h-4 text-[var(--color-primary)] fill-[var(--color-primary)]" />
                <span className="text-sm font-semibold text-neutral-800">
                  {config?.title || 'Mis favoritos'} ({items.length})
                </span>
              </div>
              {items.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-xs text-neutral-500 hover:text-red-500 transition-colors cursor-pointer"
                >
                  {config?.clear_button || 'Limpiar'}
                </button>
              )}
            </div>

            {/* Items */}
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Heart className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">{config?.empty_title || 'Sin favoritos aún'}</p>
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
                          className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-neutral-200 cursor-pointer hover:border-[var(--color-primary)] transition-colors"
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
                            className="text-sm font-medium text-neutral-800 truncate cursor-pointer hover:text-[var(--color-primary)] transition-colors"
                          >
                            {item.displayName}
                          </p>
                          <p className="text-sm font-bold text-[var(--color-primary)]">
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
interface NavbarCartConfig {
  title?: string;
  empty_title?: string;
  clear_button?: string;
  continue_button?: string;
}

interface NavbarCartProps {
  items: CatalogProduct[];
  onRemoveItem: (productId: string) => void;
  onClearAll: () => void;
  onContinue: () => void;
  id?: string;
  config?: NavbarCartConfig;
  isOverLimit?: boolean;
}

export const NavbarCart: React.FC<NavbarCartProps> = ({
  items,
  onRemoveItem,
  onClearAll,
  onContinue,
  id,
  config,
  isOverLimit = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Multi-product cart logic
  const totalMonthlyQuota = items.reduce((sum, item) => {
    const { quota } = calculateQuotaWithInitial(item.price, SELECTED_TERM, SELECTED_INITIAL);
    return sum + quota;
  }, 0);
  const isDisabled = items.length === 0 || items.length > 5 || totalMonthlyQuota > 600 || isOverLimit;

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
    <div className="relative" ref={dropdownRef} id={id}>
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all cursor-pointer ${
          items.length > 0 && isOverLimit
            ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
            : items.length > 0
              ? 'bg-[var(--color-primary)] text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
        }`}
      >
        <ShoppingCart className="w-5 h-5" />
        {items.length > 0 && (
          <span className={`absolute -top-1 -right-1 text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 ${
            isOverLimit ? 'bg-white text-red-600' : 'bg-white text-[var(--color-primary)]'
          }`}>
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
            <div className={`px-4 py-3 border-b flex items-center justify-between ${isOverLimit ? 'border-red-100 bg-red-50' : 'border-neutral-100'}`}>
              <div className="flex items-center gap-2">
                <ShoppingCart className={`w-4 h-4 ${isOverLimit ? 'text-red-500' : 'text-[var(--color-primary)]'}`} />
                <span className="text-sm font-semibold text-neutral-800">
                  {config?.title || 'Mi carrito'} ({items.length})
                </span>
              </div>
              {items.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-xs text-neutral-500 hover:text-red-500 transition-colors cursor-pointer"
                >
                  {config?.clear_button || 'Vaciar'}
                </button>
              )}
            </div>

            {/* Items */}
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <ShoppingCart className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">{config?.empty_title || 'Tu carrito está vacío'}</p>
              </div>
            ) : (
              <>
                {/* Error messages for cart limits */}
                {items.length > 5 && (
                  <div className="mx-3 mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-700">
                      Máximo 5 productos por solicitud
                    </p>
                  </div>
                )}
                {totalMonthlyQuota > 600 && (
                  <div className="mx-3 mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-700">
                      La cuota total supera S/600/mes
                    </p>
                  </div>
                )}
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
                            <p className="text-sm font-bold text-[var(--color-primary)]">
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
                    className={`w-full font-semibold ${
                      !isDisabled
                        ? 'bg-[var(--color-primary)] text-white cursor-pointer hover:brightness-90'
                        : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    }`}
                    onPress={() => {
                      onContinue();
                      setIsOpen(false);
                    }}
                    endContent={<ArrowRight className="w-4 h-4" />}
                    isDisabled={isDisabled}
                  >
                    {config?.continue_button || 'Continuar'}
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
