'use client';

/**
 * LandingNavbar - Header simple con logo
 * Configuración fija v0.5
 */

import React from 'react';

export const LandingNavbar: React.FC = () => {
  return (
    <nav className="w-full bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-16">
          <a href="/prototipos/0.5/landing/landing-preview">
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
