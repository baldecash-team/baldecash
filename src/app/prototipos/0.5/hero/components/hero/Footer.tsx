'use client';

/**
 * Footer - Completo con Newsletter + 4 columnas (basado en V2 de 0.4)
 */

import React, { useState } from 'react';
import { Button, Input } from '@nextui-org/react';
import { Facebook, Instagram, Linkedin, Twitter, Phone, Send, CheckCircle } from 'lucide-react';

const catalogUrl = '/prototipos/0.5/catalogo/catalog-preview?mode=clean';

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

export const Footer: React.FC = () => {
  const [whatsapp, setWhatsapp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const currentYear = new Date().getFullYear();

  const validatePeruvianPhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\s/g, '');
    return /^9\d{8}$/.test(cleanPhone);
  };

  const handleSubmit = () => {
    setError(null);

    if (!whatsapp.trim()) {
      setError('Ingresa tu número de WhatsApp');
      return;
    }

    if (!validatePeruvianPhone(whatsapp)) {
      setError('Ingresa un número válido (9 dígitos, ej: 987654321)');
      return;
    }

    // Éxito
    setIsSuccess(true);
    setWhatsapp('');
    setTimeout(() => {
      setIsSuccess(false);
    }, 3000);
  };

  return (
    <footer className="bg-neutral-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-[#4654CD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold mb-1">Recibe ofertas exclusivas</h3>
              <p className="text-white/80 text-sm">
                Sé el primero en enterarte de promociones y nuevos equipos
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full md:w-auto relative">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="tel"
                  placeholder="999 999 999"
                  value={whatsapp}
                  onChange={(e) => {
                    setWhatsapp(e.target.value);
                    if (error) setError(null);
                  }}
                  startContent={<Phone className="w-4 h-4 text-neutral-400" />}
                  classNames={{
                    base: 'w-full sm:w-72',
                    inputWrapper: `bg-white h-11 focus-within:ring-0 ${error ? 'border-2 border-red-500' : 'border-0'}`,
                    input: 'text-neutral-800 focus:outline-none',
                    innerWrapper: 'focus-within:ring-0',
                  }}
                />
                <Button
                  radius="lg"
                  className="bg-neutral-900 text-white font-semibold px-6 h-11 cursor-pointer hover:bg-neutral-800 transition-colors"
                  endContent={<Send className="w-4 h-4" />}
                  onPress={handleSubmit}
                >
                  Enviar
                </Button>
              </div>
              {error && (
                <p className="text-red-200 text-sm ml-1">{error}</p>
              )}
              {/* Toast de éxito */}
              {isSuccess && (
                <div className="absolute -bottom-12 left-0 right-0 sm:left-auto sm:right-0 sm:w-auto">
                  <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium whitespace-nowrap">¡Número registrado con éxito!</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-10">
          {/* Logo Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <a href="/prototipos/0.5/hero/hero-preview" className="inline-block mb-4">
              <img
                src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
                alt="BaldeCash"
                className="h-8 object-contain brightness-0 invert"
              />
            </a>
            <p className="text-sm text-neutral-400 mb-4">Financiamiento para estudiantes</p>
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
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">{column.title}</h4>
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
        <div className="border-t border-neutral-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">
            © {currentYear} Balde K S.A.C. Todos los derechos reservados.
          </p>
          <p className="text-xs text-neutral-600">Empresa supervisada por la SBS</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
