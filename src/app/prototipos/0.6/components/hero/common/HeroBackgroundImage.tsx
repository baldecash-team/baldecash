'use client';

import React from 'react';
import Image from 'next/image';

interface HeroBackgroundImageProps {
  src: string;
  /** Imagen propia de celular. Si viene, el navegador la elige hasta 639px. */
  mobileSrc?: string;
  alt: string;
  posX: number;
  posY: number;
  zoom: number;
}

/**
 * Foto de fondo de la portada. La usan HeroBanner y ConvenioHero para que las
 * dos elijan igual la imagen de celular: antes ConvenioHero pintaba siempre la
 * de escritorio y en celular le aplicaba el encuadre pensado para la otra foto.
 *
 * El corte (cover + posición + zoom desde el centro) es el mismo que dibuja el
 * editor de encuadre del admin; si cambia aquí, cambia el significado de lo
 * guardado en banner_images.
 */
export const HeroBackgroundImage: React.FC<HeroBackgroundImageProps> = ({ src, mobileSrc, alt, posX, posY, zoom }) => {
  const style: React.CSSProperties = {
    objectPosition: `${posX}% ${posY}%`,
    transform: zoom !== 1 ? `scale(${zoom})` : undefined,
  };
  const ocultar = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.opacity = '0';
  };

  if (mobileSrc) {
    // Dos URLs distintas: <picture> para que el navegador elija según la pantalla
    return (
      <picture>
        <source media="(max-width: 639px)" srcSet={mobileSrc} />
        <source media="(min-width: 640px)" srcSet={src} />
        <img
          src={src}
          alt={alt}
          data-testid="hero-bg-img"
          className="absolute inset-0 w-full h-full object-cover"
          style={style}
          fetchPriority="high"
          onError={ocultar}
        />
      </picture>
    );
  }

  // Una sola URL: next/image para el LCP
  return (
    <Image src={src} alt={alt} fill priority sizes="100vw" className="object-cover" style={style} onError={ocultar} />
  );
};
