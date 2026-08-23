'use client';

import { Baloo_2 } from 'next/font/google';
import { Footer } from '../../hero/Footer';
import { SeminuevosHero } from './SeminuevosHero';
import { SeminuevosInspector } from './SeminuevosInspector';
import { routes } from '../../../utils/routes';
import type { FooterData, PromoBannerData, FaqData } from '../../../types/hero';

const baloo = Baloo_2({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-baloo',
});

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
    <div className={`${baloo.variable} seminuevos-landing min-h-screen antialiased`}>
      <style>{`
        .seminuevos-landing{
          --azul:#4654CD; --azul2:#5a63e0; --aqua:#03DBD0; --navy:#151744;
          --lavanda:#EEF0FC; --borde:#E8E8EE; --tenue:#8A8A99;
          --sombra:0 8px 24px rgba(21,23,68,.07);
          font-family: var(--font-baloo), system-ui, sans-serif;
          color: var(--navy);
          background: #fff;
        }
        .seminuevos-landing button,
        .seminuevos-landing input { font-family: inherit; }
      `}</style>

      <main>
        <SeminuevosHero catalogUrl={routes.catalogo(landing)} />
        <SeminuevosInspector />
      </main>

      <div id="footer">
        <Footer data={footerData} landing={landing} />
      </div>
    </div>
  );
}
