'use client';

/**
 * FooterV6 - Con Chat Widget
 *
 * Concepto: Boton flotante de WhatsApp
 * Estilo: Soporte inmediato visible
 */

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Phone, Mail, Facebook, Instagram, Linkedin } from 'lucide-react';

const catalogUrl = '/prototipos/0.4/catalogo/catalog-preview/?layout=4&brand=3&card=6&techfilters=3&cols=3&skeleton=3&duration=default&loadmore=3&gallery=2&gallerysize=3&tags=3';

const quickLinks = [
  { label: 'Equipos', href: catalogUrl },
  { label: 'Cómo funciona', href: '#como-funciona' },
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

export const FooterV6: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Logo & Description */}
            <div className="md:col-span-2">
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
                Enlaces
              </h4>
              <ul className="space-y-2">
                {quickLinks.slice(0, 4).map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-neutral-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">
                Contacto
              </h4>
              <div className="space-y-3">
                <a
                  href="tel:+5115551234"
                  className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  (01) 555-1234
                </a>
                <a
                  href="mailto:contacto@baldecash.com"
                  className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  contacto@baldecash.com
                </a>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-neutral-500">
              © {currentYear} Balde K S.A.C. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4">
              {quickLinks.slice(4).map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-xs text-neutral-500 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <motion.a
        href="https://wa.me/51999999999"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-[#20BA5C] transition-colors"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageCircle className="w-7 h-7 text-white" />
        {/* Notification Badge */}
        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
          1
        </span>
      </motion.a>
    </>
  );
};

export default FooterV6;
