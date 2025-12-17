'use client';

/**
 * Hero Minimal - Combinacion de menor friccion
 *
 * - Navbar sticky
 * - Ilustracion moderna
 * - Contador animado
 * - Pre-calificacion card
 * - Sin perfil (V4 = none)
 * - Sin banner institucional (V4 = none)
 */

import React from 'react';
import { HeroSection } from '../components/hero';
import { HeroConfig } from '../types/hero';

const configMinimal: HeroConfig = {
  navbarVersion: 1,
  brandIdentityVersion: 3,
  socialProofVersion: 3,
  ctaVersion: 3,
  profileIdentificationVersion: 4,
  institutionalBannerVersion: 4,
};

export default function HeroMinimalPage() {
  return <HeroSection config={configMinimal} />;
}
