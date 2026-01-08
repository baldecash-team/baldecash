'use client';

/**
 * ConvenioFooter - Footer minimalista centrado (basado en V2)
 */

import React from 'react';
import { ConvenioData } from '../../../types/convenio';

interface ConvenioFooterProps {
  convenio: ConvenioData;
}

export const ConvenioFooter: React.FC<ConvenioFooterProps> = ({ convenio }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          {/* Logos */}
          <div className="flex items-center gap-4 mb-6">
            <img
              src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
              alt="BaldeCash"
              className="h-8 object-contain brightness-0 invert"
            />
            <span className="text-neutral-500">×</span>
            <img
              src={convenio.logo}
              alt={convenio.nombre}
              className="h-6 object-contain brightness-0 invert opacity-80"
            />
          </div>

          {/* Description */}
          <p className="text-neutral-400 text-sm max-w-md mb-6">
            Financiamiento exclusivo para estudiantes de {convenio.nombre}.
            Sin historial crediticio. Aprobación en 24 horas.
          </p>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
            <a href="#" className="text-neutral-400 hover:text-white transition-colors">
              Términos y condiciones
            </a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors">
              Política de privacidad
            </a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors">
              Libro de reclamaciones
            </a>
          </div>

          {/* Divider */}
          <div className="w-full max-w-xs h-px bg-neutral-800 mb-6" />

          {/* Copyright */}
          <p className="text-neutral-500 text-xs">
            © {currentYear} BaldeCash. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default ConvenioFooter;
