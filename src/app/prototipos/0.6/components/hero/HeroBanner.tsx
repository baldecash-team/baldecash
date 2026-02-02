'use client';

/**
 * HeroBanner - Foto Lifestyle Aspiracional (basado en V2 de 0.4)
 * Layout: Imagen fullwidth con overlay oscuro + texto izquierda
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Chip } from '@nextui-org/react';
import { ArrowRight, Shield, Users, Building } from 'lucide-react';
import { HeroBannerProps } from '../../types/hero';
import { formatMoney } from '@/app/prototipos/0.5/utils/formatMoney';

// Default background image (fallback)
const DEFAULT_HERO_IMAGE = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80';

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
  const catalogUrl = `/prototipos/0.6/${landing}/catalogo?device=laptop`;

  // Map icon names to components
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ElementType> = {
      shield: Shield,
      users: Users,
      building: Building,
    };
    return icons[iconName.toLowerCase()] || Shield;
  };

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Background Image */}
      <img
        src={imageSrc || DEFAULT_HERO_IMAGE}
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
              className="bg-[#03DBD0] text-neutral-900 font-semibold px-8 cursor-pointer hover:bg-[#02C3BA] transition-colors"
              endContent={<ArrowRight className="w-5 h-5" />}
              onPress={() => router.push(catalogUrl)}
            >
              {primaryCta?.text || ''}
            </Button>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap gap-6">
            {trustSignals.map((signal, index) => {
              const IconComponent = getIconComponent(signal.icon);
              return (
                <div key={index} className="flex items-center gap-2 text-white/80 text-sm">
                  <IconComponent className="w-5 h-5 text-[#03DBD0]" />
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
