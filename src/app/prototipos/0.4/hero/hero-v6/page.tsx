'use client';

/**
 * Hero V6 - All components set to version 6
 */

import React from 'react';
import { HeroSection } from '../components/hero';
import { HeroConfig } from '../types/hero';

const configV6: HeroConfig = {
  heroBannerVersion: 6,
  socialProofVersion: 6,
  navbarVersion: 6,
  ctaVersion: 6,
  footerVersion: 6,
  howItWorksVersion: 6,
  faqVersion: 6,
};

export default function HeroV6Page() {
  return <HeroSection config={configV6} />;
}
