'use client';

/**
 * ProductGallery - Thumbnails inferiores + zoom hover (basado en V1)
 * Main image with thumbnails below, inline hover zoom effect.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn } from 'lucide-react';
import { ProductGalleryProps } from '../../../types/detail';

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
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
    <div className="space-y-4">
      {/* Main Image */}
      <div
        className="relative bg-white rounded-xl overflow-hidden border border-neutral-200 aspect-square cursor-zoom-in group"
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

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
          <span className="text-xs font-medium text-white">
            {selectedImage + 1} / {images.length}
          </span>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-5 md:grid-cols-6 gap-3">
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
              className="w-full h-full object-contain p-2 bg-white"
              loading="lazy"
              onError={handleImageError}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;
