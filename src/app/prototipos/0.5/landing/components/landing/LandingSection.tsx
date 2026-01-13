'use client';

/**
 * LandingSection - Wrapper component para Landing v0.5
 * Estructura igual a HeroSection pero con CaptacionBanner iterable
 *
 * Configuración:
 * - Navbar: Igual que Hero
 * - CaptacionBanner: ITERABLE
 *   - Layout (L1-L6): Estructura visual
 *   - Mensaje (V1-V3): Contenido/gancho
 * - SocialProof: V1 (Marquee + Testimonios)
 * - HowItWorks: V5 (Con Requisitos)
 * - CTA: V4 (WhatsApp Directo)
 * - FAQ: V2 (Acordeón con Iconos)
 * - Footer: V2 (Newsletter + Columnas)
 */

import React, { useState } from 'react';
import { useIsMobile } from '@/app/prototipos/_shared';
import { HelpQuiz } from '@/app/prototipos/0.5/quiz/components/quiz';
import { BannerVersion, LayoutVersion } from '../../types/landing';

// Reuse Hero components
import { Navbar } from '@/app/prototipos/0.5/hero/components/hero/Navbar';
import { SocialProof } from '@/app/prototipos/0.5/hero/components/hero/SocialProof';
import { HowItWorks } from '@/app/prototipos/0.5/hero/components/hero/HowItWorks';
import { HeroCta } from '@/app/prototipos/0.5/hero/components/hero/HeroCta';
import { FaqSection } from '@/app/prototipos/0.5/hero/components/hero/FaqSection';
import { Footer } from '@/app/prototipos/0.5/hero/components/hero/Footer';
import { UnderlinedText } from '@/app/prototipos/0.5/hero/components/hero/common/UnderlinedText';
import { mockSocialProof, mockHowItWorksData, mockFaqData } from '@/app/prototipos/0.5/hero/data/mockHeroData';

// Landing specific components
import { CaptacionBanner } from './banner';

// Fixed underline style for v0.5 (4 = sin subrayado)
const UNDERLINE_STYLE = 4;

interface LandingSectionProps {
  layoutVersion?: LayoutVersion;
  bannerVersion?: BannerVersion;
  isCleanMode?: boolean;
}

export const LandingSection: React.FC<LandingSectionProps> = ({
  layoutVersion = 1,
  bannerVersion = 1,
  isCleanMode = false,
}) => {
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const isMobile = useIsMobile();

  const quizConfig = {
    layoutVersion: (isMobile ? 4 : 5) as 4 | 5,
    questionCount: 7 as const,
    questionStyle: 1 as const,
    resultsVersion: 1 as const,
    focusVersion: 1 as const,
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar isCleanMode={isCleanMode} />

      {/* Main Content */}
      <main className="flex-1 pt-16">
        {/* Captación Banner - ITERABLE (Layout × Mensaje) */}
        <section>
          <CaptacionBanner
            layoutVersion={layoutVersion}
            bannerVersion={bannerVersion}
            isCleanMode={isCleanMode}
          />
        </section>

        {/* Social Proof */}
        <section className="pt-12 bg-neutral-50">
          <SocialProof data={mockSocialProof} underlineStyle={UNDERLINE_STYLE} />
        </section>

        {/* How It Works Section */}
        <section id="como-funciona" className="scroll-mt-24">
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
              <HeroCta onQuizOpen={() => setIsQuizOpen(true)} isCleanMode={isCleanMode} />
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
        <section id="faq" className="scroll-mt-24">
          <FaqSection data={mockFaqData} underlineStyle={UNDERLINE_STYLE} />
        </section>
      </main>

      {/* Footer */}
      <Footer isCleanMode={isCleanMode} />

      {/* Help Quiz Modal */}
      <HelpQuiz
        config={quizConfig}
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        context="landing"
        isCleanMode={isCleanMode}
      />
    </div>
  );
};

export default LandingSection;
