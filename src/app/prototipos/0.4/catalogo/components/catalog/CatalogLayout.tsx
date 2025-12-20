'use client';

import React from 'react';
import { CatalogLayoutProps } from '../../types/catalog';
import {
  CatalogLayoutV1,
  CatalogLayoutV2,
  CatalogLayoutV3,
  CatalogLayoutV4,
  CatalogLayoutV5,
  CatalogLayoutV6,
} from './layout';

/**
 * CatalogLayout - Wrapper principal
 * Selecciona la version de layout segun configuracion
 */
export const CatalogLayout: React.FC<CatalogLayoutProps> = (props) => {
  const { config } = props;

  switch (config.layoutVersion) {
    case 2:
      return <CatalogLayoutV2 {...props} />;
    case 3:
      return <CatalogLayoutV3 {...props} />;
    case 4:
      return <CatalogLayoutV4 {...props} />;
    case 5:
      return <CatalogLayoutV5 {...props} />;
    case 6:
      return <CatalogLayoutV6 {...props} />;
    default:
      return <CatalogLayoutV1 {...props} />;
  }
};
