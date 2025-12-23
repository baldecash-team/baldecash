'use client';

/**
 * ConvenioFooterV2 - Footer Minimalista Centrado
 * Version: V2 - Diseño compacto y elegante
 */

import React from 'react';
import { ConvenioFooterProps } from '../../types/convenio';

const BALDECASH_LOGO = 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png';

export const ConvenioFooterV2: React.FC<ConvenioFooterProps> = ({ convenio }) => {
  return (
    <footer className="bg-neutral-900 text-white py-10">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Logos */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <img
            src={BALDECASH_LOGO}
            alt="BaldeCash"
            className="h-7"
          />
          <span className="text-neutral-600">×</span>
          <img
            src={convenio.logo}
            alt={convenio.nombre}
            className="h-5 object-contain brightness-0 invert opacity-70"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>

        {/* Navigation */}
        <nav className="flex flex-wrap items-center justify-center gap-6 mb-8 text-sm">
          <a href="#" className="text-neutral-400 hover:text-white transition-colors">Cómo funciona</a>
          <a href="#" className="text-neutral-400 hover:text-white transition-colors">Catálogo</a>
          <a href="#" className="text-neutral-400 hover:text-white transition-colors">Convenios</a>
          <a href="#" className="text-neutral-400 hover:text-white transition-colors">Nosotros</a>
          <a href="#" className="text-neutral-400 hover:text-white transition-colors">Contacto</a>
        </nav>

        {/* Legal */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-6 text-xs text-neutral-500">
          <a href="#" className="hover:text-neutral-300 transition-colors">Términos y condiciones</a>
          <span>•</span>
          <a href="#" className="hover:text-neutral-300 transition-colors">Política de privacidad</a>
          <span>•</span>
          <a href="#" className="hover:text-neutral-300 transition-colors">Libro de reclamaciones</a>
        </div>

        {/* Copyright */}
        <p className="text-xs text-neutral-600">
          © 2024 Balde K S.A.C. • Convenio {convenio.nombreCorto}
        </p>
      </div>
    </footer>
  );
};

export default ConvenioFooterV2;
