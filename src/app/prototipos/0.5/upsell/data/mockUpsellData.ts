// data/mockUpsellData.ts - BaldeCash Upsell Mock Data v0.5

import type { Accessory, InsurancePlan, ProductContext } from '../types/upsell';

// ============================================
// Accesorios Mock
// ============================================

export const mockAccessories: Accessory[] = [
  {
    id: 'mouse-1',
    name: 'Mouse inalámbrico Logitech M170',
    description: 'Mouse ergonómico con hasta 12 meses de batería. Conexión USB plug-and-play.',
    price: 89,
    monthlyQuota: 4,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
    category: 'conectividad',
    isRecommended: true,
    compatibleWith: ['all'],
  },
  {
    id: 'funda-1',
    name: 'Funda protectora 15.6"',
    description: 'Protección contra golpes y salpicaduras. Material resistente con acolchado interno.',
    price: 59,
    monthlyQuota: 3,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
    category: 'protección',
    isRecommended: true,
    compatibleWith: ['all'],
  },
  {
    id: 'audifonos-1',
    name: 'Audífonos con micrófono USB',
    description: 'Ideal para clases virtuales y videollamadas. Cancelación de ruido pasiva.',
    price: 79,
    monthlyQuota: 4,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    category: 'audio',
    isRecommended: false,
    compatibleWith: ['all'],
  },
  {
    id: 'hub-1',
    name: 'Hub USB-C 7 en 1',
    description: 'HDMI, USB 3.0, lector SD, puerto Ethernet. Expande la conectividad de tu laptop.',
    price: 129,
    monthlyQuota: 6,
    image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400&h=400&fit=crop',
    category: 'conectividad',
    isRecommended: false,
    compatibleWith: ['all'],
  },
  {
    id: 'cooler-1',
    name: 'Base enfriadora con ventiladores',
    description: '2 ventiladores silenciosos. Ángulo ajustable para mejor ergonomía.',
    price: 69,
    monthlyQuota: 3,
    image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=400&fit=crop',
    category: 'protección',
    isRecommended: false,
    compatibleWith: ['all'],
  },
  {
    id: 'ssd-1',
    name: 'SSD Externo 500GB USB 3.0',
    description: 'Almacenamiento portátil ultrarrápido. Ideal para backups y archivos grandes.',
    price: 189,
    monthlyQuota: 8,
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop',
    category: 'almacenamiento',
    isRecommended: false,
    compatibleWith: ['all'],
  },
];

// ============================================
// Planes de Seguro Mock
// ============================================

export const mockInsurancePlans: InsurancePlan[] = [
  {
    id: 'basic',
    name: 'Protección Básica',
    monthlyPrice: 15,
    yearlyPrice: 180,
    tier: 'basic',
    isRecommended: false,
    coverage: [
      {
        name: 'Robo con violencia',
        description: 'Cobertura si te roban el equipo con amenaza o agresión',
        icon: 'Shield',
        maxAmount: 3000,
      },
    ],
    exclusions: [
      'Daños por líquidos',
      'Daños accidentales (caídas, golpes)',
      'Pérdida o extravío',
      'Daños por mal uso',
    ],
  },
  {
    id: 'standard',
    name: 'Protección Total',
    monthlyPrice: 29,
    yearlyPrice: 348,
    tier: 'standard',
    isRecommended: true,
    coverage: [
      {
        name: 'Robo',
        description: 'Cobertura completa por robo',
        icon: 'Shield',
        maxAmount: 4000,
      },
      {
        name: 'Daños accidentales',
        description: 'Caídas, golpes, pantalla rota',
        icon: 'AlertTriangle',
        maxAmount: 3500,
      },
      {
        name: 'Daños por líquidos',
        description: 'Derrames de agua, café, etc.',
        icon: 'Droplet',
        maxAmount: 3500,
      },
    ],
    exclusions: [
      'Pérdida o extravío',
      'Daño intencional',
      'Desgaste normal',
    ],
  },
  {
    id: 'premium',
    name: 'Protección Premium',
    monthlyPrice: 45,
    yearlyPrice: 540,
    tier: 'premium',
    isRecommended: false,
    coverage: [
      {
        name: 'Todo lo de Total',
        description: 'Robo, daños accidentales, líquidos',
        icon: 'Shield',
        maxAmount: 5000,
      },
      {
        name: 'Pérdida',
        description: 'Extravío del equipo',
        icon: 'Search',
        maxAmount: 4000,
      },
      {
        name: 'Extensión de garantía',
        description: '+12 meses de garantía del fabricante',
        icon: 'Clock',
      },
      {
        name: 'Soporte técnico prioritario',
        description: 'Atención preferencial 24/7',
        icon: 'Headphones',
      },
    ],
    exclusions: [
      'Daño intencional',
      'Uso comercial no declarado',
    ],
  },
];

// ============================================
// Producto Mock (para contexto de upsell)
// ============================================

export const mockProductContext: ProductContext = {
  id: 'lenovo-v15',
  name: 'Lenovo V15 G4 AMN',
  price: 2499,
  monthlyQuota: 104, // 24 meses
  term: 24,
};

// ============================================
// Helpers
// ============================================

export const getAccessoryById = (id: string): Accessory | undefined => {
  return mockAccessories.find((a) => a.id === id);
};

export const getInsurancePlanById = (id: string): InsurancePlan | undefined => {
  return mockInsurancePlans.find((p) => p.id === id);
};

export const calculateTotalWithUpsells = (
  productPrice: number,
  selectedAccessoryIds: string[],
  selectedInsuranceId: string | null
): { totalPrice: number; totalQuota: number; breakdown: { item: string; price: number; quota: number }[] } => {
  const breakdown: { item: string; price: number; quota: number }[] = [
    { item: 'Equipo', price: productPrice, quota: Math.round(productPrice / 24) },
  ];

  let totalPrice = productPrice;

  selectedAccessoryIds.forEach((id) => {
    const accessory = getAccessoryById(id);
    if (accessory) {
      totalPrice += accessory.price;
      breakdown.push({
        item: accessory.name,
        price: accessory.price,
        quota: accessory.monthlyQuota,
      });
    }
  });

  if (selectedInsuranceId) {
    const insurance = getInsurancePlanById(selectedInsuranceId);
    if (insurance) {
      breakdown.push({
        item: insurance.name,
        price: insurance.monthlyPrice * 24,
        quota: insurance.monthlyPrice,
      });
    }
  }

  const totalQuota = breakdown.reduce((sum, item) => sum + item.quota, 0);

  return { totalPrice, totalQuota, breakdown };
};
