// Mock Data for Hero Section - BaldeCash v0.3
// Generated from PROMPT_01_HERO_LANDING.md

import {
  SocialProofData,
  HeroContent,
  QuotaCalculatorConfig,
  NavItem,
  Institution,
} from '../types/hero';

// ============================================
// Navigation Items
// ============================================

export const mockNavItems: NavItem[] = [
  { label: 'Inicio', href: '/prototipos/0.3/hero', isActive: true },
  { label: 'Productos', href: '/prototipos/0.3/catalogo' },
  { label: 'Ofertas', href: '#ofertas' },
  { label: 'FAQ', href: '#faq' },
];

// ============================================
// Institutions Data
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
    specialConditions: '10% descuento en primera cuota',
  },
  {
    id: '2',
    code: 'UPC',
    name: 'Universidad Peruana de Ciencias Aplicadas',
    shortName: 'UPC',
    logo: '/logos/upc.png',
    hasAgreement: true,
    agreementType: 'convenio_marco',
  },
  {
    id: '3',
    code: 'USIL',
    name: 'Universidad San Ignacio de Loyola',
    shortName: 'USIL',
    logo: '/logos/usil.png',
    hasAgreement: true,
    agreementType: 'alianza',
  },
  {
    id: '4',
    code: 'UCAL',
    name: 'Universidad de Ciencias y Artes de América Latina',
    shortName: 'UCAL',
    logo: '/logos/ucal.png',
    hasAgreement: true,
  },
  {
    id: '5',
    code: 'SENATI',
    name: 'Servicio Nacional de Adiestramiento',
    shortName: 'SENATI',
    logo: '/logos/senati.png',
    hasAgreement: true,
    agreementType: 'convenio_especifico',
  },
  {
    id: '6',
    code: 'CIBERTEC',
    name: 'Instituto Cibertec',
    shortName: 'CIBERTEC',
    logo: '/logos/cibertec.png',
    hasAgreement: true,
  },
  {
    id: '7',
    code: 'CERTUS',
    name: 'Instituto Certus',
    shortName: 'CERTUS',
    logo: '/logos/certus.png',
    hasAgreement: true,
  },
  {
    id: '8',
    code: 'TECSUP',
    name: 'Instituto Tecsup',
    shortName: 'TECSUP',
    logo: '/logos/tecsup.png',
    hasAgreement: true,
    agreementType: 'convenio_marco',
  },
];

// ============================================
// Social Proof Data
// ============================================

export const mockSocialProof: SocialProofData = {
  studentCount: 10247,
  institutionCount: 32,
  yearsInMarket: 5,
  institutions: mockInstitutions,
  mediaLogos: [
    { name: 'RPP', logo: '/media/rpp.png', url: 'https://rpp.pe' },
    { name: 'Gestion', logo: '/media/gestion.png', url: 'https://gestion.pe' },
    { name: 'Forbes Peru', logo: '/media/forbes.png', url: 'https://forbes.pe' },
    { name: 'El Comercio', logo: '/media/elcomercio.png', url: 'https://elcomercio.pe' },
  ],
};

// ============================================
// Hero Content Variants
// ============================================

export const mockHeroContentV1: HeroContent = {
  headline: 'La laptop que necesitas',
  subheadline: 'Sin historial crediticio. Sin aval ni garante.',
  primaryCta: {
    text: 'Ver laptops disponibles',
    href: '/prototipos/0.3/catalogo',
    icon: 'Monitor',
    variant: 'primary',
  },
  secondaryCta: {
    text: 'Conocer requisitos',
    href: '#requisitos',
    icon: 'FileText',
    variant: 'outline',
  },
  minQuota: 49,
  trustSignals: [
    { icon: 'Shield', text: 'Registrados en SBS', tooltip: 'Empresa regulada por la Superintendencia de Banca y Seguros' },
    { icon: 'Clock', text: 'Aprobacion en 24h', tooltip: 'Respuesta garantizada en un dia habil' },
    { icon: 'CreditCard', text: 'Sin historial crediticio', tooltip: 'No necesitas historial en bancos tradicionales' },
  ],
};

export const mockHeroContentV2: HeroContent = {
  headline: 'Financiamiento para estudiantes',
  subheadline: 'Tu primera laptop sin necesidad de historial bancario',
  primaryCta: {
    text: 'Desde S/49/mes - Solicitar ahora',
    href: '/prototipos/0.3/solicitud',
    icon: 'CreditCard',
    variant: 'primary',
  },
  secondaryCta: {
    text: 'Como funciona?',
    href: '#como-funciona',
    icon: 'HelpCircle',
    variant: 'outline',
  },
  minQuota: 49,
  trustSignals: [
    { icon: 'Shield', text: 'Registrados en SBS' },
    { icon: 'Users', text: '+10,000 estudiantes' },
    { icon: 'Building', text: '32 instituciones aliadas' },
  ],
};

export const mockHeroContentV3: HeroContent = {
  headline: 'Tu equipo para estudiar',
  subheadline: 'Aprobacion en 24 horas. Sin aval ni garante.',
  primaryCta: {
    text: 'Descubre tu monto disponible',
    href: '/prototipos/0.3/precalificacion',
    icon: 'Calculator',
    variant: 'primary',
  },
  secondaryCta: {
    text: 'Hablar con un asesor',
    href: '#asesor',
    icon: 'MessageCircle',
    variant: 'outline',
  },
  minQuota: 49,
  trustSignals: [
    { icon: 'Zap', text: 'Proceso 100% digital' },
    { icon: 'Clock', text: 'Respuesta en 24h' },
    { icon: 'Lock', text: 'Datos protegidos' },
  ],
};

// ============================================
// Quota Calculator Config
// ============================================

export const mockQuotaCalculator: QuotaCalculatorConfig = {
  minAmount: 1000,
  maxAmount: 5000,
  defaultAmount: 2500,
  terms: [12, 18, 24, 36, 48],
  monthlyRate: 0.012, // 1.2% mensual
};

// ============================================
// Helper Functions
// ============================================

export const calculateQuota = (
  amount: number,
  term: number,
  monthlyRate: number
): number => {
  // Formula de cuota fija: C = P * [r(1+r)^n] / [(1+r)^n - 1]
  const r = monthlyRate;
  const n = term;
  const quota = amount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Math.ceil(quota);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('PEN', 'S/');
};
