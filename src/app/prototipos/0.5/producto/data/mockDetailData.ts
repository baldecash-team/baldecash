// Mock Data for Detail Section - BaldeCash v0.5

import {
  ProductDetail,
  ProductColor,
  SimilarProduct,
  ProductLimitation,
  Certification,
  PaymentPlan,
  InitialPaymentPercentage,
  DeviceType,
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
  originalQuota: 99,
  images: [
    { id: '1', url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad7929bd7b580e6de7247d_Lenovo%20Chromebook%20S330.jpg', alt: 'Laptop Lenovo frontal', type: 'main' },
    { id: '2', url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad8af9ed1fbf48ea397396_hp15.png', alt: 'Laptop HP vista lateral', type: 'gallery' },
    { id: '3', url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad78aca11478d9ed058463_laptop_asus_x515ea.jpg', alt: 'Laptop ASUS en escritorio', type: 'gallery' },
    { id: '4', url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad7ac27cd445765564b11b_Dell%201505.jpg', alt: 'Laptop Dell para estudios', type: 'gallery' },
    { id: '5', url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad79b64b6011e52725b3a7_hyndai_hybook.png', alt: 'Laptop Hyundai portatil', type: 'detail' },
  ],
  colors: [
    { id: 'laptop-gray', name: 'Gris Grafito', hex: '#4A4A4A' },
    { id: 'laptop-silver', name: 'Plata', hex: '#C0C0C0' },
    { id: 'laptop-black', name: 'Negro', hex: '#1A1A1A' },
  ],
  description: 'La Lenovo V15 G4 es la laptop perfecta para estudiantes universitarios. Con su procesador AMD Ryzen 5 y 8GB de RAM, podrás ejecutar todas tus aplicaciones de estudio sin problemas. Su pantalla de 15.6 pulgadas Full HD te permite trabajar cómodamente durante horas.',
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
        { label: 'Núcleos', value: '4 núcleos / 8 hilos', tooltip: 'Más núcleos significa mejor rendimiento al ejecutar varias aplicaciones.' },
        { label: 'Velocidad', value: 'Hasta 4.3 GHz', tooltip: 'La velocidad máxima que puede alcanzar el procesador.' },
        { label: 'Cache', value: '4MB L3' },
      ],
    },
    {
      category: 'Memoria',
      icon: 'MemoryStick',
      specs: [
        { label: 'RAM', value: '8GB DDR5', tooltip: '8GB es suficiente para estudios. Permite tener varias aplicaciones abiertas.', highlight: true },
        { label: 'Tipo', value: 'DDR5-4800' },
        { label: 'Expandible', value: 'Hasta 16GB', tooltip: 'Puedes agregar más RAM en el futuro si lo necesitas.' },
      ],
    },
    {
      category: 'Almacenamiento',
      icon: 'HardDrive',
      specs: [
        { label: 'SSD', value: '256GB NVMe', tooltip: 'SSD es mucho más rápido que un disco duro tradicional. Tu laptop enciende en segundos.', highlight: true },
        { label: 'Tipo', value: 'M.2 2242 PCIe 4.0' },
        { label: 'Expandible', value: 'Si, slot disponible' },
      ],
    },
    {
      category: 'Pantalla',
      icon: 'Monitor',
      specs: [
        { label: 'Tamaño', value: '15.6 pulgadas', highlight: true },
        { label: 'Resolución', value: '1920 x 1080 (Full HD)', tooltip: 'Full HD te da imágenes nítidas y claras.' },
        { label: 'Panel', value: 'TN Anti-reflejo' },
        { label: 'Brillo', value: '220 nits' },
      ],
    },
    {
      category: 'Bateria',
      icon: 'Battery',
      specs: [
        { label: 'Capacidad', value: '38Wh' },
        { label: 'Duración', value: 'Hasta 6 horas', tooltip: 'Duración estimada con uso normal (navegación, documentos).' },
        { label: 'Carga rápida', value: '65W', tooltip: 'Carga al 50% en aproximadamente 30 minutos.' },
      ],
    },
    {
      category: 'Conectividad',
      icon: 'Wifi',
      specs: [
        { label: 'WiFi', value: 'WiFi 6 (802.11ax)', tooltip: 'WiFi 6 es la última generación, más rápido y estable.' },
        { label: 'Bluetooth', value: '5.1' },
        { label: 'Cámara', value: '720p con privacidad' },
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
    { name: 'Lenovo Vantage', icon: 'Settings', included: true, description: 'Gestión y actualizaciones' },
  ],
  features: [
    { icon: 'Zap', title: 'Rendimiento fluido', description: 'Ryzen 5 + 8GB RAM para multitarea sin lag' },
    { icon: 'Battery', title: 'Toda la clase', description: 'Hasta 6 horas de batería para tu día universitario' },
    { icon: 'Feather', title: 'Fácil de cargar', description: 'Solo 1.65kg para llevarlo a todas partes' },
    { icon: 'Shield', title: 'Cámara con privacidad', description: 'Obturador físico para proteger tu privacidad' },
  ],
  batteryLife: 'Hasta 6 horas',
  fastCharge: '65W (50% en 30 min)',
  hasOS: true,
  osName: 'Windows 11 Home',
  warranty: '1 año con fabricante + 6 meses BaldeCash',
  stock: 15,
  rating: 4.5,
  reviewCount: 128,
};

// ============================================
// Payment Plans
// ============================================

export const mockPaymentPlans: PaymentPlan[] = [
  { term: 12, monthlyQuota: 229, originalQuota: 249, initialPaymentPercent: 0, initialPaymentAmount: 0 },
  { term: 18, monthlyQuota: 159, originalQuota: 175, initialPaymentPercent: 0, initialPaymentAmount: 0 },
  { term: 24, monthlyQuota: 124, originalQuota: 136, initialPaymentPercent: 0, initialPaymentAmount: 0 },
  { term: 36, monthlyQuota: 89, originalQuota: 99, initialPaymentPercent: 0, initialPaymentAmount: 0 },
  { term: 48, monthlyQuota: 71, originalQuota: 79, initialPaymentPercent: 0, initialPaymentAmount: 0 },
];

export const initialPaymentOptions: InitialPaymentPercentage[] = [0, 10, 20, 30];

export const calculateQuotaWithInitial = (
  baseQuota: number,
  initialPaymentPercent: InitialPaymentPercentage
): number => {
  const reduction = initialPaymentPercent / 100;
  return Math.ceil(baseQuota * (1 - reduction));
};

// ============================================
// Similar Products
// ============================================

export const mockSimilarProducts: SimilarProduct[] = [
  {
    id: 'hp-15-fc0013',
    name: 'HP 15 AMD Ryzen 3',
    brand: 'HP',
    thumbnail: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad8af9ed1fbf48ea397396_hp15.png',
    images: [
      'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad8af9ed1fbf48ea397396_hp15.png',
      'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad7929bd7b580e6de7247d_Lenovo%20Chromebook%20S330.jpg',
      'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad78aca11478d9ed058463_laptop_asus_x515ea.jpg',
    ],
    colors: [
      { id: 'hp15-silver', name: 'Plata Natural', hex: '#C0C0C0' },
      { id: 'hp15-black', name: 'Negro Jet', hex: '#1A1A1A' },
    ],
    monthlyQuota: 69,
    quotaDifference: -20,
    matchScore: 85,
    differentiators: ['Más económica', 'Ryzen 3'],
    slug: 'hp-15-ryzen3-8gb',
    specs: {
      processor: 'AMD Ryzen 3 5300U',
      ram: '8GB DDR4',
      storage: '256GB SSD',
      display: '15.6" FHD',
    },
  },
  {
    id: 'hp-victus-gaming',
    name: 'HP Victus 15 Gaming',
    brand: 'HP',
    thumbnail: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad8633afc74e8146b99e4a_VICTUS-15-FA0031DX-1.jpg',
    images: [
      'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad8633afc74e8146b99e4a_VICTUS-15-FA0031DX-1.jpg',
      'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad7ac27cd445765564b11b_Dell%201505.jpg',
      'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad79b64b6011e52725b3a7_hyndai_hybook.png',
    ],
    colors: [
      { id: 'victus-black', name: 'Negro Mica', hex: '#1C1C1C' },
      { id: 'victus-white', name: 'Blanco Cerámico', hex: '#F5F5F5' },
    ],
    monthlyQuota: 149,
    quotaDifference: +60,
    matchScore: 75,
    differentiators: ['Gaming', 'RTX Graphics'],
    slug: 'hp-victus-15-gaming',
    specs: {
      processor: 'Intel Core i5-12500H',
      ram: '16GB DDR5',
      storage: '512GB SSD',
      display: '15.6" FHD 144Hz',
    },
  },
  {
    id: 'asus-vivobook',
    name: 'ASUS VivoBook X515',
    brand: 'ASUS',
    thumbnail: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad78aca11478d9ed058463_laptop_asus_x515ea.jpg',
    images: [
      'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad78aca11478d9ed058463_laptop_asus_x515ea.jpg',
      'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad8af9ed1fbf48ea397396_hp15.png',
      'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad7929bd7b580e6de7247d_Lenovo%20Chromebook%20S330.jpg',
    ],
    colors: [
      { id: 'asus-silver', name: 'Plata Transparente', hex: '#E8E8E8' },
      { id: 'asus-blue', name: 'Azul Pavo Real', hex: '#1E3A8A' },
      { id: 'asus-black', name: 'Negro Indie', hex: '#2D2D2D' },
    ],
    monthlyQuota: 94,
    quotaDifference: +5,
    matchScore: 88,
    differentiators: ['Más liviana', 'Mejor batería'],
    slug: 'asus-vivobook-15-ryzen5',
    specs: {
      processor: 'AMD Ryzen 5 5500U',
      ram: '8GB DDR4',
      storage: '512GB SSD',
      display: '15.6" FHD IPS',
    },
  },
  {
    id: 'dell-inspiron15',
    name: 'Dell Inspiron 15 3000',
    brand: 'Dell',
    thumbnail: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad7ac27cd445765564b11b_Dell%201505.jpg',
    images: [
      'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad7ac27cd445765564b11b_Dell%201505.jpg',
      'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad78aca11478d9ed058463_laptop_asus_x515ea.jpg',
      'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad8633afc74e8146b99e4a_VICTUS-15-FA0031DX-1.jpg',
    ],
    colors: [
      { id: 'dell-carbon', name: 'Carbón', hex: '#3D3D3D' },
      { id: 'dell-platinum', name: 'Platino', hex: '#D4D4D4' },
    ],
    monthlyQuota: 86,
    quotaDifference: -3,
    matchScore: 82,
    differentiators: ['Mejor soporte', 'Más puertos'],
    slug: 'dell-inspiron15-i3-8gb',
    specs: {
      processor: 'Intel Core i3-1215U',
      ram: '8GB DDR4',
      storage: '256GB SSD',
      display: '15.6" FHD',
    },
  },
  {
    id: 'hyundai-hybook',
    name: 'Hyundai HyBook 14',
    brand: 'Hyundai',
    thumbnail: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad79b64b6011e52725b3a7_hyndai_hybook.png',
    images: [
      'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad79b64b6011e52725b3a7_hyndai_hybook.png',
      'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad7929bd7b580e6de7247d_Lenovo%20Chromebook%20S330.jpg',
      'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad8af9ed1fbf48ea397396_hp15.png',
    ],
    colors: [
      { id: 'hyundai-gray', name: 'Gris Espacial', hex: '#6B7280' },
      { id: 'hyundai-rose', name: 'Rosa Dorado', hex: '#F4C2C2' },
    ],
    monthlyQuota: 59,
    quotaDifference: -30,
    matchScore: 70,
    differentiators: ['Más económica', 'Compacta'],
    slug: 'hyundai-hybook-14',
    specs: {
      processor: 'Intel Celeron N4020',
      ram: '4GB DDR4',
      storage: '128GB eMMC',
      display: '14.1" HD',
    },
  },
];

// ============================================
// Product Limitations
// ============================================

export const mockLimitations: ProductLimitation[] = [
  {
    category: 'Pantalla',
    description: 'Panel TN con ángulos de visión limitados',
    severity: 'info',
    alternative: 'Si editas fotos/videos, considera una laptop con panel IPS',
    icon: 'Monitor',
  },
  {
    category: 'Almacenamiento',
    description: '256GB puede llenarse rápido con muchos archivos',
    severity: 'info',
    alternative: 'Usa almacenamiento en la nube o disco externo',
    icon: 'HardDrive',
  },
  {
    category: 'Gráficos',
    description: 'Gráficos integrados, no ideal para juegos pesados',
    severity: 'warning',
    alternative: 'Perfecta para estudios, Office y navegación',
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
    description: 'Certificación de eficiencia energética. Este equipo consume menos energía, ahorrando en tu recibo de luz.',
    learnMoreUrl: 'https://www.energystar.gov/',
  },
  {
    code: 'epeat',
    name: 'EPEAT Gold',
    logo: '/certifications/epeat.svg',
    description: 'Certificación ambiental que garantiza un producto más sostenible y reciclable.',
  },
  {
    code: 'tco',
    name: 'TCO Certified',
    logo: '/certifications/tco.svg',
    description: 'Cumple con estándares de salud, seguridad y reducción de sustancias peligrosas.',
  },
];

// ============================================
// Helper Functions
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
  if (difference < 0) return 'text-[#22c55e]';
  if (difference > 0) return 'text-amber-600';
  return 'text-neutral-500';
};

// ============================================
// TABLET - Product Detail
// ============================================

export const mockTabletDetail: ProductDetail = {
  id: 'samsung-tab-s9',
  slug: 'samsung-galaxy-tab-s9-128gb',
  name: 'Samsung Galaxy Tab S9',
  displayName: 'Tablet Samsung 11" para estudios y entretenimiento',
  brand: 'Samsung',
  category: 'tablets',
  price: 1899,
  originalPrice: 2199,
  discount: 300,
  lowestQuota: 69,
  originalQuota: 79,
  images: [
    { id: '1', url: 'https://pngimg.com/d/tablet_PNG8576.png', alt: 'Samsung Galaxy Tab S9 frontal', type: 'main' },
    { id: '2', url: 'https://pngimg.com/d/tablet_PNG8571.png', alt: 'Samsung Galaxy Tab S9 lateral', type: 'gallery' },
    { id: '3', url: 'https://pngimg.com/d/tablet_PNG8562.png', alt: 'Samsung Galaxy Tab S9 con S Pen', type: 'gallery' },
    { id: '4', url: 'https://pngimg.com/d/tablet_PNG8555.png', alt: 'Samsung Galaxy Tab S9 posterior', type: 'gallery' },
    { id: '5', url: 'https://pngimg.com/d/tablet_PNG8576.png', alt: 'Samsung Galaxy Tab S9 accesorios', type: 'detail' },
  ],
  colors: [
    { id: 'tablet-graphite', name: 'Grafito', hex: '#2C2C2C' },
    { id: 'tablet-beige', name: 'Beige', hex: '#D4C4B0' },
    { id: 'tablet-pink', name: 'Rosa Lavanda', hex: '#E8D5E0' },
  ],
  description: 'La Samsung Galaxy Tab S9 es la tablet perfecta para estudiantes y profesionales. Con su pantalla Dynamic AMOLED 2X de 11 pulgadas y el S Pen incluido, podrás tomar notas, dibujar y disfrutar contenido multimedia como nunca antes.',
  shortDescription: 'Tablet premium con pantalla AMOLED 11", S Pen incluido y 128GB de almacenamiento.',
  badges: [
    { type: 'os', icon: 'Smartphone', text: 'Android 13 + One UI', variant: 'info' },
    { type: 'battery', icon: 'Battery', text: 'Hasta 15 horas', variant: 'success' },
    { type: 'stock', icon: 'Package', text: '8 disponibles', variant: 'primary' },
  ],
  specs: [
    {
      category: 'Pantalla',
      icon: 'Monitor',
      specs: [
        { label: 'Tamaño', value: '11 pulgadas', highlight: true },
        { label: 'Tecnología', value: 'Dynamic AMOLED 2X', tooltip: 'Colores vibrantes y negros profundos.' },
        { label: 'Resolución', value: '2560 x 1600 (WQXGA)', tooltip: 'Alta resolución para detalles nítidos.' },
        { label: 'Tasa refresco', value: '120Hz', tooltip: 'Animaciones súper fluidas.' },
      ],
    },
    {
      category: 'Procesador',
      icon: 'Cpu',
      specs: [
        { label: 'Chipset', value: 'Snapdragon 8 Gen 2', highlight: true },
        { label: 'Núcleos', value: '8 núcleos', tooltip: 'Procesador de alto rendimiento para cualquier tarea.' },
        { label: 'GPU', value: 'Adreno 740' },
      ],
    },
    {
      category: 'Memoria',
      icon: 'MemoryStick',
      specs: [
        { label: 'RAM', value: '8GB', highlight: true },
        { label: 'Almacenamiento', value: '128GB', tooltip: 'Expandible con microSD hasta 1TB.' },
        { label: 'Expandible', value: 'Sí, hasta 1TB' },
      ],
    },
    {
      category: 'Batería',
      icon: 'Battery',
      specs: [
        { label: 'Capacidad', value: '8400 mAh', highlight: true },
        { label: 'Duración', value: 'Hasta 15 horas', tooltip: 'Reproducción de video continua.' },
        { label: 'Carga rápida', value: '45W', tooltip: 'Carga completa en aproximadamente 80 minutos.' },
      ],
    },
    {
      category: 'Cámara',
      icon: 'Camera',
      specs: [
        { label: 'Trasera', value: '13MP + 8MP Ultra Wide', highlight: true },
        { label: 'Frontal', value: '12MP Ultra Wide' },
        { label: 'Video', value: '4K a 60fps' },
      ],
    },
    {
      category: 'S Pen',
      icon: 'Pencil',
      specs: [
        { label: 'Incluido', value: 'Sí', highlight: true },
        { label: 'Latencia', value: '2.8ms', tooltip: 'Respuesta casi instantánea al escribir.' },
        { label: 'Sensibilidad', value: '4096 niveles de presión' },
      ],
    },
  ],
  ports: [],
  software: [
    { name: 'Android 13', icon: 'Smartphone', included: true, description: 'Sistema operativo con One UI 5.1' },
    { name: 'Samsung Notes', icon: 'FileText', included: true, description: 'App optimizada para S Pen' },
    { name: 'Samsung DeX', icon: 'Monitor', included: true, description: 'Modo escritorio' },
  ],
  features: [
    { icon: 'Pencil', title: 'S Pen incluido', description: 'Escribe y dibuja con precisión profesional' },
    { icon: 'Battery', title: 'Batería todo el día', description: 'Hasta 15 horas de uso continuo' },
    { icon: 'Droplet', title: 'Resistente al agua', description: 'Certificación IP68 para tranquilidad' },
    { icon: 'Monitor', title: 'Pantalla AMOLED', description: 'Colores vibrantes y 120Hz de fluidez' },
  ],
  batteryLife: 'Hasta 15 horas',
  fastCharge: '45W',
  hasOS: true,
  osName: 'Android 13',
  warranty: '1 año con fabricante + 6 meses BaldeCash',
  stock: 8,
  rating: 4.7,
  reviewCount: 89,
};

export const mockSimilarTablets: SimilarProduct[] = [
  {
    id: 'ipad-10gen',
    name: 'iPad 10ma Generación',
    brand: 'Apple',
    thumbnail: 'https://pngimg.com/d/tablet_PNG8571.png',
    images: [
      'https://pngimg.com/d/tablet_PNG8571.png',
      'https://pngimg.com/d/tablet_PNG8576.png',
      'https://pngimg.com/d/tablet_PNG8562.png',
    ],
    colors: [
      { id: 'ipad-silver', name: 'Plata', hex: '#E3E4E5' },
      { id: 'ipad-blue', name: 'Azul', hex: '#5B9BD5' },
      { id: 'ipad-pink', name: 'Rosa', hex: '#F5C6D0' },
      { id: 'ipad-yellow', name: 'Amarillo', hex: '#F9E06A' },
    ],
    monthlyQuota: 79,
    quotaDifference: +10,
    matchScore: 85,
    differentiators: ['Chip A14', 'iPadOS'],
    slug: 'ipad-10-64gb',
    specs: {
      processor: 'Apple A14 Bionic',
      ram: '4GB',
      storage: '64GB',
      display: '10.9" Liquid Retina',
    },
  },
  {
    id: 'xiaomi-pad6',
    name: 'Xiaomi Pad 6',
    brand: 'Xiaomi',
    thumbnail: 'https://pngimg.com/d/tablet_PNG8562.png',
    images: [
      'https://pngimg.com/d/tablet_PNG8562.png',
      'https://pngimg.com/d/tablet_PNG8555.png',
      'https://pngimg.com/d/tablet_PNG8576.png',
    ],
    colors: [
      { id: 'xiaomi-gray', name: 'Gris Gravedad', hex: '#6B6B6B' },
      { id: 'xiaomi-gold', name: 'Dorado Champán', hex: '#D4AF37' },
      { id: 'xiaomi-blue', name: 'Azul Niebla', hex: '#7BA3C9' },
    ],
    monthlyQuota: 55,
    quotaDifference: -14,
    matchScore: 78,
    differentiators: ['Más económica', '144Hz'],
    slug: 'xiaomi-pad-6-128gb',
    specs: {
      processor: 'Snapdragon 870',
      ram: '6GB',
      storage: '128GB',
      display: '11" IPS 144Hz',
    },
  },
  {
    id: 'lenovo-tab-p12',
    name: 'Lenovo Tab P12 Pro',
    brand: 'Lenovo',
    thumbnail: 'https://pngimg.com/d/tablet_PNG8555.png',
    images: [
      'https://pngimg.com/d/tablet_PNG8555.png',
      'https://pngimg.com/d/tablet_PNG8571.png',
      'https://pngimg.com/d/tablet_PNG8562.png',
    ],
    colors: [
      { id: 'lenovo-storm', name: 'Gris Tormenta', hex: '#4A4A4A' },
      { id: 'lenovo-green', name: 'Verde Luna', hex: '#8FBC8F' },
    ],
    monthlyQuota: 89,
    quotaDifference: +20,
    matchScore: 82,
    differentiators: ['OLED 12.6"', 'Productividad'],
    slug: 'lenovo-tab-p12-pro',
    specs: {
      processor: 'Snapdragon 870',
      ram: '8GB',
      storage: '256GB',
      display: '12.6" AMOLED 120Hz',
    },
  },
];

export const mockTabletLimitations: ProductLimitation[] = [
  {
    category: 'Software',
    description: 'Algunas apps de escritorio no tienen versión optimizada',
    severity: 'info',
    alternative: 'Usa Samsung DeX para experiencia de escritorio',
    icon: 'Smartphone',
  },
  {
    category: 'Almacenamiento',
    description: '128GB puede llenarse con muchas apps y videos',
    severity: 'info',
    alternative: 'Expande con microSD hasta 1TB',
    icon: 'HardDrive',
  },
];

export const mockTabletCertifications: Certification[] = [
  {
    code: 'ip68',
    name: 'IP68',
    logo: '/certifications/ip68.svg',
    description: 'Resistente al agua y polvo. Sumergible hasta 1.5m por 30 minutos.',
  },
  {
    code: 'samsung-knox',
    name: 'Samsung Knox',
    logo: '/certifications/knox.svg',
    description: 'Seguridad de nivel empresarial integrada desde el chip.',
  },
];

// ============================================
// CELULAR - Product Detail
// ============================================

export const mockCelularDetail: ProductDetail = {
  id: 'samsung-a54',
  slug: 'samsung-galaxy-a54-5g-128gb',
  name: 'Samsung Galaxy A54 5G',
  displayName: 'Celular Samsung 6.4" con 5G y cámara 50MP',
  brand: 'Samsung',
  category: 'celulares',
  price: 1499,
  originalPrice: 1799,
  discount: 300,
  lowestQuota: 54,
  originalQuota: 64,
  images: [
    { id: '1', url: 'https://pngimg.com/d/smartphone_PNG8534.png', alt: 'Samsung Galaxy A54 frontal', type: 'main' },
    { id: '2', url: 'https://pngimg.com/d/smartphone_PNG8545.png', alt: 'Samsung Galaxy A54 lateral', type: 'gallery' },
    { id: '3', url: 'https://pngimg.com/d/smartphone_PNG8507.png', alt: 'Samsung Galaxy A54 cámaras', type: 'gallery' },
    { id: '4', url: 'https://pngimg.com/d/smartphone_PNG8517.png', alt: 'Samsung Galaxy A54 posterior', type: 'gallery' },
    { id: '5', url: 'https://pngimg.com/d/smartphone_PNG8526.png', alt: 'Samsung Galaxy A54 en mano', type: 'detail' },
  ],
  colors: [
    { id: 'cel-black', name: 'Negro Increíble', hex: '#1C1C1C' },
    { id: 'cel-violet', name: 'Violeta Asombroso', hex: '#8B5CF6' },
    { id: 'cel-lime', name: 'Lima Increíble', hex: '#84CC16' },
  ],
  description: 'El Samsung Galaxy A54 5G combina diseño premium con tecnología de punta. Su cámara de 50MP con estabilización óptica captura fotos increíbles, mientras que su pantalla Super AMOLED de 120Hz ofrece una experiencia visual impresionante.',
  shortDescription: 'Smartphone 5G con cámara 50MP OIS, pantalla AMOLED 120Hz y 128GB.',
  badges: [
    { type: 'os', icon: 'Smartphone', text: 'Android 14 + One UI', variant: 'info' },
    { type: 'battery', icon: 'Battery', text: 'Hasta 2 días', variant: 'success' },
    { type: 'stock', icon: 'Package', text: '12 disponibles', variant: 'primary' },
  ],
  specs: [
    {
      category: 'Pantalla',
      icon: 'Monitor',
      specs: [
        { label: 'Tamaño', value: '6.4 pulgadas', highlight: true },
        { label: 'Tecnología', value: 'Super AMOLED', tooltip: 'Colores vibrantes y negros perfectos.' },
        { label: 'Resolución', value: '2340 x 1080 (FHD+)' },
        { label: 'Tasa refresco', value: '120Hz', tooltip: 'Desplazamiento súper fluido.' },
      ],
    },
    {
      category: 'Procesador',
      icon: 'Cpu',
      specs: [
        { label: 'Chipset', value: 'Exynos 1380', highlight: true },
        { label: 'Núcleos', value: '8 núcleos (2.4GHz + 2.0GHz)' },
        { label: 'Proceso', value: '5nm', tooltip: 'Eficiente en consumo de energía.' },
      ],
    },
    {
      category: 'Memoria',
      icon: 'MemoryStick',
      specs: [
        { label: 'RAM', value: '8GB', highlight: true },
        { label: 'Almacenamiento', value: '128GB' },
        { label: 'Expandible', value: 'Sí, hasta 1TB', tooltip: 'Con tarjeta microSD.' },
      ],
    },
    {
      category: 'Cámara',
      icon: 'Camera',
      specs: [
        { label: 'Principal', value: '50MP OIS', highlight: true, tooltip: 'Estabilización óptica para fotos nítidas.' },
        { label: 'Ultra Wide', value: '12MP (123°)' },
        { label: 'Macro', value: '5MP' },
        { label: 'Frontal', value: '32MP' },
        { label: 'Video', value: '4K a 30fps' },
      ],
    },
    {
      category: 'Batería',
      icon: 'Battery',
      specs: [
        { label: 'Capacidad', value: '5000 mAh', highlight: true },
        { label: 'Duración', value: 'Hasta 2 días', tooltip: 'Con uso moderado.' },
        { label: 'Carga rápida', value: '25W', tooltip: '50% en 30 minutos.' },
      ],
    },
    {
      category: 'Conectividad',
      icon: 'Wifi',
      specs: [
        { label: '5G', value: 'Sí', highlight: true, tooltip: 'Velocidades de descarga ultra rápidas.' },
        { label: 'WiFi', value: 'WiFi 6 (802.11ax)' },
        { label: 'Bluetooth', value: '5.3' },
        { label: 'NFC', value: 'Sí', tooltip: 'Para pagos contactless.' },
      ],
    },
  ],
  ports: [],
  software: [
    { name: 'Android 14', icon: 'Smartphone', included: true, description: 'Con One UI 6.0' },
    { name: 'Samsung Wallet', icon: 'Wallet', included: true, description: 'Pagos y tarjetas digitales' },
    { name: 'Samsung Health', icon: 'Heart', included: true, description: 'Seguimiento de salud' },
  ],
  features: [
    { icon: 'Camera', title: 'Cámara 50MP OIS', description: 'Fotos profesionales con estabilización óptica' },
    { icon: 'Zap', title: '5G Ultra Rápido', description: 'Descarga y streaming sin esperas' },
    { icon: 'Battery', title: 'Batería 2 días', description: '5000mAh para uso intensivo' },
    { icon: 'Droplet', title: 'Resistente IP67', description: 'Protección contra agua y polvo' },
  ],
  batteryLife: 'Hasta 2 días',
  fastCharge: '25W',
  hasOS: true,
  osName: 'Android 14',
  warranty: '1 año con fabricante + 6 meses BaldeCash',
  stock: 12,
  rating: 4.6,
  reviewCount: 234,
};

export const mockSimilarCelulares: SimilarProduct[] = [
  {
    id: 'xiaomi-redmi-note13',
    name: 'Xiaomi Redmi Note 13 Pro',
    brand: 'Xiaomi',
    thumbnail: 'https://pngimg.com/d/smartphone_PNG8545.png',
    images: [
      'https://pngimg.com/d/smartphone_PNG8545.png',
      'https://pngimg.com/d/smartphone_PNG8534.png',
      'https://pngimg.com/d/smartphone_PNG8507.png',
    ],
    colors: [
      { id: 'redmi-black', name: 'Negro Medianoche', hex: '#1A1A1A' },
      { id: 'redmi-purple', name: 'Púrpura Aurora', hex: '#9333EA' },
      { id: 'redmi-white', name: 'Blanco Polar', hex: '#F8F8F8' },
    ],
    monthlyQuota: 45,
    quotaDifference: -9,
    matchScore: 82,
    differentiators: ['Más económico', '200MP'],
    slug: 'redmi-note-13-pro-256gb',
    specs: {
      processor: 'Snapdragon 7s Gen 2',
      ram: '8GB',
      storage: '256GB',
      display: '6.67" AMOLED 120Hz',
    },
  },
  {
    id: 'motorola-edge40',
    name: 'Motorola Edge 40',
    brand: 'Motorola',
    thumbnail: 'https://pngimg.com/d/smartphone_PNG8507.png',
    images: [
      'https://pngimg.com/d/smartphone_PNG8507.png',
      'https://pngimg.com/d/smartphone_PNG8517.png',
      'https://pngimg.com/d/smartphone_PNG8526.png',
    ],
    colors: [
      { id: 'moto-eclipse', name: 'Negro Eclipse', hex: '#1C1C1C' },
      { id: 'moto-nebula', name: 'Verde Nébula', hex: '#22C55E' },
      { id: 'moto-coral', name: 'Coral Vivo', hex: '#F97316' },
    ],
    monthlyQuota: 59,
    quotaDifference: +5,
    matchScore: 85,
    differentiators: ['144Hz', 'Carga 68W'],
    slug: 'motorola-edge-40-256gb',
    specs: {
      processor: 'Dimensity 8020',
      ram: '8GB',
      storage: '256GB',
      display: '6.55" pOLED 144Hz',
    },
  },
  {
    id: 'samsung-s23-fe',
    name: 'Samsung Galaxy S23 FE',
    brand: 'Samsung',
    thumbnail: 'https://pngimg.com/d/smartphone_PNG8517.png',
    images: [
      'https://pngimg.com/d/smartphone_PNG8517.png',
      'https://pngimg.com/d/smartphone_PNG8534.png',
      'https://pngimg.com/d/smartphone_PNG8545.png',
    ],
    colors: [
      { id: 's23fe-graphite', name: 'Grafito', hex: '#3D3D3D' },
      { id: 's23fe-cream', name: 'Crema', hex: '#F5F0E3' },
      { id: 's23fe-mint', name: 'Menta', hex: '#98D8C8' },
      { id: 's23fe-indigo', name: 'Índigo', hex: '#4B0082' },
    ],
    monthlyQuota: 79,
    quotaDifference: +25,
    matchScore: 90,
    differentiators: ['Flagship', 'Snapdragon 8'],
    slug: 'samsung-s23-fe-128gb',
    specs: {
      processor: 'Snapdragon 8 Gen 1',
      ram: '8GB',
      storage: '128GB',
      display: '6.4" Dynamic AMOLED',
    },
  },
  {
    id: 'realme-12-pro',
    name: 'Realme 12 Pro+ 5G',
    brand: 'Realme',
    thumbnail: 'https://pngimg.com/d/smartphone_PNG8526.png',
    images: [
      'https://pngimg.com/d/smartphone_PNG8526.png',
      'https://pngimg.com/d/smartphone_PNG8507.png',
      'https://pngimg.com/d/smartphone_PNG8517.png',
    ],
    colors: [
      { id: 'realme-beige', name: 'Beige Navegante', hex: '#D4C4A8' },
      { id: 'realme-blue', name: 'Azul Submarino', hex: '#1E40AF' },
    ],
    monthlyQuota: 49,
    quotaDifference: -5,
    matchScore: 80,
    differentiators: ['Zoom periscópico', 'Diseño premium'],
    slug: 'realme-12-pro-plus-256gb',
    specs: {
      processor: 'Snapdragon 7s Gen 2',
      ram: '12GB',
      storage: '256GB',
      display: '6.7" AMOLED 120Hz',
    },
  },
];

export const mockCelularLimitations: ProductLimitation[] = [
  {
    category: 'Rendimiento',
    description: 'No es ideal para gaming intensivo',
    severity: 'info',
    alternative: 'Para gaming considera un Galaxy S o iPhone',
    icon: 'Gamepad2',
  },
  {
    category: 'Carga',
    description: 'Carga de 25W es más lenta que la competencia',
    severity: 'info',
    alternative: 'Aún así, 50% en 30 minutos es razonable',
    icon: 'BatteryCharging',
  },
];

export const mockCelularCertifications: Certification[] = [
  {
    code: 'ip67',
    name: 'IP67',
    logo: '/certifications/ip67.svg',
    description: 'Resistente al agua. Sumergible hasta 1m por 30 minutos.',
  },
  {
    code: '5g',
    name: '5G Ready',
    logo: '/certifications/5g.svg',
    description: 'Compatible con redes 5G para máxima velocidad de datos.',
  },
  {
    code: 'samsung-knox',
    name: 'Samsung Knox',
    logo: '/certifications/knox.svg',
    description: 'Seguridad de nivel empresarial integrada.',
  },
];

// ============================================
// Helper: Get Data by Device Type
// ============================================

export const getProductByDeviceType = (deviceType: DeviceType): ProductDetail => {
  switch (deviceType) {
    case 'tablet':
      return mockTabletDetail;
    case 'celular':
      return mockCelularDetail;
    case 'laptop':
    default:
      return mockProductDetail;
  }
};

export const getSimilarProductsByDeviceType = (deviceType: DeviceType): SimilarProduct[] => {
  switch (deviceType) {
    case 'tablet':
      return mockSimilarTablets;
    case 'celular':
      return mockSimilarCelulares;
    case 'laptop':
    default:
      return mockSimilarProducts;
  }
};

export const getLimitationsByDeviceType = (deviceType: DeviceType): ProductLimitation[] => {
  switch (deviceType) {
    case 'tablet':
      return mockTabletLimitations;
    case 'celular':
      return mockCelularLimitations;
    case 'laptop':
    default:
      return mockLimitations;
  }
};

export const getCertificationsByDeviceType = (deviceType: DeviceType): Certification[] => {
  switch (deviceType) {
    case 'tablet':
      return mockTabletCertifications;
    case 'celular':
      return mockCelularCertifications;
    case 'laptop':
    default:
      return mockCertifications;
  }
};
