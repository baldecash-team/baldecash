'use client';

import { useState } from 'react';
import { Phone, Send, Facebook, Instagram, Twitter, Linkedin, Youtube, AlertCircle, Check } from 'lucide-react';
import { BC } from '../lib/constants';

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const footerColumns = [
  {
    title: 'PRODUCTOS',
    links: [
      { label: 'Laptops', href: '#' },
      { label: 'Celulares', href: '#' },
      { label: 'Tablets', href: '#' },
      { label: 'Ver catálogo', href: '#' },
    ],
  },
  {
    title: 'EMPRESA',
    links: [
      { label: 'Sobre nosotros', href: '#' },
      { label: 'Convenios', href: '#' },
      { label: 'Trabaja con nosotros', href: '#' },
      { label: 'Blog', href: '#' },
    ],
  },
  {
    title: 'SOPORTE',
    links: [
      { label: 'Centro de ayuda', href: '#' },
      { label: 'FAQ', href: '#' },
      { label: 'Estado de solicitud', href: '#' },
      { label: 'Contacto', href: '#' },
    ],
  },
  {
    title: 'LEGAL',
    links: [
      { label: 'Términos y condiciones', href: '#' },
      { label: 'Política de privacidad', href: '#' },
      { label: 'Libro de reclamaciones', href: '#' },
    ],
  },
];

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: TikTokIcon, href: '#', label: 'TikTok' },
];

const LOGO_WHITE = 'https://baldecash.s3.amazonaws.com/company/logo.svg';

export default function FooterV5() {
  const [whatsapp, setWhatsapp] = useState('');
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidPhone = whatsapp.length === 9 && /^9\d{8}$/.test(whatsapp);
  const validationState = !touched && !error ? 'default' : error ? 'error' : isValidPhone ? 'success' : 'default';

  const handleSubmit = () => {
    setTouched(true);
    if (!whatsapp.trim()) {
      setError('Ingresa tu número de WhatsApp');
      return;
    }
    if (!isValidPhone) {
      setError('Ingresa un número válido (9 dígitos, ej: 987654321)');
      return;
    }
    setError(null);
    setWhatsapp('');
    setTouched(false);
  };

  return (
    <footer className="bg-neutral-900 text-white">
      {/* Newsletter Section */}
      <div style={{ backgroundColor: BC.primary }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold mb-1">Recibe ofertas exclusivas</h3>
              <p className="text-white/80 text-sm m-0">
                Sé el primero en enterarte de promociones y nuevos equipos
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div
                  className={`flex items-center gap-2 h-11 px-3 w-full sm:w-72 rounded-lg border-2 transition-all duration-200 bg-white ${
                    validationState === 'error' ? 'border-[#ef4444]' :
                    validationState === 'success' ? 'border-[#22c55e]' :
                    'border-transparent'
                  }`}
                >
                  <Phone className={`w-4 h-4 flex-shrink-0 ${validationState === 'error' ? 'text-[#ef4444]' : 'text-neutral-400'}`} />
                  <input
                    type="tel"
                    placeholder="999999999"
                    value={whatsapp}
                    maxLength={9}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setWhatsapp(value);
                      if (error) setError(null);
                    }}
                    onBlur={() => setTouched(true)}
                    className="flex-1 bg-transparent outline-none text-base text-neutral-800 placeholder:text-neutral-400 border-none"
                  />
                  <span className={`text-xs flex-shrink-0 ${whatsapp.length === 9 ? 'text-[#22c55e]' : 'text-neutral-400'}`}>
                    {whatsapp.length}/9
                  </span>
                  {validationState === 'success' && <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0" />}
                  {validationState === 'error' && <AlertCircle className="w-5 h-5 text-[#ef4444] flex-shrink-0" />}
                </div>
                <button
                  onClick={handleSubmit}
                  className="flex items-center justify-center gap-2 bg-neutral-900 text-white font-semibold px-6 h-11 rounded-lg border-none cursor-pointer hover:bg-neutral-800 transition-colors"
                >
                  Enviar
                  <Send className="w-4 h-4" />
                </button>
              </div>
              {error && (
                <p className="text-sm text-red-200 flex items-center gap-1 ml-1 m-0">
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
            <img
              src={LOGO_WHITE}
              alt="BaldeCash"
              className="h-8 object-contain mb-4"
            />
            <p className="text-sm text-neutral-400 mb-4 m-0">Financiamiento para estudiantes</p>
            <div className="flex items-center gap-3 mb-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center transition-colors text-neutral-400 hover:text-white"
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BC.primary)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            <a href="tel:017096012" className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors no-underline">
              <Phone className="w-4 h-4" />
              <span>01 7096012</span>
            </a>
          </div>

          {/* Link Columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 m-0">{col.title}</h4>
              <ul className="list-none p-0 m-0 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-neutral-400 no-underline hover:text-white transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500 m-0">
            &copy; 2026 Balde K S.A.C. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-xs text-neutral-600 m-0">Empresa supervisada por la SBS</p>
            <a href="#" className="flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity" title="Libro de reclamaciones">
              <img
                src="https://baldecash.s3.amazonaws.com/company/libro-reclamaciones.png"
                alt="Libro de reclamaciones"
                className="h-12 w-auto"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
