'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Facebook, Instagram, Linkedin, Twitter, Youtube, Phone, MapPin } from 'lucide-react';
import { routes, BASE_PATH } from '@/app/prototipos/0.6/utils/routes';
import { ZONA_GAMER_ASSETS } from '@/app/prototipos/0.6/utils/assets';
import { getFooterData } from '@/app/prototipos/0.6/services/landingApi';
import type { FooterData } from '@/app/prototipos/0.6/types/hero';
import { useEventTrackerOptional } from '@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext';

interface GamerFooterProps {
  theme: 'dark' | 'light';
  footerData?: FooterData | null;
}

const LOGO_URL = `${ZONA_GAMER_ASSETS}/branding/logo-ofi.png`;
const LIBRO_RECLAMACIONES_IMG = 'https://baldecash.s3.amazonaws.com/company/libro-reclamaciones.png';
const WHATSAPP_SOPORTE = {
  number: '+51 959 324 808',
  href: 'https://wa.me/51959324808',
  label: 'Soporte al Estudiante',
};
const WHATSAPP_COBRANZAS = {
  number: '+51 934 240 164',
  href: 'https://wa.me/51934240164',
  label: 'Cobranzas',
};

const SOCIAL_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  x: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
};

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.05a8.27 8.27 0 004.76 1.5V7.12a4.83 4.83 0 01-1-.43z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function getSocialIcon(platform: string) {
  const key = platform.toLowerCase().trim();
  if (key === 'tiktok') return TikTokIcon;
  return SOCIAL_ICON_MAP[key] ?? null;
}

/**
 * Normaliza hrefs del backend:
 *  - externos / anchors / tel: / mailto: → tal cual
 *  - con BASE_PATH ya aplicado → tal cual
 *  - absolutos tipo "/home/catalogo" → reemplaza el landing y prefija BASE_PATH
 *  - relativos → prefija BASE_PATH + landing
 */
