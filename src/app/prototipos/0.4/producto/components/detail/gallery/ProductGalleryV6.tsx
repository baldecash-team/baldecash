'use client';

/**
 * ProductGalleryV6 - Visor 360° interactivo + hotspots
 *
 * Interactive 360-degree viewer with hotspot indicators and detailed views.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal, ModalContent, ModalBody, Button } from '@nextui-org/react';
import { Circle, X, Grid, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { ProductGalleryProps } from '../../../types/detail';

export const ProductGalleryV6: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isGridModalOpen, setIsGridModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailImageIndex, setDetailImageIndex] = useState(0);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://via.placeholder.com/600x600?text=Imagen+no+disponible';
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isRotating) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percentage = x / width;
    const imageIndex = Math.floor(percentage * images.length);
    setSelectedImage(Math.min(Math.max(imageIndex, 0), images.length - 1));
    setRotation(percentage * 360);
  };

  const openDetailModal = (index: number) => {
    setDetailImageIndex(index);
    setIsDetailModalOpen(true);
  };

  const nextDetailImage = () => {
    setDetailImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevDetailImage = () => {
    setDetailImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Generate hotspot positions (simulated)
  const hotspots = images.map((_, index) => ({
    index,
    x: 30 + (index * 60) % 60,
    y: 30 + (index * 40) % 50,
  }));

  return (
    <>
      <div className="space-y-4">
        {/* 360° Viewer */}
        <div
          className="relative bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl overflow-hidden border border-neutral-200 aspect-square cursor-grab active:cursor-grabbing select-none"
          onMouseDown={() => setIsRotating(true)}
          onMouseUp={() => setIsRotating(false)}
          onMouseLeave={() => setIsRotating(false)}
          onMouseMove={handleMouseMove}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative w-full h-full"
            >
              <img
                src={images[selectedImage]?.url || ''}
                alt={images[selectedImage]?.alt || productName}
                className="w-full h-full object-contain p-8"
                loading="lazy"
                onError={handleImageError}
                draggable={false}
              />
            </motion.div>
          </AnimatePresence>

          {/* Hotspot Indicators */}
          {hotspots.map((hotspot) => (
            <motion.div
              key={hotspot.index}
              className="absolute cursor-pointer z-10"
              style={{
                left: `${hotspot.x}%`,
                top: `${hotspot.y}%`,
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.3 }}
              onClick={(e) => {
                e.stopPropagation();
                openDetailModal(hotspot.index);
              }}
            >
              <div className="relative">
                <Circle className="w-6 h-6 text-[#03DBD0] fill-[#03DBD0]/20 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#03DBD0] rounded-full" />
                </div>
              </div>
            </motion.div>
          ))}

          {/* Instructions Overlay */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2">
            <span className="text-xs font-medium text-white">
              {isRotating ? 'Rotando...' : 'Arrastra para rotar 360°'}
            </span>
          </div>

          {/* View Controls */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              isIconOnly
              size="sm"
              className="bg-white/90 backdrop-blur-sm"
              onClick={() => setIsGridModalOpen(true)}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              isIconOnly
              size="sm"
              className="bg-white/90 backdrop-blur-sm"
              onClick={() => openDetailModal(selectedImage)}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          {/* Rotation Indicator */}
          <div className="absolute bottom-4 left-4 bg-[#4654CD] backdrop-blur-sm rounded-lg px-4 py-2">
            <div className="flex items-center gap-3">
              <Circle className="w-4 h-4 text-white" />
              <div className="flex flex-col">
                <span className="text-xs text-white/70">Rotación</span>
                <span className="text-sm font-bold text-white">{Math.round(rotation)}°</span>
              </div>
            </div>
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
            <span className="text-xs font-medium text-white">
              {selectedImage + 1} / {images.length}
            </span>
          </div>
        </div>

        {/* Thumbnail Strip */}
        <div className="relative">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                  selectedImage === index
                    ? 'border-[#4654CD] ring-2 ring-[#4654CD]/20'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
                onClick={() => {
                  setSelectedImage(index);
                  setRotation((index / images.length) * 360);
                }}
                whileHover={{ scale: 1.1, y: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-contain p-2 bg-white"
                  loading="lazy"
                  onError={handleImageError}
                />
                {/* Hotspot indicator */}
                <div className="absolute top-1 right-1">
                  <Circle className="w-3 h-3 text-[#03DBD0] fill-[#03DBD0]" />
                </div>
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
                Vista de galería ({images.length} imágenes)
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

            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 max-h-[70vh] overflow-y-auto">
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  className="relative aspect-square rounded-lg overflow-hidden border-2 border-neutral-200 cursor-pointer hover:border-[#4654CD] transition-colors bg-white group"
                  onClick={() => {
                    setSelectedImage(index);
                    setRotation((index / images.length) * 360);
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
                  <div className="absolute inset-0 bg-[#4654CD]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Circle className="w-6 h-6 text-[#03DBD0] fill-[#03DBD0]" />
                  </div>
                </motion.div>
              ))}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
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
              onClick={() => setIsDetailModalOpen(false)}
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
                  onClick={prevDetailImage}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  isIconOnly
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm"
                  size="lg"
                  onClick={nextDetailImage}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Main Image */}
            <div className="relative w-full h-screen flex items-center justify-center p-12">
              <AnimatePresence mode="wait">
                <motion.img
                  key={detailImageIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  src={images[detailImageIndex]?.url || ''}
                  alt={images[detailImageIndex]?.alt || productName}
                  className="max-w-full max-h-full object-contain"
                  onError={handleImageError}
                />
              </AnimatePresence>
            </div>

            {/* Info Bar */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg px-5 py-3 flex items-center gap-4">
              <Circle className="w-5 h-5 text-[#03DBD0] fill-[#03DBD0]" />
              <span className="text-base font-bold text-neutral-700">
                Vista detallada {detailImageIndex + 1} / {images.length}
              </span>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProductGalleryV6;
