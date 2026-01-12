// Mock Data for Landing Page - BaldeCash v0.5
// Configuración fija - Sin variaciones para A/B testing

import {
  CampaignData,
  LandingBenefit,
  LandingProduct,
  Region,
  InstitucionEducativa,
} from '../types/landing';

// ============================================
// Campaigns Data
// ============================================

export const campaigns: CampaignData[] = [
  {
    id: 'camp-220',
    slug: '220',
    nombre: 'Campaña Enero 2026',
    titulo: '¡Tu laptop ideal está aquí!',
    subtitulo: 'Financiamiento sin tarjeta de crédito para estudiantes',
    colorPrimario: '#4654CD',
    colorSecundario: '#03DBD0',
    bannerTexto: '¡GRATIS! Mochila porta laptop por tu compra',
    activo: true,
  },
  {
    id: 'camp-194',
    slug: '194',
    nombre: 'Campaña Verano',
    titulo: 'Equípate para el éxito',
    subtitulo: 'Laptops y celulares en cuotas accesibles',
    colorPrimario: '#4654CD',
    colorSecundario: '#03DBD0',
    bannerTexto: '¡Primera cuota GRATIS por tiempo limitado!',
    activo: true,
  },
];

// Helper to get campaign by slug
export const getCampaignBySlug = (slug: string): CampaignData | undefined => {
  return campaigns.find((c) => c.slug === slug);
};

// Default campaign for preview
export const defaultCampaign = campaigns[0];

// ============================================
// Benefits Data (barra horizontal)
// ============================================

export const landingBenefits: LandingBenefit[] = [
  {
    id: 'benefit-1',
    icon: 'Truck',
    texto: 'Envíos GRATIS a todo el Perú',
  },
  {
    id: 'benefit-2',
    icon: 'Shield',
    texto: 'Garantía de 12 meses',
  },
  {
    id: 'benefit-3',
    icon: 'CreditCard',
    texto: 'Sin inicial',
  },
  {
    id: 'benefit-4',
    icon: 'IdCard',
    texto: 'Evaluación con DNI',
  },
];

// ============================================
// Products Data (carousel)
// ============================================

export const landingProducts: LandingProduct[] = [
  {
    id: 'prod-1',
    nombre: 'Lenovo IdeaPad 3 15.6"',
    imagen: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad7929bd7b580e6de7247d_Lenovo%20Chromebook%20S330.jpg',
    cuotaMensual: 89,
    precioTotal: 2499,
    destacado: true,
  },
  {
    id: 'prod-2',
    nombre: 'HP Pavilion 15.6" Touch',
    imagen: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad8af9ed1fbf48ea397396_hp15.png',
    cuotaMensual: 109,
    precioTotal: 2999,
    destacado: false,
  },
  {
    id: 'prod-3',
    nombre: 'ASUS VivoBook 15 OLED',
    imagen: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad78aca11478d9ed058463_laptop_asus_x515ea.jpg',
    cuotaMensual: 129,
    precioTotal: 3499,
    destacado: false,
  },
  {
    id: 'prod-4',
    nombre: 'Dell Inspiron 15 3000',
    imagen: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad7ac27cd445765564b11b_Dell%201505.jpg',
    cuotaMensual: 99,
    precioTotal: 2699,
    destacado: false,
  },
  {
    id: 'prod-5',
    nombre: 'Acer Aspire 5 14"',
    imagen: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad79b64b6011e52725b3a7_hyndai_hybook.png',
    cuotaMensual: 119,
    precioTotal: 3199,
    destacado: false,
  },
];

// ============================================
// Regions Data (Perú)
// ============================================

export const regions: Region[] = [
  {
    id: 'lima',
    nombre: 'Lima',
    provincias: [
      { id: 'lima-metro', nombre: 'Lima Metropolitana' },
      { id: 'callao', nombre: 'Callao' },
      { id: 'cañete', nombre: 'Cañete' },
      { id: 'huaral', nombre: 'Huaral' },
      { id: 'huaura', nombre: 'Huaura' },
    ],
  },
  {
    id: 'arequipa',
    nombre: 'Arequipa',
    provincias: [
      { id: 'arequipa-ciudad', nombre: 'Arequipa' },
      { id: 'camana', nombre: 'Camaná' },
      { id: 'islay', nombre: 'Islay' },
    ],
  },
  {
    id: 'la-libertad',
    nombre: 'La Libertad',
    provincias: [
      { id: 'trujillo', nombre: 'Trujillo' },
      { id: 'pacasmayo', nombre: 'Pacasmayo' },
      { id: 'chepen', nombre: 'Chepén' },
    ],
  },
  {
    id: 'piura',
    nombre: 'Piura',
    provincias: [
      { id: 'piura-ciudad', nombre: 'Piura' },
      { id: 'sullana', nombre: 'Sullana' },
      { id: 'talara', nombre: 'Talara' },
    ],
  },
  {
    id: 'lambayeque',
    nombre: 'Lambayeque',
    provincias: [
      { id: 'chiclayo', nombre: 'Chiclayo' },
      { id: 'lambayeque-ciudad', nombre: 'Lambayeque' },
      { id: 'ferrenafe', nombre: 'Ferreñafe' },
    ],
  },
  {
    id: 'cusco',
    nombre: 'Cusco',
    provincias: [
      { id: 'cusco-ciudad', nombre: 'Cusco' },
      { id: 'urubamba', nombre: 'Urubamba' },
      { id: 'calca', nombre: 'Calca' },
    ],
  },
  {
    id: 'junin',
    nombre: 'Junín',
    provincias: [
      { id: 'huancayo', nombre: 'Huancayo' },
      { id: 'satipo', nombre: 'Satipo' },
      { id: 'tarma', nombre: 'Tarma' },
    ],
  },
  {
    id: 'ica',
    nombre: 'Ica',
    provincias: [
      { id: 'ica-ciudad', nombre: 'Ica' },
      { id: 'chincha', nombre: 'Chincha' },
      { id: 'pisco', nombre: 'Pisco' },
      { id: 'nazca', nombre: 'Nazca' },
    ],
  },
];

