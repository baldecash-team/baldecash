'use client';

/**
 * ProductGalleryV2 - Thumbnails Inferiores + Zoom Hover
 *
 * Caracteristicas:
 * - Thumbnails horizontales debajo
 * - Zoom inline al hacer hover
 * - Transicion suave
 * - Ideal para: balance desktop/mobile
 */

import React, { useState, useRef } from 'react';
import { ProductGalleryProps } from '../../../types/detail';

export const ProductGalleryV2: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedImage = images[selectedIndex];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  return (
    <div className="space-y-4">
      {/* Imagen principal con zoom hover */}
      <div
        ref={containerRef}
        className="relative aspect-square bg-neutral-50 rounded-xl overflow-hidden cursor-crosshair"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={selectedImage.url}
          alt={selectedImage.alt}
          className="w-full h-full object-contain p-4"
        />

        {/* Zoom overlay */}
        {isHovering && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url(${selectedImage.url})`,
              backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
              backgroundSize: '200%',
              backgroundRepeat: 'no-repeat',
            }}
          />
        )}

        {/* Badge de descuento */}
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1 bg-[#22c55e] text-white text-sm font-semibold rounded-full">
            Ahorras S/400
          </span>
        </div>

        {/* Indicador de zoom */}
        {!isHovering && (
          <div className="absolute bottom-4 right-4 bg-white/90 px-3 py-1 rounded-lg shadow-sm">
            <span className="text-xs text-neutral-500">Pasa el mouse para zoom</span>
          </div>
        )}
      </div>

      {/* Thumbnails horizontales */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => setSelectedIndex(index)}
            className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
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
    </div>
  );
};

export default ProductGalleryV2;
