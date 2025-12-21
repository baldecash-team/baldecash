'use client';

import React from 'react';
import { ComparatorLayoutProps, ComparatorConfig } from '../../types/comparator';
import { ComparatorLayoutV1 } from './layout/ComparatorLayoutV1';

/**
 * ProductComparator - Main wrapper component
 * Selects the appropriate layout version based on config
 */
export const ProductComparator: React.FC<
  ComparatorLayoutProps & {
    isOpen?: boolean;
    onClose?: () => void;
  }
> = (props) => {
  const { config, isOpen = true, onClose = () => {} } = props;

  // For now, all versions use V1 layout until others are created
  // The layout version determines how the comparison is displayed
  switch (config.layoutVersion) {
    case 1:
      return <ComparatorLayoutV1 {...props} isOpen={isOpen} onClose={onClose} />;
    case 2:
      // Page dedicated - would be a different component
      return <ComparatorLayoutV1 {...props} isOpen={isOpen} onClose={onClose} />;
    case 3:
      // Panel sticky
      return <ComparatorLayoutV1 {...props} isOpen={isOpen} onClose={onClose} />;
    case 4:
      // Modal fluido fintech
      return <ComparatorLayoutV1 {...props} isOpen={isOpen} onClose={onClose} />;
    case 5:
      // Split 50/50
      return <ComparatorLayoutV1 {...props} isOpen={isOpen} onClose={onClose} />;
    case 6:
      // Fullscreen inmersivo
      return <ComparatorLayoutV1 {...props} isOpen={isOpen} onClose={onClose} />;
    default:
      return <ComparatorLayoutV1 {...props} isOpen={isOpen} onClose={onClose} />;
  }
};

export default ProductComparator;
