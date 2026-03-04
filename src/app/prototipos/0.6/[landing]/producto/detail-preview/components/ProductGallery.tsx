'use client';

/**
 * ProductGallery - Galeria de imagenes del producto con thumbnails
 *
 * Layout: Main image + thumbnails debajo
 * Features: Click para cambiar imagen, zoom hover
 */

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import type { ProductColor } from '../../../catalogo/types/catalog';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  brand: string;
  brandLogo?: string;
  colors?: ProductColor[];
  selectedColorId?: string;
  onColorSelect?: (colorId: string) => void;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  productName,
  brand,
  brandLogo,
  colors,
  selectedColorId,
  onColorSelect,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  const displayImages = useMemo(() => {
    if (images.length === 0) return ['/images/products/placeholder.jpg'];
    return images;
  }, [images]);

  const currentImage = displayImages[selectedImageIndex] || displayImages[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
      {/* Brand bar */}
      <div className="px-6 pt-5 pb-3 flex items-center gap-3">
        {brandLogo ? (
          <Image
            src={brandLogo}
            alt={brand}
            width={80}
            height={28}
            className="h-7 w-auto object-contain"
          />
        ) : (
          <span className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
            {brand}
          </span>
        )}
      </div>

      {/* Product name */}
      <div className="px-6 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-800 leading-tight">
          {productName}
        </h1>
      </div>

      {/* Main image with zoom */}
      <div
        className="relative aspect-square mx-6 mb-4 rounded-xl overflow-hidden bg-neutral-50 cursor-zoom-in"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <Image
          src={currentImage}
          alt={productName}
          fill
          className={`object-contain transition-transform duration-300 ${
            isZoomed ? 'scale-150' : 'scale-100'
          }`}
          style={isZoomed ? {
            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
          } : undefined}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="px-6 pb-4 flex gap-2 overflow-x-auto">
          {displayImages.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                index === selectedImageIndex
                  ? 'border-[#4654CD] shadow-md'
                  : 'border-neutral-200 hover:border-neutral-400'
              }`}
            >
              <Image
                src={img}
                alt={`${productName} - ${index + 1}`}
                fill
                className="object-contain p-1"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Color selector */}
      {colors && colors.length > 0 && (
        <div className="px-6 pb-5">
          <p className="text-xs text-neutral-500 mb-2">Color disponible</p>
          <div className="flex gap-2">
            {colors.map((color) => (
              <button
                key={color.id}
                onClick={() => onColorSelect?.(color.id)}
                title={color.name}
                className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                  selectedColorId === color.id
                    ? 'border-[#4654CD] ring-2 ring-[#4654CD]/30 scale-110'
                    : 'border-neutral-300 hover:border-neutral-500'
                }`}
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
