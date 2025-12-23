'use client';

import React from 'react';
import { Phone, Mail } from 'lucide-react';

/**
 * BrandingLevelV2 - Branding completo
 * Logo, colores, footer normal
 * Experiencia consistente con el resto del sitio
 */

interface BrandingLevelProps {
  children?: React.ReactNode;
}

export const BrandingLevelV2: React.FC<BrandingLevelProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header completo */}
      <header className="bg-white border-b border-neutral-200 py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#4654CD] flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="font-semibold text-neutral-800">BaldeCash</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <a href="tel:+51999999999" className="flex items-center gap-1 hover:text-[#4654CD] cursor-pointer">
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">Ayuda</span>
            </a>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </main>

      {/* Footer completo */}
      <footer className="bg-white border-t border-neutral-200 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#4654CD] flex items-center justify-center">
                <span className="text-white font-bold text-xs">B</span>
              </div>
              <span className="text-sm text-neutral-500">BaldeCash 2024</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-neutral-500">
              <a href="#" className="hover:text-[#4654CD] cursor-pointer">Términos</a>
              <a href="#" className="hover:text-[#4654CD] cursor-pointer">Privacidad</a>
              <a href="mailto:ayuda@baldecash.com" className="flex items-center gap-1 hover:text-[#4654CD] cursor-pointer">
                <Mail className="w-4 h-4" />
                Contacto
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
