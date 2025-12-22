'use client';

/**
 * ConvenioFooterV5 - Footer con Redes Sociales Destacadas
 * Version: V5 - Redes sociales prominentes con estilo visual
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { Facebook, Instagram, Twitter, Linkedin, Youtube, MessageCircle } from 'lucide-react';
import { ConvenioFooterProps } from '../../types/convenio';

const BALDECASH_LOGO = 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png';

const socialLinks = [
  { icon: Facebook, label: 'Facebook', href: '#', color: 'hover:bg-blue-600' },
  { icon: Instagram, label: 'Instagram', href: '#', color: 'hover:bg-pink-600' },
  { icon: Twitter, label: 'Twitter', href: '#', color: 'hover:bg-sky-500' },
  { icon: Linkedin, label: 'LinkedIn', href: '#', color: 'hover:bg-blue-700' },
  { icon: Youtube, label: 'YouTube', href: '#', color: 'hover:bg-red-600' },
  { icon: MessageCircle, label: 'WhatsApp', href: '#', color: 'hover:bg-green-600' },
];

export const ConvenioFooterV5: React.FC<ConvenioFooterProps> = ({ convenio }) => {
  return (
    <footer className="bg-neutral-900 text-white">
      {/* Social Section */}
      <div className="border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Síguenos en redes</h3>
            <p className="text-neutral-400 text-sm mb-6">
              Entérate de ofertas y novedades para estudiantes
            </p>
            <div className="flex items-center justify-center gap-3">
              {socialLinks.map(({ icon: Icon, label, href, color }) => (
                <Button
                  key={label}
                  isIconOnly
                  as="a"
                  href={href}
                  className={`bg-neutral-800 text-white cursor-pointer transition-colors ${color}`}
                  aria-label={label}
                >
                  <Icon className="w-5 h-5" />
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo */}
          <div>
            <img
              src={BALDECASH_LOGO}
              alt="BaldeCash"
              className="h-8 mb-4"
            />
            <p className="text-neutral-400 text-sm">
              Financiamiento para estudiantes
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Producto</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><a href="#" className="hover:text-white transition-colors">Cómo funciona</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Catálogo</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Convenios</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><a href="#" className="hover:text-white transition-colors">Nosotros</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><a href="#" className="hover:text-white transition-colors">Términos y condiciones</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Política de privacidad</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Libro de reclamaciones</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-sm text-neutral-500">
          <p>© 2024 Balde K S.A.C. • Convenio {convenio.nombreCorto}</p>
        </div>
      </div>
    </footer>
  );
};

export default ConvenioFooterV5;
