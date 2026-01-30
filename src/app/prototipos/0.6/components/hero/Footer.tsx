'use client';

/**
 * Footer - Completo con Newsletter + 4 columnas (basado en V2 de 0.4)
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { Facebook, Instagram, Linkedin, Phone, Send, AlertCircle, Check } from 'lucide-react';
import { Toast } from '@/app/prototipos/_shared';

// Helper function to build internal URLs with mode propagation
const buildInternalUrl = (basePath: string, isCleanMode: boolean, params?: Record<string, string>) => {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      searchParams.set(key, value);
    });
  }
  if (isCleanMode) {
    searchParams.set('mode', 'clean');
  }
  const queryString = searchParams.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
};

// TikTok icon component (not available in lucide-react)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const socialLinks = [
  { icon: Facebook, href: 'https://www.facebook.com/baldecash', label: 'Facebook' },
  { icon: Instagram, href: 'https://www.instagram.com/baldecash/', label: 'Instagram' },
  { icon: TikTokIcon, href: 'https://www.tiktok.com/@baldecash', label: 'TikTok' },
];

interface FooterProps {
  isCleanMode?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ isCleanMode = false }) => {
  const catalogUrl = buildInternalUrl('/prototipos/0.5/catalogo/catalog-preview', isCleanMode);
  const heroUrl = buildInternalUrl('/prototipos/0.5/hero/hero-preview', isCleanMode);

  const proximamenteUrl = '/prototipos/0.5/proximamente';

  const columns = [
    {
      title: 'Productos',
      links: [
        { label: 'Equipos', href: catalogUrl },
        { label: 'Accesorios', href: buildInternalUrl(proximamenteUrl, isCleanMode, { seccion: 'accesorios' }) },
        { label: 'Seguros', href: buildInternalUrl(proximamenteUrl, isCleanMode, { seccion: 'seguros' }) },
        { label: 'Promociones', href: buildInternalUrl(proximamenteUrl, isCleanMode, { seccion: 'promos' }) },
      ],
    },
    {
      title: 'Empresa',
      links: [
        { label: 'Sobre nosotros', href: buildInternalUrl(proximamenteUrl, isCleanMode, { seccion: 'nosotros' }) },
        { label: 'Convenios', href: buildInternalUrl(proximamenteUrl, isCleanMode, { seccion: 'convenios' }) },
        { label: 'Trabaja con nosotros', href: buildInternalUrl(proximamenteUrl, isCleanMode, { seccion: 'empleo' }) },
        { label: 'Blog', href: buildInternalUrl(proximamenteUrl, isCleanMode, { seccion: 'blog' }) },
      ],
    },
    {
      title: 'Soporte',
      links: [
        { label: 'Centro de ayuda', href: buildInternalUrl(proximamenteUrl, isCleanMode, { seccion: 'ayuda' }) },
        { label: 'FAQ', href: buildInternalUrl(proximamenteUrl, isCleanMode, { seccion: 'faq' }) },
        { label: 'Estado de solicitud', href: buildInternalUrl(proximamenteUrl, isCleanMode, { seccion: 'estado' }) },
        { label: 'Contacto', href: buildInternalUrl(proximamenteUrl, isCleanMode, { seccion: 'contacto' }) },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Términos y condiciones', href: buildInternalUrl('/prototipos/0.5/legal/terminos-y-condiciones', isCleanMode) },
        { label: 'Política de privacidad', href: buildInternalUrl('/prototipos/0.5/legal/politica-de-privacidad', isCleanMode) },
        { label: 'Libro de reclamaciones', href: buildInternalUrl('/prototipos/0.5/legal/libro-reclamaciones', isCleanMode) },
        { label: 'Regulación SBS', href: buildInternalUrl(proximamenteUrl, isCleanMode, { seccion: 'sbs' }) },
      ],
    },
  ];
  const [whatsapp, setWhatsapp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const currentYear = new Date().getFullYear();

  const validatePeruvianPhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\s/g, '');
    return /^9\d{8}$/.test(cleanPhone);
  };

  // Validación en tiempo real
  const getValidationState = () => {
    if (!touched && !error) return 'default';
    if (error) return 'error';
    if (whatsapp.trim() && validatePeruvianPhone(whatsapp)) return 'success';
    return 'default';
  };

  const validationState = getValidationState();

  const handleSubmit = () => {
    setTouched(true);
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
    setTouched(false);
    setError(null);
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
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Input con estilo estándar 8.7 */}
                <div
                  className={`
                    flex items-center gap-2 h-11 px-3 w-full sm:w-72
                    rounded-lg border-2 transition-all duration-200 bg-white
                    ${validationState === 'error' ? 'border-[#ef4444]' : ''}
                    ${validationState === 'success' ? 'border-[#22c55e]' : ''}
                    ${validationState === 'default' ? 'border-transparent focus-within:border-[#4654CD]' : ''}
                  `}
                >
                  <Phone className={`w-4 h-4 flex-shrink-0 ${validationState === 'error' ? 'text-[#ef4444]' : 'text-neutral-400'}`} />
                  <input
                    type="tel"
                    placeholder="999 999 999"
                    value={whatsapp}
                    maxLength={9}
                    onChange={(e) => {
                      // Solo permitir números
                      const value = e.target.value.replace(/\D/g, '');
                      setWhatsapp(value);
                      if (error) setError(null);
                    }}
                    onBlur={() => setTouched(true)}
                    className="flex-1 bg-transparent outline-none text-base text-neutral-800 placeholder:text-neutral-400"
                  />
                  {/* Contador de caracteres */}
                  <span className={`text-xs flex-shrink-0 ${whatsapp.length === 9 ? 'text-[#22c55e]' : 'text-neutral-400'}`}>
                    {whatsapp.length}/9
                  </span>
                  {validationState === 'success' && <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0" />}
                  {validationState === 'error' && <AlertCircle className="w-5 h-5 text-[#ef4444] flex-shrink-0" />}
                </div>
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
                <p className="text-sm text-red-200 flex items-center gap-1 ml-1">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </p>
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
            <a href={heroUrl} className="inline-block mb-4">
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
                  target="_blank"
                  rel="noopener noreferrer"
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

      {/* Toast de éxito - Newsletter */}
      <Toast
        message="¡Número registrado con éxito!"
        type="success"
        isVisible={isSuccess}
        onClose={() => setIsSuccess(false)}
        duration={3000}
        position="bottom"
      />
    </footer>
  );
};

export default Footer;
