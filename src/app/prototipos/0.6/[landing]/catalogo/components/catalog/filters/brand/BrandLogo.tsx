'use client';

import React from 'react';

interface BrandLogoProps {
  /** URL of the SVG logo (must be black/monochrome for mask to work) */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Brand's primary color (hex, e.g., "#0096D6") */
  primaryColor?: string;
  /** Whether the item is selected/active */
  isSelected?: boolean;
  /** Whether to show color on hover */
  showColorOnHover?: boolean;
  /** Additional className for sizing */
  className?: string;
  /** Callback when image fails to load */
  onError?: () => void;
}

/**
 * BrandLogo - Renders a brand logo using CSS mask-image
 *
 * Uses the mask technique to dynamically color SVG logos:
 * - Default: Gray color (neutral-400)
 * - Hover: Brand's primary color
 * - Selected: Brand's primary color
 *
 * Requirements:
 * - Logo must be a black SVG on transparent background
 * - Logo URL must be accessible (presigned if from S3)
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  src,
  alt,
  primaryColor = '#000000',
  isSelected = false,
  showColorOnHover = true,
  className = '',
  onError,
}) => {
  const [hasError, setHasError] = React.useState(false);
  const [isHovering, setIsHovering] = React.useState(false);

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Determine the current color
  const currentColor = isSelected || (showColorOnHover && isHovering)
    ? primaryColor
    : '#9CA3AF'; // neutral-400

  if (hasError) {
    return null;
  }

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      aria-label={alt}
    >
      {/* Hidden img for load detection and accessibility */}
      <img
        src={src}
        alt=""
        className="absolute w-0 h-0 opacity-0"
        onError={handleError}
        aria-hidden="true"
      />
      {/* Colored mask */}
      <div
        className="w-full h-full transition-all duration-200"
        style={{
          backgroundColor: currentColor,
          maskImage: `url(${src})`,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskImage: `url(${src})`,
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
        }}
      />
    </div>
  );
};

export default BrandLogo;
