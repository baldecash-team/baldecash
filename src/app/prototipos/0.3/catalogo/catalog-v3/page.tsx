'use client';

/**
 * Catalog V3 - Mobile-First Drawer
 *
 * Version standalone con boton flotante para filtros
 * Drawer de filtros tanto en desktop como movil
 */

import React from 'react';
import { CatalogSection } from '../components/catalog';
import { CatalogConfig } from '../types/catalog';

const configV3: CatalogConfig = {
  layoutVersion: 3,
  brandFilterVersion: 3,
  cardVersion: 3,
};

export default function CatalogV3Page() {
  return <CatalogSection config={configV3} />;
}
