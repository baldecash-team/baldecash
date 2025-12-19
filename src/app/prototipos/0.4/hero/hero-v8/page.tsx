'use client';

/**
 * Hero V8 - All components set to version 8
 */

import React from 'react';
import { HeroSection } from '../components/hero';
import { HeroConfig } from '../types/hero';

const configV8: HeroConfig = {
  heroBannerVersion: 8,
  socialProofVersion: 8,
  navbarVersion: 8,
  ctaVersion: 8,
  footerVersion: 8,
};

export default function HeroV8Page() {
  return <HeroSection config={configV8} />;
}
