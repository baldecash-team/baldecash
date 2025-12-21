'use client';

import React from 'react';
import { Chip, Tooltip } from '@nextui-org/react';
import { ProductTagType, TagDisplayVersion, productTagsConfig } from '../../types/catalog';

interface ProductTagsProps {
  tags: ProductTagType[];
  version?: TagDisplayVersion;
  maxTags?: number;
}

/**
 * ProductTags - Renders product tags in 3 different versions
 * V1: Chips Apilados - Stacked vertically (classic e-commerce)
 * V2: Fila Horizontal - Inline row, compact size
 * V3: Dots Minimal - Only colored dots with tooltip
 */
export const ProductTags: React.FC<ProductTagsProps> = ({
  tags,
  version = 1,
  maxTags = 4,
}) => {
  const displayTags = tags.slice(0, maxTags);

  if (displayTags.length === 0) return null;

  // V1: Chips Apilados (Stacked)
  if (version === 1) {
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
  }

  // V2: Fila Horizontal (Inline Row)
  if (version === 2) {
    return (
      <div className="flex flex-wrap gap-1">
        {displayTags.map((tagType) => {
          const tag = productTagsConfig[tagType];
          return (
            <Chip
              key={tagType}
              size="sm"
              radius="full"
              classNames={{
                base: 'px-2 py-0 h-5',
                content: 'text-[9px] font-semibold',
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
  }

  // V3: Dots Minimal (Colored dots with tooltip)
  return (
    <div className="flex gap-1.5">
      {displayTags.map((tagType) => {
        const tag = productTagsConfig[tagType];
        return (
          <Tooltip
            key={tagType}
            content={
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tag.bgColor }}
                />
                <span>{tag.label}</span>
              </span>
            }
            placement="top"
            delay={0}
            closeDelay={0}
            classNames={{
              base: 'pointer-events-none',
              content: 'bg-neutral-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg',
            }}
          >
            <div
              className="w-3.5 h-3.5 rounded-full shadow-md cursor-help transition-transform hover:scale-125 ring-2 ring-white/80"
              style={{ backgroundColor: tag.bgColor }}
            />
          </Tooltip>
        );
      })}
    </div>
  );
};
