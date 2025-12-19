'use client';

/**
 * Catalog V7 - Asimetrico con Filtros Flotantes
 *
 * Version standalone con panel flotante minimizable
 * Diseno editorial asimetrico
 */

import React from 'react';
import { CatalogSection } from '../components/catalog';
import { CatalogConfig } from '../types/catalog';

const configV7: CatalogConfig = {
  layoutVersion: 7,
  brandFilterVersion: 7,
  cardVersion: 3,
};

export default function CatalogV7Page() {
  return <CatalogSection config={configV7} />;
}
