'use client';

/**
 * ProductGallery - Card unificada con galería + info del producto
 * Incluye: imagen principal, thumbnails, marca, rating, nombre y selector de color
 * + Lightbox modal para ver imágenes en pantalla completa con zoom
 *
 * Las imágenes se FILTRAN por el color seleccionado (via variantId)
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, Star, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { ProductGalleryProps } from '../../../types/detail';
import { ColorSelector } from '../color-selector/ColorSelector';

interface ExtendedProductGalleryProps extends ProductGalleryProps {
  // Product info
  brand?: string;
  rating?: number;
  reviewCount?: number;
  displayName?: string;
  // Color selector
  colors?: Array<{ id: string; name: string; hex: string }>;
  selectedColorId?: string;
  onColorSelect?: (colorId: string) => void;
}

export const ProductGallery: React.FC<ExtendedProductGalleryProps> = ({
  images,
  productName,
  brand,
  rating,
  reviewCount,
  displayName,
  colors,
  selectedColorId,
  onColorSelect,
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Lightbox state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [lightboxPosition, setLightboxPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Extraer el variant_id numérico del selectedColorId (formato "variant-{id}")
  const selectedVariantId = useMemo(() => {
    if (!selectedColorId) return null;
    const match = selectedColorId.match(/variant-(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }, [selectedColorId]);

  // Filtrar imágenes por el color/variante seleccionado
  const filteredImages = useMemo(() => {
    // Si no hay variante seleccionada o no hay variantId en imágenes, mostrar todas
    if (!selectedVariantId) return images;

    const variantImages = images.filter(img => img.variantId === selectedVariantId);
    // Si no hay imágenes para esta variante, mostrar todas
    return variantImages.length > 0 ? variantImages : images;
  }, [images, selectedVariantId]);

  // Reset a primera imagen cuando cambia el color
  useEffect(() => {
    setSelectedImage(0);
  }, [selectedColorId]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://via.placeholder.com/600x600?text=Imagen+no+disponible';
  };

  // Lightbox handlers
  const openLightbox = useCallback(() => {
    setIsLightboxOpen(true);
    setLightboxZoom(1);
    setLightboxPosition({ x: 0, y: 0 });
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    setLightboxZoom(1);
    setLightboxPosition({ x: 0, y: 0 });
    document.body.style.overflow = '';
  }, []);

  const handleLightboxPrev = useCallback(() => {
    setSelectedImage((prev) => (prev === 0 ? filteredImages.length - 1 : prev - 1));
    setLightboxZoom(1);
    setLightboxPosition({ x: 0, y: 0 });
  }, [filteredImages.length]);

  const handleLightboxNext = useCallback(() => {
    setSelectedImage((prev) => (prev === filteredImages.length - 1 ? 0 : prev + 1));
    setLightboxZoom(1);
    setLightboxPosition({ x: 0, y: 0 });
  }, [filteredImages.length]);

  const handleZoomIn = useCallback(() => {
    setLightboxZoom((prev) => Math.min(prev + 0.5, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setLightboxZoom((prev) => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) setLightboxPosition({ x: 0, y: 0 });
      return newZoom;
    });
  }, []);

  const handleDoubleClick = useCallback(() => {
    if (lightboxZoom > 1) {
      setLightboxZoom(1);
      setLightboxPosition({ x: 0, y: 0 });
    } else {
      setLightboxZoom(2);
    }
  }, [lightboxZoom]);

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (lightboxZoom <= 1) return;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - lightboxPosition.x, y: clientY - lightboxPosition.y });
  }, [lightboxZoom, lightboxPosition]);

  const handleDragMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || lightboxZoom <= 1) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setLightboxPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    });
  }, [isDragging, lightboxZoom, dragStart]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          handleLightboxPrev();
          break;
        case 'ArrowRight':
          handleLightboxNext();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, closeLightbox, handleLightboxPrev, handleLightboxNext, handleZoomIn, handleZoomOut]);

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
      {/* Product Name + Brand - Above photos */}
      {(displayName || brand) && (
        <div id="section-info" className="p-5 pb-0 relative z-10">
          {/* Brand + Rating Row */}
          {(brand || rating) && (
            <div className="flex items-center gap-3 mb-2">
              {brand && (
                <span className="px-3 py-1.5 bg-[var(--color-primary)] text-white text-sm font-bold rounded-lg">
                  {brand}
                </span>
              )}
              {rating !== undefined && rating > 0 && (
                <div className="flex items-center gap-1.5">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="text-base font-bold text-neutral-800">{rating}</span>
                  {reviewCount !== undefined && reviewCount > 0 && (
                    <span className="text-sm text-neutral-400">({reviewCount})</span>
                  )}
                </div>
              )}
            </div>
          )}
          {displayName && (
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 font-['Baloo_2',_sans-serif] leading-tight">
              {displayName}
            </h1>
          )}
          {/* Color Selector - Below product name */}
          {colors && colors.length > 0 && selectedColorId && onColorSelect && (
            <div className="mt-3">
              <ColorSelector
                colors={colors}
                selectedColorId={selectedColorId}
                onColorSelect={onColorSelect}
              />
            </div>
          )}
        </div>
      )}

      {/* Main Image — swipe to change on touch devices (framer-motion drag).
          Click/tap still opens the lightbox when drag distance is negligible. */}
      <motion.div
        className="relative aspect-square cursor-zoom-in group overflow-hidden touch-pan-y"
        onClick={openLightbox}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          const threshold = 50;
          if (info.offset.x < -threshold && selectedImage < filteredImages.length - 1) {
            setSelectedImage((i) => i + 1);
          } else if (info.offset.x > threshold && selectedImage > 0) {
            setSelectedImage((i) => i - 1);
          }
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full pointer-events-none"
          >
            <img
              src={filteredImages[selectedImage]?.url || undefined}
              alt={filteredImages[selectedImage]?.alt || productName}
              className="w-full h-full object-contain p-8 transition-transform duration-200 pointer-events-none"
              style={
                isZoomed
                  ? {
                      transform: 'scale(2)',
                      transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                    }
                  : {}
              }
              loading="lazy"
              onError={handleImageError}
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        {/* Zoom Indicator */}
        {!isZoomed && (
          <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Maximize2 className="w-4 h-4 text-neutral-600" />
            <span className="text-xs font-medium text-neutral-700">Click para ampliar</span>
          </div>
        )}

        {/* Imagen referencial */}
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center">
          <span className="text-[10px] uppercase tracking-wider text-white/80 leading-none">
            Imagen referencial
          </span>
        </div>

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
          <span className="text-xs font-medium text-white">
            {selectedImage + 1} / {filteredImages.length}
          </span>
        </div>
      </motion.div>

      {/* Thumbnails */}
      <div className="px-4 py-3 border-t border-neutral-100">
        <div className="grid grid-cols-5 md:grid-cols-6 gap-2">
          {filteredImages.map((image, index) => (
            <motion.div
              key={image.id}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                selectedImage === index
                  ? 'border-[var(--color-primary)] ring-2 ring-[rgba(var(--color-primary-rgb),0.20)]'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
              onClick={() => setSelectedImage(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={image.url || undefined}
                alt={image.alt}
                className="w-full h-full object-contain p-1.5 bg-white"
                loading="lazy"
                onError={handleImageError}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={(e) => e.target === e.currentTarget && closeLightbox()}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Zoom controls */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-white/10 rounded-full px-3 py-2">
              <button
                onClick={handleZoomOut}
                disabled={lightboxZoom <= 1}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                aria-label="Reducir zoom"
              >
                <ZoomOut className="w-5 h-5 text-white" />
              </button>
              <span className="text-white text-sm font-medium min-w-[3rem] text-center">
                {Math.round(lightboxZoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={lightboxZoom >= 3}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                aria-label="Aumentar zoom"
              >
                <ZoomIn className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Navigation arrows */}
            {filteredImages.length > 1 && (
              <>
                <button
                  onClick={handleLightboxPrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={handleLightboxNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}

            {/* Main image */}
            <motion.div
              className="relative max-w-[90vw] max-h-[80vh] overflow-hidden"
              style={{
                cursor: lightboxZoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
              }}
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
              onDoubleClick={handleDoubleClick}
            >
              <motion.img
                key={selectedImage}
                src={filteredImages[selectedImage]?.url || undefined}
                alt={filteredImages[selectedImage]?.alt || productName}
                className="max-w-full max-h-[80vh] object-contain select-none"
                style={{
                  transform: `scale(${lightboxZoom}) translate(${lightboxPosition.x / lightboxZoom}px, ${lightboxPosition.y / lightboxZoom}px)`,
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                draggable={false}
                onError={handleImageError}
              />
            </motion.div>

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 rounded-full px-4 py-2">
              <span className="text-white text-sm font-medium">
                {selectedImage + 1} / {filteredImages.length}
              </span>
            </div>

            {/* Thumbnails strip */}
            {filteredImages.length > 1 && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 bg-white/10 rounded-xl p-2 max-w-[80vw] overflow-x-auto">
                {filteredImages.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => {
                      setSelectedImage(index);
                      setLightboxZoom(1);
                      setLightboxPosition({ x: 0, y: 0 });
                    }}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                      selectedImage === index
                        ? 'border-white'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image.url || undefined}
                      alt={image.alt}
                      className="w-full h-full object-contain bg-white/10"
                      onError={handleImageError}
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductGallery;
