'use client';

/**
 * ConvenioFooter - Footer minimalista centrado con co-branding
 * Adaptado de v0.5 al sistema API-driven de v0.6
 * - Co-branded logos (BaldeCash × Institución)
 * - Links legales desde API
 * - Sin newsletter (más limpio para convenio)
 */

import React from 'react';
import type { FooterData, AgreementData } from '../../../types/hero';
import { routes } from '@/app/prototipos/0.6/utils/routes';

interface ConvenioFooterProps {
  data?: FooterData | null;
  agreementData: AgreementData;
  landing: string;
}

export const ConvenioFooter: React.FC<ConvenioFooterProps> = ({
  data,
  agreementData,
  landing,
}) => {
  const heroUrl = routes.landingHome(landing || 'home');
  const currentYear = new Date().getFullYear();

  const transformLink = (href: string): string => {
    if (!href) return '#';
    if (href.startsWith('http') || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:')) return href;
    if (href.startsWith('/prototipos/')) return href;
    return `${heroUrl}/${href}`;
  };

  // Logo from company data
  const DEFAULT_LOGO_WHITE = 'https://baldecash.s3.amazonaws.com/company/logo.svg';
  const logoUrl = data?.company?.logo_white_url || DEFAULT_LOGO_WHITE;

  // Get legal links from footer columns or use defaults
  const legalLinks: { label: string; href: string }[] = [];
  if (data?.columns) {
    // Flatten all links from all columns to find legal ones
    data.columns.forEach((col) => {
      col.links.forEach((link) => {
        if (
          link.label.toLowerCase().includes('término') ||
          link.label.toLowerCase().includes('privacidad') ||
          link.label.toLowerCase().includes('reclamacion')
        ) {
          legalLinks.push({ label: link.label, href: transformLink(link.href) });
        }
      });
    });
  }

  // Fallback legal links if none found
  if (legalLinks.length === 0) {
    legalLinks.push(
      { label: 'Términos y condiciones', href: routes.legal(landing, 'terminos-y-condiciones') },
      { label: 'Política de privacidad', href: routes.legal(landing, 'politica-de-privacidad') },
      { label: 'Libro de reclamaciones', href: routes.legal(landing, 'libro-reclamaciones') },
    );
  }

  return (
    <footer className="bg-neutral-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          {/* Co-branded Logos */}
          <div className="flex items-center gap-4 mb-6">
            <img
              src={logoUrl}
              alt="BaldeCash"
              className="h-8 object-contain"
            />
            <span className="text-neutral-500">×</span>
            {agreementData.institution_logo ? (
              <div className="bg-white rounded-lg px-3 py-1.5">
                <img
                  src={agreementData.institution_logo}
                  alt={agreementData.institution_name || 'Institución'}
                  className="h-5 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <span className="text-neutral-400 font-medium">
                {agreementData.institution_short_name || agreementData.institution_name}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-neutral-400 text-sm max-w-md mb-6">
            {data?.tagline}
          </p>

          {/* Legal Links */}
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
            {legalLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Divider */}
          <div className="w-full max-w-xs h-px bg-neutral-800 mb-6" />

          {/* Libro de reclamaciones */}
          <a
            href={transformLink('legal/libro-reclamaciones')}
            className="mb-4 opacity-80 hover:opacity-100 transition-opacity"
            title="Libro de reclamaciones"
          >
            <img
              src="https://baldecash.s3.amazonaws.com/company/libro-reclamaciones.png"
              alt="Libro de reclamaciones"
              className="h-18 w-auto"
            />
          </a>

          {/* SBS + Copyright */}
          {data?.sbs_text && (
            <p className="text-neutral-600 text-xs mb-2">{data.sbs_text}</p>
          )}
          <p className="text-neutral-500 text-xs">
            {data?.copyright_text}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default ConvenioFooter;
