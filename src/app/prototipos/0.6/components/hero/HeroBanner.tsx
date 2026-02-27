'use client';

/**
 * HeroBanner - Foto Lifestyle Aspiracional (basado en V2 de 0.4)
 * Layout: Imagen fullwidth con overlay oscuro + texto izquierda
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Chip } from '@nextui-org/react';
import { ArrowRight, Shield, Users, Building, Clock, CreditCard, Truck, CheckCircle, Star, Heart, Zap, Headphones, Award } from 'lucide-react';
import { HeroBannerProps } from '../../types/hero';
import { formatMoney } from '@/app/prototipos/0.5/utils/formatMoney';

export const HeroBanner: React.FC<HeroBannerProps> = ({
  headline,
  subheadline,
  minQuota,
  imageSrc,
  primaryCta,
  trustSignals = [],
  badgeText,
  underlineStyle = 4,
  landing = 'home',
}) => {
  const router = useRouter();

  // Normalize landing to remove trailing slashes
  const normalizedLanding = landing.replace(/\/+$/, '');
  const heroUrl = `/prototipos/0.6/${normalizedLanding}`;

  // Transform links: handle relative paths and build full URLs
  const transformLink = (href: string): string => {
    if (!href) return '#';

    // External links and special protocols - return as-is
    if (href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:')) {
      return href;
    }

    // Anchors - prepend heroUrl for full path
    if (href.startsWith('#')) {
      return `${heroUrl}${href}`;
    }

    // If it's an absolute path starting with /prototipos, return as-is
    if (href.startsWith('/prototipos/')) {
      return href;
    }

    // Relative path: build full URL with landing base
    return `${heroUrl}/${href}`;
  };

  // Use primaryCta.href if available, otherwise empty (shows error if not configured)
  const ctaUrl = transformLink(primaryCta?.href || '');

  // Check if a link is external
  const isExternalLink = (href: string): boolean => {
    return href.startsWith('http://') || href.startsWith('https://');
  };

  // Check if URL contains an anchor
  const isAnchorLink = (href: string): boolean => {
    return href.includes('#');
  };

  // Handle CTA click - external links in new tab, anchors with smooth scroll
  const handleCtaClick = () => {
    if (isExternalLink(ctaUrl)) {
      window.open(ctaUrl, '_blank', 'noopener,noreferrer');
    } else if (isAnchorLink(ctaUrl)) {
      // Extract anchor from URL
      const hashIndex = ctaUrl.indexOf('#');
      const anchor = ctaUrl.substring(hashIndex);
      const pathBeforeAnchor = ctaUrl.substring(0, hashIndex);
      const currentPath = window.location.pathname;

      // Normalize paths for comparison
      const normalizePath = (path: string) => path.replace(/\/$/, '');
      const isOnTargetPage = pathBeforeAnchor && normalizePath(currentPath) === normalizePath(pathBeforeAnchor);

      if (isOnTargetPage) {
        // Same page - smooth scroll
        const element = document.querySelector(anchor);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        // Different page - navigate normally
        router.push(ctaUrl);
      }
    } else {
      router.push(ctaUrl);
    }
  };

  // Map icon names to components
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ElementType> = {
      shield: Shield,
      users: Users,
      building: Building,
      clock: Clock,
      creditcard: CreditCard,
      truck: Truck,
      checkcircle: CheckCircle,
      star: Star,
      heart: Heart,
      zap: Zap,
      headphones: Headphones,
      award: Award,
    };
    return icons[iconName.toLowerCase()] || Shield;
  };

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Background Image */}
      <img
        src={imageSrc}
        alt="Estudiantes trabajando"
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.opacity = '0';
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="max-w-2xl">
          {/* Badge */}
          {badgeText && (
            <Chip
              size="sm"
              radius="sm"
              classNames={{
                base: 'bg-white/20 backdrop-blur-sm px-3 py-1 h-auto mb-6',
                content: 'text-white text-xs font-medium',
              }}
            >
              {badgeText}
            </Chip>
          )}

          {/* Headline */}
          <h1 className="font-['Baloo_2'] text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {headline || ''}
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl">
            {subheadline}
          </p>

          {/* Price Highlight */}
          <div className="inline-flex items-baseline gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 mb-8">
            <span className="text-white/70 text-lg">Desde</span>
            <span className="text-4xl md:text-5xl font-bold text-white">S/{formatMoney(minQuota)}</span>
            <span className="text-white/70 text-lg">/mes</span>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Button
              size="lg"
              radius="lg"
              className="text-neutral-900 font-semibold px-8 cursor-pointer transition-colors"
              style={{
                backgroundColor: 'var(--color-secondary, #03DBD0)',
              }}
              endContent={<ArrowRight className="w-5 h-5" />}
              onPress={handleCtaClick}
            >
              {primaryCta?.text || ''}
            </Button>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap gap-6">
            {trustSignals
              .filter((signal) => signal.is_visible !== false)
              .map((signal, index) => {
                const IconComponent = getIconComponent(signal.icon);
                return (
                  <div key={index} className="flex items-center gap-2 text-white/80 text-sm">
                    <IconComponent className="w-5 h-5" style={{ color: 'var(--color-secondary, #03DBD0)' }} />
                    <span>{signal.text}</span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
