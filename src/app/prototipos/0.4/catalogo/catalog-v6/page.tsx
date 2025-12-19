'use client';

/**
 * Catalog V6 - Centrado con Filtros Sticky
 *
 * Version standalone con filtros sticky superiores
 * Grid centrado con popovers de filtros
 */

import React from 'react';
import { CatalogSection } from '../components/catalog';
import { CatalogConfig } from '../types/catalog';

const configV6: CatalogConfig = {
  layoutVersion: 6,
  brandFilterVersion: 6,
  cardVersion: 3,
};

export default function CatalogV6Page() {
  return <CatalogSection config={configV6} />;
}
