// Mock Data for Hero Section - BaldeCash v0.5

import {
  SocialProofData,
  HeroContent,
  NavItem,
  Institution,
  Testimonial,
  HowItWorksData,
  FaqData,
} from '../types/hero';

// ============================================
// Navigation Items
// ============================================

export const mockNavItems: NavItem[] = [
  { label: 'Inicio', href: '/prototipos/0.5/hero', isActive: true },
  { label: 'Laptops', href: '/prototipos/0.5/catalogo' },
  { label: 'Cómo funciona', href: '#como-funciona' },
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
    name: 'Universidad Tecnológica del Perú',
    shortName: 'UTP',
    logo: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c97244b484a7cf98bd37a_Vector.png',
    hasAgreement: true,
    agreementType: 'convenio_marco',
  },
  {
    id: '4',
    code: 'UCAL',
    name: 'Universidad de Ciencias y Artes de América Latina',
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
    { name: 'Gestión', logo: '/media/gestion.png', url: 'https://gestion.pe' },
    { name: 'Forbes Perú', logo: '/media/forbes.png', url: 'https://forbes.pe' },
    { name: 'El Comercio', logo: '/media/elcomercio.png', url: 'https://elcomercio.pe' },
  ],
};

// ============================================
// Hero Content
// ============================================

export const mockHeroContent: HeroContent = {
  headline: 'Tu laptop para estudiar',
  subheadline: 'Sin historial crediticio. Sin aval ni garante. Aprobación en 24 horas.',
  primaryCta: {
    text: 'Ver laptops disponibles',
    href: '/prototipos/0.5/catalogo',
    icon: 'Monitor',
    variant: 'primary',
  },
  secondaryCta: {
    text: 'Cómo funciona',
    href: '#como-funciona',
    icon: 'HelpCircle',
    variant: 'outline',
  },
  minQuota: 49,
  trustSignals: [
    { icon: 'Shield', text: 'Registrados en SBS', tooltip: 'Empresa regulada por la Superintendencia de Banca y Seguros' },
    { icon: 'Clock', text: 'Aprobación en 24h', tooltip: 'Respuesta garantizada en un día hábil' },
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
    quote: 'Gracias a BaldeCash pude terminar mi tesis a tiempo. El proceso fue súper rápido.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    rating: 5,
  },
  {
    id: '2',
    name: 'Carlos Rodriguez',
    institution: 'UPC',
    quote: 'Nunca pensé que podría tener mi propia laptop. BaldeCash lo hizo posible.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    rating: 5,
  },
  {
    id: '3',
    name: 'Ana Torres',
    institution: 'SENATI',
    quote: 'El financiamiento me permitió concentrarme en mis estudios sin preocuparme.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    rating: 5,
  },
  {
    id: '4',
    name: 'Luis Mendoza',
    institution: 'UTP',
    quote: 'Excelente servicio. Mi laptop llegó en perfectas condiciones y las cuotas son muy accesibles.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    rating: 5,
  },
  {
    id: '5',
    name: 'Fernanda Rios',
    institution: 'CIBERTEC',
    quote: 'El proceso de aprobación fue increíblemente rápido. En 24 horas ya tenía mi laptop.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    rating: 5,
  },
  {
    id: '6',
    name: 'Diego Vargas',
    institution: 'TECSUP',
    quote: 'Sin historial crediticio y sin aval. BaldeCash confió en mí como estudiante.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    rating: 5,
  },
  {
    id: '7',
    name: 'Camila Fernandez',
    institution: 'UCAL',
    quote: 'La mejor decisión que tomé. Mi laptop es perfecta para diseño gráfico.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    rating: 5,
  },
  {
    id: '8',
    name: 'Jorge Huaman',
    institution: 'CERTUS',
    quote: 'Atención personalizada y cuotas que se adaptan a mi presupuesto de estudiante.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
    rating: 5,
  },
];

// ============================================
// How It Works Data
// ============================================

export const mockHowItWorksData: HowItWorksData = {
  steps: [
    {
      id: 1,
      title: 'Elige tu equipo',
      description: 'Explora laptops, tablets y celulares en nuestro catálogo',
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
      title: 'Aprobación en 24h',
      description: 'Recibe respuesta en un día hábil',
      icon: 'Clock',
      color: '#03DBD0',
    },
    {
      id: 4,
      title: 'Recibe tu laptop',
      description: 'Entrega a domicilio en todo el Perú',
      icon: 'GraduationCap',
      color: '#22c55e',
    },
  ],
  requirements: [
    { id: 1, text: 'Ser estudiante universitario o técnico', icon: 'GraduationCap' },
    { id: 2, text: 'DNI o CE vigente', icon: 'CreditCard' },
    { id: 3, text: 'Celular con WhatsApp', icon: 'Smartphone' },
  ],
  availableTerms: [6, 12, 18, 24],
};

// ============================================
// FAQ Data
// ============================================

export const mockFaqData: FaqData = {
  items: [
    {
      id: '1',
      question: '¿Qué tipo de financiamiento es este?',
      answer: 'BaldeCash ofrece arrendamiento operativo con opción de compra. Puedes usar tu laptop inmediatamente mientras pagas en cuotas, y al terminar de pagar, el equipo es tuyo.',
      category: 'General',
    },
    {
      id: '2',
      question: '¿Cómo y cuándo recibo mi laptop?',
      answer: 'Después de la aprobación, completas un contrato virtual con firma electrónica. La entrega toma 3-5 días hábiles en Lima o 5-9 días en provincias vía courier.',
      category: 'Envío',
    },
    {
      id: '3',
      question: '¿Cómo pago mis cuotas?',
      answer: 'Los pagos se realizan a través de "Zona Estudiantes", nuestra plataforma. Puedes pagar con tarjeta de débito, agente bancario o ventanilla. Los pagos se registran inmediatamente.',
      category: 'Pagos',
    },
    {
      id: '4',
      question: '¿La laptop es de mi propiedad?',
      answer: 'La laptop está en tu entera posesión durante los pagos, pero pertenece a BaldeCash hasta que termines de pagar. Al completar todas las cuotas, la propiedad se transfiere a ti.',
      category: 'General',
    },
    {
      id: '5',
      question: '¿Puedo hacer pagos adelantados?',
      answer: 'Sí, puedes adelantar pagos a través de Zona Estudiantes y recibir 20% de descuento por cancelación anticipada de toda la deuda.',
      category: 'Pagos',
    },
    {
      id: '6',
      question: '¿La laptop cuenta con garantía?',
      answer: 'Sí, las laptops incluyen 12 meses de garantía del fabricante más servicio técnico de BaldeCash mientras estés al día en tus pagos.',
      category: 'Garantía',
    },
  ],
  categories: ['General', 'Pagos', 'Envío', 'Garantía'],
};
