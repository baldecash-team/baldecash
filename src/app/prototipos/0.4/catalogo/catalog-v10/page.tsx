'use client';

/**
 * Catalog V10 - Comparador Inline
 *
 * Version standalone con checkbox de comparacion
 * Barra flotante inferior para comparar productos
 */

import React from 'react';
import { CatalogSection } from '../components/catalog';
import { CatalogConfig } from '../types/catalog';

const configV10: CatalogConfig = {
  layoutVersion: 10,
  brandFilterVersion: 10,
  cardVersion: 3,
};

export default function CatalogV10Page() {
  return <CatalogSection config={configV10} />;
}
