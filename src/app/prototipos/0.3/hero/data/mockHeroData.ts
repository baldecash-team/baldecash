/**
 * Mock Data para Hero Section - BaldeCash Web 3.0
 */

import type {
  SocialProofData,
  HeroContent,
  QuotaCalculatorConfig,
  Institution,
  MenuItem,
  CTAButton
} from '../types/hero';

// ============================================
// INSTITUCIONES ALIADAS
// ============================================

export const mockInstitutions: Institution[] = [
  {
    id: '1',
    code: 'UPN',
    name: 'Universidad Privada del Norte',
    shortName: 'UPN',
    logo: '/logos/upn.png',
    hasAgreement: true,
    agreementType: 'convenio_marco',
    featured: true
  },
  {
    id: '2',
    code: 'UPC',
    name: 'Universidad Peruana de Ciencias Aplicadas',
    shortName: 'UPC',
    logo: '/logos/upc.png',
    hasAgreement: true,
    agreementType: 'convenio_marco',
    featured: true
  },
  {
    id: '3',
    code: 'USIL',
    name: 'Universidad San Ignacio de Loyola',
    shortName: 'USIL',
    logo: '/logos/usil.png',
    hasAgreement: true,
    agreementType: 'alianza',
    featured: true
  },
  {
    id: '4',
    code: 'UCAL',
    name: 'Universidad de Ciencias y Artes de América Latina',
    shortName: 'UCAL',
    logo: '/logos/ucal.png',
    hasAgreement: true,
    featured: true
  },
  {
    id: '5',
    code: 'SENATI',
    name: 'Servicio Nacional de Adiestramiento',
    shortName: 'SENATI',
    logo: '/logos/senati.png',
    hasAgreement: true
  },
  {
    id: '6',
    code: 'CIBERTEC',
    name: 'Instituto Cibertec',
    shortName: 'CIBERTEC',
    logo: '/logos/cibertec.png',
    hasAgreement: true
  },
  {
    id: '7',
    code: 'CERTUS',
    name: 'Instituto Certus',
    shortName: 'CERTUS',
    logo: '/logos/certus.png',
    hasAgreement: true
  },
  {
    id: '8',
    code: 'TECSUP',
    name: 'Instituto Tecsup',
    shortName: 'TECSUP',
    logo: '/logos/tecsup.png',
    hasAgreement: true
  },
];

// ============================================
// SOCIAL PROOF
// ============================================

export const mockSocialProof: SocialProofData = {
  studentCount: 5247,
  institutionCount: 32,
  yearsInMarket: 5,
  institutions: mockInstitutions,
  mediaLogos: [
    { name: 'RPP', logo: '/media/rpp.png', url: 'https://rpp.pe' },
    { name: 'Gestión', logo: '/media/gestion.png', url: 'https://gestion.pe' },
    { name: 'Forbes Perú', logo: '/media/forbes.png', url: 'https://forbes.pe' },
    { name: 'El Comercio', logo: '/media/elcomercio.png', url: 'https://elcomercio.pe' },
  ],
  reviews: [
    {
      name: 'María García',
      institution: 'UPN',
      rating: 5,
      comment: 'Gracias a BaldeCash pude tener mi laptop para estudiar ingeniería.',
      avatar: '/avatars/maria.jpg',
    },
    {
      name: 'Carlos Mendoza',
      institution: 'SENATI',
      rating: 5,
      comment: 'El proceso fue rápido y las cuotas se ajustan a mi presupuesto.',
      avatar: '/avatars/carlos.jpg',
    },
    {
      name: 'Ana Torres',
      institution: 'UPC',
      rating: 4,
      comment: 'Muy buen servicio, me aprobaron en menos de 24 horas.',
      avatar: '/avatars/ana.jpg',
    },
  ],
};

// ============================================
// HERO CONTENT - VERSIONES
// ============================================

// V1 - Enfoque en producto + precio
export const heroContentV1: HeroContent = {
  headline: 'La laptop que necesitas',
  subheadline: 'Financiamiento para estudiantes sin historial crediticio',
  primaryCta: {
    text: 'Ver laptops disponibles',
    href: '/prototipos/0.3/catalogo',
    variant: 'primary',
  },
  secondaryCta: {
    text: 'Conocer requisitos',
    href: '#requisitos',
    variant: 'outline',
  },
  minQuota: 49,
  trustSignals: [
    { icon: null, text: 'Registrados en SBS' },
    { icon: null, text: 'Aprobación en 24h' },
    { icon: null, text: 'Sin historial crediticio' },
  ],
};

// V2 - Enfoque en beneficio
export const heroContentV2: HeroContent = {
  headline: 'Financiamiento para estudiantes',
  subheadline: 'Sin historial crediticio. Sin aval. Sin complicaciones.',
  primaryCta: {
    text: 'Desde S/49/mes - Solicitar',
    href: '/prototipos/0.3/solicitud',
    variant: 'primary',
  },
  secondaryCta: {
    text: '¿Cómo funciona?',
    href: '#como-funciona',
    variant: 'outline',
  },
  minQuota: 49,
  trustSignals: [
    { icon: null, text: '5,000+ estudiantes financiados' },
    { icon: null, text: '32 instituciones aliadas' },
    { icon: null, text: 'Desde 2020' },
  ],
};

// V3 - Enfoque híbrido
export const heroContentV3: HeroContent = {
  headline: 'Tu equipo para estudiar',
  subheadline: 'Aprobación en 24 horas. Laptops desde S/49/mes.',
  primaryCta: {
    text: 'Descubre tu monto disponible',
    href: '/prototipos/0.3/pre-calificacion',
    variant: 'primary',
  },
  secondaryCta: {
    text: 'Hablar con un asesor',
    href: '#asesor',
    variant: 'outline',
  },
  minQuota: 49,
  trustSignals: [
    { icon: null, text: 'Sin burocracia' },
    { icon: null, text: '100% online' },
    { icon: null, text: 'Cuotas flexibles' },
  ],
};

// ============================================
// CALCULADORA
// ============================================

export const mockQuotaCalculator: QuotaCalculatorConfig = {
  minAmount: 1000,
  maxAmount: 5000,
  defaultAmount: 2500,
  terms: [12, 18, 24, 36, 48],
  monthlyRate: 0.012, // 1.2% mensual
};

// ============================================
// NAVEGACIÓN
// ============================================

export const mockMenuItems: MenuItem[] = [
  { label: 'Conócenos', href: '/conocenos' },
  { label: 'Productos', href: '/productos' },
  { label: 'Ofertas', href: '/ofertas' },
  { label: 'FAQ', href: '/faq' },
];

export const mockLoginCTA: CTAButton = {
  label: 'Zona Estudiantes',
  href: '/zona-estudiantes',
  isButton: true,
};

// ============================================
// MENSAJES DE BANNER INSTITUCIONAL
// ============================================

export const institutionalMessages = {
  convenio_marco: '¡Beneficios exclusivos para estudiantes de {institution}!',
  convenio_especifico: 'Condiciones especiales disponibles para {institution}',
  alianza: 'Alianza estratégica con {institution}',
  default: '¿Estudias en {institution}? Tenemos beneficios para ti',
};
