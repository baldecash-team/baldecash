'use client';

/**
 * Footer - Completo con Newsletter + 4 columnas (basado en V2 de 0.4)
 * v0.6 - Conectado a API (datos dinámicos desde DB)
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { Facebook, Instagram, Linkedin, Phone, Send, AlertCircle, Check, Twitter, Youtube } from 'lucide-react';
import { Toast } from '@/app/prototipos/_shared';
import type { FooterData } from '../../types/hero';
import { routes, BASE_PATH } from '@/app/prototipos/0.6/utils/routes';
import { useEventTrackerOptional } from '@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext';


// TikTok icon component (not available in lucide-react)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// WhatsApp icon component (not available in lucide-react)
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// Icon map for dynamic social links
const socialIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: TikTokIcon,
};

interface FooterProps {
  data?: FooterData | null;
  landing?: string;
}

export const Footer: React.FC<FooterProps> = ({ data, landing = 'home' }) => {
  const tracker = useEventTrackerOptional();
  const heroUrl = routes.landingHome(landing || 'home');

  // Transform links: handle relative paths and build full URLs
  const transformLink = (href: string): string => {
    if (!href) return '#';

    // Skip external links, anchors, and already absolute paths
    if (href.startsWith('http') || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:')) {
      return href;
    }

    // If it's an absolute path starting with BASE_PATH, transform legacy format
    if (href.startsWith(`${BASE_PATH}/`)) {
      // Transform old legal paths to new dynamic paths with landing
      const legalMatch = href.match(new RegExp(`^${BASE_PATH.replace(/\//g, '\\/')}/legal/(.+)$`));
      if (legalMatch) {
        return routes.legal(landing, legalMatch[1]);
      }
      // Transform old proximamente path to new dynamic path with landing
      if (href === `${BASE_PATH}/proximamente` || href.startsWith(`${BASE_PATH}/proximamente`)) {
        return routes.proximamente(landing);
      }
      return href;
    }

    // Relative path: build full URL with landing base
    return `${heroUrl}/${href}`;
  };

  // Data from API (no fallbacks - data must come from backend)
  const columns = data?.columns;
  const tagline = data?.tagline;
  const sbsText = data?.sbs_text;
  const copyrightText = data?.copyright_text;
  const newsletterConfig = data?.newsletter;

  // Build social links from API data (no fallback - data must come from backend)
  const buildSocialLinks = () => {
    const companySocial = data?.company?.social_links;
    const componentSocial = data?.social_links;

    // If we have company social links, use those
    if (companySocial) {
      const links: { icon: React.ComponentType<{ className?: string }>; href: string; label: string }[] = [];
      if (companySocial.facebook) links.push({ icon: Facebook, href: companySocial.facebook, label: 'Facebook' });
      if (companySocial.instagram) links.push({ icon: Instagram, href: companySocial.instagram, label: 'Instagram' });
      if (companySocial.twitter) links.push({ icon: Twitter, href: companySocial.twitter, label: 'Twitter' });
      if (companySocial.linkedin) links.push({ icon: Linkedin, href: companySocial.linkedin, label: 'LinkedIn' });
      if (companySocial.youtube) links.push({ icon: Youtube, href: companySocial.youtube, label: 'YouTube' });
      if (companySocial.tiktok) links.push({ icon: TikTokIcon, href: companySocial.tiktok, label: 'TikTok' });
      return links;
    }

    // If we have component social links, use those
    if (componentSocial && componentSocial.length > 0) {
      return componentSocial
        .filter(s => s.url && socialIconMap[s.platform])
        .map(s => ({
          icon: socialIconMap[s.platform],
          href: s.url,
          label: s.platform.charAt(0).toUpperCase() + s.platform.slice(1),
        }));
    }

    // No fallback - return empty array
    return [];
  };

  const socialLinks = buildSocialLinks();

  // Logo URL from company - use white version for dark footer background
  const DEFAULT_LOGO_WHITE = 'https://baldecash.s3.amazonaws.com/company/logo.svg';
  const logoUrl = data?.company?.logo_white_url || DEFAULT_LOGO_WHITE;
  const [whatsapp, setWhatsapp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
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

    // Enviar a la API
    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';
      const response = await fetch(`${apiUrl}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: whatsapp,
          landing_slug: landing,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        tracker?.track('cta_click', { cta_name: 'newsletter_subscribe', location: 'footer' });
        setIsSuccess(true);
        setWhatsapp('');
        setTouched(false);
        setError(null);
      } else {
        setError(result.message || 'Error al registrar');
      }
    } catch (err) {
      console.error('[Newsletter] Error:', err);
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer
      className="bg-neutral-900 text-white"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Newsletter Section - Only render if newsletter is enabled */}
      {newsletterConfig?.enabled && (
        <div style={{ backgroundColor: 'var(--color-primary, #4654CD)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold mb-1">{newsletterConfig.title}</h3>
                <p className="text-white/80 text-sm">
                  {newsletterConfig.description}
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
                      ${validationState === 'default' ? 'border-transparent' : ''}
                    `}
                  >
                    <Phone className={`w-4 h-4 flex-shrink-0 ${validationState === 'error' ? 'text-[#ef4444]' : 'text-neutral-400'}`} />
                    <input
                      type="tel"
                      placeholder={newsletterConfig.placeholder}
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
                    className="bg-neutral-900 text-white font-semibold px-6 h-11 cursor-pointer hover:bg-neutral-800 transition-colors disabled:opacity-70 w-full sm:w-auto"
                    endContent={!isSubmitting && <Send className="w-4 h-4" />}
                    onPress={handleSubmit}
                    isLoading={isSubmitting}
                    isDisabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enviando...' : newsletterConfig.button_text}
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
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className={`grid grid-cols-2 gap-8 mb-10 ${
          // lg: 1 logo col + N link cols (safelist: lg:grid-cols-2 lg:grid-cols-3 lg:grid-cols-4 lg:grid-cols-5 lg:grid-cols-6)
          columns?.length === 1 ? 'md:grid-cols-2 lg:grid-cols-2'
          : columns?.length === 2 ? 'md:grid-cols-3 lg:grid-cols-3'
          : columns?.length === 3 ? 'md:grid-cols-4 lg:grid-cols-4'
          : columns?.length === 4 ? 'md:grid-cols-4 lg:grid-cols-5'
          : 'md:grid-cols-4 lg:grid-cols-5'
        }`}>
          {/* Logo Column - full width on mobile/tablet, single col on desktop */}
          <div className="col-span-full lg:col-span-1">
            <a href={heroUrl} className="inline-block mb-4">
              <img
                src={logoUrl}
                alt="BaldeCash"
                className="h-8 object-contain"
              />
            </a>
            <p className="text-sm text-neutral-400 mb-4">{tagline}</p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center transition-colors social-link-hover"
                  style={{ '--hover-bg': 'var(--color-primary, #4654CD)' } as React.CSSProperties}
                  aria-label={social.label}
                  onClick={() => tracker?.track('cta_click', { cta_name: `social_${social.label.toLowerCase()}`, href: social.href, location: 'footer' })}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary, #4654CD)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            {/* Contacto */}
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Contáctanos</p>
              {data?.company?.main_phone && (
                <a
                  href={`tel:${data.company.main_phone.replace(/\s/g, '')}`}
                  className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{data.company.main_phone}</span>
                </a>
              )}
              <a
                href="https://wa.me/51959324808"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-neutral-400 hover:text-[#25D366] transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4 flex-shrink-0" />
                <span>+51 959 324 808 · Soporte al Estudiante</span>
              </a>
              <a
                href="https://wa.me/51934240164"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-neutral-400 hover:text-[#25D366] transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4 flex-shrink-0" />
                <span>+51 934 240 164 · Cobranzas</span>
              </a>
            </div>
          </div>

          {/* Link Columns - Only render if columns exist */}
          {columns?.map((column) => (
            <div key={column.title}>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">{column.title}</h4>
              <ul className="space-y-2">
                {column.links.map((link) => {
                  const href = transformLink(link.href || '#');
                  const isInternalLink = href.startsWith('/') || href.startsWith('#');
                  return (
                    <li key={link.label}>
                      <a
                        href={href}
                        className="text-sm text-neutral-400 hover:text-white transition-colors"
                        onClick={() => tracker?.track('nav_click', { label: link.label, href, location: 'footer' })}
                        {...(!isInternalLink ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      >
                        {link.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">
            {copyrightText}
          </p>
          <div className="flex items-center gap-4">
            <p className="text-xs text-neutral-600">{sbsText}</p>
            <a
              href={transformLink('legal/libro-reclamaciones')}
              className="flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity"
              onClick={() => tracker?.track('nav_click', { label: 'libro_reclamaciones', location: 'footer' })}
              title="Libro de reclamaciones"
            >
              <img
                src="https://baldecash.s3.amazonaws.com/company/libro-reclamaciones.png"
                alt="Libro de reclamaciones"
                className="h-10 sm:h-12 w-auto max-w-[90px] object-contain"
              />
            </a>
          </div>
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
