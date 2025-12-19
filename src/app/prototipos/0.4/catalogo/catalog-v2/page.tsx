'use client';

/**
 * Catalog V2 - Horizontal Collapsible
 *
 * Version standalone con filtros horizontales colapsables
 * Barra de filtros superior que se puede ocultar
 */

import React from 'react';
import { CatalogSection } from '../components/catalog';
import { CatalogConfig } from '../types/catalog';

const configV2: CatalogConfig = {
  layoutVersion: 2,
  brandFilterVersion: 2,
  cardVersion: 1,
};

export default function CatalogV2Page() {
  return <CatalogSection config={configV2} />;
}
