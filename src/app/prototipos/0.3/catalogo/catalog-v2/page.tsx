'use client';

/**
 * Catalog V2 - Filtros Horizontales
 *
 * Version standalone con filtros colapsables arriba
 * Grid de 4 columnas en desktop
 */

import React from 'react';
import { CatalogSection } from '../components/catalog';
import { CatalogConfig } from '../types/catalog';

const configV2: CatalogConfig = {
  layoutVersion: 2,
  brandFilterVersion: 2,
  cardVersion: 2,
};

export default function CatalogV2Page() {
  return <CatalogSection config={configV2} />;
}
