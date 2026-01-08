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

interface ConvenioLandingProps {
  convenio: ConvenioData;
}

export const ConvenioLanding: React.FC<ConvenioLandingProps> = ({ convenio }) => {
  const handleVerEquipos = () => {
    window.location.href = '/prototipos/0.5/catalogo/catalog-preview?mode=clean';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <ConvenioNavbar convenio={convenio} />

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
