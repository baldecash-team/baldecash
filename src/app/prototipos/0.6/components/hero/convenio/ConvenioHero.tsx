'use client';

/**
 * ConvenioHero - Hero con imagen de campus para landings de convenio
 * Adaptado de v0.5 al sistema API-driven de v0.6
 * - Sin NextUI Button (usa tags nativos + Tailwind)
 * - Colores via CSS variables
 * - Datos desde API (no mock data)
 */

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowRight, CheckCircle, Shield, Users, Building, Clock, CreditCard, Truck, Star, Heart, Zap, Headphones, Award, Percent } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Chip } from '@nextui-org/react';
import type { HeroContent, AgreementData } from '../../../types/hero';
import { formatMoney } from '@/app/prototipos/0.5/utils/formatMoney';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { getContrastTextColor } from '@/app/prototipos/0.6/utils/colorContrast';

interface ConvenioHeroProps {
  heroContent: HeroContent;
  agreementData: AgreementData;
  landing: string;
  primaryColor?: string;
}

export const ConvenioHero: React.FC<ConvenioHeroProps> = ({
  heroContent,
  agreementData,
  landing,
  primaryColor,
}) => {
  const router = useRouter();
  const normalizedLanding = landing.replace(/\/+$/, '');
  const heroUrl = routes.landingHome(normalizedLanding);

  // Use mobile position/zoom on small screens if configured
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const hasMobileOverride = heroContent.mobilePositionX != null || heroContent.mobilePositionY != null || heroContent.mobileZoom != null;
  const posX = isMobile && hasMobileOverride ? (heroContent.mobilePositionX ?? 50) : (heroContent.backgroundPositionX ?? 50);
  const posY = isMobile && hasMobileOverride ? (heroContent.mobilePositionY ?? 50) : (heroContent.backgroundPositionY ?? 50);
  const zoomVal = isMobile && hasMobileOverride ? (heroContent.mobileZoom ?? 1.0) : (heroContent.backgroundZoom ?? 1);

  const transformLink = (href: string): string => {
    if (!href) return '#';
    if (href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:')) return href;
    if (href.startsWith('#')) return `${heroUrl}${href}`;
    if (href.startsWith('/prototipos/')) return href;
    return `${heroUrl}/${href}`;
  };

  const ctaUrl = transformLink(heroContent.primaryCta?.href || 'catalogo');
  const institutionShortName = agreementData.institution_short_name || agreementData.institution_name || '';

  // Benefits list from trust signals (fully managed from admin)
  const beneficios = (heroContent.trustSignals || [])
    .filter((signal) => signal.is_visible !== false);

  // Map icon names to components
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ElementType> = {
      shield: Shield, users: Users, building: Building, clock: Clock,
      creditcard: CreditCard, truck: Truck, checkcircle: CheckCircle,
      star: Star, heart: Heart, zap: Zap, headphones: Headphones,
      award: Award, percent: Percent,
    };
    return icons[iconName.toLowerCase()] || CheckCircle;
  };

  const ctaTextColor = getContrastTextColor(primaryColor || '#4654CD');

  const handleCtaClick = () => {
    if (ctaUrl.startsWith('http')) {
      window.open(ctaUrl, '_blank', 'noopener,noreferrer');
    } else {
      router.push(ctaUrl);
    }
  };

  return (
    <div
      className="relative overflow-hidden"
      style={{ height: 'calc(100svh - var(--header-total-height, 4rem))' }}
    >
      {/* Background image - next/image with priority for LCP optimization */}
      {heroContent.backgroundImage && (
        <Image
          src={heroContent.backgroundImage}
          alt="Campus universitario"
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{
            objectPosition: `${posX}% ${posY}%`,
            transform: zoomVal !== 1 ? `scale(${zoomVal})` : undefined,
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.opacity = '0';
          }}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex items-center">
        <div className="max-w-xl">
          {/* Badge */}
          <Chip
            radius="sm"
            classNames={{
              base: 'px-3 py-1 h-auto mb-4',
              content: 'text-xs font-medium',
            }}
            style={{ backgroundColor: 'var(--color-primary, #4654CD)', color: ctaTextColor }}
          >
            {heroContent.badgeText}
          </Chip>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 font-['Baloo_2']">
            {heroContent.headline}
          </h1>

          <p className="text-lg text-white/80 mb-6">
            {heroContent.subheadline}
          </p>

          {/* Price highlight */}
          {heroContent.minQuota > 0 && (
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-6 inline-block">
              <p className="text-white/60 text-sm mb-1">Cuotas desde</p>
              <p className="text-4xl font-bold text-white font-['Baloo_2']">
                S/{formatMoney(heroContent.minQuota)}
                <span className="text-lg font-normal text-white/70">/mes</span>
              </p>
            </div>
          )}

          {/* Benefits list */}
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
            {beneficios.map((signal, index) => {
              const IconComponent = getIconComponent(signal.icon);
              return (
                <li key={index} className="flex items-center gap-2 text-white/90">
                  <IconComponent className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-primary, #4654CD)' }} />
                  <span>{signal.text}</span>
                </li>
              );
            })}
          </ul>

          {/* CTA */}
          <button
            onClick={handleCtaClick}
            className="inline-flex items-center gap-2 px-8 py-3 font-bold rounded-xl cursor-pointer hover:opacity-90 transition-opacity text-lg"
            style={{ backgroundColor: 'var(--color-primary, #4654CD)', color: ctaTextColor }}
          >
            {heroContent.primaryCta?.text}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConvenioHero;
