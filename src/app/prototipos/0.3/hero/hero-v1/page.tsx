'use client';

/**
 * Hero V1 - Combinacion conservadora
 *
 * - Navbar sticky visible
 * - Imagen aspiracional estudiante
 * - Marquee de logos
 * - CTA directo "Ver laptops"
 * - Modal de perfil
 * - Banner institucional completo
 */

import React from 'react';
import { HeroSection } from '../components/hero';
import { HeroConfig } from '../types/hero';

const configV1: HeroConfig = {
  navbarVersion: 1,
  brandIdentityVersion: 1,
  socialProofVersion: 1,
  ctaVersion: 1,
  profileIdentificationVersion: 1,
  institutionalBannerVersion: 1,
};

export default function HeroV1Page() {
  return <HeroSection config={configV1} />;
}
