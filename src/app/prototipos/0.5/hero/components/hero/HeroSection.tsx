'use client';

/**
 * HeroSection - Wrapper component para v0.5
 * Configuración fija basada en 0.4:
 * - Navbar: V6 (Banner Promocional)
 * - HeroBanner: V2 (Lifestyle Aspiracional)
 * - SocialProof: V1 (Marquee + Testimonios)
 * - HowItWorks: V5 (Con Requisitos)
 * - CTA: V4 (WhatsApp Directo)
 * - FAQ: V2 (Acordeón con Iconos)
 * - Footer: V2 (Newsletter + Columnas)
 */

import React from 'react';
import { mockHeroContent, mockSocialProof, mockHowItWorksData, mockFaqData } from '../../data/mockHeroData';
import { UnderlinedText } from './common/UnderlinedText';

// Components
import { Navbar } from './Navbar';
import { HeroBanner } from './HeroBanner';
import { SocialProof } from './SocialProof';
import { HowItWorks } from './HowItWorks';
import { HeroCta } from './HeroCta';
import { FaqSection } from './FaqSection';
import { Footer } from './Footer';

// Fixed underline style for v0.5 (4 = sin subrayado)
const UNDERLINE_STYLE = 4;

export const HeroSection: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 pt-16">
        {/* Hero Banner */}
        <section>
          <HeroBanner
            headline={mockHeroContent.headline}
            subheadline={mockHeroContent.subheadline}
            minQuota={mockHeroContent.minQuota}
            primaryCta={mockHeroContent.primaryCta}
            trustSignals={mockHeroContent.trustSignals}
            underlineStyle={UNDERLINE_STYLE}
          />
        </section>

        {/* Social Proof */}
        <section className="py-12 bg-neutral-50">
          <SocialProof data={mockSocialProof} underlineStyle={UNDERLINE_STYLE} />
        </section>

        {/* How It Works Section */}
        <section id="como-funciona">
          <HowItWorks data={mockHowItWorksData} underlineStyle={UNDERLINE_STYLE} />
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-neutral-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-3 font-['Baloo_2']">
              ¿Listo para tu nuevo{' '}
              <UnderlinedText style={UNDERLINE_STYLE} color="primary">
                equipo
              </UnderlinedText>
              ?
            </h2>
            <p className="text-neutral-600 mb-8">
              Solicita tu laptop en minutos. 100% digital.
            </p>

            {/* CTA Component */}
            <div className="flex justify-center mb-6">
              <HeroCta />
            </div>

            {/* Microcopy */}
            <p className="text-xs text-neutral-400">
              Al continuar, aceptas nuestros{' '}
              <a href="#terminos" className="underline hover:text-neutral-600">términos</a>
              {' '}y{' '}
              <a href="#privacidad" className="underline hover:text-neutral-600">privacidad</a>
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq">
          <FaqSection data={mockFaqData} underlineStyle={UNDERLINE_STYLE} />
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HeroSection;
