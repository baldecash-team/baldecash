'use client';

/**
 * ConvenioFooter - Footer minimalista centrado (basado en V2)
 */

import React from 'react';
import { ConvenioData } from '../../../types/convenio';

// Helper function to build internal URLs with mode propagation
const buildInternalUrl = (basePath: string, isCleanMode: boolean) => {
  return isCleanMode ? `${basePath}?mode=clean` : basePath;
};

interface ConvenioFooterProps {
  convenio: ConvenioData;
  isCleanMode?: boolean;
}

export const ConvenioFooter: React.FC<ConvenioFooterProps> = ({ convenio, isCleanMode = false }) => {
  const currentYear = new Date().getFullYear();

  const legalLinks = [
    { label: 'Términos y condiciones', href: buildInternalUrl('/prototipos/0.5/legal/terminos-y-condiciones', isCleanMode) },
    { label: 'Política de privacidad', href: buildInternalUrl('/prototipos/0.5/legal/politica-de-privacidad', isCleanMode) },
    { label: 'Libro de reclamaciones', href: buildInternalUrl('/prototipos/0.5/legal/libro-reclamaciones', isCleanMode) },
  ];

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
            {/* Logo del convenio con fondo para garantizar visibilidad */}
            <div className="bg-white rounded-lg px-3 py-1.5">
              <img
                src={convenio.logo}
                alt={convenio.nombre}
                className="h-5 object-contain"
              />
            </div>
          </div>

          {/* Description */}
          <p className="text-neutral-400 text-sm max-w-md mb-6">
            Financiamiento exclusivo para estudiantes de {convenio.nombre}.
            Sin historial crediticio. Aprobación en 24 horas.
          </p>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
            {legalLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
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
