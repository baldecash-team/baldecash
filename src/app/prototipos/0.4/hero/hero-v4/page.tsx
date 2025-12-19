'use client';

/**
 * Hero V4 - All components set to version 4
 */

import React from 'react';
import { HeroSection } from '../components/hero';
import { HeroConfig } from '../types/hero';

const configV4: HeroConfig = {
  heroBannerVersion: 4,
  socialProofVersion: 4,
  navbarVersion: 4,
  ctaVersion: 4,
  footerVersion: 4,
};

export default function HeroV4Page() {
  return <HeroSection config={configV4} />;
}
