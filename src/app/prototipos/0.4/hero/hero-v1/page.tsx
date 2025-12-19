'use client';

/**
 * Hero V1 - All components set to version 1
 */

import React from 'react';
import { HeroSection } from '../components/hero';
import { HeroConfig } from '../types/hero';

const configV1: HeroConfig = {
  heroBannerVersion: 1,
  socialProofVersion: 1,
  navbarVersion: 1,
  ctaVersion: 1,
  footerVersion: 1,
};

export default function HeroV1Page() {
  return <HeroSection config={configV1} />;
}
