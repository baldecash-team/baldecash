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
  HowItWorksData,
  FaqData,
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

// ============================================
// How It Works Data
// ============================================

export const mockHowItWorksData: HowItWorksData = {
  steps: [
    {
      id: 1,
      title: 'Elige tu equipo',
      description: 'Explora laptops, tablets y celulares en nuestro catalogo',
      icon: 'Search',
      color: '#4654CD',
    },
    {
      id: 2,
      title: 'Solicita en 5 min',
      description: 'Completa tu solicitud 100% digital',
      icon: 'FileText',
      color: '#5B68D8',
    },
    {
      id: 3,
      title: 'Aprobacion en 24h',
      description: 'Recibe respuesta en un dia habil',
      icon: 'Clock',
      color: '#03DBD0',
    },
    {
      id: 4,
      title: 'Empieza a estudiar',
      description: 'Recibe tu equipo y comienza tu camino',
      icon: 'GraduationCap',
      color: '#22c55e',
    },
  ],
  requirements: [
    { id: 1, text: 'Ser estudiante universitario o tecnico', icon: 'GraduationCap' },
    { id: 2, text: 'DNI vigente', icon: 'CreditCard' },
    { id: 3, text: 'Correo institucional (opcional)', icon: 'Mail' },
    { id: 4, text: 'Celular con WhatsApp', icon: 'Smartphone' },
  ],
  availableTerms: [6, 12, 18, 24],
};

// ============================================
// FAQ Data - Basado en baldecash.com
// ============================================

export const mockFaqData: FaqData = {
  items: [
    {
      id: '1',
      question: 'Que tipo de financiamiento es este?',
      answer: 'BaldeCash ofrece arrendamiento operativo con opcion de compra. Puedes usar tu laptop inmediatamente mientras pagas en cuotas, y al terminar de pagar, el equipo es tuyo.',
      category: 'General',
    },
    {
      id: '2',
      question: 'Como y cuando recibo mi laptop?',
      answer: 'Despues de la aprobacion, completas un contrato virtual con firma electronica. La entrega toma 3-5 dias habiles en Lima o 5-9 dias en provincias via courier.',
      category: 'Envio',
    },
    {
      id: '3',
      question: 'Como pago mis cuotas?',
      answer: 'Los pagos se realizan a traves de "Zona Estudiantes", nuestra plataforma. Puedes pagar con tarjeta de debito, agente bancario o ventanilla. Los pagos se registran inmediatamente.',
      category: 'Pagos',
    },
    {
      id: '4',
      question: 'La laptop es de mi propiedad?',
      answer: 'La laptop esta en tu entera posesion durante los pagos, pero pertenece a BaldeCash hasta que termines de pagar. Al completar todas las cuotas, la propiedad se transfiere a ti.',
      category: 'General',
    },
    {
      id: '5',
      question: 'Puedo hacer pagos adelantados?',
      answer: 'Si, puedes adelantar pagos a traves de Zona Estudiantes y recibir 20% de descuento por cancelacion anticipada de toda la deuda.',
      category: 'Pagos',
    },
    {
      id: '6',
      question: 'La laptop cuenta con garantia?',
      answer: 'Si, las laptops incluyen 12 meses de garantia del fabricante mas servicio tecnico de BaldeCash mientras estes al dia en tus pagos.',
      category: 'Garantia',
    },
  ],
  categories: ['General', 'Pagos', 'Envio', 'Garantia'],
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
    copyright: '© 2025 Balde K S.A.C. Todos los derechos reservados.',
    links: [
      { label: 'Terminos y Condiciones', href: '/prototipos/0.4/legal/terminos' },
      { label: 'Politica de Privacidad', href: '/prototipos/0.4/legal/privacidad' },
      { label: 'Libro de Reclamaciones', href: '/prototipos/0.4/legal/reclamaciones' },
    ],
  },
};
