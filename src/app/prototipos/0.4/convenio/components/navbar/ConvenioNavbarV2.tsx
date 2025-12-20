'use client';

/**
 * ConvenioNavbarV2 - Logo BaldeCash con acento de color universidad
 * Version: V2 - Navbar con borde inferior en color del convenio
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { Menu, X, GraduationCap } from 'lucide-react';
import { ConvenioNavbarProps } from '../../types/convenio';

const BALDECASH_LOGO = 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png';

export const ConvenioNavbarV2: React.FC<ConvenioNavbarProps> = ({ convenio, onVerEquipos }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="sticky top-0 z-50">
      {/* Main navbar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo BaldeCash */}
          <div className="flex items-center gap-3">
            <img
              src={BALDECASH_LOGO}
              alt="BaldeCash"
              className="h-8 object-contain"
            />
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-neutral-200">
              <GraduationCap
                className="w-4 h-4"
                style={{ color: convenio.colorPrimario }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: convenio.colorPrimario }}
              >
                {convenio.nombreCorto}
              </span>
            </div>
          </div>

          {/* Desktop: Links + CTA */}
          <div className="hidden md:flex items-center gap-6">
            <a
              href="#beneficios"
              className="text-sm text-neutral-600 hover:text-[#4654CD] transition-colors cursor-pointer"
            >
              Beneficios
            </a>
            <a
              href="#faq"
              className="text-sm text-neutral-600 hover:text-[#4654CD] transition-colors cursor-pointer"
            >
              ¿Tienes dudas?
            </a>
            <Button
              className="text-white rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
              style={{ backgroundColor: convenio.colorPrimario }}
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

        {/* Accent border */}
        <div
          className="h-1 w-full"
          style={{ backgroundColor: convenio.colorPrimario }}
        />
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-neutral-200 px-4 py-4 shadow-lg">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
              <GraduationCap
                className="w-5 h-5"
                style={{ color: convenio.colorPrimario }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: convenio.colorPrimario }}
              >
                Convenio {convenio.nombreCorto}
              </span>
            </div>
            <a
              href="#beneficios"
              className="text-sm text-neutral-600 hover:text-[#4654CD] transition-colors cursor-pointer py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Beneficios
            </a>
            <a
              href="#faq"
              className="text-sm text-neutral-600 hover:text-[#4654CD] transition-colors cursor-pointer py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              ¿Tienes dudas?
            </a>
            <Button
              className="text-white rounded-xl cursor-pointer hover:opacity-90 transition-opacity w-full"
              style={{ backgroundColor: convenio.colorPrimario }}
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
    </nav>
  );
};

export default ConvenioNavbarV2;
