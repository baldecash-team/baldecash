// Mock Data for Detail Section - BaldeCash v0.4
// Generated from PROMPT_04_DETALLE_PRODUCTO.md
// Changes: No price display, focus on quota, quota variation for similar products

import {
  ProductDetail,
  SimilarProduct,
  ProductLimitation,
  Certification,
  PaymentPlan,
  InitialPaymentPercentage,
} from '../types/detail';

// ============================================
// Main Product Detail
// ============================================

export const mockProductDetail: ProductDetail = {
  id: 'lenovo-v15-g4',
  slug: 'lenovo-v15-g4-ryzen5-8gb-256ssd',
  name: 'Lenovo V15 G4 AMN',
  displayName: 'Laptop Lenovo 15.6" para estudios - Ryzen 5',
  brand: 'Lenovo',
  category: 'laptops',
  price: 2499,
  originalPrice: 2899,
  discount: 400,
  lowestQuota: 89,
  originalQuota: 99, // For crossed-out quota display
  images: [
    { id: '1', url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad7929bd7b580e6de7247d_Lenovo%20Chromebook%20S330.jpg', alt: 'Laptop Lenovo frontal', type: 'main' },
    { id: '2', url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad8af9ed1fbf48ea397396_hp15.png', alt: 'Laptop HP vista lateral', type: 'gallery' },
    { id: '3', url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad78aca11478d9ed058463_laptop_asus_x515ea.jpg', alt: 'Laptop ASUS en escritorio', type: 'gallery' },
    { id: '4', url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad7ac27cd445765564b11b_Dell%201505.jpg', alt: 'Laptop Dell para estudios', type: 'gallery' },
    { id: '5', url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad79b64b6011e52725b3a7_hyndai_hybook.png', alt: 'Laptop Hyundai portátil', type: 'detail' },
  ],
  description: 'La Lenovo V15 G4 es la laptop perfecta para estudiantes universitarios. Con su procesador AMD Ryzen 5 y 8GB de RAM, podras ejecutar todas tus aplicaciones de estudio sin problemas. Su pantalla de 15.6 pulgadas Full HD te permite trabajar comodamente durante horas.',
  shortDescription: 'Laptop ideal para estudios universitarios con Ryzen 5, 8GB RAM y SSD de 256GB.',
  badges: [
    { type: 'os', icon: 'Monitor', text: 'Con Windows 11 Home', variant: 'info' },
    { type: 'battery', icon: 'Battery', text: 'Hasta 6 horas', variant: 'success' },
    { type: 'stock', icon: 'Package', text: '15 disponibles', variant: 'primary' },
  ],
  specs: [
    {
      category: 'Procesador',
      icon: 'Cpu',
      specs: [
        { label: 'Procesador', value: 'AMD Ryzen 5 7520U', tooltip: 'El cerebro de tu laptop. Ryzen 5 es ideal para multitarea y aplicaciones de estudio.', highlight: true },
        { label: 'Nucleos', value: '4 nucleos / 8 hilos', tooltip: 'Mas nucleos significa mejor rendimiento al ejecutar varias aplicaciones.' },
        { label: 'Velocidad', value: 'Hasta 4.3 GHz', tooltip: 'La velocidad maxima que puede alcanzar el procesador.' },
        { label: 'Cache', value: '4MB L3' },
      ],
    },
    {
      category: 'Memoria',
      icon: 'MemoryStick',
      specs: [
        { label: 'RAM', value: '8GB DDR5', tooltip: '8GB es suficiente para estudios. Permite tener varias aplicaciones abiertas.', highlight: true },
        { label: 'Tipo', value: 'DDR5-4800' },
        { label: 'Expandible', value: 'Hasta 16GB', tooltip: 'Puedes agregar mas RAM en el futuro si lo necesitas.' },
      ],
    },
    {
      category: 'Almacenamiento',
      icon: 'HardDrive',
      specs: [
        { label: 'SSD', value: '256GB NVMe', tooltip: 'SSD es mucho mas rapido que un disco duro tradicional. Tu laptop enciende en segundos.', highlight: true },
        { label: 'Tipo', value: 'M.2 2242 PCIe 4.0' },
        { label: 'Expandible', value: 'Si, slot disponible' },
      ],
    },
    {
      category: 'Pantalla',
      icon: 'Monitor',
      specs: [
        { label: 'Tamano', value: '15.6 pulgadas', highlight: true },
        { label: 'Resolucion', value: '1920 x 1080 (Full HD)', tooltip: 'Full HD te da imagenes nitidas y claras.' },
        { label: 'Panel', value: 'TN Anti-reflejo' },
        { label: 'Brillo', value: '220 nits' },
      ],
    },
    {
      category: 'Bateria',
      icon: 'Battery',
      specs: [
        { label: 'Capacidad', value: '38Wh' },
        { label: 'Duracion', value: 'Hasta 6 horas', tooltip: 'Duracion estimada con uso normal (navegacion, documentos).' },
        { label: 'Carga rapida', value: '65W', tooltip: 'Carga al 50% en aproximadamente 30 minutos.' },
      ],
    },
    {
      category: 'Conectividad',
      icon: 'Wifi',
      specs: [
        { label: 'WiFi', value: 'WiFi 6 (802.11ax)', tooltip: 'WiFi 6 es la ultima generacion, mas rapido y estable.' },
        { label: 'Bluetooth', value: '5.1' },
        { label: 'Camara', value: '720p con privacidad' },
      ],
    },
  ],
  ports: [
    { name: 'USB-C', icon: 'Usb', count: 1, position: 'left' },
    { name: 'USB-A 3.2', icon: 'Usb', count: 2, position: 'right' },
    { name: 'HDMI', icon: 'Monitor', count: 1, position: 'left' },
    { name: 'Audio Jack', icon: 'Headphones', count: 1, position: 'left' },
    { name: 'Lector SD', icon: 'CreditCard', count: 1, position: 'right' },
  ],
  software: [
    { name: 'Windows 11 Home', icon: 'Monitor', included: true, description: 'Sistema operativo incluido' },
    { name: 'Microsoft 365', icon: 'FileText', included: false, description: 'Prueba gratuita de 1 mes' },
    { name: 'Lenovo Vantage', icon: 'Settings', included: true, description: 'Gestion y actualizaciones' },
  ],
  features: [
    { icon: 'Zap', title: 'Rendimiento fluido', description: 'Ryzen 5 + 8GB RAM para multitarea sin lag' },
    { icon: 'Battery', title: 'Toda la clase', description: 'Hasta 6 horas de bateria para tu dia universitario' },
    { icon: 'Feather', title: 'Facil de cargar', description: 'Solo 1.65kg para llevarlo a todas partes' },
    { icon: 'Shield', title: 'Camara con privacidad', description: 'Obturador fisico para proteger tu privacidad' },
  ],
  batteryLife: 'Hasta 6 horas',
  fastCharge: '65W (50% en 30 min)',
  hasOS: true,
  osName: 'Windows 11 Home',
  warranty: '1 ano con fabricante + 6 meses BaldeCash',
  stock: 15,
  rating: 4.5,
  reviewCount: 128,
};

// ============================================
// Payment Plans (Updated for 0.4 - No price, only quota)
// ============================================

export const mockPaymentPlans: PaymentPlan[] = [
  { term: 12, monthlyQuota: 229, originalQuota: 249, initialPaymentPercent: 0, initialPaymentAmount: 0 },
  { term: 18, monthlyQuota: 159, originalQuota: 175, initialPaymentPercent: 0, initialPaymentAmount: 0 },
  { term: 24, monthlyQuota: 124, originalQuota: 136, initialPaymentPercent: 0, initialPaymentAmount: 0 },
  { term: 36, monthlyQuota: 89, originalQuota: 99, initialPaymentPercent: 0, initialPaymentAmount: 0 },
  { term: 48, monthlyQuota: 71, originalQuota: 79, initialPaymentPercent: 0, initialPaymentAmount: 0 },
];

// Initial payment options
export const initialPaymentOptions: InitialPaymentPercentage[] = [0, 10, 20, 30];

// Calculate quota with initial payment
export const calculateQuotaWithInitial = (
  baseQuota: number,
  initialPaymentPercent: InitialPaymentPercentage
): number => {
  // Reduce quota proportionally based on initial payment
  const reduction = initialPaymentPercent / 100;
  return Math.ceil(baseQuota * (1 - reduction));
};

// ============================================
// Similar Products (Updated for 0.4 - Focus on quota variation)
// ============================================

export const mockSimilarProducts: SimilarProduct[] = [
  {
    id: 'hp-15-fc0013',
    name: 'HP 15 AMD Ryzen 3',
    thumbnail: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad8af9ed1fbf48ea397396_hp15.png',
    monthlyQuota: 69,
    quotaDifference: -20, // S/20 menos al mes
    matchScore: 85,
    differentiators: ['Mas economica', 'Ryzen 3'],
    slug: 'hp-15-ryzen3-8gb',
  },
  {
    id: 'hp-victus-gaming',
    name: 'HP Victus 15 Gaming',
    thumbnail: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad8633afc74e8146b99e4a_VICTUS-15-FA0031DX-1.jpg',
    monthlyQuota: 149,
    quotaDifference: +60, // S/60 mas al mes
    matchScore: 75,
    differentiators: ['Gaming', 'RTX Graphics'],
    slug: 'hp-victus-15-gaming',
  },
  {
    id: 'asus-vivobook',
    name: 'ASUS VivoBook X515',
    thumbnail: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad78aca11478d9ed058463_laptop_asus_x515ea.jpg',
    monthlyQuota: 94,
    quotaDifference: +5, // S/5 mas al mes
    matchScore: 88,
    differentiators: ['Mas liviana', 'Mejor bateria'],
    slug: 'asus-vivobook-15-ryzen5',
  },
  {
    id: 'dell-inspiron15',
    name: 'Dell Inspiron 15 3000',
    thumbnail: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad7ac27cd445765564b11b_Dell%201505.jpg',
    monthlyQuota: 86,
    quotaDifference: -3, // S/3 menos al mes
    matchScore: 82,
    differentiators: ['Mejor soporte', 'Mas puertos'],
    slug: 'dell-inspiron15-i3-8gb',
  },
  {
    id: 'hyundai-hybook',
    name: 'Hyundai HyBook 14',
    thumbnail: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad79b64b6011e52725b3a7_hyndai_hybook.png',
    monthlyQuota: 59,
    quotaDifference: -30, // S/30 menos al mes
    matchScore: 70,
    differentiators: ['Mas economica', 'Compacta'],
    slug: 'hyundai-hybook-14',
  },
];

// ============================================
// Product Limitations
// ============================================

export const mockLimitations: ProductLimitation[] = [
  {
    category: 'Pantalla',
    description: 'Panel TN con angulos de vision limitados',
    severity: 'info',
    alternative: 'Si editas fotos/videos, considera una laptop con panel IPS',
    icon: 'Monitor',
  },
  {
    category: 'Almacenamiento',
    description: '256GB puede llenarse rapido con muchos archivos',
    severity: 'info',
    alternative: 'Usa almacenamiento en la nube o disco externo',
    icon: 'HardDrive',
  },
  {
    category: 'Graficos',
    description: 'Graficos integrados, no ideal para juegos pesados',
    severity: 'warning',
    alternative: 'Perfecta para estudios, Office y navegacion',
    icon: 'Gamepad2',
  },
];

// ============================================
// Certifications
// ============================================

export const mockCertifications: Certification[] = [
  {
    code: 'energy-star',
    name: 'ENERGY STAR',
    logo: '/certifications/energy-star.svg',
    description: 'Certificacion de eficiencia energetica. Este equipo consume menos energia, ahorrando en tu recibo de luz.',
    learnMoreUrl: 'https://www.energystar.gov/',
  },
  {
    code: 'epeat',
    name: 'EPEAT Gold',
    logo: '/certifications/epeat.svg',
    description: 'Certificacion ambiental que garantiza un producto mas sostenible y reciclable.',
  },
  {
    code: 'tco',
    name: 'TCO Certified',
    logo: '/certifications/tco.svg',
    description: 'Cumple con estandares de salud, seguridad y reduccion de sustancias peligrosas.',
  },
];

// ============================================
// Helper Functions (Updated for 0.4)
// ============================================

export const formatQuota = (quota: number): string => {
  return `S/${quota}`;
};

export const formatQuotaDifference = (difference: number): string => {
  if (difference === 0) return 'Mismo precio';
  if (difference > 0) return `+S/${difference}/mes`;
  return `-S/${Math.abs(difference)}/mes`;
};

export const getQuotaDifferenceColor = (difference: number): string => {
  if (difference < 0) return 'text-[#22c55e]'; // Green for cheaper
  if (difference > 0) return 'text-amber-600'; // Amber for more expensive
  return 'text-neutral-500';
};
