'use client';

import { useState, type CSSProperties } from 'react';

const VIDEO_EXT = /\.(mp4|webm)(\?.*)?$/i;

export interface MediaSlotProps {
  /** URL en S3. Si falta o falla, se muestra el placeholder. */
  src?: string | null;
  alt: string;
  className?: string;
  /** Ej. '16/10'. Por defecto lo define el contenedor. */
  aspectRatio?: string;
  /** Estilos extra para el medio. Se combinan con aspectRatio. */
  style?: CSSProperties;
}

/**
 * Slot de media para los assets que entrega Haru. Mientras el archivo no exista
 * en S3, muestra el placeholder con el gradiente del prototipo. Cuando el asset
 * se sube, la landing lo toma sin tocar código.
 */
export function MediaSlot({
  src, alt, className = '', aspectRatio, style: styleExtra,
}: MediaSlotProps) {
  const [failed, setFailed] = useState(false);
  const style =
    aspectRatio || styleExtra ? { ...styleExtra, ...(aspectRatio ? { aspectRatio } : {}) } : undefined;

  if (!src || failed) {
    return (
      <div
        data-testid="media-slot-placeholder"
        role="img"
        aria-label={alt}
        className={`rounded-[14px] bg-[linear-gradient(160deg,#f7f7fb,#ececf4)] ${className}`}
        style={style}
      />
    );
  }

  if (VIDEO_EXT.test(src)) {
    return (
      <video
        src={src}
        aria-label={alt}
        muted
        loop
        playsInline
        autoPlay
        onError={() => setFailed(true)}
        className={`rounded-[14px] object-cover w-full ${className}`}
        style={style}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- assets de S3 con nombres dinámicos
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`rounded-[14px] object-cover w-full ${className}`}
      style={style}
    />
  );
}
