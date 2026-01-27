/**
 * Mock data para desarrollo - Home v0.6
 * Simula respuesta de: GET /api/landings/slug/{slug}/hero
 */

import { HeroConfig, HomeConfig } from '../types/home';

/**
 * Mock del hero para convenio UPN
 */
export const mockHeroUPN: HeroConfig = {
  title: 'Beneficio Exclusivo UPN',
  subtitle: 'Hasta 10% de descuento + TEA preferencial',
  image_url: 'https://cdn.baldecash.com/hero/upn-estudiante.png',
  background_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071',
  background_color: '#1E3A5F',
  offer: {
    badge: '10% OFF',
    badge_color: '#FFFFFF',
    badge_bg_color: '#E31837',
    text: 'Descuento exclusivo para alumnos y egresados UPN',
    text_color: '#FFFFFF',
  },
  cta: {
    text: 'Ver laptops',
    url: '#catalogo',
  },
  secondary_cta: {
    text: 'Calcular cuota',
    url: '#simulador',
  },
  branding: {
    logo_url: 'https://cdn.baldecash.com/logos/upn-white.svg',
    primary_color: '#E31837',
    secondary_color: '#1E3A5F',
  },
};

/**
 * Mock del hero genérico (sin convenio)
 */
export const mockHeroGeneral: HeroConfig = {
  title: 'Tu laptop ideal, a tu alcance',
  subtitle: 'Financiamiento flexible para estudiantes universitarios. Sin aval, sin complicaciones.',
  image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2071',
  background_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070',
  background_color: '#0a0a0a',
  offer: {
    badge: 'Nuevo',
    badge_color: '#FFFFFF',
    badge_bg_color: '#4654CD',
    text: 'Aprobación en 24 horas',
    text_color: '#FFFFFF',
  },
  cta: {
    text: 'Explorar catálogo',
    url: '#catalogo',
  },
  secondary_cta: {
    text: 'Simular cuota',
    url: '#simulador',
  },
  branding: {
    logo_url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png',
    primary_color: '#4654CD',
    secondary_color: '#1e1e2e',
  },
};

/**
 * Configuración completa del home con navbar offer derivada del hero
 */
export const mockHomeConfig: HomeConfig = {
  hero: mockHeroGeneral,
  navbarOffer: mockHeroGeneral.offer
    ? {
        enabled: true,
        badge: mockHeroGeneral.offer.badge,
        badge_color: mockHeroGeneral.offer.badge_color,
        badge_bg_color: mockHeroGeneral.offer.badge_bg_color,
        text: mockHeroGeneral.offer.text,
        text_color: mockHeroGeneral.offer.text_color,
        linkText: mockHeroGeneral.cta.text,
        linkUrl: mockHeroGeneral.cta.url,
        backgroundColor: mockHeroGeneral.branding.primary_color,
      }
    : { enabled: false, text: '' },
};

/**
 * Configuración para convenio UPN
 */
export const mockHomeConfigUPN: HomeConfig = {
  hero: mockHeroUPN,
  navbarOffer: mockHeroUPN.offer
    ? {
        enabled: true,
        badge: mockHeroUPN.offer.badge,
        badge_color: mockHeroUPN.offer.badge_color,
        badge_bg_color: mockHeroUPN.offer.badge_bg_color,
        text: mockHeroUPN.offer.text,
        text_color: mockHeroUPN.offer.text_color,
        linkText: mockHeroUPN.cta.text,
        linkUrl: mockHeroUPN.cta.url,
        backgroundColor: mockHeroUPN.branding.primary_color,
      }
    : { enabled: false, text: '' },
};
