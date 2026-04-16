'use client';

import { lazy, Suspense, useState, useEffect, useRef, type ReactNode } from 'react';
import { useLenis } from './shared/hooks/useLenis';
import { useDeviceCapabilities } from './shared/hooks/useDeviceCapabilities';
import StickyNav from './StickyNav';
import HeroCanvasScrub from './HeroCanvasScrub';
import MediaCardGallery from './MediaCardGallery';
import { Footer } from '../hero/Footer';
import type { FooterData, HeroContent } from '../../types/hero';

// Lazy load below-fold sections
const TextOverMediaDesign = lazy(() => import('./TextOverMediaDesign'));
const FinancingPlans = lazy(() => import('./FinancingPlans'));
const PerformanceSection = lazy(() => import('./PerformanceSection'));
const DisplayCameraAudio = lazy(() => import('./DisplayCameraAudio'));
const ProductViewer = lazy(() => import('./ProductViewer'));
// const SocialProof = lazy(() => import('./SocialProof'));

// Load section when it's near the viewport
function LazySection({ children, fallbackHeight = 400 }: { children: ReactNode; fallbackHeight?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { rootMargin: '200px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {visible ? (
        <Suspense fallback={<div style={{ height: fallbackHeight }} />}>
          {children}
        </Suspense>
      ) : (
        <div style={{ height: fallbackHeight }} />
      )}
    </div>
  );
}

interface MacBookNeoLandingProps {
  footerData?: FooterData | null;
  heroContent?: HeroContent | null;
  landing?: string;
}

export default function MacBookNeoLanding({ footerData, heroContent, landing = 'baldecash-macbook-neo' }: MacBookNeoLandingProps) {
  useLenis();
  const { tier } = useDeviceCapabilities();
  const [videoEnded, setVideoEnded] = useState(tier === 'base');

  // Always scroll to top on mount (page refresh)
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div
      className="bg-black text-[#f5f5f7]"
      style={{ fontFamily: "'Asap', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      {/* Preconnect to S3 CDN */}
      <link rel="preconnect" href="https://baldecash.s3.amazonaws.com" />
      <link rel="dns-prefetch" href="https://baldecash.s3.amazonaws.com" />

      <StickyNav videoEnded={videoEnded} landing={landing} />

      {/* S1: Hero — loads immediately */}
      <HeroCanvasScrub tier={tier} onVideoEnd={() => setVideoEnded(true)} onVideoReplay={() => setVideoEnded(false)} />

      {/* S2: Highlights — loads immediately (near hero) */}
      <MediaCardGallery />

      {/* S4: Design */}
      <LazySection fallbackHeight={600}>
        <TextOverMediaDesign />
      </LazySection>

      {/* S5: Financing Plans */}
      <LazySection fallbackHeight={900}>
        <FinancingPlans tier={tier} />
      </LazySection>

      {/* S6: Performance */}
      <LazySection fallbackHeight={900}>
        <PerformanceSection />
      </LazySection>

      {/* S7: Display, Camera, Audio */}
      <LazySection fallbackHeight={800}>
        <DisplayCameraAudio />
      </LazySection>

      {/* S8: Product Viewer */}
      <div id="product-viewer">
        <LazySection fallbackHeight={900}>
          <ProductViewer />
        </LazySection>
      </div>

      {/* S9: Social Proof — oculto temporalmente */}
      {/* <LazySection fallbackHeight={500}>
        <SocialProof />
      </LazySection> */}

      {/* S10: Footer */}
      <Footer data={footerData} landing={landing} />
    </div>
  );
}
