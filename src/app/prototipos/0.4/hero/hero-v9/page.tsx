'use client';

/**
 * Hero V9 - All components set to version 9
 */

import React from 'react';
import { HeroSection } from '../components/hero';
import { HeroConfig } from '../types/hero';

const configV9: HeroConfig = {
  heroBannerVersion: 9,
  socialProofVersion: 9,
  navbarVersion: 9,
  ctaVersion: 9,
  footerVersion: 9,
};

export default function HeroV9Page() {
  return <HeroSection config={configV9} />;
}
