'use client';

/**
 * ProductGalleryV1 - Thumbnails Laterales + Zoom Modal
 *
 * Caracteristicas:
 * - Thumbnails verticales a la izquierda
 * - Imagen principal grande
 * - Click abre zoom en modal
 * - Ideal para: desktop-first, detalle maximo
 */

import React, { useState } from 'react';
import { Modal, ModalContent, ModalBody } from '@nextui-org/react';
import { ZoomIn, X } from 'lucide-react';
import { ProductGalleryProps } from '../../../types/detail';

export const ProductGalleryV1: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const selectedImage = images[selectedIndex];

  return (
    <div className="flex gap-4">
      {/* Thumbnails laterales */}
      <div className="flex flex-col gap-2 w-20 flex-shrink-0">
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => setSelectedIndex(index)}
            className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
              selectedIndex === index
                ? 'border-[#4654CD] shadow-md'
                : 'border-neutral-200 hover:border-[#4654CD]/50'
            }`}
          >
            <img
              src={image.url}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Imagen principal */}
      <div className="flex-1 relative group">
        <div
          className="aspect-square bg-neutral-50 rounded-xl overflow-hidden cursor-zoom-in"
          onClick={() => setIsZoomOpen(true)}
        >
          <img
            src={selectedImage.url}
            alt={selectedImage.alt}
            className="w-full h-full object-contain p-4"
          />
        </div>

        {/* Indicador de zoom */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="w-4 h-4 text-neutral-600" />
          <span className="text-sm text-neutral-600">Click para zoom</span>
        </div>

        {/* Badge de descuento si aplica */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-[#22c55e] text-white text-sm font-semibold rounded-full">
            Ahorras S/400
          </span>
        </div>
      </div>

      {/* Modal de Zoom */}
      <Modal
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        size="5xl"
        backdrop="blur"
        classNames={{
          backdrop: 'bg-black/80',
          base: 'bg-white',
          closeButton: 'top-4 right-4 hover:bg-neutral-100 rounded-lg cursor-pointer text-neutral-600',
        }}
      >
        <ModalContent>
          <ModalBody className="p-0">
            <div className="relative">
              <img
                src={selectedImage.url}
                alt={selectedImage.alt}
                className="w-full h-auto max-h-[80vh] object-contain"
              />

              {/* Navegacion en zoom */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-white/90 backdrop-blur-sm rounded-lg p-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                      selectedIndex === index
                        ? 'bg-[#4654CD] w-6'
                        : 'bg-neutral-300 hover:bg-neutral-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ProductGalleryV1;
