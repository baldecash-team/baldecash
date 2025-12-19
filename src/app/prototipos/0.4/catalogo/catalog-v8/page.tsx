'use client';

/**
 * Catalog V8 - Data-Driven Stats
 *
 * Version standalone con header de estadisticas
 * Filtros con contadores de productos
 */

import React from 'react';
import { CatalogSection } from '../components/catalog';
import { CatalogConfig } from '../types/catalog';

const configV8: CatalogConfig = {
  layoutVersion: 8,
  brandFilterVersion: 8,
  cardVersion: 1,
};

export default function CatalogV8Page() {
  return <CatalogSection config={configV8} />;
}
