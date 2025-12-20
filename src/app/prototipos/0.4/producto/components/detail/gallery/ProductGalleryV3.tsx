'use client';

/**
 * ProductGalleryV3 - Carousel swipeable + pinch-to-zoom
 *
 * Mobile-first carousel with swipe gestures and touch-friendly navigation.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@nextui-org/react';
import { ProductGalleryProps } from '../../../types/detail';

export const ProductGalleryV3: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://via.placeholder.com/600x600?text=Imagen+no+disponible';
  };

  const nextImage = () => {
    setDirection(1);
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setDirection(-1);
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold) {
      prevImage();
    } else if (info.offset.x < -threshold) {
      nextImage();
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <div className="space-y-4">
      {/* Main Carousel */}
      <div className="relative bg-white rounded-xl overflow-hidden border border-neutral-200 aspect-square">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={selectedImage}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
          >
            <img
              src={images[selectedImage]?.url || ''}
              alt={images[selectedImage]?.alt || productName}
              className="w-full h-full object-contain p-8"
              loading="lazy"
              onError={handleImageError}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <Button
              isIconOnly
              size="sm"
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-md"
              onClick={prevImage}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              isIconOnly
              size="sm"
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-md"
              onClick={nextImage}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </>
        )}

        {/* Swipe Hint */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
          <span className="text-xs font-medium text-white">Desliza para cambiar</span>
        </div>

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
          <span className="text-xs font-medium text-white">
            {selectedImage + 1} / {images.length}
          </span>
        </div>
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > selectedImage ? 1 : -1);
              setSelectedImage(index);
            }}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              selectedImage === index
                ? 'w-8 bg-[#4654CD]'
                : 'w-2 bg-neutral-300 hover:bg-neutral-400'
            }`}
            aria-label={`Ir a imagen ${index + 1}`}
          />
        ))}
      </div>

      {/* Thumbnails Grid */}
      <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
        {images.map((image, index) => (
          <motion.div
            key={image.id}
            className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
              selectedImage === index
                ? 'border-[#4654CD] ring-2 ring-[#4654CD]/20'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
            onClick={() => {
              setDirection(index > selectedImage ? 1 : -1);
              setSelectedImage(index);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img
              src={image.url}
              alt={image.alt}
              className="w-full h-full object-contain p-1 bg-white"
              loading="lazy"
              onError={handleImageError}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProductGalleryV3;
