'use client';

import React from 'react';
import type { HeroContent, LeadFormConfig, BannerImage, StudyCenter } from '../../types/hero';
import { LeadHeroBanner } from './LeadHeroBanner';
import { LeadLeadForm } from './LeadLeadForm';

interface LeadHeroProps {
  heroContent: HeroContent | null;
  bannerImages: BannerImage[];
  leadFormConfig: LeadFormConfig | null;
  studyCenters: StudyCenter[];
  landingId: number;
  landing: string;
  primaryColor?: string;
  previewBannerOffset?: number;
}

const DEFAULT_FORM_CONFIG: LeadFormConfig = {
  title_count: 20,
  title: 'Explora más de 20 modelos',
  description: 'Facilitamos el acceso a equipos tecnológicos para estudiantes con financiamiento simple y rápido.',
  cta_text: 'Ver equipos disponibles',
};

export const LeadHero: React.FC<LeadHeroProps> = ({
  heroContent,
  bannerImages,
  leadFormConfig,
  studyCenters,
  landingId,
  landing,
  primaryColor = '#4654CD',
  previewBannerOffset = 0,
}) => {
  const formConfig = leadFormConfig || DEFAULT_FORM_CONFIG;
  const headerHeight = `calc(var(--header-total-height, 6.5rem) + ${previewBannerOffset}px)`;
  const sectionHeight = `max(520px, calc(100svh - ${headerHeight}))`;

  return (
    <section className="w-full">
      {/* Desktop: grid 70/30 — Mobile: columna única */}
      <div className="flex flex-col lg:grid lg:grid-cols-[70fr_30fr] lg:items-start">

        {/* Lado izquierdo: banner + marcas (70%) */}
        <div
          className="overflow-hidden"
          style={{ height: sectionHeight }}
        >
          <LeadHeroBanner
            heroContent={heroContent}
            bannerImages={bannerImages}
            landing={landing}
            primaryColor={primaryColor}
          />
        </div>

        {/* Lado derecho: formulario sticky (30%) */}
        {/* Desktop: sticky top = header height, queda fijo mientras se hace scroll */}
        {/* Mobile: sección estática debajo del banner */}
        <div
          className="bg-gray-50 p-4 lg:p-6 lg:sticky"
          style={{ top: headerHeight }}
        >
          <LeadLeadForm
            config={formConfig}
            landingId={landingId}
            landing={landing}
            studyCenters={studyCenters}
            primaryColor={primaryColor}
          />
        </div>
      </div>
    </section>
  );
};
