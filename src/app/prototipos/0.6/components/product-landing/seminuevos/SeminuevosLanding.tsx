'use client';

import { Footer } from '../../hero/Footer';
import type { FooterData, PromoBannerData } from '../../../types/hero';
import type { FaqData } from '../../../types/hero';

export interface SeminuevosLandingProps {
  footerData?: FooterData | null;
  landing?: string;
  previewBannerOffset?: number;
  promoBannerData?: PromoBannerData | null;
  faqData?: FaqData | null;
}

export default function SeminuevosLanding({
  footerData,
  landing = 'seminuevos',
}: SeminuevosLandingProps) {
  return (
    <div className="seminuevos-landing min-h-screen">
      <main>
        <p data-testid="seminuevos-placeholder">Landing seminuevos</p>
      </main>
      <div id="footer">
        <Footer data={footerData} landing={landing} />
      </div>
    </div>
  );
}
