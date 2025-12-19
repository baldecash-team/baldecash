'use client';

/**
 * Catalog V1 - Sidebar Clasico
 *
 * Version standalone con layout de sidebar fijo
 * Sidebar 280px izquierdo en desktop, drawer en movil
 */

import React from 'react';
import { CatalogSection } from '../components/catalog';
import { CatalogConfig } from '../types/catalog';

const configV1: CatalogConfig = {
  layoutVersion: 1,
  brandFilterVersion: 1,
  cardVersion: 1,
};

export default function CatalogV1Page() {
  return <CatalogSection config={configV1} />;
}
