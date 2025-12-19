'use client';

/**
 * Catalog V9 - Storytelling Categories
 *
 * Version standalone con navegacion por narrativa
 * Categorias: Para estudiar, Para crear, etc.
 */

import React from 'react';
import { CatalogSection } from '../components/catalog';
import { CatalogConfig } from '../types/catalog';

const configV9: CatalogConfig = {
  layoutVersion: 9,
  brandFilterVersion: 9,
  cardVersion: 2,
};

export default function CatalogV9Page() {
  return <CatalogSection config={configV9} />;
}
