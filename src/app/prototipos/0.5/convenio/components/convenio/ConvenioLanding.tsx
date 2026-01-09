'use client';

/**
 * ConvenioLanding - Orquestador principal v0.5
 * Configuración fija (sin variaciones)
 */

import React from 'react';
import { ConvenioData } from '../../types/convenio';
import { ConvenioNavbar } from './navbar';
import { ConvenioHero } from './hero';
import { ConvenioBenefits } from './benefits';
import { ConvenioTestimonials } from './testimonials';
import { ConvenioFaq } from './faq';
import { ConvenioCta } from './cta';
import { ConvenioFooter } from './footer';

// Helper function to build internal URLs with mode propagation
const buildInternalUrl = (basePath: string, isCleanMode: boolean) => {
  return isCleanMode ? `${basePath}?mode=clean` : basePath;
};

interface ConvenioLandingProps {
  convenio: ConvenioData;
  isCleanMode?: boolean;
}

export const ConvenioLanding: React.FC<ConvenioLandingProps> = ({ convenio, isCleanMode = false }) => {
  const catalogUrl = buildInternalUrl('/prototipos/0.5/catalogo/catalog-preview', isCleanMode);

  const handleVerEquipos = () => {
    window.location.href = catalogUrl;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <ConvenioNavbar convenio={convenio} isCleanMode={isCleanMode} />

      {/* Main content */}
      <main>
        {/* Hero Section */}
        <ConvenioHero convenio={convenio} onVerEquipos={handleVerEquipos} />

        {/* Benefits Section */}
        <ConvenioBenefits convenio={convenio} />

        {/* Testimonials Section */}
        <ConvenioTestimonials convenio={convenio} />

        {/* FAQ Section */}
        <ConvenioFaq convenio={convenio} />

        {/* CTA Section */}
        <ConvenioCta convenio={convenio} onVerEquipos={handleVerEquipos} />
      </main>

      {/* Footer */}
      <ConvenioFooter convenio={convenio} />
    </div>
  );
};

export default ConvenioLanding;
