'use client';

/**
 * Hero V3 - All components set to version 3
 */

import React from 'react';
import { HeroSection } from '../components/hero';
import { HeroConfig } from '../types/hero';

const configV3: HeroConfig = {
  heroBannerVersion: 3,
  socialProofVersion: 3,
  navbarVersion: 3,
  ctaVersion: 3,
  footerVersion: 3,
};

export default function HeroV3Page() {
  return <HeroSection config={configV3} />;
}
