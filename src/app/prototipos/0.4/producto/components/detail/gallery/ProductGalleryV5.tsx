'use client';

/**
 * ProductGalleryV5 - Hero fullscreen + masonry grid
 *
 * Large hero image with masonry-style thumbnail grid below.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal, ModalContent, ModalBody, Button } from '@nextui-org/react';
import { Expand, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductGalleryProps } from '../../../types/detail';

export const ProductGalleryV5: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://via.placeholder.com/600x600?text=Imagen+no+disponible';
  };

  const openFullscreen = (index: number) => {
    setFullscreenIndex(index);
    setIsFullscreenOpen(true);
  };

  const nextFullscreenImage = () => {
    setFullscreenIndex((prev) => (prev + 1) % images.length);
  };

  const prevFullscreenImage = () => {
    setFullscreenIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Hero Image */}
        <div
          className="relative bg-white rounded-xl overflow-hidden border border-neutral-200 cursor-pointer group"
          style={{ aspectRatio: '16/10' }}
          onClick={() => openFullscreen(selectedImage)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="relative w-full h-full"
            >
              <img
                src={images[selectedImage]?.url || ''}
                alt={images[selectedImage]?.alt || productName}
                className="w-full h-full object-contain p-12"
                loading="lazy"
                onError={handleImageError}
              />
            </motion.div>
          </AnimatePresence>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Expand Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Button
              isIconOnly
              className="bg-white/90 backdrop-blur-sm shadow-lg"
              size="lg"
            >
              <Expand className="w-5 h-5" />
            </Button>
          </motion.div>

          {/* Image Info */}
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2">
            <span className="text-sm font-medium text-white">
              Vista principal {selectedImage + 1}/{images.length}
            </span>
          </div>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((image, index) => {
            // Alternate heights for masonry effect
            const isLarge = index % 3 === 0;

            return (
              <motion.div
                key={image.id}
                className={`relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all bg-white ${
                  selectedImage === index
                    ? 'border-[#4654CD] ring-2 ring-[#4654CD]/20'
                    : 'border-neutral-200 hover:border-neutral-300'
                } ${isLarge ? 'row-span-2' : 'row-span-1'}`}
                style={{ aspectRatio: isLarge ? '1/1.5' : '1/1' }}
                onClick={() => setSelectedImage(index)}
                whileHover={{ scale: 1.02, zIndex: 10 }}
                whileTap={{ scale: 0.98 }}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-contain p-3"
                  loading="lazy"
                  onError={handleImageError}
                />

                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity" />

                {/* Index Badge */}
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded px-2 py-1">
                  <span className="text-xs font-bold text-neutral-700">{index + 1}</span>
                </div>

                {/* Expand Icon on Hover */}
                <div className="absolute bottom-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5">
                    <Expand className="w-3 h-3 text-[#4654CD]" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Modal */}
      <Modal
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        size="full"
        scrollBehavior="outside"
        placement="center"
        classNames={{
          backdrop: 'bg-black/90',
          wrapper: 'items-center',
          base: 'bg-transparent shadow-none max-w-7xl',
        }}
      >
        <ModalContent>
          <ModalBody className="p-0 relative">
            {/* Close Button */}
            <Button
              isIconOnly
              className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm"
              size="lg"
              onClick={() => setIsFullscreenOpen(false)}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <Button
                  isIconOnly
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm"
                  size="lg"
                  onClick={prevFullscreenImage}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  isIconOnly
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm"
                  size="lg"
                  onClick={nextFullscreenImage}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Main Image */}
            <div className="relative w-full h-screen flex items-center justify-center p-12">
              <AnimatePresence mode="wait">
                <motion.img
                  key={fullscreenIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  src={images[fullscreenIndex]?.url || ''}
                  alt={images[fullscreenIndex]?.alt || productName}
                  className="max-w-full max-h-full object-contain"
                  onError={handleImageError}
                />
              </AnimatePresence>
            </div>

            {/* Counter */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg px-5 py-2.5">
              <span className="text-base font-bold text-neutral-700">
                {fullscreenIndex + 1} / {images.length}
              </span>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProductGalleryV5;
