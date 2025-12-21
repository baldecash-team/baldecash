'use client';

import React, { useState } from 'react';
import { ImageGalleryVersion, GallerySizeVersion, gallerySizeVersionLabels } from '../../types/catalog';

interface ImageGalleryProps {
  images: string[];
  alt: string;
  version: ImageGalleryVersion;
  sizeVersion?: GallerySizeVersion;
}

// Height classes mapping
const sizeHeights: Record<GallerySizeVersion, string> = {
  1: 'h-32',
  2: 'h-40',
  3: 'h-52',
};

// For V2 thumbnails, we need slightly smaller heights to fit thumbnails
const sizeHeightsV2: Record<GallerySizeVersion, string> = {
  1: 'h-24',
  2: 'h-36',
  3: 'h-44',
};

/**
 * ImageGalleryV1 - Dots Carousel
 * Indicadores de puntos debajo de la imagen, click para cambiar
 */
const ImageGalleryV1: React.FC<{ images: string[]; alt: string; heightClass: string }> = ({ images, alt, heightClass }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const displayImages = images.slice(0, 4);

  return (
    <div className="relative">
      <img
        src={displayImages[currentIndex]}
        alt={alt}
        className={`w-full ${heightClass} object-contain transition-opacity duration-200`}
        loading="lazy"
      />
      {displayImages.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {displayImages.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                index === currentIndex
                  ? 'bg-[#4654CD] w-4'
                  : 'bg-neutral-300 hover:bg-neutral-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * ImageGalleryV2 - Thumbnails
 * Miniaturas pequeñas debajo de la imagen principal
 */
const ImageGalleryV2: React.FC<{ images: string[]; alt: string; heightClass: string }> = ({ images, alt, heightClass }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const displayImages = images.slice(0, 4);

  return (
    <div>
      <img
        src={displayImages[currentIndex]}
        alt={alt}
        className={`w-full ${heightClass} object-contain transition-opacity duration-200`}
        loading="lazy"
      />
      {displayImages.length > 1 && (
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
      )}
    </div>
  );
};

/**
 * ImageGalleryV3 - Arrow Navigation
 * Flechas izquierda/derecha que aparecen al hover para navegar
 */
const ImageGalleryV3: React.FC<{ images: string[]; alt: string; heightClass: string }> = ({ images, alt, heightClass }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const displayImages = images.slice(0, 4);

  const goToPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={displayImages[currentIndex]}
        alt={alt}
        className={`w-full ${heightClass} object-contain transition-opacity duration-200`}
        loading="lazy"
      />
      {displayImages.length > 1 && (
        <>
          {/* Arrow buttons - visible on hover */}
          <button
            onClick={goToPrev}
            className={`absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 shadow-md flex items-center justify-center cursor-pointer transition-all hover:bg-white hover:scale-110 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <svg className="w-4 h-4 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className={`absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 shadow-md flex items-center justify-center cursor-pointer transition-all hover:bg-white hover:scale-110 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <svg className="w-4 h-4 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {/* Image counter */}
          <div className={`absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded transition-opacity ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            {currentIndex + 1}/{displayImages.length}
          </div>
        </>
      )}
    </div>
  );
};

/**
 * ImageGallery - Componente principal que renderiza la versión seleccionada
 */
export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, alt, version, sizeVersion = 2 }) => {
  const heightClass = sizeHeights[sizeVersion];
  const heightClassV2 = sizeHeightsV2[sizeVersion];

  // Si no hay imágenes o solo 1, usar imagen simple
  if (images.length <= 1) {
    return (
      <img
        src={images[0] || '/placeholder-laptop.png'}
        alt={alt}
        className={`w-full ${heightClass} object-contain`}
        loading="lazy"
      />
    );
  }

  switch (version) {
    case 2:
      return <ImageGalleryV2 images={images} alt={alt} heightClass={heightClassV2} />;
    case 3:
      return <ImageGalleryV3 images={images} alt={alt} heightClass={heightClass} />;
    default:
      return <ImageGalleryV1 images={images} alt={alt} heightClass={heightClass} />;
  }
};
