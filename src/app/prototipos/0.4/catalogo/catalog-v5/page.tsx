'use client';

/**
 * Catalog V5 - Split 50/50 con Preview
 *
 * Version standalone con panel de preview
 * Mitad filtros + preview, mitad productos
 */

import React from 'react';
import { CatalogSection } from '../components/catalog';
import { CatalogConfig } from '../types/catalog';

const configV5: CatalogConfig = {
  layoutVersion: 5,
  brandFilterVersion: 5,
  cardVersion: 2,
};

export default function CatalogV5Page() {
  return <CatalogSection config={configV5} />;
}
