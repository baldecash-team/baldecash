'use client';

/**
 * Hero V2 - Combinacion e-commerce
 *
 * - Navbar que se oculta al scroll
 * - Producto showcase con specs
 * - Grid estatico de logos
 * - CTA con precio destacado
 * - Cards inline de perfiles
 * - Chip/badge institucional
 */

import React from 'react';
import { HeroSection } from '../components/hero';
import { HeroConfig } from '../types/hero';

const configV2: HeroConfig = {
  navbarVersion: 2,
  brandIdentityVersion: 2,
  socialProofVersion: 2,
  ctaVersion: 2,
  profileIdentificationVersion: 2,
  institutionalBannerVersion: 2,
};

export default function HeroV2Page() {
  return <HeroSection config={configV2} />;
}
