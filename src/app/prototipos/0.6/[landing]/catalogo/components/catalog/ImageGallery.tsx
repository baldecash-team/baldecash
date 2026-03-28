'use client';

/**
 * ImageGallery v0.6 - Simplificado (fijo en V2 Thumbnails)
 * Basado en configuración de presentación v0.4
 */

import React, { useState } from 'react';

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

// Galería V2 con thumbnails (configuración fija de v0.6)
// Layout unificado para consistencia de altura entre cards
export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, alt }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const displayImages = images.slice(0, 4);
  const hasMultipleImages = displayImages.length > 1;

  return (
    <div>
      {/* Imagen principal - altura fija */}
      <img
        src={displayImages[currentIndex] || '/placeholder-laptop.png'}
        alt={alt}
        className="w-full h-36 object-contain transition-opacity duration-200"
        loading="lazy"
      />

      {/* Texto referencial - siempre presente para mantener altura */}
      <p className="text-[10px] text-neutral-400 uppercase tracking-wider text-center mt-2">
        Imagen referencial
      </p>

      {/* Thumbnails row - only show when multiple images */}
      {hasMultipleImages && (
        <div className="flex gap-1 mt-2 justify-center">
          {displayImages.map((img, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`w-10 h-10 rounded border-2 overflow-hidden transition-all cursor-pointer ${
                index === currentIndex
                  ? 'border-[var(--color-primary)]'
                  : 'border-transparent hover:border-neutral-300'
              }`}
            >
              <img
                src={img}
                alt={`${alt} - ${index + 1}`}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
