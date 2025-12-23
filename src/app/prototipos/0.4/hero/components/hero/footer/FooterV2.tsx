'use client';

/**
 * FooterV2 - Completo 4 columnas
 *
 * Concepto: Links, productos, legal, contacto
 * Estilo: Footer corporativo tradicional
 */

import React from 'react';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

const catalogUrl = '/prototipos/0.4/catalogo/catalog-preview/?layout=4&brand=3&card=6&techfilters=3&cols=3&skeleton=3&duration=default&loadmore=3&gallery=2&gallerysize=3&tags=3';

const columns = [
  {
    title: 'Productos',
    links: [
      { label: 'Equipos', href: catalogUrl },
      { label: 'Accesorios', href: '#accesorios' },
      { label: 'Seguros', href: '#seguros' },
      { label: 'Promociones', href: '#promos' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre nosotros', href: '#nosotros' },
      { label: 'Convenios', href: '#convenios' },
      { label: 'Trabaja con nosotros', href: '#empleo' },
      { label: 'Blog', href: '#blog' },
    ],
  },
  {
    title: 'Soporte',
    links: [
      { label: 'Centro de ayuda', href: '#ayuda' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Estado de solicitud', href: '#estado' },
      { label: 'Contacto', href: '#contacto' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Términos y condiciones', href: '#terminos' },
      { label: 'Política de privacidad', href: '#privacidad' },
      { label: 'Libro de reclamaciones', href: '#reclamos' },
      { label: 'Regulación SBS', href: '#sbs' },
    ],
  },
];

const socialLinks = [
  { icon: Facebook, href: '#facebook', label: 'Facebook' },
  { icon: Instagram, href: '#instagram', label: 'Instagram' },
  { icon: Twitter, href: '#twitter', label: 'Twitter' },
  { icon: Linkedin, href: '#linkedin', label: 'LinkedIn' },
];

export const FooterV2: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Logo Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <a href="/prototipos/0.4/hero" className="inline-block mb-4">
              <img
                src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
                alt="BaldeCash"
                className="h-8 object-contain brightness-0 invert"
              />
            </a>
            <p className="text-sm text-neutral-400 mb-4">
              Financiamiento para estudiantes
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

          {/* Link Columns */}
          {columns.map((column) => (
            <div key={column.title}>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">
                {column.title}
              </h4>
              <ul className="space-y-2">
                {column.links.map((link) => (
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
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">
            © {currentYear} Balde K S.A.C. Todos los derechos reservados.
          </p>
          <p className="text-xs text-neutral-600">
            Empresa supervisada por la SBS
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterV2;
