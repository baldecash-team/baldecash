'use client';

/**
 * HeroCta - WhatsApp Directo + Ver productos (basado en V4 de 0.4)
 * Estilo: Verde WhatsApp, genera confianza y cercanía
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { Laptop, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { HeroCtaProps } from '../../types/hero';

const WhatsAppIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export const HeroCta: React.FC<HeroCtaProps> = ({ data, onCtaClick, onQuizOpen, landing = 'home', hasQuiz = true }) => {
  const router = useRouter();

  // Normalize landing to remove trailing slashes
  const normalizedLanding = landing.replace(/\/+$/, '');
  const heroUrl = `/prototipos/0.6/${normalizedLanding}`;

  // Transform links: handle relative paths and build full URLs
  const transformLink = (href: string | undefined, fallback: string): string => {
    if (!href) return `${heroUrl}/${fallback}`;

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

  // Check if a link is external
  const isExternalLink = (href: string): boolean => {
    return href.startsWith('http://') || href.startsWith('https://');
  };

  // Check if URL contains an anchor
  const isAnchorLink = (href: string): boolean => {
    return href.includes('#');
  };

  const catalogUrl = transformLink(data?.buttons.catalog.url, 'catalogo');
  const whatsappUrl = data?.buttons.whatsapp.url || '';

  const handleWhatsApp = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
    onCtaClick?.();
  };

  const handleCatalogo = () => {
    onCtaClick?.();

    if (isExternalLink(catalogUrl)) {
      // External - open in new tab
      window.open(catalogUrl, '_blank', 'noopener,noreferrer');
    } else if (isAnchorLink(catalogUrl)) {
      // Anchor - check if same page for smooth scroll
      const hashIndex = catalogUrl.indexOf('#');
      const anchor = catalogUrl.substring(hashIndex);
      const pathBeforeAnchor = catalogUrl.substring(0, hashIndex);
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
        router.push(catalogUrl);
      }
    } else {
      // Normal navigation
      router.push(catalogUrl);
    }
  };

  const handleQuiz = () => {
    onCtaClick?.();
    onQuizOpen?.();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button
          size="lg"
          radius="lg"
          className="text-white font-semibold w-52 h-14 text-base cursor-pointer transition-colors shadow-lg"
          style={{
            backgroundColor: 'var(--color-primary, #4654CD)',
            boxShadow: '0 10px 15px -3px color-mix(in srgb, var(--color-primary, #4654CD) 25%, transparent)',
          }}
          startContent={<Laptop className="w-5 h-5" />}
          onPress={handleCatalogo}
        >
          {data?.buttons.catalog.text || ''}
        </Button>
        {/* Quiz button - Solo mostrar si hay quiz asociado */}
        {hasQuiz && (
          <Button
            size="lg"
            radius="lg"
            className="text-white font-semibold w-52 h-14 text-base cursor-pointer transition-colors shadow-lg"
            style={{
              backgroundColor: 'var(--color-secondary, #03DBD0)',
              boxShadow: '0 10px 15px -3px color-mix(in srgb, var(--color-secondary, #03DBD0) 25%, transparent)',
            }}
            startContent={<HelpCircle className="w-5 h-5 flex-shrink-0" />}
            onPress={handleQuiz}
          >
            <span className="text-wrap text-left leading-tight">{data?.buttons.quiz.text || ''}</span>
          </Button>
        )}
        <Button
          size="lg"
          radius="lg"
          className="bg-[#25D366] text-white font-semibold w-52 h-14 text-base cursor-pointer hover:bg-[#20bd5a] transition-colors shadow-lg shadow-[#25D366]/25"
          startContent={<WhatsAppIcon />}
          onPress={handleWhatsApp}
        >
          {data?.buttons.whatsapp.text || ''}
        </Button>
      </div>
      <p className="text-sm text-neutral-400">
        {data?.responseTime || ''}
      </p>
    </div>
  );
};

export default HeroCta;
