'use client';

/**
 * ConvenioCta - CTA 2 columnas con WhatsApp + Quick Links + Precio
 * Adaptado de v0.5 al sistema API-driven de v0.6
 * - Fondo con color primario del landing
 * - WhatsApp directo
 * - Panel de quick-links a la derecha
 * - Recap de precio con descuento
 */

import React from 'react';
import Image from 'next/image';
import { ArrowRight, MessageCircle, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { CtaData, AgreementData, HeroContent, CtaQuickLink } from '../../../types/hero';
import { formatMoney } from '@/app/prototipos/0.5/utils/formatMoney';
import { routes } from '@/app/prototipos/0.6/utils/routes';

const AVATAR_COLORS = [
  '#4654CD', '#E85D75', '#03DBD0', '#F59E0B', '#8B5CF6',
  '#10B981', '#EC4899', '#3B82F6', '#F97316', '#6366F1',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

interface ConvenioCtaProps {
  ctaData: CtaData | null;
  agreementData: AgreementData;
  heroContent: HeroContent | null;
  landing: string;
}

export const ConvenioCta: React.FC<ConvenioCtaProps> = ({
  ctaData,
  agreementData,
  heroContent,
  landing,
}) => {
  const router = useRouter();
  const normalizedLanding = landing.replace(/\/+$/, '');
  const heroUrl = routes.landingHome(normalizedLanding);

  const transformLink = (href: string): string => {
    if (!href) return '#';
    if (href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:')) return href;
    if (href.startsWith('#')) return `${heroUrl}${href}`;
    if (href.startsWith('/prototipos/')) return href;
    return `${heroUrl}/${href}`;
  };

  const institutionShortName = agreementData.institution_short_name || agreementData.institution_name || '';
  const discountPct = agreementData.discount_percentage ? parseFloat(agreementData.discount_percentage) : 0;
  const whatsappUrl = ctaData?.buttons.whatsapp.url || '';

  // Quick links from config (editable from admin)
  const quickLinks: CtaQuickLink[] = ctaData?.quickLinks || [];

  const handleWhatsApp = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      className="py-12 sm:py-16 md:py-20 scroll-mt-24"
      style={{ backgroundColor: 'var(--color-primary, #4654CD)' }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          {/* Left: Text + WhatsApp */}
          <div className="text-white">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 font-['Baloo_2',_sans-serif] leading-tight">
              {ctaData?.sectionTitle}
            </h2>
            <p className="text-base sm:text-lg text-white/80 mb-5 sm:mb-6">
              {ctaData?.sectionSubtitle}
            </p>

            {/* Advisors — show when at least one advisor exists */}
            {ctaData?.advisors && ctaData.advisors.length > 0 && (
            <div className="flex items-center gap-4 mb-6 sm:mb-8">
              <div className="flex -space-x-3">
                {ctaData.advisors.map((advisor, i) => {
                  const initials = getInitials(advisor.name);
                  const bgColor = getAvatarColor(advisor.name || `Asesor ${i + 1}`);
                  return (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white overflow-hidden flex items-center justify-center"
                      style={!advisor.imageUrl ? { backgroundColor: bgColor } : undefined}
                    >
                      {advisor.imageUrl ? (
                        <Image
                          src={advisor.imageUrl}
                          alt={advisor.name || `Asesor ${i + 1}`}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-white">{initials}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div>
                <p className="text-sm text-white/90">Asesores en línea</p>
                <p className="text-xs text-white/60">
                  {ctaData?.responseTime}
                </p>
              </div>
            </div>
            )}

            {/* WhatsApp CTA */}
            <button
              onClick={handleWhatsApp}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white font-bold rounded-xl cursor-pointer hover:bg-[#20BD5A] transition-colors text-sm sm:text-base"
            >
              <MessageCircle className="w-5 h-5 flex-shrink-0" />
              <span className="break-words">{ctaData?.buttons.whatsapp.text}</span>
            </button>

            {ctaData?.phoneNumber && (
              <p className="text-white/60 text-xs sm:text-sm mt-4 flex items-center gap-2 break-words">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>También puedes llamar: {ctaData.phoneNumber}</span>
              </p>
            )}
          </div>

          {/* Right: Quick links + Price */}
          <div
            className="bg-white/10 rounded-2xl p-4 sm:p-6 md:p-8"
            style={{
              // backdrop-blur with explicit -webkit- prefix for older iOS Safari
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">También puedes:</h3>

            <div className="space-y-2 sm:space-y-3">
              {quickLinks.map((link, index) => {
                if (link.action === 'link') {
                  const linkUrl = transformLink(link.url || '');
                  return (
                    <a
                      key={index}
                      href={linkUrl}
                      onClick={(e) => {
                        if (!linkUrl.startsWith('http')) {
                          e.preventDefault();
                          router.push(linkUrl);
                        }
                      }}
                      className="w-full flex items-center justify-between gap-3 p-3 sm:p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
                    >
                      <span className="text-white text-sm sm:text-base break-words min-w-0">{link.text}</span>
                      <ArrowRight className="w-5 h-5 text-white flex-shrink-0" />
                    </a>
                  );
                }
                return (
                  <button
                    key={index}
                    onClick={() => handleScrollTo(link.target || '')}
                    className="w-full flex items-center justify-between gap-3 p-3 sm:p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
                  >
                    <span className="text-white text-sm sm:text-base break-words min-w-0 text-left">{link.text}</span>
                    <ArrowRight className="w-5 h-5 text-white flex-shrink-0" />
                  </button>
                );
              })}
            </div>

            {/* Price recap */}
            {heroContent && heroContent.minQuota > 0 && (
              <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-white/20 text-center">
                <p className="text-white/60 text-xs sm:text-sm mb-1">Cuotas desde</p>
                <p className="text-2xl sm:text-3xl font-bold text-white font-['Baloo_2',_sans-serif]">
                  S/{formatMoney(heroContent.minQuota)}{heroContent.quotaSuffix || '/mes'}
                </p>
                {discountPct > 0 && (
                  <p className="text-white/60 text-xs mt-1">
                    Con {discountPct}% de descuento
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConvenioCta;
