'use client';

/**
 * LandingNavbar - Header simple con logo
 * Configuración fija v0.5
 */

import React from 'react';

// Helper function to build internal URLs with mode propagation
const buildInternalUrl = (basePath: string, isCleanMode: boolean) => {
  return isCleanMode ? `${basePath}?mode=clean` : basePath;
};

interface LandingNavbarProps {
  isCleanMode?: boolean;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ isCleanMode = false }) => {
  const landingUrl = buildInternalUrl('/prototipos/0.5/landing/landing-preview', isCleanMode);

  return (
    <nav className="w-full bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-16">
          <a href={landingUrl}>
            <img
              src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
              alt="BaldeCash"
              className="h-12 object-contain"
            />
          </a>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;
