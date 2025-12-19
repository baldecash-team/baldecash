'use client';

/**
 * FooterV10 - Con Trust Badges
 *
 * Concepto: Sellos de seguridad prominentes
 * Estilo: Confianza y credibilidad
 */

import React from 'react';
import { Shield, Lock, Award, CheckCircle, Facebook, Instagram, Linkedin } from 'lucide-react';

const trustBadges = [
  {
    icon: Shield,
    title: 'SBS Regulado',
    description: 'Supervisados por la Superintendencia',
  },
  {
    icon: Lock,
    title: 'SSL 256 bits',
    description: 'Conexión cifrada y segura',
  },
  {
    icon: Award,
    title: 'ISO 27001',
    description: 'Certificación de seguridad',
  },
  {
    icon: CheckCircle,
    title: 'PCI DSS',
    description: 'Protección de datos de pago',
  },
];

const quickLinks = [
  { label: 'Laptops', href: '#laptops' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Convenios', href: '#convenios' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Términos', href: '#terminos' },
  { label: 'Privacidad', href: '#privacidad' },
];

const socialLinks = [
  { icon: Facebook, href: '#facebook', label: 'Facebook' },
  { icon: Instagram, href: '#instagram', label: 'Instagram' },
  { icon: Linkedin, href: '#linkedin', label: 'LinkedIn' },
];

export const FooterV10: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-white">
      {/* Trust Badges Section */}
      <div className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustBadges.map((badge) => (
              <div
                key={badge.title}
                className="flex items-center gap-3 p-4 bg-neutral-800/50 rounded-lg"
              >
                <div className="w-10 h-10 rounded-full bg-[#03DBD0]/20 flex items-center justify-center flex-shrink-0">
                  <badge.icon className="w-5 h-5 text-[#03DBD0]" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{badge.title}</p>
                  <p className="text-xs text-neutral-400">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
              Financiamiento seguro y transparente para estudiantes peruanos.
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
              Enlaces
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

          {/* Security Notice */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">
              Tu seguridad
            </h4>
            <div className="bg-neutral-800/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#03DBD0] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Proceso 100% seguro</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Tus datos están protegidos con cifrado de grado bancario.
                    No compartimos tu información con terceros.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">
            © {currentYear} Balde K S.A.C. Todos los derechos reservados.
          </p>
          <p className="text-xs text-neutral-600">
            Empresa supervisada por la Superintendencia de Banca, Seguros y AFP (SBS)
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterV10;