function transformFooterHref(href: string | undefined | null, landing: string | undefined): string {
  if (!href) return '#';
  if (/^(https?:|mailto:|tel:|#)/i.test(href)) return href;
  if (BASE_PATH && href.startsWith(`${BASE_PATH}/`)) return href;
  if (!landing) return href;

  const qIndex = href.indexOf('?');
  const pathPart = qIndex >= 0 ? href.slice(0, qIndex) : href;
  const queryPart = qIndex >= 0 ? href.slice(qIndex) : '';

  if (pathPart.startsWith('/')) {
    const segments = pathPart.split('/').filter(Boolean);
    if (segments.length === 0) return `${BASE_PATH}/${landing}${queryPart}`;
    const [, ...rest] = segments;
    const newPath = rest.length > 0 ? `/${landing}/${rest.join('/')}` : `/${landing}`;
    return `${BASE_PATH}${newPath}${queryPart}`;
  }

  return `${BASE_PATH}/${landing}/${href}${queryPart}`;
}

/**
 * Normaliza social_links: prioriza array del footer component,
 * fallback al objeto company.social_links.
 */
function resolveSocialLinks(data: FooterData | null): { platform: string; url: string }[] {
  if (!data) return [];
  if (data.social_links && data.social_links.length > 0) return data.social_links;

  const fromCompany = data.company?.social_links;
  if (!fromCompany) return [];

  const list: { platform: string; url: string }[] = [];
  (['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok'] as const).forEach((platform) => {
    const url = fromCompany[platform];
    if (url) list.push({ platform, url });
  });
  return list;
}

export function GamerFooter({ theme, footerData: footerDataProp }: GamerFooterProps) {
  const tracker = useEventTrackerOptional();
  const params = useParams();
  const landingSlug =
    (params?.landing as string | undefined) ||
    (Array.isArray(params?.slug)
      ? (params.slug[0] as string | undefined)
      : (params?.slug as string | undefined));

  const [fetchedFooter, setFetchedFooter] = useState<FooterData | null>(null);

  useEffect(() => {
    if (footerDataProp) return;
    if (!landingSlug) return;
    let cancelled = false;
    getFooterData(landingSlug).then((data) => {
      if (!cancelled) setFetchedFooter(data);
    });
    return () => {
      cancelled = true;
    };
  }, [landingSlug, footerDataProp]);

  const footerData = footerDataProp ?? fetchedFooter;

  const isDark = theme === 'dark';
  const neonCyan = isDark ? '#00ffd5' : '#00897a';
  const neonPurple = isDark ? '#6366f1' : '#4f46e5';
  const bgDark = isDark ? '#141414' : '#eaeaea';
  const border = isDark ? '#2a2a2a' : '#e0e0e0';
  const bgSurface = isDark ? '#1e1e1e' : '#f5f5f5';
  const textSecondary = isDark ? '#a0a0a0' : '#555';
  const textMuted = isDark ? '#707070' : '#888';
  const gradient = `linear-gradient(135deg, ${neonPurple}, ${neonCyan})`;

  const socials = resolveSocialLinks(footerData);
  const columns = footerData?.columns ?? [];
  const tagline = footerData?.tagline;
  const sbsText = footerData?.sbs_text;
  const copyrightText = footerData?.copyright_text;
  const contactTitle = footerData?.contact_title;
  const libroReclamacionesLabel = footerData?.libro_reclamaciones_label;
  const mainPhone = footerData?.company?.main_phone;
  const libroReclamacionesHref = landingSlug
    ? routes.legal(landingSlug, 'libro-reclamaciones')
    : undefined;

  return (
    <footer
      className="relative"
      style={{ background: bgDark, borderTop: `1px solid ${border}`, padding: '0 clamp(16px, 4vw, 24px)' }}
    >
      <div className="absolute top-0 left-0 right-0 h-px opacity-30" style={{ background: gradient }} />

      <div className="max-w-[1280px] mx-auto pt-12">
        <div className={`grid grid-cols-2 gap-6 sm:gap-8 mb-10 ${
          columns.length <= 1 ? 'sm:grid-cols-2 lg:grid-cols-2'
          : columns.length === 2 ? 'sm:grid-cols-3 lg:grid-cols-3'
          : columns.length === 3 ? 'sm:grid-cols-3 lg:grid-cols-4'
          : 'sm:grid-cols-3 lg:grid-cols-5'
        }`}>
          {/* Brand column */}
          <div className="col-span-full lg:col-span-1">
            <Image
              src={LOGO_URL}
              alt="BaldeCash"
              width={130}
              height={28}
              loading="lazy"
              className="object-contain mb-4"
              style={{ height: 32, width: 'auto' }}
            />
            {tagline && (
              <p className="text-[13px] mb-4" style={{ color: textMuted }}>
                {tagline}
              </p>
            )}

            {socials.length > 0 && (
              <div className="flex flex-wrap gap-2.5">
                {socials.map((s) => {
                  const Icon = getSocialIcon(s.platform);
                  if (!Icon) return null;
                  return (
                    <a
                      key={s.platform}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-[40px] h-[40px] sm:w-[34px] sm:h-[34px] rounded-full flex items-center justify-center no-underline transition-all hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                      style={{
                        background: bgSurface,
                        border: `1px solid ${border}`,
                        color: textSecondary,
                      }}
                      title={s.platform}
                      onClick={() => tracker?.track('cta_click', { cta_name: `social_${s.platform}`, href: s.url, location: 'footer' })}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4
                className="text-[11px] font-bold uppercase tracking-[2px] mb-4"
                style={{ fontFamily: "'Share Tech Mono', monospace", color: neonCyan }}
              >
                {col.title}
              </h4>
              <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={transformFooterHref(l.href, landingSlug)}
                      className="text-[13px] no-underline transition-colors hover:text-[#00ffd5]"
                      style={{ color: textSecondary }}
                      onClick={() => tracker?.track('nav_click', { label: l.label, href: l.href, location: 'footer' })}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contacto - Fila separada */}
        <div className="pt-6 mb-6" style={{ borderTop: `1px solid ${border}` }}>
          <p
            className="text-[11px] font-bold uppercase tracking-[2px] mb-3"
            style={{ fontFamily: "'Share Tech Mono', monospace", color: neonCyan }}
          >
            {contactTitle || 'Contáctanos'}
          </p>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-2">
            {mainPhone && (
              <a
                href={`tel:${mainPhone.replace(/\s+/g, '')}`}
                className="flex items-center gap-2 text-[13px] no-underline transition-colors"
                style={{ color: textSecondary }}
              >
                <Phone className="w-4 h-4 shrink-0" />
                <span>{mainPhone}</span>
              </a>
            )}
            <a
              href={WHATSAPP_SOPORTE.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[13px] no-underline transition-colors hover:text-[#25D366]"
              style={{ color: textSecondary }}
            >
              <WhatsAppIcon className="w-4 h-4 shrink-0" />
              <span>{WHATSAPP_SOPORTE.number} · {WHATSAPP_SOPORTE.label}</span>
            </a>
            <a
              href={WHATSAPP_COBRANZAS.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[13px] no-underline transition-colors hover:text-[#25D366]"
              style={{ color: textSecondary }}
            >
              <WhatsAppIcon className="w-4 h-4 shrink-0" />
              <span>{WHATSAPP_COBRANZAS.number} · {WHATSAPP_COBRANZAS.label}</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col gap-4 pt-6 py-5" style={{ borderTop: `1px solid ${border}` }}>
          {footerData?.company?.main_address && (
            <div className="flex items-center gap-2 text-[13px]" style={{ color: textMuted }}>
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{footerData.company.main_address}</span>
            </div>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
            {copyrightText && (
              <p className="text-xs" style={{ color: textMuted }}>
                {copyrightText}
              </p>
            )}
            <div className="flex items-center gap-4">
              {sbsText && (
                <p className="text-[11px]" style={{ color: 'rgba(85,85,119,0.6)' }}>
                  {sbsText}
                </p>
              )}
              {libroReclamacionesHref && (
                <a
                  href={libroReclamacionesHref}
                  title={libroReclamacionesLabel || 'Libro de reclamaciones'}
                  className="shrink-0 opacity-80 hover:opacity-100 transition-opacity"
                  onClick={() => tracker?.track('nav_click', { label: 'libro_reclamaciones', location: 'footer' })}
                >
                  <Image
                    src={LIBRO_RECLAMACIONES_IMG}
                    alt={libroReclamacionesLabel || 'Libro de reclamaciones'}
                    width={90}
                    height={48}
                    loading="lazy"
                    className="w-auto max-w-[90px] object-contain"
                    style={{ height: 'clamp(40px, 6vw, 48px)' }}
                  />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
