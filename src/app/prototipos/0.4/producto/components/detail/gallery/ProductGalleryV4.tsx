'use client';

/**
 * ProductGalleryV4 - Preview flotante + stats overlay
 *
 * Floating preview with image count overlay and hover effects.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal, ModalContent, ModalBody, Button } from '@nextui-org/react';
import { Expand, X, Grid } from 'lucide-react';
import { ProductGalleryProps } from '../../../types/detail';

export const ProductGalleryV4: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);
  const [isGridModalOpen, setIsGridModalOpen] = useState(false);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://via.placeholder.com/600x600?text=Imagen+no+disponible';
  };

  return (
    <>
      <div className="space-y-4">
        {/* Main Image with Stats Overlay */}
        <div className="relative bg-white rounded-xl overflow-hidden border border-neutral-200 aspect-square group">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full"
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

          {/* Stats Overlay - Top */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <Grid className="w-4 h-4 text-white" />
                <span className="text-xs font-medium text-white">
                  {images.length} {images.length === 1 ? 'imagen' : 'imágenes'}
                </span>
              </div>
            </div>

            <Button
              isIconOnly
              size="sm"
              className="bg-white/90 backdrop-blur-sm"
              onClick={() => setIsGridModalOpen(true)}
            >
              <Expand className="w-4 h-4" />
            </Button>
          </div>

          {/* Image Counter - Bottom */}
          <div className="absolute bottom-4 left-4 bg-[#4654CD] backdrop-blur-sm rounded-lg px-3 py-2">
            <span className="text-sm font-bold text-white">
              {selectedImage + 1} / {images.length}
            </span>
          </div>
        </div>

        {/* Floating Preview Thumbnails */}
        <div className="relative">
          <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                  selectedImage === index
                    ? 'border-[#4654CD] ring-2 ring-[#4654CD]/20'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
                onClick={() => setSelectedImage(index)}
                onHoverStart={() => setHoveredImage(index)}
                onHoverEnd={() => setHoveredImage(null)}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-contain p-2 bg-white"
                  loading="lazy"
                  onError={handleImageError}
                />

                {/* Hover Overlay */}
                <AnimatePresence>
                  {hoveredImage === index && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-[#4654CD]/10 flex items-center justify-center"
                    >
                      <div className="bg-white rounded-full p-1.5 shadow-md">
                        <Expand className="w-3 h-3 text-[#4654CD]" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Modal */}
      <Modal
        isOpen={isGridModalOpen}
        onClose={() => setIsGridModalOpen(false)}
        size="5xl"
        scrollBehavior="outside"
        placement="center"
        classNames={{
          backdrop: 'bg-black/90',
        }}
      >
        <ModalContent>
          <ModalBody className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-neutral-900">
                Todas las imágenes ({images.length})
              </h3>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onClick={() => setIsGridModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto">
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  className="relative aspect-square rounded-lg overflow-hidden border-2 border-neutral-200 cursor-pointer hover:border-[#4654CD] transition-colors bg-white"
                  onClick={() => {
                    setSelectedImage(index);
                    setIsGridModalOpen(false);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-contain p-4"
                    loading="lazy"
                    onError={handleImageError}
                  />
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded px-2 py-1">
                    <span className="text-xs font-medium text-white">{index + 1}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProductGalleryV4;
