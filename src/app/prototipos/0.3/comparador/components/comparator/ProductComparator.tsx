'use client';

/**
 * ProductComparator - Componente principal del comparador
 *
 * Orquesta layout, tabla y highlights segun configuracion
 * Maneja estado de productos a comparar
 */

import React, { useState, useMemo } from 'react';
import { ComparatorLayoutV1 } from './layout/ComparatorLayoutV1';
import { ComparatorLayoutV2 } from './layout/ComparatorLayoutV2';
import { ComparatorLayoutV3 } from './layout/ComparatorLayoutV3';
import { ComparisonTableV1 } from './table/ComparisonTableV1';
import { ComparisonTableV2 } from './table/ComparisonTableV2';
import { ComparisonTableV3 } from './table/ComparisonTableV3';
import {
  ComparatorConfig,
  ComparisonProduct,
  defaultComparatorConfig,
} from '../../types/comparator';

interface ProductComparatorProps {
  config: ComparatorConfig;
  products: ComparisonProduct[];
  onRemoveProduct: (productId: string) => void;
  onClearAll: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  onOpenSettings?: () => void;
  onBack?: () => void;
}

export const ProductComparator: React.FC<ProductComparatorProps> = ({
  config,
  products,
  onRemoveProduct,
  onClearAll,
  isOpen = true,
  onClose,
  onOpenSettings,
  onBack,
}) => {
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);
  const [highlightWinners, setHighlightWinners] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Select table component based on config
  const TableComponent = useMemo(() => {
    switch (config.tableVersion) {
      case 1:
        return ComparisonTableV1;
      case 2:
        return ComparisonTableV2;
      case 3:
        return ComparisonTableV3;
      default:
        return ComparisonTableV1;
    }
  }, [config.tableVersion]);

  // Render table content
  const tableContent = (
    <TableComponent
      products={products}
      config={config}
      showOnlyDifferences={showOnlyDifferences}
      highlightWinners={highlightWinners}
      onRemoveProduct={onRemoveProduct}
    />
  );

  // Common layout props
  const layoutProps = {
    config,
    products,
    onRemoveProduct,
    onClearAll,
    showOnlyDifferences,
    onToggleDifferences: setShowOnlyDifferences,
    highlightWinners,
    onToggleHighlight: setHighlightWinners,
  };

  // Render layout based on version
  switch (config.layoutVersion) {
    case 1:
      return (
        <ComparatorLayoutV1
          {...layoutProps}
          isOpen={isOpen}
          onClose={onClose}
        >
          {tableContent}
        </ComparatorLayoutV1>
      );

    case 2:
      return (
        <ComparatorLayoutV2
          {...layoutProps}
          onOpenSettings={onOpenSettings}
          onBack={onBack}
        >
          {tableContent}
        </ComparatorLayoutV2>
      );

    case 3:
      return (
        <ComparatorLayoutV3
          {...layoutProps}
          isOpen={isOpen}
          onClose={onClose}
          isExpanded={isExpanded}
          onToggleExpand={() => setIsExpanded(!isExpanded)}
        >
          {tableContent}
        </ComparatorLayoutV3>
      );

    default:
      return (
        <ComparatorLayoutV1
          {...layoutProps}
          isOpen={isOpen}
          onClose={onClose}
        >
          {tableContent}
        </ComparatorLayoutV1>
      );
  }
};

export default ProductComparator;
