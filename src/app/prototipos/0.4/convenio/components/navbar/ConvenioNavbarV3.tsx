'use client';

/**
 * ConvenioNavbarV3 - Navbar con banner de descuento flotante
 * Version: V3 - Incluye banner destacando el descuento del convenio
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { Menu, X, Percent, ArrowRight } from 'lucide-react';
import { ConvenioNavbarProps } from '../../types/convenio';

const BALDECASH_LOGO = 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png';

export const ConvenioNavbarV3: React.FC<ConvenioNavbarProps> = ({ convenio, onVerEquipos }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="sticky top-0 z-50">
      {/* Discount banner */}
      <div
        className="py-2 px-4 text-white text-center text-sm"
        style={{ backgroundColor: convenio.colorPrimario }}
      >
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Percent className="w-4 h-4" />
          <span className="font-medium">
            {convenio.descuentoCuota}% de descuento exclusivo para estudiantes {convenio.nombreCorto}
          </span>
          <button
            className="hidden sm:inline-flex items-center gap-1 underline underline-offset-2 hover:no-underline cursor-pointer"
            onClick={onVerEquipos}
          >
            Ver equipos <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo solo BaldeCash */}
          <img
            src={BALDECASH_LOGO}
            alt="BaldeCash"
            className="h-8 object-contain"
          />

          {/* Desktop: CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="#testimonios"
              className="text-sm text-neutral-600 hover:text-[#4654CD] transition-colors cursor-pointer"
            >
              Testimonios
            </a>
            <Button
              className="bg-[#4654CD] text-white font-semibold px-6 rounded-xl cursor-pointer hover:bg-[#3a47b3] hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
              endContent={<ArrowRight className="w-4 h-4" />}
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
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-neutral-200 px-4 py-4 shadow-lg">
          <div className="flex flex-col gap-4">
            <a
              href="#testimonios"
              className="text-sm text-neutral-600 hover:text-[#4654CD] transition-colors cursor-pointer py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Testimonios
            </a>
            <Button
              className="bg-[#4654CD] text-white font-semibold rounded-xl cursor-pointer hover:bg-[#3a47b3] transition-all w-full"
              endContent={<ArrowRight className="w-4 h-4" />}
              onPress={() => {
                onVerEquipos?.();
                setIsMenuOpen(false);
              }}
            >
              Ver equipos
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConvenioNavbarV3;
