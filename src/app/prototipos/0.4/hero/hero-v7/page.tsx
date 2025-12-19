'use client';

/**
 * Hero V7 - All components set to version 7
 */

import React from 'react';
import { HeroSection } from '../components/hero';
import { HeroConfig } from '../types/hero';

const configV7: HeroConfig = {
  heroBannerVersion: 7,
  socialProofVersion: 7,
  navbarVersion: 7,
  ctaVersion: 7,
  footerVersion: 7,
};

export default function HeroV7Page() {
  return <HeroSection config={configV7} />;
}
