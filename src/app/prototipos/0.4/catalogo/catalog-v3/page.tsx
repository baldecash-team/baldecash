'use client';

/**
 * Catalog V3 - Mobile-First Drawer
 *
 * Version standalone con drawer de filtros
 * Boton flotante centrado para abrir filtros
 */

import React from 'react';
import { CatalogSection } from '../components/catalog';
import { CatalogConfig } from '../types/catalog';

const configV3: CatalogConfig = {
  layoutVersion: 3,
  brandFilterVersion: 3,
  cardVersion: 2,
};

export default function CatalogV3Page() {
  return <CatalogSection config={configV3} />;
}
