/**
 * Types para Home v0.6 - Integración Backend
 * TODO ES CONFIGURABLE - nada hardcodeado
 */

/**
 * Trust Signal (ej: "Registrados en SBS")
 */
export interface TrustSignal {
  icon: string;  // nombre del icono: "shield", "users", "building"
  text: string;
}

/**
 * Configuración del precio
 */
export interface PriceConfig {
  prefix: string;      // "Desde"
  amount: number;      // 49
  currency: string;    // "S/"
  suffix: string;      // "/mes"
}

/**
 * Configuración del CTA
 */
export interface HeroCTA {
  text: string;
  url: string;
  color?: string;       // Color del botón
  text_color?: string;  // Color del texto
}

/**
 * Configuración de la barra de promoción
 */
export interface PromoBarConfig {
  enabled: boolean;
  strong_text?: string;
  text: string;
  link_text?: string;
  link_url?: string;
  background_gradient_from?: string;
  background_gradient_to?: string;
  icon_color?: string;  // Color del icono Zap
}

/**
 * Configuración de la oferta/badge del hero (LEGACY)
 */
export interface HeroOffer {
  badge: string;
  badge_color: string;
  badge_bg_color: string;
  text: string;
  text_color: string;
  linkText?: string;
  linkUrl?: string;
}

/**
 * Branding específico de la landing
 */
export interface HeroBranding {
  logo_url?: string;
  primary_color: string;
  secondary_color?: string;
  accent_color?: string;  // Color de acentos (turquesa por defecto)
}

/**
 * Info de la landing desde el API
 */
export interface LandingInfo {
  id: number;
  nombre: string;
  slug: string;
  url: string | null;
  institucion_label: string | null;
}

/**
 * Respuesta del endpoint GET /api/v1/landings/slug/{slug}/hero
 * ESTRUCTURA COMPLETA - TODO CONFIGURABLE
 */
export interface HeroAPIResponse {
  // Textos principales
  title: string;
  subtitle: string;
  badge_text: string;

  // Precio
  price: PriceConfig;
  // Legacy: min_quota (para compatibilidad)
  min_quota?: number;

  // Visual
  background_url: string;
  background_color: string;

  // CTAs
  cta: HeroCTA;
  secondary_cta?: HeroCTA;

  // Trust signals
  trust_signals: TrustSignal[];

  // Promo bar
  promo_bar: PromoBarConfig | null;

  // Branding/colores
  branding?: HeroBranding;

  // Legacy
  offer?: HeroOffer | null;
  image_url?: string;

  // Metadata
  landing: LandingInfo;
}

/**
 * Configuración del Hero procesada para el componente
 */
export interface HeroConfig {
  title: string;
  subtitle: string;
  badge_text?: string;

  // Precio
  price?: PriceConfig;
  min_quota?: number;

  // Visual
  image_url?: string;
  background_url: string;
  background_color: string;

  // CTAs
  cta: HeroCTA;
  secondary_cta?: HeroCTA;

  // Trust signals
  trust_signals?: TrustSignal[];

  // Promo bar
  promo_bar?: PromoBarConfig | null;

  // Branding
  branding: HeroBranding;

  // Legacy
  offer?: HeroOffer | null;

  // Metadata
  landing?: LandingInfo;
}

/**
 * Configuración de la oferta del navbar (LEGACY)
 */
export interface NavbarOfferConfig {
  enabled: boolean;
  badge?: string;
  badge_color?: string;
  badge_bg_color?: string;
  text: string;
  text_color?: string;
  linkText?: string;
  linkUrl?: string;
  backgroundColor?: string;
}

/**
 * Configuración completa del Home
 */
export interface HomeConfig {
  hero: HeroConfig;
  navbarOffer?: NavbarOfferConfig;
}

/**
 * Estado del hook useHomeConfig
 */
export interface HomeConfigState {
  config: HomeConfig | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Respuesta del endpoint de configuración
 */
export interface HeroConfigResponse {
  success?: boolean;
  data?: HeroConfig;
  error?: string;
  title?: string;
}
