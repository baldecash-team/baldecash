'use client';

/**
 * SimilarProducts - Carousel con cards estilo catálogo v0.6
 * Incluye: match %, comparación vs precio actual, tags diferenciadores
 * Diseño basado en ProductCard del catálogo con alturas fijas para consistencia
 *
 * v0.6.1: Agregado CartSelectionModal para ofrecer opción de carrito
 * v0.6.2: Alturas fijas para consistencia visual, removido selector de colores
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Card, CardBody, Button, Modal, ModalContent, ModalHeader, ModalBody } from '@nextui-org/react';
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Eye, ArrowRight, ShoppingCart, X } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { SimilarProductsProps, SimilarProduct, SimilarProductImage } from '../../../types/detail';
import { formatMoney, formatMoneyNoDecimals } from '../../../utils/formatMoney';
import type { SelectedProduct } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';
import { useIsMobile } from '@/app/prototipos/_shared';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { useAnalytics } from '@/app/prototipos/0.6/analytics/useAnalytics';

// Dynamic storage keys based on landing slug (same pattern as ProductContext)
const getStorageKey = (landing: string) => `baldecash-${landing}-solicitar-selected-product`;
const getCartProductsKey = (landing: string) => `baldecash-${landing}-solicitar-cart-products`;

// State per product for image selection
interface ProductCardState {
  selectedImageIndex: number;
}

// Extended props for cart integration
// v0.6.2: onAddToCart now receives SimilarProduct to build CartItem
interface SimilarProductsExtendedProps extends SimilarProductsProps {
  onAddToCart?: (product: SimilarProduct) => void;
  cartItems?: string[];
}

/** Título con line-clamp-2 y tooltip CSS cuando el texto está truncado */
function TruncatedTitle({ text, onClick }: { text: string; onClick?: () => void }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const check = useCallback(() => {
    const el = ref.current;
    if (el) setIsTruncated(el.scrollHeight > el.clientHeight);
  }, []);
  useEffect(() => {
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [text, check]);

  return (
    <div className="relative group/title min-h-[3.5rem] mb-3">
      <h3
        ref={ref}
        className="font-bold text-neutral-800 text-lg line-clamp-2 cursor-pointer hover:text-[var(--color-primary)] transition-colors leading-tight"
        onClick={onClick}
      >
        {text}
      </h3>
      {isTruncated && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-3 py-2 bg-neutral-800 text-white text-xs rounded-lg shadow-lg max-w-sm whitespace-normal opacity-0 invisible group-hover/title:opacity-100 group-hover/title:visible transition-opacity duration-200 z-50 pointer-events-none">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800" />
        </div>
      )}
    </div>
  );
}

