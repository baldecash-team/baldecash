'use client';

/**
 * SimilarProducts - Carousel con cards estilo catálogo v0.5
 * Incluye: match %, comparación vs precio actual, tags diferenciadores
 * Diseño basado en ProductCard del catálogo
 * Incluye galería de imágenes con miniaturas y selector de colores
 */

import React, { useRef, useState, useEffect } from 'react';
import { Card, CardBody, Button } from '@nextui-org/react';
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Eye, ArrowRight, Cpu, MemoryStick, HardDrive, Monitor, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SimilarProductsProps, SimilarProduct } from '../../../types/detail';
import { formatMoney } from '../../../../utils/formatMoney';

// State per product for image and color selection
interface ProductCardState {
  selectedImageIndex: number;
  selectedColorId: string | null;
}

export const SimilarProducts: React.FC<SimilarProductsProps> = ({ products, currentQuota, isCleanMode = false }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // State for each product's selected image and color
  const [productStates, setProductStates] = useState<Record<string, ProductCardState>>(() => {
    const initial: Record<string, ProductCardState> = {};
    products.forEach((p) => {
      initial[p.id] = {
        selectedImageIndex: 0,
        selectedColorId: p.colors?.[0]?.id || null,
      };
    });
    return initial;
  });

  // Reinitialize state when products change (e.g., device type change)
  useEffect(() => {
    const newStates: Record<string, ProductCardState> = {};
    products.forEach((p) => {
      newStates[p.id] = {
        selectedImageIndex: 0,
        selectedColorId: p.colors?.[0]?.id || null,
      };
    });
    setProductStates(newStates);
  }, [products]);

  const updateProductState = (productId: string, updates: Partial<ProductCardState>) => {
    setProductStates((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], ...updates },
    }));
  };

  // Helper function to determine if a color is light (for check icon contrast)
  const isLightColor = (hex: string): boolean => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://placehold.co/400x300/e5e7eb/64748b?text=Producto';
  };

  const handleProductClick = (slug: string) => {
    if (typeof window !== 'undefined') {
      const baseUrl = '/prototipos/0.5/producto/detail-preview';
      window.location.href = isCleanMode ? `${baseUrl}?mode=clean` : baseUrl;
    }
  };

  const handleAddToCart = () => {
    if (typeof window !== 'undefined') {
      const baseUrl = '/prototipos/0.5/wizard-solicitud/wizard-preview/';
      window.location.href = isCleanMode ? `${baseUrl}?mode=clean` : baseUrl;
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
                ? 'bg-[#4654CD] text-white hover:bg-[#3a47b3] shadow-lg'
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
                ? 'bg-[#4654CD] text-white hover:bg-[#3a47b3] shadow-lg'
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
        {products.map((product) => {
          const isCheaper = product.quotaDifference < 0;
          const priceDiff = Math.abs(product.quotaDifference);
          const state = productStates[product.id] || { selectedImageIndex: 0, selectedColorId: null };
          const images = product.images || [product.thumbnail];
          const currentImage = images[state.selectedImageIndex] || product.thumbnail;

          return (
            <motion.div
              key={product.id}
              className="w-[280px] md:w-[300px] snap-start flex-shrink-0"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden bg-white">
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

                    {/* Image Thumbnails */}
                    {images.length > 1 && (
                      <div className="flex justify-center gap-1.5">
                        {images.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => updateProductState(product.id, { selectedImageIndex: idx })}
                            className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                              state.selectedImageIndex === idx
                                ? 'border-[#4654CD] shadow-md'
                                : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={img}
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
                        <div className="w-2 h-2 rounded-full bg-[#4654CD]" />
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
                          {isCheaper ? '-' : '+'}S/{formatMoney(priceDiff)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content - Estilo catálogo centrado */}
                  <div className="p-5 text-center flex flex-col flex-1">
                    {/* Imagen referencial */}
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-2">
                      Imagen referencial
                    </p>

                    {/* Brand */}
                    <p className="text-xs text-[#4654CD] font-medium uppercase tracking-wider mb-1">
                      {product.brand}
                    </p>

                    {/* Title */}
                    <h3 className="font-bold text-neutral-800 text-lg line-clamp-2 mb-2">
                      {product.name}
                    </h3>

                    {/* Color Selector - V1 Swatches Style */}
                    {product.colors && product.colors.length > 0 && (
                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-center justify-center gap-2 overflow-x-auto scrollbar-hide pb-1">
                          {product.colors.map((color) => {
                            const isSelected = state.selectedColorId === color.id;
                            const isDarkColor = !isLightColor(color.hex);

                            return (
                              <button
                                key={color.id}
                                type="button"
                                onClick={() => updateProductState(product.id, { selectedColorId: color.id })}
                                className={`
                                  w-7 h-7 rounded-md border-2 transition-all flex-shrink-0
                                  flex items-center justify-center cursor-pointer
                                  ${isSelected
                                    ? 'border-[#4654CD] ring-2 ring-[#4654CD]/20'
                                    : 'border-neutral-200 hover:border-neutral-400'}
                                `}
                                style={{ backgroundColor: color.hex }}
                                aria-label={`Seleccionar color ${color.name}`}
                                aria-pressed={isSelected}
                              >
                                {isSelected && (
                                  <Check
                                    className={`w-4 h-4 ${isDarkColor ? 'text-white' : 'text-neutral-800'}`}
                                    style={{
                                      filter: isDarkColor ? 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))' : 'none',
                                    }}
                                  />
                                )}
                              </button>
                            );
                          })}
                        </div>
                        {/* Selected color name */}
                        {state.selectedColorId && (
                          <p className="text-xs text-neutral-600 font-medium">
                            {product.colors.find((c) => c.id === state.selectedColorId)?.name}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Specs técnicas con iconos - Estilo catálogo */}
                    {product.specs && (
                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-center justify-center gap-2 text-xs text-neutral-600">
                          <Cpu className="w-3.5 h-3.5 text-[#4654CD]" />
                          <span>{product.specs.processor}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs text-neutral-600">
                          <MemoryStick className="w-3.5 h-3.5 text-[#4654CD]" />
                          <span>{product.specs.ram}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs text-neutral-600">
                          <HardDrive className="w-3.5 h-3.5 text-[#4654CD]" />
                          <span>{product.specs.storage}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs text-neutral-600">
                          <Monitor className="w-3.5 h-3.5 text-[#4654CD]" />
                          <span>{product.specs.display}</span>
                        </div>
                      </div>
                    )}

                    {/* Differentiator Tags */}
                    <div className="flex flex-wrap justify-center gap-1.5 mb-3">
                      {product.differentiators.map((diff, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-[#4654CD]/10 text-[#4654CD] text-xs font-medium rounded-full"
                        >
                          {diff}
                        </span>
                      ))}
                    </div>

                    {/* Giant Price - Estilo catálogo */}
                    <div className={`rounded-2xl py-4 px-6 mb-3 ${
                      isCheaper
                        ? 'bg-emerald-50'
                        : 'bg-[#4654CD]/5'
                    }`}>
                      <p className="text-xs text-neutral-500 mb-1">Cuota mensual</p>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className={`text-3xl font-black ${
                          isCheaper ? 'text-emerald-600' : 'text-[#4654CD]'
                        }`}>
                          S/{formatMoney(product.monthlyQuota)}
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
                        <span>vs S/{formatMoney(currentQuota)}/mes actual</span>
                      </div>
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* CTAs - Estilo catálogo */}
                    <div className="flex gap-2">
                      <Button
                        size="lg"
                        variant="bordered"
                        className="flex-1 border-[#4654CD] text-[#4654CD] font-bold cursor-pointer hover:bg-[#4654CD]/5 rounded-xl"
                        startContent={<Eye className="w-5 h-5" />}
                        onPress={() => handleProductClick(product.slug)}
                      >
                        Detalle
                      </Button>
                      <Button
                        size="lg"
                        className={`flex-1 font-bold cursor-pointer rounded-xl ${
                          isCheaper
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                            : 'bg-[#4654CD] text-white hover:bg-[#3a47b3]'
                        }`}
                        onPress={handleAddToCart}
                      >
                        {isCheaper ? 'Ahorrar' : 'Lo quiero'}
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
    </div>
  );
};

export default SimilarProducts;
