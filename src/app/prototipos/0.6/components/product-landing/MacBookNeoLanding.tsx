'use client';

import { useState } from 'react';
import { useLenis } from './shared/hooks/useLenis';
import { useDeviceCapabilities } from './shared/hooks/useDeviceCapabilities';
import StickyNav from './StickyNav';
import HeroCanvasScrub from './HeroCanvasScrub';
import MediaCardGallery from './MediaCardGallery';
import TextOverMediaDesign from './TextOverMediaDesign';
import FinancingPlans from './FinancingPlans';
import PerformanceSection from './PerformanceSection';
import DisplayCameraAudio from './DisplayCameraAudio';
import ProductViewer from './ProductViewer';
import SocialProof from './SocialProof';
import { Footer } from '../hero/Footer';
import type { FooterData } from '../../types/hero';

interface MacBookNeoLandingProps {
  footerData?: FooterData | null;
  landing?: string;
}

export default function MacBookNeoLanding({ footerData, landing = 'baldecash-mac-book-neo' }: MacBookNeoLandingProps) {
  useLenis();
  const { tier } = useDeviceCapabilities();
  const [videoEnded, setVideoEnded] = useState(tier === 'base');

  return (
    <div
      className="bg-black text-[#f5f5f7]"
      style={{ fontFamily: "'Asap', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      <StickyNav videoEnded={videoEnded} />

      {/* S1: Hero */}
      <HeroCanvasScrub tier={tier} onVideoEnd={() => setVideoEnded(true)} onVideoReplay={() => setVideoEnded(false)} />

      {/* S2: Highlights */}
      <MediaCardGallery />

      {/* S4: Design */}
      <TextOverMediaDesign />

      {/* S5: Financing Plans */}
      <FinancingPlans tier={tier} />

      {/* S6: Performance */}
      <PerformanceSection />

      {/* S7: Display, Camera, Audio */}
      <DisplayCameraAudio />

      {/* S8: Product Viewer */}
      <ProductViewer />

      {/* S9: Social Proof */}
      <SocialProof />

      {/* S10: Footer from DB */}
      <Footer data={footerData} landing={landing} />
    </div>
  );
}
