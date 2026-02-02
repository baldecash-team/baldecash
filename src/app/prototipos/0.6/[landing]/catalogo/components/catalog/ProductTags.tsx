'use client';

/**
 * ProductTags v0.6 - Simplificado (fijo en V1 Chips Apilados)
 * Basado en configuración de presentación v0.4
 */

import React from 'react';
import { Chip } from '@nextui-org/react';
import { ProductTagType, productTagsConfig } from '../../types/catalog';

interface ProductTagsProps {
  tags: ProductTagType[];
  maxTags?: number;
}

export const ProductTags: React.FC<ProductTagsProps> = ({
  tags,
  maxTags = 4,
}) => {
  const displayTags = tags.slice(0, maxTags);

  if (displayTags.length === 0) return null;

  // V1: Chips Apilados (Stacked) - Configuración fija v0.6
  return (
    <div className="flex flex-col gap-1">
      {displayTags.map((tagType) => {
        const tag = productTagsConfig[tagType];
        return (
          <Chip
            key={tagType}
            size="sm"
            radius="sm"
            classNames={{
              base: 'px-2 py-0.5 h-auto shadow-sm',
              content: 'text-[10px] font-medium',
            }}
            style={{
              backgroundColor: tag.bgColor,
              color: tag.color,
            }}
          >
            {tag.label}
          </Chip>
        );
      })}
    </div>
  );
};

export default ProductTags;