// ============================================
// Instituciones Educativas Data
// ============================================

export const instituciones: InstitucionEducativa[] = [
  // Universidades
  { id: 'upn', nombre: 'Universidad Privada del Norte (UPN)', tipo: 'universidad' },
  { id: 'upc', nombre: 'Universidad Peruana de Ciencias Aplicadas (UPC)', tipo: 'universidad' },
  { id: 'usil', nombre: 'Universidad San Ignacio de Loyola (USIL)', tipo: 'universidad' },
  { id: 'utp', nombre: 'Universidad Tecnológica del Perú (UTP)', tipo: 'universidad' },
  { id: 'continental', nombre: 'Universidad Continental', tipo: 'universidad' },
  { id: 'ucv', nombre: 'Universidad César Vallejo (UCV)', tipo: 'universidad' },
  { id: 'unmsm', nombre: 'Universidad Nacional Mayor de San Marcos', tipo: 'universidad' },
  { id: 'uni', nombre: 'Universidad Nacional de Ingeniería (UNI)', tipo: 'universidad' },
  { id: 'pucp', nombre: 'Pontificia Universidad Católica del Perú (PUCP)', tipo: 'universidad' },
  // Institutos
  { id: 'certus', nombre: 'Instituto CERTUS', tipo: 'instituto' },
  { id: 'tecsup', nombre: 'TECSUP', tipo: 'instituto' },
  { id: 'senati', nombre: 'SENATI', tipo: 'instituto' },
  { id: 'cibertec', nombre: 'Instituto CIBERTEC', tipo: 'instituto' },
  { id: 'isil', nombre: 'Instituto ISIL', tipo: 'instituto' },
  { id: 'toulouse', nombre: 'Instituto Toulouse Lautrec', tipo: 'instituto' },
  { id: 'idat', nombre: 'Instituto IDAT', tipo: 'instituto' },
  // Colegios
  { id: 'colegio-otro', nombre: 'Colegio / Academia', tipo: 'colegio' },
  // Otro
  { id: 'otro', nombre: 'Otra institución', tipo: 'otro' },
];

// ============================================
// Promo Products Data (for V1-V3 promo landings)
// ============================================

export const promoProductCountdown = {
  id: 'promo-countdown',
  nombre: 'HP Pavilion 15.6" AMD Ryzen 5',
  marca: 'HP',
  imagen: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad8af9ed1fbf48ea397396_hp15.png',
  precioOriginal: 3499,
  precioPromo: 2799,
  cuotaOriginal: 145,
  cuotaPromo: 116,
  specs: ['AMD Ryzen 5', '8GB RAM', '512GB SSD', 'Full HD'],
};

export const promoProductGift = {
  id: 'promo-gift',
  nombre: 'Lenovo IdeaPad 3 15.6" Intel Core i5',
  marca: 'Lenovo',
  imagen: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad7929bd7b580e6de7247d_Lenovo%20Chromebook%20S330.jpg',
  precioTotal: 2999,
  cuotaMensual: 125,
  specs: ['Intel Core i5', '8GB RAM', '256GB SSD', 'Full HD'],
};

export const promoGift = {
  nombre: 'Mochila Porta Laptop HP',
  imagen: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop',
  valorEstimado: 149,
};

export const promoProductFlash = {
  id: 'promo-flash',
  nombre: 'ASUS VivoBook 15 OLED',
  marca: 'ASUS',
  imagen: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad78aca11478d9ed058463_laptop_asus_x515ea.jpg',
  precioOriginal: 3999,
  precioFlash: 2999,
  cuotaOriginal: 166,
  cuotaFlash: 125,
  specs: ['Intel Core i7', '16GB RAM', '512GB SSD', 'OLED Display'],
  stockTotal: 50,
  stockVendido: 43,
};

// Helper to get promo end date (3 days from now)
export const getPromoEndDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  date.setHours(23, 59, 59, 999);
  return date;
};

// ============================================
// Helper Functions
// ============================================

export const getProvincias = (regionId: string) => {
  const region = regions.find((r) => r.id === regionId);
  return region?.provincias || [];
};

export const getInstitucionesByTipo = (tipo: InstitucionEducativa['tipo']) => {
  return instituciones.filter((i) => i.tipo === tipo);
};
