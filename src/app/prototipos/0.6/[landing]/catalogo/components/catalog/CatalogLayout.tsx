'use client';

import React from 'react';
import { CatalogLayoutProps } from '../../types/catalog';
import { CatalogLayoutV4 } from './layout';

/**
 * CatalogLayout - Wrapper principal
 * Usa CatalogLayoutV4 (único layout activo en v0.6)
 */
export const CatalogLayout: React.FC<CatalogLayoutProps> = (props) => {
  return <CatalogLayoutV4 {...props} />;
};
