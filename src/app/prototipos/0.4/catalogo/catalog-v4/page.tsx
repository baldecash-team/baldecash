'use client';

/**
 * Catalog V4 - Split View Abstracto
 *
 * Version standalone con vista dividida y formas geometricas
 * Panel de filtros flotante con fondo abstracto
 */

import React from 'react';
import { CatalogSection } from '../components/catalog';
import { CatalogConfig } from '../types/catalog';

const configV4: CatalogConfig = {
  layoutVersion: 4,
  brandFilterVersion: 4,
  cardVersion: 2,
};

export default function CatalogV4Page() {
  return <CatalogSection config={configV4} />;
}
