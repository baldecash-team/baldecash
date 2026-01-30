'use client';

/**
 * ProductGallery - Card unificada con galería + info del producto
 * Incluye: imagen principal, thumbnails, marca, rating, nombre y selector de color
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, Star } from 'lucide-react';
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

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
      {/* Main Image */}
      <div
        className="relative aspect-square cursor-zoom-in group"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full"
          >
            <img
              src={images[selectedImage]?.url || ''}
              alt={images[selectedImage]?.alt || productName}
              className="w-full h-full object-contain p-8 transition-transform duration-200"
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
            />
          </motion.div>
        </AnimatePresence>

        {/* Zoom Indicator */}
        {!isZoomed && (
          <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="w-4 h-4 text-neutral-600" />
            <span className="text-xs font-medium text-neutral-700">Hover para zoom</span>
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
            {selectedImage + 1} / {images.length}
          </span>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="px-4 py-3 border-t border-neutral-100">
        <div className="grid grid-cols-5 md:grid-cols-6 gap-2">
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                selectedImage === index
                  ? 'border-[#4654CD] ring-2 ring-[#4654CD]/20'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
              onClick={() => setSelectedImage(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-contain p-1.5 bg-white"
                loading="lazy"
                onError={handleImageError}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Product Info Section */}
      <div className="p-5 border-t border-neutral-100">
        {/* Brand + Rating Row */}
        {(brand || rating) && (
          <div className="flex items-center gap-3 mb-3">
            {brand && (
              <span className="px-3 py-1.5 bg-[#4654CD] text-white text-sm font-bold rounded-lg">
                {brand}
              </span>
            )}
            {rating && (
              <div className="flex items-center gap-1.5">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="text-base font-bold text-neutral-800">{rating}</span>
                {reviewCount && (
                  <span className="text-sm text-neutral-400">({reviewCount})</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Product Name */}
        {displayName && (
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 font-['Baloo_2'] leading-tight">
            {displayName}
          </h1>
        )}

        {/* Color Selector */}
        {colors && colors.length > 0 && selectedColorId && onColorSelect && (
          <div className="mt-4">
            <ColorSelector
              colors={colors}
              selectedColorId={selectedColorId}
              onColorSelect={onColorSelect}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGallery;
