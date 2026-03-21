'use client';

/**
 * WishlistDrawer - Panel/Bottom sheet para mostrar favoritos
 * Desktop: Modal lateral con NextUI
 * Mobile: Bottom sheet con Framer Motion (patrón estándar)
 *
 * v0.6.1: Soporta tanto CatalogProduct[] (legacy) como WishlistItem[] (nuevo)
 * Muestra color cuando está disponible en WishlistItem
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X, Heart, Trash2, GitCompare, ShoppingCart, AlertTriangle } from 'lucide-react';
import { CatalogProduct, WishlistItem } from '../../types/catalog';
import { formatMoneyNoDecimals } from '../../utils/formatMoney';
import { useIsMobile } from '@/app/prototipos/_shared';

interface WishlistConfig {
  title?: string;
  empty_title?: string;
  empty_description?: string;
  empty_cta?: string;
  clear_button?: string;
  clear_all_button?: string;
  remove_button?: string;
  compare_button?: string;
  in_compare_button?: string;
  add_to_cart_button?: string;
}

/** v0.6.1: Normalized item for display - works with both WishlistItem and CatalogProduct */
interface NormalizedWishlistItem {
  id: string;
  name: string;
  brand: string;
  image: string;
  lowestQuota: number;
  colorName?: string;
  colorHex?: string;
}

/** Type guard to check if item is WishlistItem */
function isWishlistItem(item: WishlistItem | CatalogProduct): item is WishlistItem {
  return 'productId' in item && 'lowestQuota' in item;
}

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Accepts both WishlistItem[] (new) and CatalogProduct[] (legacy) */
  products: (WishlistItem | CatalogProduct)[];
  onRemoveProduct: (productId: string) => void;
  onClearAll: () => void;
  onViewProduct: (productId: string) => void;
  onAddToCompare?: (productId: string) => void;
  /** v0.6.1: Add item to cart with configuration */
  onAddToCart?: (productId: string) => void;
  compareList?: string[];
  maxCompareProducts?: number;
  config?: WishlistConfig;
  /** IDs of products that are no longer available */
  unavailableIds?: string[];
}

