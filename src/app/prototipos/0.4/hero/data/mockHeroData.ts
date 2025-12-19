// Mock Data for Hero Section - BaldeCash v0.4
// Generated from PROMPT_01_HERO_LANDING.md

import {
  SocialProofData,
  HeroContent,
  QuotaCalculatorConfig,
  NavItem,
  Institution,
  FooterData,
  Testimonial,
  TimelineStep,
} from '../types/hero';

// ============================================
// Navigation Items
// ============================================

export const mockNavItems: NavItem[] = [
  { label: 'Inicio', href: '/prototipos/0.4/hero', isActive: true },
  { label: 'Laptops', href: '/prototipos/0.4/catalogo' },
  { label: 'Como funciona', href: '#como-funciona' },
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
    logo: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c972324b38a6a21133bad_2%20UPN%202.png',
    hasAgreement: true,
    agreementType: 'convenio_marco',
    specialConditions: '10% descuento en primera cuota',
  },
  {
    id: '2',
    code: 'UPC',
    name: 'Universidad Peruana de Ciencias Aplicadas',
    shortName: 'UPC',
    logo: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c97232b703bfd964ee870_universidad-peruana-de-ciencias-aplicadas-upc-logo-B98C3A365C-seeklogo%201.png',
    hasAgreement: true,
    agreementType: 'convenio_marco',
  },
  {
    id: '3',
    code: 'UTP',
    name: 'Universidad Tecnologica del Peru',
    shortName: 'UTP',
    logo: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c97244b484a7cf98bd37a_Vector.png',
    hasAgreement: true,
    agreementType: 'convenio_marco',
  },
  {
    id: '4',
    code: 'UCAL',
    name: 'Universidad de Ciencias y Artes de America Latina',
    shortName: 'UCAL',
    logo: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c9724ce86b4d16858024d_11%20UCAL%201.png',
    hasAgreement: true,
  },
  {
    id: '5',
    code: 'SENATI',
    name: 'Servicio Nacional de Adiestramiento',
    shortName: 'SENATI',
    logo: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c97241f715c1e9ac6dfcb_4%20Senati%201.png',
    hasAgreement: true,
    agreementType: 'convenio_especifico',
  },
  {
    id: '6',
    code: 'CIBERTEC',
    name: 'Instituto Cibertec',
    shortName: 'CIBERTEC',
    logo: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c77a9b79d511938e74125_6%20Cibertec%201.png',
    hasAgreement: true,
  },
  {
    id: '7',
    code: 'CERTUS',
    name: 'Instituto Certus',
    shortName: 'CERTUS',
    logo: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c77a99272a25a2e81ae6a_certus%202.png',
    hasAgreement: true,
  },
  {
    id: '8',
    code: 'TECSUP',
    name: 'Instituto Tecsup',
    shortName: 'TECSUP',
    logo: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c97247f31ad0cf1646031_8%20TECSUP%202.png',
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

export const mockHeroContent: HeroContent = {
  headline: 'Tu laptop para estudiar',
  subheadline: 'Sin historial crediticio. Sin aval ni garante. Aprobacion en 24 horas.',
  primaryCta: {
    text: 'Ver laptops disponibles',
    href: '/prototipos/0.4/catalogo',
    icon: 'Monitor',
    variant: 'primary',
  },
  secondaryCta: {
    text: 'Como funciona',
    href: '#como-funciona',
    icon: 'HelpCircle',
    variant: 'outline',
  },
  minQuota: 49,
  trustSignals: [
    { icon: 'Shield', text: 'Registrados en SBS', tooltip: 'Empresa regulada por la Superintendencia de Banca y Seguros' },
    { icon: 'Clock', text: 'Aprobacion en 24h', tooltip: 'Respuesta garantizada en un dia habil' },
    { icon: 'CreditCard', text: 'Sin historial crediticio', tooltip: 'No necesitas historial en bancos tradicionales' },
  ],
};

// ============================================
// Testimonials
// ============================================

export const mockTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Maria Garcia',
    institution: 'UPN',
    quote: 'Gracias a BaldeCash pude terminar mi tesis a tiempo. El proceso fue super rapido.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    rating: 5,
  },
  {
    id: '2',
    name: 'Carlos Rodriguez',
    institution: 'UPC',
    quote: 'Nunca pense que podria tener mi propia laptop. BaldeCash lo hizo posible.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    rating: 5,
  },
  {
    id: '3',
    name: 'Ana Torres',
    institution: 'SENATI',
    quote: 'El financiamiento me permitio concentrarme en mis estudios sin preocuparme.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    rating: 5,
  },
];

// ============================================
// Timeline Steps
// ============================================

export const mockTimelineSteps: TimelineStep[] = [
  { id: 1, title: 'Elige tu laptop', description: 'Explora nuestro catalogo', icon: 'Monitor' },
  { id: 2, title: 'Solicita en 5 min', description: 'Proceso 100% digital', icon: 'FileText' },
  { id: 3, title: 'Aprobacion 24h', description: 'Respuesta garantizada', icon: 'Clock' },
  { id: 4, title: 'Recibe y estudia', description: 'Envio a todo el Peru', icon: 'Package' },
];

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
// Stats Data
// ============================================

export const mockStats = {
  laptops: { value: 10000, label: 'laptops financiadas', suffix: '+' },
  convenios: { value: 32, label: 'convenios educativos', suffix: '' },
  aprobacion: { value: 24, label: 'horas de aprobacion', suffix: 'h' },
  satisfaccion: { value: 98, label: 'satisfaccion', suffix: '%' },
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

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('es-PE').format(num);
};

// ============================================
// Footer Data
// ============================================

export const mockFooterData: FooterData = {
  logo: { text: 'BaldeCash', tagline: 'Financiamiento estudiantil en Peru' },
  navigation: [
    {
      title: 'Productos',
      links: [
        { label: 'Laptops', href: '/prototipos/0.4/catalogo' },
        { label: 'Financiamiento', href: '#financiamiento' },
        { label: 'Calculadora', href: '#calculadora' },
      ],
    },
    {
      title: 'Soporte',
      links: [
        { label: 'Centro de ayuda', href: '#ayuda' },
        { label: 'FAQ', href: '#faq' },
        { label: 'Contacto', href: '#contacto' },
      ],
    },
    {
      title: 'Empresa',
      links: [
        { label: 'Sobre nosotros', href: '#nosotros' },
        { label: 'Alianzas', href: '#alianzas' },
        { label: 'Blog', href: '#blog' },
      ],
    },
  ],
  social: [
    { platform: 'instagram', url: 'https://instagram.com/baldecash', label: 'Instagram' },
    { platform: 'facebook', url: 'https://facebook.com/baldecash', label: 'Facebook' },
    { platform: 'tiktok', url: 'https://tiktok.com/@baldecash', label: 'TikTok' },
    { platform: 'whatsapp', url: 'https://wa.me/51999999999', label: 'WhatsApp' },
  ],
  contact: { phone: '+51 1 234 5678', whatsapp: '+51 999 999 999', email: 'hola@baldecash.com' },
  certifications: [
    { name: 'SBS', icon: 'Shield', description: 'Regulados por la SBS' },
    { name: 'SSL', icon: 'Lock', description: 'Conexion segura' },
    { name: '5 anos', icon: 'Award', description: '5 anos en el mercado' },
  ],
  legal: {
    copyright: '© 2025 BaldeCash. Todos los derechos reservados.',
    links: [
      { label: 'Terminos', href: '#terminos' },
      { label: 'Privacidad', href: '#privacidad' },
      { label: 'Libro de Reclamaciones', href: '#reclamaciones' },
    ],
  },
};
