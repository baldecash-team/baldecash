'use client';

/**
 * Hero V10 - All components set to version 10
 */

import React from 'react';
import { HeroSection } from '../components/hero';
import { HeroConfig } from '../types/hero';

const configV10: HeroConfig = {
  heroBannerVersion: 10,
  socialProofVersion: 10,
  navbarVersion: 10,
  ctaVersion: 10,
  footerVersion: 10,
};

export default function HeroV10Page() {
  return <HeroSection config={configV10} />;
}
