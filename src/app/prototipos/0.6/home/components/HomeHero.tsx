'use client';

/**
 * HomeHero v0.6 - Hero con contenido dinámico desde backend
 * Estilo visual basado en v0.5
 */

import React from 'react';
import { Button, Chip } from '@nextui-org/react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { HeroConfig } from '../types/home';

interface HomeHeroProps {
  config?: HeroConfig | null;
  isLoading?: boolean;
  /** Altura del navbar + oferta bar para calcular offset */
  navbarHeight?: number;
}

// Skeleton del Hero mientras carga
const HeroSkeleton = () => (
  <div className="relative min-h-screen bg-neutral-900">
    {/* Skeleton background */}
    <div className="absolute inset-0 bg-neutral-800 animate-pulse" />
    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-transparent" />

    <div className="relative z-10 max-w-7xl mx-auto px-4 pt-32 pb-16 md:pt-40 md:pb-24 min-h-screen flex items-center">
      <div className="max-w-xl animate-pulse space-y-4">
        <div className="h-6 w-32 bg-neutral-700 rounded" />
        <div className="h-12 w-full bg-neutral-700 rounded" />
        <div className="h-12 w-3/4 bg-neutral-700 rounded" />
        <div className="h-6 w-2/3 bg-neutral-800 rounded mt-4" />
        <div className="h-24 w-48 bg-neutral-700/50 rounded-xl mt-6" />
        <div className="space-y-2 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-5 w-48 bg-neutral-800 rounded" />
          ))}
        </div>
        <div className="h-12 w-48 bg-neutral-700 rounded-xl mt-8" />
      </div>
    </div>
  </div>
);

export const HomeHero: React.FC<HomeHeroProps> = ({
  config,
  isLoading = false,
  navbarHeight = 104,
}) => {
  if (isLoading || !config) {
    return <HeroSkeleton />;
  }

  const { branding } = config;
  const primaryColor = branding?.primary_color || '#4654CD';

  const beneficios = [
    'Sin historial crediticio',
    'Aprobación en 24 horas',
    'Cuotas flexibles',
    'Sin aval requerido',
  ];

  return (
    <div className="relative min-h-screen">
      {/* Background image */}
      {config.background_url ? (
        <img
          src={config.background_url}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: config.background_color || '#1e3a5f' }}
        />
      )}

      {/* Gradient overlay - mismo estilo que 0.5 */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-transparent" />

      <div
        className="relative z-10 max-w-7xl mx-auto px-4 pb-16 md:pb-24 min-h-screen flex items-center"
        style={{ paddingTop: navbarHeight + 32 }}
      >
        <div className="grid lg:grid-cols-2 gap-8 items-center w-full">
          {/* Left: Text content */}
          <div className="max-w-xl">
            {/* Badge */}
            {config.offer ? (
              <Chip
                radius="sm"
                classNames={{
                  base: 'px-3 py-1 h-auto mb-4',
                  content: 'text-white text-xs font-medium',
                }}
                style={{
                  backgroundColor: config.offer.badge_bg_color || primaryColor,
                  color: config.offer.badge_color || '#FFFFFF',
                }}
              >
                {config.offer.badge}
              </Chip>
            ) : (
              <Chip
                radius="sm"
                classNames={{
                  base: 'px-3 py-1 h-auto mb-4',
                  content: 'text-white text-xs font-medium',
                }}
                style={{ backgroundColor: primaryColor }}
              >
                Financiamiento estudiantil
              </Chip>
            )}

            {/* Logo del convenio si existe */}
            {branding?.logo_url && (
              <img
                src={branding.logo_url}
                alt="Logo convenio"
                className="h-10 mb-4 object-contain"
              />
            )}

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 font-['Baloo_2']">
              {config.title}
            </h1>

            <p className="text-lg text-white/80 mb-6">
              {config.subtitle}
            </p>

            {/* Price highlight - estilo 0.5 */}
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-6 inline-block">
              <p className="text-white/60 text-sm mb-1">Cuotas desde</p>
              <p className="text-4xl font-bold text-white font-['Baloo_2']">
                S/99
                <span className="text-lg font-normal text-white/70">/mes</span>
              </p>
            </div>

            {/* Benefits list - estilo 0.5 */}
            <ul className="space-y-2 mb-8">
              {beneficios.map((beneficio, index) => (
                <li key={index} className="flex items-center gap-2 text-white/90">
                  <CheckCircle className="w-5 h-5 text-[#03DBD0] flex-shrink-0" />
                  <span>{beneficio}</span>
                </li>
              ))}
            </ul>

            {/* CTA - estilo 0.5 */}
            <div className="flex flex-wrap gap-4">
              <Button
                as="a"
                href={config.cta.url}
                size="lg"
                className="text-white font-bold rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                style={{ backgroundColor: primaryColor }}
                endContent={<ArrowRight className="w-5 h-5" />}
              >
                {config.cta.text}
              </Button>

              {config.secondary_cta && (
                <Button
                  as="a"
                  href={config.secondary_cta.url}
                  size="lg"
                  variant="bordered"
                  className="border-white/30 text-white font-semibold rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
                >
                  {config.secondary_cta.text}
                </Button>
              )}
            </div>
          </div>

          {/* Right: Hero image */}
          {config.image_url && (
            <div className="hidden lg:flex justify-end">
              <img
                src={config.image_url}
                alt="Hero"
                className="max-h-[500px] object-contain drop-shadow-2xl"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeHero;
