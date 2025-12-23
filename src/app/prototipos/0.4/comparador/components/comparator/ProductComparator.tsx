'use client';

import React from 'react';
import { ComparatorLayoutProps } from '../../types/comparator';
import { ComparatorLayoutV1 } from './layout/ComparatorLayoutV1';
import { ComparatorLayoutV2 } from './layout/ComparatorLayoutV2';
import { ComparatorLayoutV3 } from './layout/ComparatorLayoutV3';
import { ComparatorLayoutV4 } from './layout/ComparatorLayoutV4';
import { ComparatorLayoutV5 } from './layout/ComparatorLayoutV5';
import { ComparatorLayoutV6 } from './layout/ComparatorLayoutV6';

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

  // Don't render if not open (for modal-based layouts)
  if (!isOpen && [1, 3, 4].includes(config.layoutVersion)) {
    return null;
  }

  switch (config.layoutVersion) {
    case 1:
      return <ComparatorLayoutV1 {...props} isOpen={isOpen} onClose={onClose} />;
    case 2:
      // V2 is a dedicated page layout, uses onBack instead of isOpen/onClose
      return isOpen ? <ComparatorLayoutV2 {...props} onBack={onClose} /> : null;
    case 3:
      return <ComparatorLayoutV3 {...props} isOpen={isOpen} onClose={onClose} />;
    case 4:
      return <ComparatorLayoutV4 {...props} isOpen={isOpen} onClose={onClose} />;
    case 5:
      // V5 is a split view, always visible when products selected
      return isOpen ? <ComparatorLayoutV5 {...props} /> : null;
    case 6:
      // V6 is fullscreen immersive
      return isOpen ? <ComparatorLayoutV6 {...props} onClose={onClose} /> : null;
    default:
      return <ComparatorLayoutV1 {...props} isOpen={isOpen} onClose={onClose} />;
  }
};

export default ProductComparator;
