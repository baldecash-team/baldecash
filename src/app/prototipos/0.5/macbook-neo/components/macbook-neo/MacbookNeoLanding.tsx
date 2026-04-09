'use client';

/**
 * MacbookNeoLanding - Orchestrator
 *
 * Assembles all sections of the MacBook Neo landing page in order.
 * Receives configuration from the preview page and passes relevant
 * props to each section.
 */

import { MacbookNeoColor, ScrollSpeedVersion } from '../../types/macbook-neo';
import { HeroSection } from './hero';
import { ScrollStorySection } from './scroll-story';
import { HighlightsGallery } from './highlights';
import { ColorSelectorSection } from './color-selector';
import { SpecsSection } from './specs';
import { FinancingSection } from './financing';
import { HowItWorksSection } from './how-it-works';
import { CtaFinalSection } from './cta-final';

export interface MacbookNeoLandingProps {
  selectedColor: MacbookNeoColor;
  scrollSpeed: ScrollSpeedVersion;
  isCleanMode?: boolean;
}

export function MacbookNeoLanding({
  selectedColor,
  scrollSpeed,
}: MacbookNeoLandingProps) {
  return (
    <main className="bg-white min-h-screen">
      <HeroSection />
      <ScrollStorySection scrollSpeed={scrollSpeed} />
      <HighlightsGallery />
      <ColorSelectorSection defaultColor={selectedColor} />
      <SpecsSection />
      <FinancingSection />
      <HowItWorksSection />
      <CtaFinalSection />
    </main>
  );
}
