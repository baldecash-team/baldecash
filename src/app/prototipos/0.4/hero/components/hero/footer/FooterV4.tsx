'use client';

/**
 * FooterV4 - Con App Download
 *
 * Concepto: Badges de App Store/Play Store
 * Estilo: Promueve descarga de app movil
 */

import React from 'react';
import { Smartphone, Facebook, Instagram, Linkedin } from 'lucide-react';

const quickLinks = [
  { label: 'Equipos', href: '#equipos' },
  { label: 'Convenios', href: '#convenios' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Términos', href: '#terminos' },
  { label: 'Libro de reclamaciones', href: '#reclamos' },
];

const socialLinks = [
  { icon: Facebook, href: '#facebook', label: 'Facebook' },
  { icon: Instagram, href: '#instagram', label: 'Instagram' },
  { icon: Linkedin, href: '#linkedin', label: 'LinkedIn' },
];

export const FooterV4: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo & Description */}
          <div>
            <a href="/prototipos/0.4/hero" className="inline-block mb-4">
              <img
                src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
                alt="BaldeCash"
                className="h-8 object-contain brightness-0 invert"
              />
            </a>
            <p className="text-sm text-neutral-400 mb-4">
              Financiamiento para estudiantes. Tu laptop te espera.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-[#4654CD] transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">
              Enlaces rápidos
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* App Download */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">
              Descarga nuestra app
            </h4>
            <p className="text-sm text-neutral-400 mb-4">
              Gestiona tu cuenta y realiza pagos desde tu celular
            </p>
            <div className="space-y-3">
              {/* App Store Badge */}
              <a
                href="#app-store"
                className="flex items-center gap-3 bg-neutral-800 hover:bg-neutral-700 transition-colors rounded-lg px-4 py-2"
              >
                <Smartphone className="w-6 h-6" />
                <div>
                  <p className="text-[10px] text-neutral-400">Descarga en</p>
                  <p className="text-sm font-semibold">App Store</p>
                </div>
              </a>
              {/* Play Store Badge */}
              <a
                href="#play-store"
                className="flex items-center gap-3 bg-neutral-800 hover:bg-neutral-700 transition-colors rounded-lg px-4 py-2"
              >
                <Smartphone className="w-6 h-6" />
                <div>
                  <p className="text-[10px] text-neutral-400">Disponible en</p>
                  <p className="text-sm font-semibold">Google Play</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-neutral-800 pt-8 text-center">
          <p className="text-sm text-neutral-500">
            © {currentYear} Balde K S.A.C. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterV4;
