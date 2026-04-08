'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@nextui-org/react';
import { X, Trash2, Scale, Trophy, ChevronDown, ChevronUp, ShoppingCart } from 'lucide-react';
import { ComparatorLayoutProps, compareSpecs, calculatePriceDifference, ComparisonProduct, getDisplayQuota, countProductWins } from '../../types/comparator';
import { DesignStyleA } from './DesignStyleA';
import { DesignStyleB } from './DesignStyleB';
import { DesignStyleC } from './DesignStyleC';
import { useProduct } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';
import { routes } from '@/app/prototipos/0.6/utils/routes';

import type { TermMonths } from '../../types/catalog';

/**
 * ComparatorV2 - Panel Inline Expandible
 * Panel que se expande sin perder el contexto del catálogo
 * Referencia: Notion, Linear comparison views
 */
export const ComparatorV2: React.FC<ComparatorLayoutProps & { isOpen: boolean; onClose: () => void; onAddToCart?: (productId: string) => void; cartItems?: string[] }> = ({
  products,
  config,
  onRemoveProduct,
  onClearAll,
  comparisonState,
  onStateChange,
  isOpen,
  onClose,
  onAddToCart,
  cartItems = [],
}) => {
  const router = useRouter();
  const params = useParams();
  const landing = (params.landing as string) || 'home';
  const { setSelectedProduct, clearCartProducts, clearAccessories } = useProduct();
  const specs = compareSpecs(products);
  const priceDiff = calculatePriceDifference(products);
  const [showBestOption, setShowBestOption] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Helper to save product to context - usar cuota precalculada del backend
  const selectProductForWizard = useCallback((product: ComparisonProduct) => {
    // Clear cart and accessories - user explicitly selected THIS product
    clearCartProducts();
    clearAccessories();
    setSelectedProduct({
      id: product.id,
      name: product.displayName,
      shortName: product.name,
      brand: product.brand,
      price: product.price,
      monthlyPayment: product.quotaMonthly,
      months: (product.maxTermMonths || 24) as TermMonths,
      initialPercent: 0,
      initialAmount: 0,
      image: product.images[0] || product.thumbnail,
      specs: {
        processor: product.specs?.processor?.model || '',
        ram: product.specs?.ram ? `${product.specs.ram.size}GB RAM` : '',
        storage: product.specs?.storage ? `${product.specs.storage.size}GB ${product.specs.storage.type}` : '',
      },
    });
  }, [setSelectedProduct, clearCartProducts, clearAccessories]);

  // Reset showBestOption when comparator opens
  useEffect(() => {
    if (isOpen) {
      setShowBestOption(false);
    }
  }, [isOpen]);

  // Find the best option: most spec wins, then lowest quota as tiebreaker
  const bestProduct = useMemo(() => {
    if (products.length === 0) return null;

    // Count wins for each product
    const winsPerProduct = products.map((_, index) => countProductWins(specs, index));

    // Find the max wins
    const maxWins = Math.max(...winsPerProduct);

    // Get all products with max wins
    const topProducts = products.filter((_, index) => winsPerProduct[index] === maxWins);

    // If tie in wins, use lowest quota as tiebreaker
    if (topProducts.length > 1) {
      return topProducts.reduce((best, current) =>
        getDisplayQuota(current) < getDisplayQuota(best) ? current : best
      , topProducts[0]);
    }

    return topProducts[0];
  }, [products, specs]);

  const bestProductIndex = useMemo(() => {
    if (!bestProduct) return -1;
    return products.findIndex(p => p.id === bestProduct.id);
  }, [products, bestProduct]);

  // Helper to clean up body styles (panel may affect scroll)
  const cleanupBodyStyles = useCallback(() => {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.overflow = '';
  }, []);

  const handleShowBestOption = () => {
    setShowBestOption(true);
  };

  const handleContinueWithBest = () => {
    // Guardar el mejor producto antes de navegar
    if (bestProduct) {
      selectProductForWizard(bestProduct);
    }
    cleanupBodyStyles();
    router.push(routes.solicitar(landing));
  };

  // Filter specs based on fieldsVersion
  const getFilteredSpecs = () => {
    if (config.fieldsVersion === 1) {
      const allowedFields = ['processor', 'ram', 'storage', 'displaySize', 'quota'];
      return specs.filter(s => allowedFields.includes(s.key));
    }
    return specs;
  };

  const filteredSpecs = comparisonState.showOnlyDifferences
    ? getFilteredSpecs().filter(s => s.isDifferent)
    : getFilteredSpecs();

  // Handler for selecting a product from DesignStyleB/C
  const handleSelectProduct = (productId: string) => {
    // Guardar el producto seleccionado antes de navegar
    const product = products.find((p) => p.id === productId);
    if (product) {
      selectProductForWizard(product);
    }
    cleanupBodyStyles();
    router.push(routes.solicitar(landing));
  };

  // Render the appropriate design style
  const renderDesignStyle = () => {
    const commonProps = {
      products,
      specs: filteredSpecs,
      config,
      showBestOption,
      bestProductIndex,
      onRemoveProduct,
      priceDiff,
    };

    switch (config.designStyle) {
      case 1:
        return <DesignStyleA {...commonProps} onSelectProduct={handleSelectProduct} onAddToCart={onAddToCart} cartItems={cartItems} />;
      case 2:
        return <DesignStyleB {...commonProps} onSelectProduct={handleSelectProduct} onAddToCart={onAddToCart} cartItems={cartItems} />;
      case 3:
        return (
          <DesignStyleC
            {...commonProps}
            onSelectProduct={handleSelectProduct}
            onAddToCart={onAddToCart}
            cartItems={cartItems}
            showOnlyDifferences={comparisonState.showOnlyDifferences}
            onToggleDifferences={(value) => onStateChange({
              ...comparisonState,
              showOnlyDifferences: value,
            })}
          />
        );
      default:
        return <DesignStyleA {...commonProps} onSelectProduct={handleSelectProduct} onAddToCart={onAddToCart} cartItems={cartItems} />;
    }
  };

  if (!isOpen || products.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] bg-white border-t border-neutral-200 shadow-2xl transition-all duration-300">
      {/* Collapsible Header */}
      <div
        className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-neutral-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[rgba(var(--color-primary-rgb),0.1)] flex items-center justify-center">
            <Scale className="w-5 h-5 text-[var(--color-primary)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-800">
              Comparando {products.length} equipos
            </h2>
            <p className="text-sm text-neutral-500">
              {showBestOption ? 'Mejor opción destacada' : 'Haz clic para expandir o colapsar'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Product thumbnails preview */}
          <div className="flex -space-x-3">
            {products.slice(0, 3).map((product, index) => (
              <div
                key={product.id}
                className="w-10 h-10 rounded-lg border-2 border-white bg-neutral-100 overflow-hidden shadow-sm"
                style={{ zIndex: products.length - index }}
              >
                <img
                  src={product.images[0] || product.thumbnail}
                  alt={product.displayName}
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>

          <Button
            isIconOnly
            variant="light"
            className="cursor-pointer"
            onPress={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </Button>

          <Button
            isIconOnly
            variant="light"
            className="cursor-pointer text-neutral-500 hover:text-red-500"
            onPress={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-6 pb-6 max-h-[60vh] overflow-y-auto">
          {/* Toggle for differences and actions */}
          <div className="flex items-center justify-between mb-4">
            {/* Checkbox - Oculto para DesignStyleC (tiene su propio checkbox) */}
            {config.designStyle !== 3 ? (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={comparisonState.showOnlyDifferences}
                  onChange={(e) => onStateChange({
                    ...comparisonState,
                    showOnlyDifferences: e.target.checked,
                  })}
                  className="w-4 h-4 rounded border-neutral-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                />
                <span className="text-sm text-neutral-600">Solo mostrar diferencias</span>
              </label>
            ) : (
              <div /> /* Placeholder para mantener justify-between */
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="light"
                startContent={<Trash2 className="w-4 h-4" />}
                onPress={onClearAll}
                className="cursor-pointer text-neutral-600 hover:text-red-500"
              >
                Limpiar
              </Button>
              {!showBestOption ? (
                <Button
                  size="sm"
                  className="bg-[var(--color-primary)] text-white cursor-pointer hover:brightness-90"
                  onPress={handleShowBestOption}
                  startContent={<Trophy className="w-4 h-4" />}
                >
                  Ver mejor opción
                </Button>
              ) : bestProduct && (
                <Button
                  size="sm"
                  variant="bordered"
                  className="cursor-pointer border-[var(--color-primary)] text-[var(--color-primary)] bg-[rgba(var(--color-primary-rgb),0.05)] hover:bg-[rgba(var(--color-primary-rgb),0.1)] font-semibold"
                  startContent={<ShoppingCart className="w-4 h-4" />}
                  onPress={() => onAddToCart?.(bestProduct.id)}
                >
                  Al carrito
                </Button>
              )}
            </div>
          </div>

          {/* Design Style Content */}
          {renderDesignStyle()}
        </div>
      )}
    </div>
  );
};
