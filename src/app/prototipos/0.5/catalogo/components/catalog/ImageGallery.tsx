'use client';

/**
 * ImageGallery v0.5 - Simplificado (fijo en V2 Thumbnails)
 * Basado en configuración de presentación v0.4
 */

import React, { useState } from 'react';

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

// Galería V2 con thumbnails (configuración fija de v0.5)
export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, alt }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const displayImages = images.slice(0, 4);

  // Si no hay imágenes o solo 1, usar imagen simple
  if (displayImages.length <= 1) {
    return (
      <img
        src={displayImages[0] || '/placeholder-laptop.png'}
        alt={alt}
        className="w-full h-52 object-contain"
        loading="lazy"
      />
    );
  }

  return (
    <div>
      <img
        src={displayImages[currentIndex]}
        alt={alt}
        className="w-full h-44 object-contain transition-opacity duration-200"
        loading="lazy"
      />
      <p className="text-[10px] text-neutral-400 uppercase tracking-wider text-center mt-2">
        Imagen referencial
      </p>
      <div className="flex gap-1 mt-2 justify-center">
        {displayImages.map((img, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(index);
            }}
            className={`w-10 h-10 rounded border-2 overflow-hidden cursor-pointer transition-all ${
              index === currentIndex
                ? 'border-[#4654CD]'
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
    </div>
  );
};

export default ImageGallery;
