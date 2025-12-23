// Convenio Types - BaldeCash v0.4
// Generated from PROMPT_17_LANDING_CONVENIOS.md
// 6 versiones por componente para A/B testing

import { ReactNode } from 'react';

// ============================================
// Configuration Types (6 versions each)
// ============================================

export type ConvenioVersion = 1 | 2 | 3 | 4 | 5 | 6;

export interface ConvenioConfig {
  navbarVersion: ConvenioVersion;
  heroVersion: ConvenioVersion;
  benefitsVersion: ConvenioVersion;
  testimonialsVersion: ConvenioVersion;
  faqVersion: ConvenioVersion;
  ctaVersion: ConvenioVersion;
  footerVersion: ConvenioVersion;
}

export const defaultConvenioConfig: ConvenioConfig = {
  navbarVersion: 3,
  heroVersion: 2,
  benefitsVersion: 1,
  testimonialsVersion: 1,
  faqVersion: 2,
  ctaVersion: 6,
  footerVersion: 2,
};

// ============================================
// Convenio Data Types
// ============================================

export interface ConvenioData {
  slug: string;
  nombre: string;
  nombreCorto: string;
  logo: string;
  logoBanner?: string;
  colorPrimario: string;
  colorSecundario: string;
  descuentoCuota: number; // porcentaje (ej: 10 = 10%)
  descuentoInicial?: number;
  mensajeExclusivo: string;
  dominioEmail: string; // certus.edu.pe
  activo: boolean;
  fechaInicio: string;
  fechaFin: string | null;
  campusImage?: string;
  tipo: 'instituto' | 'universidad';
}

// ============================================
// Testimonial Types (Convenio-specific)
// ============================================

export interface ConvenioTestimonial {
  id: string;
  nombre: string;
  carrera: string;
  universidad: string; // slug del convenio
  testimonio: string;
  foto?: string;
  rating?: number;
  equipoComprado?: string;
  fechaCompra?: string;
}

// ============================================
// FAQ Types (Convenio-specific)
// ============================================

export interface ConvenioFaqItem {
  id: string;
  pregunta: string;
  respuesta: string;
  categoria?: 'descuento' | 'verificacion' | 'proceso' | 'entrega' | 'general';
}

// ============================================
// Benefit Types
// ============================================

export interface ConvenioBenefit {
  id: string;
  icon: string;
  titulo: string;
  descripcion: string;
}

// ============================================
// Product Card Types (with convenio discount)
// ============================================

export interface ProductoConvenio {
  id: string;
  slug: string;
  nombre: string;
  imagen: string;
  cuotaMensual: number; // cuota sin descuento
  precioTotal: number;
  marca: string;
  destacado?: boolean;
}

// ============================================
// Component Props Types
// ============================================

export interface ConvenioNavbarProps {
  convenio: ConvenioData;
  onVerEquipos?: () => void;
}

export interface ConvenioHeroProps {
  convenio: ConvenioData;
  cuotaDesde?: number;
  onVerEquipos?: () => void;
}

export interface ConvenioBenefitsProps {
  convenio: ConvenioData;
  benefits?: ConvenioBenefit[];
}

export interface ConvenioTestimonialsProps {
  convenio: ConvenioData;
  testimonios?: ConvenioTestimonial[];
}

export interface ConvenioFaqProps {
  convenio: ConvenioData;
  faqs?: ConvenioFaqItem[];
}

export interface ConvenioCtaProps {
  convenio: ConvenioData;
  cuotaDesde?: number;
  onVerEquipos?: () => void;
  showCountdown?: boolean;
}

export interface ConvenioFooterProps {
  convenio: ConvenioData;
}

export interface ConvenioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ConvenioConfig;
  onConfigChange: (config: ConvenioConfig) => void;
  convenio: ConvenioData;
  onConvenioChange: (convenio: ConvenioData) => void;
  conveniosList: ConvenioData[];
}

// ============================================
// Countdown Types
// ============================================

export interface CountdownData {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
}

// ============================================
// Calculator Types (with discount)
// ============================================

export interface ConvenioCalculatorResult {
  cuotaOriginal: number;
  cuotaConDescuento: number;
  ahorroPorCuota: number;
  ahorroTotal: number;
  plazo: number;
}

// ============================================
// Version Descriptions (for Settings Modal)
// ============================================

export const versionDescriptions = {
  navbar: {
    1: 'Logos lado a lado + badge convenio',
    2: 'Logo BaldeCash con acento de color universidad',
    3: 'Navbar con banner de descuento flotante',
    4: 'Navbar minimalista con CTA prominente',
    5: 'Navbar con countdown de oferta',
    6: 'Navbar con barra de progreso de cupos',
  },
  hero: {
    1: 'Hero Clásico Co-branded (producto + colores)',
    2: 'Hero con Video/Foto de Campus',
    3: 'Hero Split con Calculadora',
    4: 'Hero Centrado con Logo Grande',
    5: 'Hero con Countdown de Urgencia',
    6: 'Hero con Carrusel de Equipos',
  },
  benefits: {
    1: 'Cards Grid (iconos circulares)',
    2: 'Lista vertical con iconos',
    3: 'Cards horizontales (2 columnas)',
    4: 'Timeline de beneficios',
    5: 'Cards con gradiente sutil',
    6: 'Tabs de beneficios',
  },
  testimonials: {
    1: 'Cards Grid (3 columnas)',
    2: 'Carrusel deslizable',
    3: 'Testimonial destacado + thumbnails',
    4: 'Video testimonials',
    5: 'Cards con foto grande',
    6: 'Masonry layout',
  },
  faq: {
    1: 'Acordeón simple',
    2: 'Acordeón con iconos de categoría',
    3: 'Grid de cards expandibles',
    4: 'Tabs por categoría',
    5: 'Búsqueda + acordeón',
    6: 'Chatbot conversacional style',
  },
  cta: {
    1: 'CTA simple con botón grande',
    2: 'CTA con calculadora inline',
    3: 'CTA con countdown urgencia',
    4: 'CTA split (info + botón)',
    5: 'CTA con cupos limitados',
    6: 'CTA con WhatsApp directo',
  },
  footer: {
    1: 'Footer clásico 4 columnas',
    2: 'Footer minimalista centrado',
    3: 'Footer con newsletter',
    4: 'Footer con mapa y contacto',
    5: 'Footer con redes sociales destacadas',
    6: 'Footer con app download CTA',
  },
} as const;
