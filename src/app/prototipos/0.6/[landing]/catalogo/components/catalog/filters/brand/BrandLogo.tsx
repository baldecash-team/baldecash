'use client';

import React from 'react';

interface BrandLogoProps {
  /** URL of the brand logo */
  src: string;
  /** Alt text for accessibility */
  alt: string;
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
 * BrandLogo - Renders a brand logo using an img tag with CSS filters
 *
 * Visual states:
 * - Default: Grayscale + reduced opacity
 * - Hover: Full color
 * - Selected: Full color
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  src,
  alt,
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

  if (hasError) {
    return null;
  }

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      aria-label={alt}
    >
      <img
        src={src}
        alt={alt}
        className="w-[90%] h-[90%] object-contain transition-all duration-200"
        style={{
          filter: isSelected || (showColorOnHover && isHovering)
            ? 'none'
            : 'grayscale(100%) opacity(0.5)',
        }}
        onError={handleError}
      />
    </div>
  );
};

export default BrandLogo;
