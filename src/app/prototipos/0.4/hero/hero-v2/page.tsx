'use client';

/**
 * Hero V2 - All components set to version 2
 */

import React from 'react';
import { HeroSection } from '../components/hero';
import { HeroConfig } from '../types/hero';

const configV2: HeroConfig = {
  heroBannerVersion: 2,
  socialProofVersion: 2,
  navbarVersion: 2,
  ctaVersion: 2,
  footerVersion: 2,
  howItWorksVersion: 2,
  faqVersion: 2,
};

export default function HeroV2Page() {
  return <HeroSection config={configV2} />;
}
