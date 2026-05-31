'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Shield, Users, Building, Clock, CreditCard, Truck, CheckCircle, Star, Heart, Zap, Headphones, Award } from 'lucide-react';
import { Button, Chip } from '@nextui-org/react';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { HeroContent, BannerImage } from '../../types/hero';
import { useEventTrackerOptional } from '../../[landing]/solicitar/context/EventTrackerContext';

const getIconComponent = (iconName: string): React.ElementType => {
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

const formatMoney = (n: number) =>
  n % 1 === 0 ? n.toFixed(0) : n.toFixed(2);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

interface LeadHeroBannerProps {
  heroContent: HeroContent | null;
  bannerImages: BannerImage[];
  landing: string;
  primaryColor?: string;
  onCtaClick?: () => void;
  contained?: boolean;
}

export const LeadHeroBanner: React.FC<LeadHeroBannerProps> = ({
  heroContent,
  bannerImages,
  landing,
  primaryColor = '#4654CD',
  onCtaClick,
  contained = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [brands, setBrands] = useState<{ id: number; name: string; logo_url: string }[]>([]);
  const tracker = useEventTrackerOptional();

  useEffect(() => {
    fetch(`${API_BASE_URL}/public/landing/${landing}/filters`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setBrands((d.brands || []).filter((b: any) => b.logo_url)))
      .catch(() => {});
  }, [landing]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const images = bannerImages.length > 0 ? bannerImages : (
    heroContent?.backgroundImage ? [{
      url: heroContent.backgroundImage,
      mobile_url: heroContent.backgroundMobileImage,
      position_x: heroContent.backgroundPositionX,
      position_y: heroContent.backgroundPositionY,
      zoom: heroContent.backgroundZoom,
      mobile_position_x: heroContent.mobilePositionX,
      mobile_position_y: heroContent.mobilePositionY,
      mobile_zoom: heroContent.mobileZoom,
    }] : []
  );

  const goTo = useCallback((idx: number) => {
    const next = (idx + images.length) % images.length;
    setCurrentIndex(next);
    tracker?.track('lead_banner_slide_change', { from: currentIndex, to: next, total: images.length });
  }, [images.length, currentIndex, tracker]);

  const currentImage = images[currentIndex];
  const posX = (isMobile && currentImage?.mobile_position_x != null ? currentImage.mobile_position_x : currentImage?.position_x) ?? 50;
  const posY = (isMobile && currentImage?.mobile_position_y != null ? currentImage.mobile_position_y : currentImage?.position_y) ?? 50;
  const zoom = (isMobile && currentImage?.mobile_zoom != null ? currentImage.mobile_zoom : currentImage?.zoom) ?? 1.0;
  const imgSrc = (isMobile && currentImage?.mobile_url) ? currentImage.mobile_url : currentImage?.url;

  // Logos para marquee mobile / tarjetitas desktop
  const logos = brands.map((b) => ({ id: String(b.id), name: b.name, url: b.logo_url }));


  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* ── Imagen de fondo — 100% ancho ── */}
      <AnimatePresence mode="wait">
        {imgSrc ? (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <Image
              src={imgSrc}
              alt={currentImage?.alt || heroContent?.headline || 'Banner BaldeCash'}
              fill
              priority
              sizes="(max-width: 1023px) 100vw, 70vw"
              className="object-cover"
              style={{
                objectPosition: `${posX}% ${posY}%`,
                transform: zoom !== 1 ? `scale(${zoom})` : undefined,
                transformOrigin: 'center center',
              }}
            />
          </motion.div>
        ) : (
          /* Fallback: fondo sólido de marca cuando no hay imagen */
          <div className="absolute inset-0" style={{ backgroundColor: '#4247d2' }} />
        )}
      </AnimatePresence>

      {/* ── Overlay oscuro — igual que HeroBanner principal ── */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/20 sm:to-transparent" />

      {/* ── Carousel controls (solo si > 1 imagen) ── */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => goTo(currentIndex - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => goTo(currentIndex + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-20 lg:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="rounded-full transition-all cursor-pointer"
                style={{
                  width: i === currentIndex ? '24px' : '8px',
                  height: '8px',
                  backgroundColor: i === currentIndex ? '#ffffff' : 'rgba(255,255,255,0.4)',
                }}
                aria-label={`Ir a imagen ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* ── DESKTOP: Marcas — absolute en ambos modos ── */}
      {logos.length > 0 && (
        <div className={`hidden lg:block absolute bottom-8 z-20 ${contained ? 'left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' : 'left-10'}`}>
          <div style={{ width: 'min(560px, 55vw)' }}>
            <p className="text-white/70 text-xs font-['Asap',_sans-serif] mb-2 uppercase tracking-wider">Marcas disponibles</p>
            <div className="relative overflow-hidden group" style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)' }}>
              <div className="flex gap-3 group-hover:[animation-play-state:paused]" style={{ animation: 'lead-marquee 28s linear infinite', width: 'max-content' }}>
                {[...logos, ...logos].map((logo, i) => (
                  <div key={`${logo.id}-${i}`} className="bg-white rounded-xl shadow-md flex items-center justify-center px-3 py-2 flex-shrink-0" style={{ minWidth: '72px', height: '44px' }}>
                    <img src={logo.url} alt={logo.name} className="max-h-6 max-w-[56px] object-contain grayscale hover:grayscale-0 transition-all"
                      onError={(e) => { const t = e.target as HTMLImageElement; t.style.display = 'none'; const span = document.createElement('span'); span.className = 'text-[10px] font-bold text-neutral-500'; span.textContent = logo.name; t.parentNode?.appendChild(span); }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE: Marcas — absolute bottom ── */}
      {logos.length > 0 && (
        <div className="lg:hidden absolute bottom-6 left-0 right-0 z-20 px-4">
          <p className="text-white/70 text-xs font-['Asap',_sans-serif] mb-2 uppercase tracking-wider">Marcas disponibles</p>
          <div
            className="relative overflow-hidden"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
            }}
          >
            <div className="flex gap-2" style={{ animation: 'lead-marquee 18s linear infinite', width: 'max-content' }}>
              {[...logos, ...logos].map((logo, i) => (
                <div
                  key={`${logo.id}-${i}`}
                  className="bg-white rounded-xl shadow-md flex items-center justify-center px-3 flex-shrink-0"
                  style={{ height: '36px', minWidth: '56px' }}
                >
                  <img
                    src={logo.url}
                    alt={logo.name}
                    className="max-h-5 max-w-[44px] object-contain grayscale hover:grayscale-0 transition-all"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Texto hero — visible en mobile y desktop ── */}
      <div className={`relative z-10 h-full flex items-center py-8 sm:py-12 overflow-hidden ${contained ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full' : 'px-6 lg:px-10'}`}>
        <div className="w-full max-w-2xl">
          {/* Badge */}
          {heroContent?.badgeText && (
            <Chip
              size="sm"
              radius="sm"
              classNames={{
                base: 'bg-white/20 backdrop-blur-sm px-3 py-1 h-auto mb-4 sm:mb-6',
                content: 'text-white text-xs font-medium',
              }}
            >
              {heroContent.badgeText}
            </Chip>
          )}

          {/* Headline */}
          {heroContent?.headline && (
            <h1 className="font-['Baloo_2',_sans-serif] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 sm:mb-6">
              {heroContent.headline}
            </h1>
          )}

          {/* Subheadline */}
          {heroContent?.subheadline && (
            <p className="text-base sm:text-lg md:text-xl text-white/80 mb-6 sm:mb-8 max-w-xl">
              {heroContent.subheadline}
            </p>
          )}

          {/* Price Highlight */}
          {heroContent?.minQuota != null && heroContent.minQuota > 0 && (
            <div className="inline-flex items-baseline gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 sm:px-6 sm:py-4 mb-6 sm:mb-8">
              <span className="text-white/70 text-sm sm:text-lg">Desde</span>
              <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">S/{formatMoney(heroContent.minQuota)}</span>
              <span className="text-white/70 text-sm sm:text-lg">{heroContent.quotaSuffix || '/mes'}</span>
            </div>
          )}

          {/* CTA */}
          {heroContent?.primaryCta?.text && (
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-8">
              <Button
                size="lg"
                radius="lg"
                className="text-neutral-900 font-semibold px-4 sm:px-8 cursor-pointer transition-colors w-full sm:w-auto"
                style={{ backgroundColor: 'var(--color-secondary, #03DBD0)' }}
                endContent={<ArrowRight className="w-5 h-5" />}
                onPress={() => onCtaClick ? onCtaClick() : (() => {
                  const formEl = document.getElementById('lead-form');
                  if (formEl) {
                    formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    const firstInput = formEl.querySelector<HTMLInputElement>('input, select, textarea');
                    if (firstInput) setTimeout(() => firstInput.focus(), 400);
                  }
                })()}
              >
                {heroContent.primaryCta.text}
              </Button>
            </div>
          )}

          {/* Trust Signals */}
          {heroContent?.trustSignals && heroContent.trustSignals.filter((s) => s.is_visible !== false).length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-2 sm:gap-4 md:gap-6 mb-6">
              {heroContent.trustSignals
                .filter((s) => s.is_visible !== false)
                .map((signal, i) => {
                  const IconComponent = getIconComponent(signal.icon);
                  return (
                    <div key={i} className="flex items-center gap-2 text-white/80 text-xs sm:text-sm">
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: 'var(--color-secondary, #03DBD0)' }} />
                      <span>{signal.text}</span>
                    </div>
                  );
                })}
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