export const SimilarProducts: React.FC<SimilarProductsExtendedProps> = ({
  products,
  currentQuota,
  landing: landingProp,
  sourceProductId = '',
  onAddToCart,
  cartItems = [],
}) => {
  const isMobile = useIsMobile();
  const analytics = useAnalytics();

  // Si no hay productos similares, no mostrar la sección
  if (!products || products.length === 0) {
    return null;
  }

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Modal state for cart selection
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<SimilarProduct | null>(null);

  // Open modal when clicking "Lo quiero"
  const handleOpenModal = (product: SimilarProduct) => {
    analytics.trackSimilarProductClick({
      source_product_id: sourceProductId,
      target_product_id: product.id,
      position: products.findIndex((p) => p.id === product.id),
    });
    setSelectedProductForModal(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProductForModal(null);
  };

  // State for each product's selected image
  const [productStates, setProductStates] = useState<Record<string, ProductCardState>>(() => {
    const initial: Record<string, ProductCardState> = {};
    products.forEach((p) => {
      initial[p.id] = { selectedImageIndex: 0 };
    });
    return initial;
  });

  // Reinitialize state when products change
  useEffect(() => {
    const newStates: Record<string, ProductCardState> = {};
    products.forEach((p) => {
      newStates[p.id] = { selectedImageIndex: 0 };
    });
    setProductStates(newStates);
  }, [products]);

  // Check scroll state on mount and when products change
  useEffect(() => {
    // Small delay to ensure DOM is rendered
    const timer = setTimeout(() => {
      checkScroll();
    }, 100);
    return () => clearTimeout(timer);
  }, [products]);

  const updateProductState = (productId: string, updates: Partial<ProductCardState>) => {
    setProductStates((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], ...updates },
    }));
  };

  // Obtener URLs de imágenes
  const getImageUrls = (
    images: SimilarProductImage[] | undefined,
    thumbnail: string
  ): string[] => {
    if (!images || images.length === 0) return [thumbnail];
    return images.map((img) => img.url);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://placehold.co/400x300/e5e7eb/64748b?text=Producto';
  };

  const handleProductClick = (slug: string) => {
    if (typeof window !== 'undefined') {
      const clickedProduct = products.find((p) => p.slug === slug);
      if (clickedProduct) {
        analytics.trackSimilarProductClick({
          source_product_id: sourceProductId,
          target_product_id: clickedProduct.id,
          position: products.findIndex((p) => p.id === clickedProduct.id),
        });
      }
      const landing = landingProp || 'home';
      window.location.href = routes.producto(landing, slug);
    }
  };

  const handleAddToCart = (product: SimilarProduct) => {
    // Save product to localStorage before navigating
    if (typeof window !== 'undefined') {
      const landing = landingProp || 'home';

      // Build SelectedProduct from SimilarProduct
      // Note: SimilarProduct doesn't have price, so we estimate it from monthlyQuota
      // Price ≈ monthlyQuota * months (plazo más alto, sin inicial)
      const estimatedPrice = Math.floor(product.monthlyQuota * 24);

      const selectedProduct: SelectedProduct = {
        id: product.id,
        name: product.displayName,
        shortName: product.name,
        brand: product.brand,
        price: estimatedPrice,
        monthlyPayment: product.monthlyQuota,
        months: 24, // Fallback — SimilarProduct no trae maxTermMonths
        initialPercent: 0,
        initialAmount: 0,
        image: product.thumbnail,
        specs: product.specs ? {
          processor: product.specs.processor || '',
          ram: product.specs.ram || '',
          storage: product.specs.storage || '',
        } : undefined,
      };

      // Save to localStorage
      try {
        localStorage.setItem(getStorageKey(landing), JSON.stringify(selectedProduct));
        // Clear cart products since this is a single product selection
        localStorage.removeItem(getCartProductsKey(landing));
      } catch {
        // localStorage not available
      }

      window.location.href = routes.solicitar(landing);
    }
  };

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 300);
    }
  };

  // Calculate max differentiators count (excluding brand, capped at 3) for consistent card height
  const MAX_DIFF_TAGS = 3;
  const maxDiffCount = Math.min(MAX_DIFF_TAGS, Math.max(0, ...products.map(p =>
    p.differentiators.filter(d => d.toLowerCase() !== p.brand.toLowerCase()).length
  )));
  // Each tag ~26px tall + 6px gap between them
  const diffMinHeight = maxDiffCount > 0 ? maxDiffCount * 26 + Math.max(0, maxDiffCount - 1) * 6 : 0;

  return (
    <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 mb-1">También te puede interesar</h3>
          <p className="text-sm text-neutral-500">Desliza para explorar más opciones</p>
        </div>

        {/* Navigation Arrows */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              canScrollLeft
                ? 'bg-[var(--color-primary)] text-white hover:brightness-90 shadow-lg'
                : 'bg-neutral-100 text-neutral-300'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              canScrollRight
                ? 'bg-[var(--color-primary)] text-white hover:brightness-90 shadow-lg'
                : 'bg-neutral-100 text-neutral-300'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-6 -mx-2 px-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product, index) => {
          const isCheaper = product.quotaDifference < 0;
          const priceDiff = Math.abs(product.quotaDifference);
          const state = productStates[product.id] || { selectedImageIndex: 0 };
          const imageUrls = getImageUrls(product.images, product.thumbnail);
          const currentImage = imageUrls[state.selectedImageIndex] || product.thumbnail;

          const discountValue = product.promotion?.discount_value ?? 0;

          return (
            <motion.div
              key={`${product.id}-${index}`}
              className="w-[260px] sm:w-[280px] md:w-[300px] lg:w-[320px] snap-start flex-shrink-0"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className="h-full shadow-lg hover:shadow-xl transition-all overflow-hidden bg-white"
              >
                <CardBody className="p-0 flex flex-col">
                  {/* Image Gallery - Estilo catálogo */}
                  <div className="relative bg-gradient-to-b from-neutral-50 to-white p-4">
                    {/* Main Image */}
                    <div className="aspect-[4/3] overflow-hidden rounded-xl mb-2">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={state.selectedImageIndex}
                          src={currentImage}
                          alt={product.name}
                          className="w-full h-full object-contain"
                          onError={handleImageError}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      </AnimatePresence>
                    </div>

                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider text-center mb-2">
                      Imagen referencial
                    </p>

                    {/* Image Thumbnails */}
                    {imageUrls.length >= 1 && (
                      <div className="flex justify-center gap-1.5">
                        {imageUrls.map((imgUrl, idx) => (
                          <button
                            key={idx}
                            onClick={() => updateProductState(product.id, { selectedImageIndex: idx })}
                            className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                              state.selectedImageIndex === idx
                                ? 'border-[var(--color-primary)] shadow-md'
                                : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={imgUrl}
                              alt={`${product.name} ${idx + 1}`}
                              className="w-full h-full object-contain bg-white"
                              onError={handleImageError}
                            />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Match Badge - Top Left */}
                    <div className="absolute top-3 left-3">
                      <div className="px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-md flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                        <span className="text-xs font-bold text-neutral-800">{product.matchScore}% match</span>
                      </div>
                    </div>

                    {/* Price Comparison Badge - Top Right */}
                    <div className="absolute top-3 right-3">
                      <div className={`px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 ${
                        isCheaper
                          ? 'bg-emerald-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}>
                        {isCheaper ? (
                          <TrendingDown className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingUp className="w-3.5 h-3.5" />
                        )}
                        <span className="text-xs font-bold">
                          {isCheaper ? '-' : '+'}S/{formatMoneyNoDecimals(priceDiff)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content - Estilo catálogo centrado */}
                  <div className="p-5 text-center flex flex-col flex-1">
                    {/* Brand */}
                    <p className="text-xs text-[var(--color-primary)] font-medium uppercase tracking-wider mb-1">
                      {product.brand}
                    </p>

                    {/* Title - Altura fija para 2 líneas, tooltip si truncado */}
                    <TruncatedTitle
                      text={product.displayName}
                      onClick={() => handleProductClick(product.slug)}
                    />

                    {/* Differentiator Tags - Vertical list, height based on max across all cards */}
                    {maxDiffCount > 0 && (
                      <div className="flex flex-col items-center gap-1.5 mb-3" style={{ minHeight: diffMinHeight }}>
                        {product.differentiators
                          .filter((diff) => diff.toLowerCase() !== product.brand.toLowerCase())
                          .slice(0, MAX_DIFF_TAGS)
                          .map((diff, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-[rgba(var(--color-primary-rgb),0.10)] text-[var(--color-primary)] text-xs font-medium rounded-full"
                          >
                            {diff}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Giant Price - Estilo catálogo */}
                    <div className={`rounded-2xl py-4 px-6 mb-3 ${
                      isCheaper
                        ? 'bg-emerald-50'
                        : 'bg-[rgba(var(--color-primary-rgb),0.05)]'
                    }`}>
                      {/* Precio anterior tachado + badge descuento (igual que catálogo) */}
                      <div className="h-5 flex items-center justify-center gap-1.5 mb-1">
                        {discountValue > 0 ? (
                          <>
                            <span className="text-xs text-neutral-400 line-through">
                              S/{formatMoneyNoDecimals(Math.round(product.monthlyQuota / (1 - discountValue / 100)))}
                            </span>
                            <span className="text-xs font-bold text-white bg-[var(--color-primary)] px-1.5 py-0.5 rounded">
                              -{Math.round(discountValue)}%
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-neutral-500">Cuota mensual</span>
                        )}
                      </div>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className={`text-3xl font-black ${
                          isCheaper ? 'text-emerald-600' : 'text-[var(--color-primary)]'
                        }`}>
                          S/{formatMoneyNoDecimals(product.monthlyQuota)}
                        </span>
                        <span className="text-base text-neutral-400">/mes</span>
                      </div>
                      {/* Comparison vs current */}
                      <div className={`inline-flex items-center justify-center gap-1 text-xs font-medium mt-1 ${
                        isCheaper ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {isCheaper ? (
                          <TrendingDown className="w-3 h-3" />
                        ) : (
                          <TrendingUp className="w-3 h-3" />
                        )}
                        <span>vs S/{formatMoneyNoDecimals(currentQuota)}/mes actual</span>
                      </div>
                    </div>

                    {/* Spacer - empuja pricing y CTAs al fondo */}
                    <div className="flex-1 min-h-4" />

                    {/* CTAs - Estilo catálogo */}
                    <div className="flex gap-2">
                      <Button
                        size="lg"
                        variant="bordered"
                        className="flex-1 border-[var(--color-primary)] text-[var(--color-primary)] font-bold cursor-pointer hover:bg-[rgba(var(--color-primary-rgb),0.05)] rounded-xl"
                        startContent={<Eye className="w-5 h-5 hidden md:block" />}
                        onPress={() => handleProductClick(product.slug)}
                      >
                        Detalle
                      </Button>
                      <Button
                        size="lg"
                        className={`flex-1 font-bold cursor-pointer rounded-xl ${
                          onAddToCart && cartItems.includes(product.id)
                            ? 'bg-emerald-500 text-white cursor-default'
                            : isCheaper
                              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                              : 'bg-[var(--color-primary)] text-white hover:brightness-90'
                        }`}
                        onPress={() => {
                          if (onAddToCart && cartItems.includes(product.id)) return;
                          if (onAddToCart) {
                            handleOpenModal(product);
                          } else {
                            handleAddToCart(product);
                          }
                        }}
                        isDisabled={onAddToCart && cartItems.includes(product.id)}
                      >
                        {onAddToCart && cartItems.includes(product.id) ? 'En el carrito' : isCheaper ? 'Ahorrar' : 'Lo quiero'}
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Mobile Scroll Hint */}
      <p className="md:hidden text-center text-xs text-neutral-400 mt-3">
        Desliza para ver más →
      </p>

      {/* Cart Selection Modal — only when multi-product is enabled */}
      {onAddToCart && selectedProductForModal && (
        isMobile ? (
          <SimilarProductMobileModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            product={selectedProductForModal}
            onRequestEquipment={() => handleAddToCart(selectedProductForModal)}
            onAddToCart={() => {
              analytics.trackSimilarProductAddToCart({
                source_product_id: sourceProductId,
                target_product_id: selectedProductForModal.id,
              });
              onAddToCart(selectedProductForModal);
              handleCloseModal();
            }}
          />
        ) : (
          <SimilarProductDesktopModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            product={selectedProductForModal}
            onRequestEquipment={() => handleAddToCart(selectedProductForModal)}
            onAddToCart={() => {
              analytics.trackSimilarProductAddToCart({
                source_product_id: sourceProductId,
                target_product_id: selectedProductForModal.id,
              });
              onAddToCart(selectedProductForModal);
              handleCloseModal();
            }}
          />
        )
      )}
    </div>
  );
};

// ============================================
// Cart Selection Modal Components for SimilarProduct
// ============================================

interface SimilarProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: SimilarProduct;
  onRequestEquipment: () => void;
  onAddToCart: () => void;
}

// Shared content for both mobile and desktop modals
const ModalContentShared: React.FC<{
  product: SimilarProduct;
  onRequestEquipment: () => void;
  onAddToCart: () => void;
  onClose: () => void;
}> = ({ product, onRequestEquipment, onAddToCart, onClose }) => {
  return (
    <div className="space-y-4">
      {/* Product Preview */}
      <div className="flex items-center gap-4 p-3 bg-neutral-50 rounded-xl">
        <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 border border-neutral-200">
          <img
            src={product.thumbnail}
            alt={product.displayName}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[var(--color-primary)] font-medium uppercase tracking-wide">
            {product.brand}
          </p>
          <h3 className="text-sm lg:text-base font-semibold text-neutral-800 line-clamp-2">
            {product.displayName}
          </h3>
          <p className="text-base lg:text-lg font-bold text-[var(--color-primary)] mt-0.5">
            S/{formatMoneyNoDecimals(Math.floor(product.monthlyQuota))}/mes
          </p>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {/* Option 1: Request Equipment */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            onRequestEquipment();
            onClose();
          }}
          className="w-full p-4 bg-[var(--color-primary)] text-white rounded-xl flex items-center gap-4 cursor-pointer hover:brightness-90 transition-colors"
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <ArrowRight className="w-6 h-6" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-base">Solicitar equipo</p>
            <p className="text-sm text-white/80">
              Iniciar proceso de solicitud ahora
            </p>
          </div>
        </motion.button>

        {/* Option 2: Add to Cart */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            onAddToCart();
          }}
          className="w-full p-4 bg-white border-2 border-neutral-200 text-neutral-800 rounded-xl flex items-center gap-4 cursor-pointer hover:border-[var(--color-primary)] hover:bg-[rgba(var(--color-primary-rgb),0.05)] transition-all"
        >
          <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShoppingCart className="w-6 h-6 text-neutral-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-base">Añadir al carrito</p>
            <p className="text-sm text-neutral-500">
              Guardar y seguir explorando
            </p>
          </div>
        </motion.button>
      </div>
    </div>
  );
};

// Desktop Modal (NextUI)
const SimilarProductDesktopModal: React.FC<SimilarProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onRequestEquipment,
  onAddToCart,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    size="md"
    backdrop="blur"
    placement="center"
    classNames={{
      wrapper: 'z-[100]',
      backdrop: 'bg-black/50 backdrop-blur-sm z-[99]',
      base: 'bg-white rounded-2xl shadow-2xl border border-neutral-200',
      header: 'border-b border-neutral-100 pb-4',
      body: 'p-0',
      closeButton: 'top-4 right-4 hover:bg-neutral-100 rounded-lg cursor-pointer',
    }}
  >
    <ModalContent>
      <ModalHeader className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[rgba(var(--color-primary-rgb),0.1)] flex items-center justify-center">
          <ShoppingCart className="w-5 h-5 text-[var(--color-primary)]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-neutral-800">¿Qué deseas hacer?</h2>
          <p className="text-sm text-neutral-500">Elige una opción</p>
        </div>
      </ModalHeader>
      <ModalBody className="p-6">
        <ModalContentShared
          product={product}
          onRequestEquipment={onRequestEquipment}
          onAddToCart={onAddToCart}
          onClose={onClose}
        />
      </ModalBody>
    </ModalContent>
  </Modal>
);

// Mobile Bottom Sheet (Framer Motion)
const SimilarProductMobileModal: React.FC<SimilarProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onRequestEquipment,
  onAddToCart,
}) => {
  const dragControls = useDragControls();

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="similar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[9998]"
          />

          {/* Bottom Sheet */}
          <motion.div
            key="similar-sheet"
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
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[9999] flex flex-col"
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
                  <ShoppingCart className="w-4 h-4 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-800">
                    ¿Qué deseas hacer?
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Elige una opción
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

            {/* Body */}
            <div className="p-4 pb-8">
              <ModalContentShared
                product={product}
                onRequestEquipment={onRequestEquipment}
                onAddToCart={onAddToCart}
                onClose={onClose}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SimilarProducts;
