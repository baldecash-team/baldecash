'use client';

/**
 * ProductGalleryV2 - Thumbnails laterales + zoom modal
 *
 * Thumbnails on the left side, click main image opens modal with full zoom.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal, ModalContent, ModalBody, Button } from '@nextui-org/react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { ProductGalleryProps } from '../../../types/detail';

export const ProductGalleryV2: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://via.placeholder.com/600x600?text=Imagen+no+disponible';
  };

  const openModal = (index: number) => {
    setModalImageIndex(index);
    setIsModalOpen(true);
  };

  const nextImage = () => {
    setModalImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setModalImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div className="flex gap-4">
        {/* Thumbnails - Left Side */}
        <div className="flex flex-col gap-3 w-20 md:w-24">
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

        {/* Main Image */}
        <div
          className="relative flex-1 bg-white rounded-xl overflow-hidden border border-neutral-200 aspect-square cursor-pointer group"
          onClick={() => openModal(selectedImage)}
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
                className="w-full h-full object-contain p-8"
                loading="lazy"
                onError={handleImageError}
              />
            </motion.div>
          </AnimatePresence>

          {/* Click to Zoom Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2.5 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="w-5 h-5 text-neutral-700" />
              <span className="text-sm font-medium text-neutral-700">Click para ampliar</span>
            </div>
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
            <span className="text-xs font-medium text-white">
              {selectedImage + 1} / {images.length}
            </span>
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="full"
        scrollBehavior="outside"
        placement="center"
        classNames={{
          backdrop: 'bg-black/90',
          wrapper: 'items-center',
          base: 'bg-transparent shadow-none max-w-5xl',
        }}
      >
        <ModalContent>
          <ModalBody className="p-0 relative">
            {/* Close Button */}
            <Button
              isIconOnly
              className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <Button
                  isIconOnly
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  isIconOnly
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </>
            )}

            {/* Main Image */}
            <div className="relative w-full h-screen flex items-center justify-center p-8">
              <img
                src={images[modalImageIndex]?.url || ''}
                alt={images[modalImageIndex]?.alt || productName}
                className="max-w-full max-h-full object-contain"
                onError={handleImageError}
              />
            </div>

            {/* Counter */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-sm font-medium text-neutral-700">
                {modalImageIndex + 1} / {images.length}
              </span>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProductGalleryV2;
