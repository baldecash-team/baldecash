'use client';

/**
 * FooterV3 - Con Newsletter
 *
 * Concepto: Input de email prominente
 * Estilo: Captacion de leads en footer
 */

import React, { useState } from 'react';
import { Button, Input } from '@nextui-org/react';
import { Mail, Send, Facebook, Instagram, Linkedin } from 'lucide-react';

const quickLinks = [
  { label: 'Laptops', href: '#laptops' },
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Convenios', href: '#convenios' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contacto', href: '#contacto' },
];

const socialLinks = [
  { icon: Facebook, href: '#facebook', label: 'Facebook' },
  { icon: Instagram, href: '#instagram', label: 'Instagram' },
  { icon: Linkedin, href: '#linkedin', label: 'LinkedIn' },
];

export const FooterV3: React.FC = () => {
  const [email, setEmail] = useState('');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-[#4654CD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold mb-2">
                Recibe ofertas exclusivas
              </h3>
              <p className="text-white/80 text-sm">
                Sé el primero en enterarte de promociones y nuevos equipos
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                startContent={<Mail className="w-4 h-4 text-neutral-400" />}
                classNames={{
                  base: 'w-full sm:w-80',
                  inputWrapper: 'bg-white border-0 h-12',
                  input: 'text-neutral-800',
                }}
              />
              <Button
                radius="lg"
                className="bg-neutral-900 text-white font-semibold px-8 h-12 cursor-pointer hover:bg-neutral-800 transition-colors"
                endContent={<Send className="w-4 h-4" />}
              >
                Suscribir
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <a href="/prototipos/0.4/hero" className="flex items-center">
            <img
              src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
              alt="BaldeCash"
              className="h-8 object-contain brightness-0 invert"
            />
          </a>

          {/* Quick Links */}
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

          {/* Social */}
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

        {/* Bottom */}
        <div className="border-t border-neutral-800 mt-8 pt-8 text-center">
          <p className="text-sm text-neutral-500">
            © {currentYear} Balde K S.A.C. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterV3;