// Contenido compartido entre mobile y desktop
const WishlistContentShared: React.FC<{
  products: (WishlistItem | CatalogProduct)[];
  onRemoveProduct: (productId: string) => void;
  onViewProduct: (productId: string) => void;
  onAddToCompare?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  compareList: string[];
  maxCompareProducts: number;
  onClose: () => void;
  config?: WishlistConfig;
  unavailableIds?: string[];
}> = ({
  products,
  onRemoveProduct,
  onViewProduct,
  onAddToCompare,
  onAddToCart,
  compareList,
  maxCompareProducts,
  onClose,
  config,
  unavailableIds = [],
}) => {
  const unavailableSet = useMemo(() => new Set(unavailableIds), [unavailableIds]);
  // v0.6.1: Normalize items to unified format for display
  const normalizedItems = useMemo((): NormalizedWishlistItem[] => {
    return products.map((item) => {
      if (isWishlistItem(item)) {
        // New WishlistItem format
        return {
          id: item.productId,
          name: item.shortName || item.name,
          brand: item.brand,
          image: item.image,
          lowestQuota: item.lowestQuota,
          colorName: item.colorName,
          colorHex: item.colorHex,
        };
      } else {
        // Legacy CatalogProduct format
        return {
          id: item.id,
          name: item.displayName,
          brand: item.brand,
          image: item.thumbnail,
          lowestQuota: item.quotaMonthly,
        };
      }
    });
  }, [products]);

  if (normalizedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center px-6 py-12">
        <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
          <Heart className="w-10 h-10 text-neutral-300" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-700 mb-2">
          {config?.empty_title || 'Sin favoritos aún'}
        </h3>
        <p className="text-sm text-neutral-500 mb-4">
          {config?.empty_description || 'Haz clic en el corazón de cualquier producto para agregarlo aquí'}
        </p>
        <Button
          variant="bordered"
          onPress={onClose}
          className="cursor-pointer"
        >
          {config?.empty_cta || 'Explorar catálogo'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {unavailableIds.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 mb-1">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-700">
            {unavailableIds.length === 1
              ? 'Un favorito ya no está disponible.'
              : `${unavailableIds.length} favoritos ya no están disponibles.`
            }
          </p>
        </div>
      )}
      {normalizedItems.map((item, index) => {
        const isInCompare = compareList.includes(item.id);
        const canAddToCompare = compareList.length < maxCompareProducts;
        const isUnavailable = unavailableSet.has(item.id);

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-neutral-50 rounded-xl p-3 flex gap-3 group ${isUnavailable ? 'opacity-60 border border-amber-300' : ''}`}
          >
            {/* Product Image */}
            <div
              onClick={() => onViewProduct(item.id)}
              className="w-20 h-20 rounded-lg bg-white flex-shrink-0 flex items-center justify-center p-2 cursor-pointer hover:shadow-md transition-shadow"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-500">{item.brand}</p>
              <p
                onClick={() => onViewProduct(item.id)}
                className="text-sm font-semibold text-neutral-800 line-clamp-2 cursor-pointer hover:text-[var(--color-primary)] transition-colors"
              >
                {item.name}
              </p>
              {/* v0.6.1: Show color if available */}
              {item.colorName && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-neutral-200 flex-shrink-0"
                    style={{ backgroundColor: item.colorHex }}
                  />
                  <span className="text-xs text-neutral-400">{item.colorName}</span>
                </div>
              )}
              {isUnavailable ? (
                <span className="inline-block text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded mt-1">
                  No disponible
                </span>
              ) : (
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-lg font-bold text-[var(--color-primary)]">
                    S/{formatMoneyNoDecimals(Math.floor(item.lowestQuota))}
                  </span>
                  <span className="text-xs text-neutral-500">/mes</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {/* Add to Cart button - v0.6.1 (hide if unavailable) */}
                {onAddToCart && !isUnavailable && (
                  <Button
                    size="sm"
                    variant="solid"
                    onPress={() => onAddToCart(item.id)}
                    className="cursor-pointer text-xs h-7 bg-[var(--color-primary)] text-white"
                    startContent={<ShoppingCart className="w-3 h-3" />}
                  >
                    {config?.add_to_cart_button || 'Agregar'}
                  </Button>
                )}
                {onAddToCompare && !isUnavailable && (
                  <Button
                    size="sm"
                    variant={isInCompare ? 'solid' : 'bordered'}
                    onPress={() => onAddToCompare(item.id)}
                    isDisabled={!isInCompare && !canAddToCompare}
                    className={`cursor-pointer text-xs h-7 ${
                      isInCompare
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'border-neutral-300'
                    }`}
                    startContent={<GitCompare className="w-3 h-3" />}
                  >
                    {isInCompare ? (config?.in_compare_button || 'En comparador') : (config?.compare_button || 'Comparar')}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="light"
                  onPress={() => onRemoveProduct(item.id)}
                  className="cursor-pointer text-xs h-7 text-red-500 hover:bg-red-50"
                  startContent={<Trash2 className="w-3 h-3" />}
                >
                  {config?.remove_button || 'Quitar'}
                </Button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// Desktop Modal (NextUI - panel lateral)
const DesktopModal: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  products,
  onRemoveProduct,
  onClearAll,
  onViewProduct,
  onAddToCompare,
  onAddToCart,
  compareList = [],
  maxCompareProducts = 3,
  config,
  unavailableIds = [],
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    size="full"
    scrollBehavior="inside"
    classNames={{
      base: 'bg-white m-0 rounded-none sm:rounded-l-xl sm:ml-auto sm:max-w-md h-full',
      header: 'border-b border-neutral-200 bg-white py-4',
      body: 'bg-white p-0',
      footer: 'border-t border-neutral-200 bg-white',
      closeButton: 'top-4 right-4 hover:bg-neutral-100 rounded-lg cursor-pointer',
    }}
  >
    <ModalContent>
      <ModalHeader className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[rgba(var(--color-primary-rgb),0.1)] flex items-center justify-center">
          <Heart className="w-5 h-5 text-[var(--color-primary)] fill-[var(--color-primary)]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-neutral-800">{config?.title || 'Mis Favoritos'}</h2>
          <p className="text-sm text-neutral-500 font-normal">
            {products.length} {products.length === 1 ? 'producto' : 'productos'}
          </p>
        </div>
      </ModalHeader>

      <ModalBody className="px-4 py-4 overflow-y-auto">
        <WishlistContentShared
          products={products}
          onRemoveProduct={onRemoveProduct}
          onViewProduct={onViewProduct}
          onAddToCompare={onAddToCompare}
          onAddToCart={onAddToCart}
          compareList={compareList}
          maxCompareProducts={maxCompareProducts}
          onClose={onClose}
          config={config}
          unavailableIds={unavailableIds}
        />
      </ModalBody>

      {products.length > 0 && (
        <ModalFooter>
          <Button
            fullWidth
            variant="light"
            onPress={onClearAll}
            className="cursor-pointer text-neutral-600 hover:text-red-500"
            startContent={<Trash2 className="w-4 h-4" />}
          >
            {config?.clear_all_button || 'Limpiar favoritos'}
          </Button>
        </ModalFooter>
      )}
    </ModalContent>
  </Modal>
);

// Mobile Bottom Sheet (Framer Motion - patrón estándar)
const MobileBottomSheet: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  products,
  onRemoveProduct,
  onClearAll,
  onViewProduct,
  onAddToCompare,
  onAddToCart,
  compareList = [],
  maxCompareProducts = 3,
  config,
  unavailableIds = [],
}) => {
  const dragControls = useDragControls();

  // Block body scroll when drawer is open (iOS Safari fix)
  // Note: In catalog page, scroll lock is managed centrally - this is a fallback for standalone usage
  const scrollYRef = useRef<number>(0);
  const didLockRef = useRef<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      // Only lock if not already locked by parent
      if (document.body.style.position !== 'fixed') {
        scrollYRef.current = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollYRef.current}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.overflow = 'hidden';
        didLockRef.current = true;
      }
    } else {
      // Only unlock if we were the one who locked
      if (didLockRef.current) {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollYRef.current);
        didLockRef.current = false;
      }
    }
  }, [isOpen]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="wishlist-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            onTouchMove={(e) => e.preventDefault()}
            className="fixed inset-0 bg-black/50 z-[9998]"
            style={{ touchAction: 'none' }}
          />

          {/* Bottom Sheet */}
          <motion.div
            key="wishlist-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[9999] flex flex-col min-h-[50vh] max-h-[calc(100vh-12rem)]"
            style={{ overscrollBehavior: 'contain' }}
          >
            {/* Drag Handle */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
            >
              <div className="w-10 h-1.5 bg-neutral-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[rgba(var(--color-primary-rgb),0.1)] flex items-center justify-center">
                  <Heart className="w-4 h-4 text-[var(--color-primary)] fill-[var(--color-primary)]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-800">
                    {config?.title || 'Mis Favoritos'}
                  </h2>
                  <p className="text-xs text-neutral-500">
                    {products.length} {products.length === 1 ? 'producto' : 'productos'}
                  </p>
                </div>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={onClose}
                className="cursor-pointer"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Body - scrollable */}
            <div
              className="flex-1 overflow-y-auto px-4 pb-4"
              style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
            >
              <WishlistContentShared
                products={products}
                onRemoveProduct={onRemoveProduct}
                onViewProduct={onViewProduct}
                onAddToCompare={onAddToCompare}
                onAddToCart={onAddToCart}
                compareList={compareList}
                maxCompareProducts={maxCompareProducts}
                onClose={onClose}
                config={config}
                unavailableIds={unavailableIds}
              />
            </div>

            {/* Footer */}
            {products.length > 0 && (
              <div className="border-t border-neutral-200 bg-white p-4">
                <Button
                  fullWidth
                  variant="light"
                  onPress={onClearAll}
                  className="cursor-pointer text-neutral-600 hover:text-red-500"
                  startContent={<Trash2 className="w-4 h-4" />}
                >
                  {config?.clear_all_button || 'Limpiar favoritos'}
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * WishlistDrawer - Panel de favoritos
 * Desktop: Modal lateral con NextUI
 * Mobile: Bottom sheet con Framer Motion
 */
export const WishlistDrawer: React.FC<WishlistDrawerProps> = (props) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileBottomSheet {...props} />;
  }

  return <DesktopModal {...props} />;
};

export default WishlistDrawer;
