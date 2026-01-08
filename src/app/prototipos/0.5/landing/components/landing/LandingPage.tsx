'use client';

/**
 * LandingPage - Orquestador principal v0.5
 * Configuración fija (sin variaciones)
 */

import React from 'react';
import { CampaignData, LeadFormData } from '../../types/landing';
import { landingBenefits, landingProducts, regions, instituciones } from '../../data/mockLandingData';
import { LandingNavbar } from './navbar';
import { LandingBenefitsBar } from './benefits';
import { LandingHero } from './hero';

interface LandingPageProps {
  campaign: CampaignData;
}

export const LandingPage: React.FC<LandingPageProps> = ({ campaign }) => {
  const handleFormSubmit = (data: LeadFormData) => {
    console.log('Form submitted:', data);
    // In production, this would send data to API
    alert('¡Gracias! Te contactaremos pronto por WhatsApp.');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <LandingNavbar campaign={campaign} />

      {/* Benefits Bar */}
      <LandingBenefitsBar benefits={landingBenefits} />

      {/* Main Hero Section */}
      <main>
        <LandingHero
          campaign={campaign}
          products={landingProducts}
          regions={regions}
          instituciones={instituciones}
          onSubmit={handleFormSubmit}
        />
      </main>
    </div>
  );
};

export default LandingPage;
