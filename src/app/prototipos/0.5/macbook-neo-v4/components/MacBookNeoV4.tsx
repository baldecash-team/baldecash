'use client';

import { useLenis } from '../../macbook-neo-v3/shared/hooks/useLenis';
import { useDeviceCapabilities } from '../../macbook-neo-v3/shared/hooks/useDeviceCapabilities';
import { ScrollProgress } from '../../macbook-neo-v3/shared/components/ScrollProgress';
import { StickyNavV4 } from './StickyNavV4';
import { HeroCanvasScrub } from './HeroCanvasScrub';
import MediaCardGallery from './MediaCardGallery';
import { TextOverMediaDesign } from './TextOverMediaDesign';
import { ProductViewer } from './ProductViewer';
import PerformanceSection from './PerformanceSection';
import { DisplayCameraAudio } from './DisplayCameraAudio';
import AppleIntelligenceSection from './AppleIntelligenceSection';
import MacOSSection from './MacOSSection';
import ContinuitySection from './ContinuitySection';
import NewToMacSection from './NewToMacSection';
import SecuritySection from './SecuritySection';
import IncentiveSection from './IncentiveSection';
import HelpMeChooseSection from './HelpMeChooseSection';
import ContrastSection from './ContrastSection';
import EnvironmentSection from './EnvironmentSection';
import ValuesSection from './ValuesSection';
import { Footer } from './Footer';

export default function MacBookNeoV4() {
  useLenis();
  const { tier } = useDeviceCapabilities();

  return (
    <div className="bg-black text-[#f5f5f7]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}>
      <StickyNavV4 />
      <ScrollProgress />

      {/* 1. Welcome (Hero) */}
      <HeroCanvasScrub tier={tier} />

      {/* 2. Highlights (MediaCardGallery) */}
      <MediaCardGallery />

      {/* 3. Design (TextOverMedia) */}
      <TextOverMediaDesign />

      {/* 4. Product Viewer (8-item interactive tour) */}
      <ProductViewer />

      {/* 5. Performance (4 chapters + video scrub) */}
      <PerformanceSection />

      {/* 6. Display, Camera, Audio */}
      <DisplayCameraAudio />

      {/* 7. Apple Intelligence (CaptionTileGallery) */}
      <AppleIntelligenceSection />

      {/* 8. macOS (TextOverMedia + CaptionTileGallery) */}
      <MacOSSection />

      {/* 9. Continuity (FadeGallery with 6 tabs) */}
      <ContinuitySection />

      {/* 10. New to Mac (CaptionTileGallery) */}
      <NewToMacSection />

      {/* 11. Security (CaptionTileGallery) */}
      <SecuritySection />

      {/* 12. Incentive ("Why Apple" cards) */}
      <IncentiveSection />

      {/* 13. Help Me Choose */}
      <HelpMeChooseSection />

      {/* 14. Contrast (Product comparison) */}
      <ContrastSection />

      {/* 15. Environment */}
      <EnvironmentSection />

      {/* 16. Values */}
      <ValuesSection />

      {/* 17. Index (Footer router) */}
      <Footer />
    </div>
  );
}
