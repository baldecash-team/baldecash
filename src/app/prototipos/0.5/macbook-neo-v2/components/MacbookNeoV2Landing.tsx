'use client';

import { useLenis } from '../hooks/useLenis';
import { StickyNav } from './StickyNav';
import { ScrollProgress } from './ScrollProgress';
import { Hero } from './hero/Hero';
import { HighlightsGallery } from './highlights/HighlightsGallery';
import { DesignSection } from './design/DesignSection';
import { ColorPicker } from './color-selector/ColorPicker';
import { ProductGrid } from './product-details/ProductGrid';
import { PerformanceSlider } from './performance/PerformanceSlider';
import { LifestyleSection } from './lifestyle/LifestyleSection';
import { DisplaySection } from './display/DisplaySection';
import { MacOSSection } from './macos/MacOSSection';
import { ContinuitySection } from './continuity/ContinuitySection';
import { PrivacySection } from './privacy/PrivacySection';
import { FinancingCTA } from './financing/FinancingCTA';

export function MacbookNeoV2Landing() {
  useLenis();

  return (
    <main
      className="bg-[#fbfbfd] min-h-screen"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}
    >
      <ScrollProgress />
      <StickyNav />
      <Hero />
      <HighlightsGallery />
      <DesignSection />
      <ColorPicker />
      <ProductGrid />
      <PerformanceSlider />
      <LifestyleSection />
      <DisplaySection />
      <MacOSSection />
      <ContinuitySection />
      <PrivacySection />
      <FinancingCTA />
    </main>
  );
}
