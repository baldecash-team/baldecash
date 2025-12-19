'use client';

/**
 * FooterV1 - Minimalista
 *
 * Concepto: Solo logo + links esenciales
 * Estilo: Limpio, sin distracciones
 */

import React from 'react';

const essentialLinks = [
  { label: 'Términos', href: '#terminos' },
  { label: 'Privacidad', href: '#privacidad' },
  { label: 'Contacto', href: '#contacto' },
];

export const FooterV1: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <a href="/prototipos/0.4/hero" className="flex items-center">
            <img
              src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
              alt="BaldeCash"
              className="h-8 object-contain brightness-0 invert"
            />
          </a>

          {/* Links */}
          <div className="flex items-center gap-6">
            {essentialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-sm text-neutral-500">
            © {currentYear} BaldeCash
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterV1;
