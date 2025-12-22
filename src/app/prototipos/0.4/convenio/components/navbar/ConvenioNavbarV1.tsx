'use client';

/**
 * ConvenioNavbarV1 - Logos lado a lado + badge convenio
 * Version: V1 - Co-branded clásico con logos BaldeCash x Universidad
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { Menu, X } from 'lucide-react';
import { ConvenioNavbarProps } from '../../types/convenio';

const BALDECASH_LOGO = 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png';

export const ConvenioNavbarV1: React.FC<ConvenioNavbarProps> = ({ convenio, onVerEquipos }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="sticky top-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logos co-branded */}
        <div className="flex items-center gap-4">
          <img
            src={BALDECASH_LOGO}
            alt="BaldeCash"
            className="h-8 object-contain"
          />
          <span className="text-neutral-300 text-lg">×</span>
          <img
            src={convenio.logo}
            alt={convenio.nombre}
            className="h-6 object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>

        {/* Desktop: CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            className="bg-[#4654CD] text-white rounded-xl cursor-pointer hover:bg-[#3a47b3] transition-colors"
            onPress={onVerEquipos}
          >
            Ver equipos
          </Button>
        </div>

        {/* Mobile: Menu toggle */}
        <button
          className="md:hidden p-2 hover:bg-neutral-100 rounded-lg cursor-pointer transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200 px-4 py-4">
          <Button
            className="bg-[#4654CD] text-white rounded-xl cursor-pointer hover:bg-[#3a47b3] transition-colors w-full"
            onPress={() => {
              onVerEquipos?.();
              setIsMenuOpen(false);
            }}
          >
            Ver equipos
          </Button>
        </div>
      )}
    </nav>
  );
};

export default ConvenioNavbarV1;
