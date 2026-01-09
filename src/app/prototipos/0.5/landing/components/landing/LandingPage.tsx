'use client';

/**
 * LandingPage - Orquestador principal v0.5
 * Configuración fija
 */

import React from 'react';
import { CampaignData, LeadFormData } from '../../types/landing';
import { regions, instituciones } from '../../data/mockLandingData';
import { LandingNavbar } from './navbar';
import { LandingHero } from './hero';

interface LandingPageProps {
  campaign: CampaignData;
}

export const LandingPage: React.FC<LandingPageProps> = ({ campaign }) => {
  const handleFormSubmit = (data: LeadFormData) => {
    console.log('Form submitted:', data);
    // In production, this would send data to API
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <LandingNavbar />

      {/* Main Hero Section */}
      <main>
        <LandingHero
          campaign={campaign}
          regions={regions}
          instituciones={instituciones}
          onSubmit={handleFormSubmit}
        />
      </main>
    </div>
  );
};

export default LandingPage;
