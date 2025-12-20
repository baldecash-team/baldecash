'use client';

/**
 * Hero V5 - All components set to version 5
 */

import React from 'react';
import { HeroSection } from '../components/hero';
import { HeroConfig } from '../types/hero';

const configV5: HeroConfig = {
  heroBannerVersion: 5,
  underlineStyle: 5,
  socialProofVersion: 5,
  navbarVersion: 5,
  ctaVersion: 5,
  footerVersion: 5,
  howItWorksVersion: 5,
  faqVersion: 5,
};

export default function HeroV5Page() {
  return <HeroSection config={configV5} />;
}
