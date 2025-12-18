'use client';

/**
 * Hero V3 - Combinacion moderna/fintech
 *
 * - Navbar transparente -> solido
 * - Ilustracion abstracta bold
 * - Contador animado
 * - Pre-calificacion card
 * - Banner sticky top
 * - Seccion dedicada beneficios
 */

import React from 'react';
import { HeroSection } from '../components/hero';
import { HeroConfig } from '../types/hero';

const configV3: HeroConfig = {
  navbarVersion: 3,
  brandIdentityVersion: 3,
  socialProofVersion: 3,
  ctaVersion: 3,
  profileIdentificationVersion: 3,
  institutionalBannerVersion: 3,
  footerVersion: 3,
};

export default function HeroV3Page() {
  return <HeroSection config={configV3} />;
}
