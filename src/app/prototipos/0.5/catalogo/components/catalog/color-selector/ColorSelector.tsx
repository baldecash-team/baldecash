'use client';

/**
 * ColorSelector - Wrapper que selecciona la versión según config
 */

import React from 'react';
import { ColorSelectorV1 } from './ColorSelectorV1';
import { ColorSelectorV2 } from './ColorSelectorV2';
import type { ProductColor, ColorSelectorVersion } from '../../../types/catalog';

interface ColorSelectorProps {
  colors: ProductColor[];
  selectedColorId: string;
  onColorSelect: (colorId: string) => void;
  version?: ColorSelectorVersion;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  colors,
  selectedColorId,
  onColorSelect,
  version = 1,
}) => {
  if (!colors || colors.length === 0) {
    return null;
  }

  switch (version) {
    case 1:
      return (
        <ColorSelectorV1
          colors={colors}
          selectedColorId={selectedColorId}
          onColorSelect={onColorSelect}
        />
      );
    case 2:
      return (
        <ColorSelectorV2
          colors={colors}
          selectedColorId={selectedColorId}
          onColorSelect={onColorSelect}
        />
      );
    default:
      return (
        <ColorSelectorV1
          colors={colors}
          selectedColorId={selectedColorId}
          onColorSelect={onColorSelect}
        />
      );
  }
};

export default ColorSelector;
