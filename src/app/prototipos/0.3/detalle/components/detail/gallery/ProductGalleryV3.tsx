'use client';

/**
 * ProductGalleryV3 - Carousel Swipeable + Dots
 *
 * Caracteristicas:
 * - Carousel full-width
 * - Swipe gestures (mobile-first)
 * - Dots de navegacion
 * - Ideal para: mobile, minimalista
 */

import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductGalleryProps } from '../../../types/detail';

export const ProductGalleryV3: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isSwipe = Math.abs(distance) > 50;

    if (isSwipe) {
      if (distance > 0 && currentIndex < images.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else if (distance < 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  const goTo = (index: number) => {
    if (index >= 0 && index < images.length) {
      setCurrentIndex(index);
    }
  };

  const goPrev = () => goTo(currentIndex - 1);
  const goNext = () => goTo(currentIndex + 1);

  return (
    <div className="relative">
      {/* Carousel Container */}
      <div
        ref={carouselRef}
        className="relative aspect-square bg-neutral-50 rounded-xl overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Images */}
        <div
          className="flex transition-transform duration-300 ease-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image) => (
            <div key={image.id} className="w-full h-full flex-shrink-0">
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-contain p-4"
              />
            </div>
          ))}
        </div>

        {/* Badge de descuento */}
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1 bg-[#22c55e] text-white text-sm font-semibold rounded-full">
            Ahorras S/400
          </span>
        </div>

        {/* Contador */}
        <div className="absolute top-4 right-4 z-10 bg-black/50 text-white px-2 py-1 rounded-lg text-sm">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Flechas de navegacion - desktop */}
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className={`hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg items-center justify-center cursor-pointer transition-opacity ${
            currentIndex === 0 ? 'opacity-30' : 'hover:bg-neutral-100'
          }`}
        >
          <ChevronLeft className="w-5 h-5 text-neutral-600" />
        </button>

        <button
          onClick={goNext}
          disabled={currentIndex === images.length - 1}
          className={`hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg items-center justify-center cursor-pointer transition-opacity ${
            currentIndex === images.length - 1 ? 'opacity-30' : 'hover:bg-neutral-100'
          }`}
        >
          <ChevronRight className="w-5 h-5 text-neutral-600" />
        </button>
      </div>

      {/* Dots de navegacion */}
      <div className="flex justify-center gap-2 mt-4">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            className={`transition-all cursor-pointer rounded-full ${
              currentIndex === index
                ? 'w-6 h-2 bg-[#4654CD]'
                : 'w-2 h-2 bg-neutral-300 hover:bg-neutral-400'
            }`}
          />
        ))}
      </div>

      {/* Indicador de swipe - mobile */}
      <p className="text-center text-xs text-neutral-400 mt-2 sm:hidden">
        Desliza para ver mas fotos
      </p>
    </div>
  );
};

export default ProductGalleryV3;
