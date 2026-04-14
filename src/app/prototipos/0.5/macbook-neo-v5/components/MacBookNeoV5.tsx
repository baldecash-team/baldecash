'use client';

import { useState } from 'react';
import { useLenis } from '../../macbook-neo-v3/shared/hooks/useLenis';
import { useDeviceCapabilities } from '../../macbook-neo-v3/shared/hooks/useDeviceCapabilities';
import StickyNavV5 from './StickyNavV5';
import HeroCanvasScrubV5 from './HeroCanvasScrubV5';
import MediaCardGalleryV5 from './MediaCardGalleryV5';
import TextOverMediaDesignV5 from './TextOverMediaDesignV5';
import FinancingPlansV5 from './FinancingPlansV5';
import PerformanceSectionV5 from './PerformanceSectionV5';
import DisplayCameraAudioV5 from './DisplayCameraAudioV5';
import ProductViewerV5 from './ProductViewerV5';
import SocialProofV5 from './SocialProofV5';
import FooterV5 from './FooterV5';

export default function MacBookNeoV5() {
  useLenis();
  const { tier } = useDeviceCapabilities();
  const [videoEnded, setVideoEnded] = useState(tier === 'base');

  return (
    <div
      className="bg-black text-[#f5f5f7]"
      style={{ fontFamily: "'Asap', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      <StickyNavV5 videoEnded={videoEnded} />

      {/* S1: Hero */}
      <HeroCanvasScrubV5 tier={tier} onVideoEnd={() => setVideoEnded(true)} onVideoReplay={() => setVideoEnded(false)} />

      {/* S2: Highlights */}
      <MediaCardGalleryV5 />

      {/* S4: Design */}
      <TextOverMediaDesignV5 />

      {/* S5: Financing Plans */}
      <FinancingPlansV5 tier={tier} />

      {/* S6: Performance */}
      <PerformanceSectionV5 />

      {/* S7: Display, Camera, Audio */}
      <DisplayCameraAudioV5 />

      {/* S8: Product Viewer */}
      <ProductViewerV5 />

      {/* S9: Social Proof */}
      <SocialProofV5 />

      {/* S10: Footer */}
      <FooterV5 />
    </div>
  );
}
