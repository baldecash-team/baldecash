'use client';

/**
 * LandingNavbar - Header simple con logo y banner promocional
 * Configuración fija v0.5
 */

import React from 'react';
import { Gift } from 'lucide-react';
import { CampaignData } from '../../../types/landing';

interface LandingNavbarProps {
  campaign: CampaignData;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ campaign }) => {
  return (
    <>
      {/* Promo Banner */}
      <div
        className="w-full py-2.5 px-4 text-center text-sm font-medium text-white"
        style={{ backgroundColor: campaign.colorPrimario }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <Gift className="w-4 h-4 text-[#03DBD0]" />
          <span>{campaign.bannerTexto}</span>
        </div>
      </div>

      {/* Navbar */}
      <nav className="w-full bg-white border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-14">
            <a href="/prototipos/0.5/hero/hero-preview">
              <img
                src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
                alt="BaldeCash"
                className="h-7 object-contain"
              />
            </a>
          </div>
        </div>
      </nav>
    </>
  );
};

export default LandingNavbar;
