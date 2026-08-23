'use client';

import { Baloo_2 } from 'next/font/google';
import { Navbar } from '../../hero/Navbar';
import { Footer } from '../../hero/Footer';
import { SeminuevosHero } from './SeminuevosHero';
import { SeminuevosInspector } from './SeminuevosInspector';
import { SeminuevosProceso } from './SeminuevosProceso';
import { SeminuevosAbout } from './SeminuevosAbout';
import { SeminuevosFaq } from './SeminuevosFaq';
import { SeminuevosWhatsapp } from './SeminuevosWhatsapp';
import { routes } from '../../../utils/routes';
import { LANDING_IDS } from '../../../utils/landingIds';
import type { FooterData, PromoBannerData, FaqData } from '../../../types/hero';

interface NavbarItemData {
  label: string;
  href: string;
  section: string | null;
  has_megamenu?: boolean;
  badge_text?: string | null;
  badge_color?: string | null;
  megamenu_items?: MegaMenuItemData[];
  is_visible?: boolean;
}

interface MegaMenuItemData {
  label: string;
  href: string;
  icon: string;
  description: string;
  is_visible?: boolean;
}

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
  navbarItems?: NavbarItemData[];
  megamenuItems?: MegaMenuItemData[];
  logoUrl?: string;
  customerPortalUrl?: string;
  portalButtonText?: string;
  primaryColor?: string;
}

export default function SeminuevosLanding({
  footerData,
  landing = 'seminuevos',
  previewBannerOffset,
  promoBannerData,
  faqData,
  navbarItems = [],
  megamenuItems = [],
  logoUrl,
  customerPortalUrl,
  portalButtonText,
  primaryColor,
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

      <Navbar
        landing={landing}
        landingId={LANDING_IDS.SEMINUEVOS}
        navbarItems={navbarItems}
        megamenuItems={megamenuItems}
        logoUrl={logoUrl}
        customerPortalUrl={customerPortalUrl}
        portalButtonText={portalButtonText}
        primaryColor={primaryColor}
        promoBannerData={promoBannerData}
        previewBannerOffset={previewBannerOffset}
      />

      <main style={{ paddingTop: 'var(--header-total-height, 6.5rem)' }}>
        <SeminuevosHero catalogUrl={routes.catalogo(landing)} />
        <SeminuevosInspector />
        <SeminuevosProceso catalogUrl={routes.catalogo(landing)} />
        <SeminuevosAbout />
        <SeminuevosFaq data={faqData} />
      </main>

      <div id="footer">
        <Footer data={footerData} landing={landing} />
      </div>

      <SeminuevosWhatsapp />
    </div>
  );
}
