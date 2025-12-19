'use client';

/**
 * FooterV5 - Con Mapa
 *
 * Concepto: Ubicacion de oficinas
 * Estilo: Confianza por presencia fisica
 */

import React from 'react';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Linkedin } from 'lucide-react';

const contactInfo = [
  {
    icon: MapPin,
    label: 'Dirección',
    value: 'Av. Javier Prado Este 123, San Isidro, Lima',
  },
  {
    icon: Phone,
    label: 'Teléfono',
    value: '(01) 555-1234',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'contacto@baldecash.com',
  },
  {
    icon: Clock,
    label: 'Horario',
    value: 'Lun - Vie: 9am - 6pm',
  },
];

const quickLinks = [
  { label: 'Laptops', href: '#laptops' },
  { label: 'Convenios', href: '#convenios' },
  { label: 'FAQ', href: '#faq' },
];

const socialLinks = [
  { icon: Facebook, href: '#facebook', label: 'Facebook' },
  { icon: Instagram, href: '#instagram', label: 'Instagram' },
  { icon: Linkedin, href: '#linkedin', label: 'LinkedIn' },
];

export const FooterV5: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Map Placeholder */}
          <div className="bg-neutral-800 rounded-xl h-64 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[#4654CD]/10" />
            <div className="text-center z-10">
              <MapPin className="w-12 h-12 text-[#4654CD] mx-auto mb-2" />
              <p className="text-neutral-400 text-sm">San Isidro, Lima</p>
              <p className="text-xs text-neutral-500 mt-1">
                Click para ver en Google Maps
              </p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col justify-between">
            <div>
              <a href="/prototipos/0.4/hero" className="inline-block mb-6">
                <img
                  src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
                  alt="BaldeCash"
                  className="h-8 object-contain brightness-0 invert"
                />
              </a>
              <div className="space-y-4">
                {contactInfo.map((info) => (
                  <div key={info.label} className="flex items-start gap-3">
                    <info.icon className="w-5 h-5 text-[#4654CD] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-neutral-500">{info.label}</p>
                      <p className="text-sm text-neutral-300">{info.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
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
        </div>

        {/* Bottom */}
        <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center gap-6">
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
          <p className="text-sm text-neutral-500">
            © {currentYear} Balde K S.A.C. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterV5;
