'use client';

/**
 * ConvenioNavbarV4 - Navbar minimalista con CTA prominente
 * Version: V4 - Diseño limpio con énfasis en el botón de acción
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { ConvenioNavbarProps } from '../../types/convenio';

const BALDECASH_LOGO = 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png';

export const ConvenioNavbarV4: React.FC<ConvenioNavbarProps> = ({ convenio, onVerEquipos }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="sticky top-0 bg-white z-50 border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo only */}
        <img
          src={BALDECASH_LOGO}
          alt="BaldeCash"
          className="h-7 object-contain"
        />

        {/* Desktop: Large CTA */}
        <div className="hidden md:flex items-center gap-3">
          <span className="text-sm text-neutral-500">
            Exclusivo para {convenio.nombreCorto}
          </span>
          <Button
            size="lg"
            className="text-white rounded-xl cursor-pointer hover:opacity-90 transition-opacity px-8 font-semibold"
            style={{ backgroundColor: convenio.colorPrimario }}
            startContent={<ShoppingBag className="w-5 h-5" />}
            onPress={onVerEquipos}
          >
            Ver equipos con {convenio.descuentoCuota}% OFF
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
        <div className="md:hidden bg-white border-t border-neutral-100 px-4 py-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <img
                src={convenio.logo}
                alt={convenio.nombre}
                className="h-8 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <span className="text-neutral-600 text-sm">
                Convenio exclusivo
              </span>
            </div>
            <Button
              size="lg"
              className="text-white rounded-xl cursor-pointer hover:opacity-90 transition-opacity w-full font-semibold"
              style={{ backgroundColor: convenio.colorPrimario }}
              startContent={<ShoppingBag className="w-5 h-5" />}
              onPress={() => {
                onVerEquipos?.();
                setIsMenuOpen(false);
              }}
            >
              Ver equipos con {convenio.descuentoCuota}% OFF
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default ConvenioNavbarV4;
