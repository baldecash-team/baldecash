'use client';

/**
 * ProductTags v0.6 - Simplificado (fijo en V1 Badges Apilados)
 * Basado en configuración de presentación v0.4
 */

import React from 'react';
import { ProductTagType, productTagsConfig } from '../../types/catalog';
import type { LabelFilter } from '../../../../types/filters';
import { CardBadge } from './CardBadge';

interface ProductTagsProps {
  tags: ProductTagType[];
  maxTags?: number;
  /**
   * Catálogo de etiquetas del facet — fuente del texto y el color (BAL-3204).
   * `productTagsConfig` queda como respaldo para cuando el facet todavía no
   * cargó: sin él la tarjeta se quedaría sin etiquetas al primer render.
   */
  labels?: LabelFilter[] | null;
}

export const ProductTags: React.FC<ProductTagsProps> = ({
  tags,
  maxTags = 4,
  labels = null,
}) => {
  const displayTags = tags.slice(0, maxTags);

  if (displayTags.length === 0) return null;

  // V1: Badges Apilados (Stacked) - Configuración fija v0.6.
  // Se usa CardBadge en vez del Chip de NextUI: el Chip traía su propia altura
  // y dejaba los tags desalineados con los badges de condición y grado, que
  // viven en el mismo contenedor apilado (BAL-3202).
  return (
    <div className="flex flex-col gap-1">
      {displayTags.map((tagType) => {
        const tag = productTagsConfig[tagType];
        // El facet (BD) manda; el config del front solo cubre el hueco.
        const fromDb = labels?.find((l) => l.code === tagType);
        const label = fromDb?.name || tag?.label;
        const bgColor = fromDb?.color || tag?.bgColor;
        if (!label || !bgColor) return null;
        return (
          <CardBadge key={tagType} backgroundColor={bgColor} color={tag?.color}>
            {label}
          </CardBadge>
        );
      })}
    </div>
  );
};

export default ProductTags;
