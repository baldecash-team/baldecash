// Mock Upsell Data - BaldeCash v0.3
// Generated from PROMPT_14_UPSELL.md

import { Accessory, InsurancePlan } from '../types/upsell';

export const mockAccessories: Accessory[] = [
  {
    id: 'mouse-1',
    name: 'Mouse inalambrico Logitech M240',
    description: 'Mouse ergonomico con 18 meses de bateria y conexion Bluetooth',
    price: 89,
    monthlyQuota: 4,
    image: '/products/accessories/mouse.png',
    category: 'conectividad',
    isRecommended: true,
    compatibleWith: ['all'],
  },
  {
    id: 'funda-1',
    name: 'Funda protectora 15.6"',
    description: 'Proteccion contra golpes y salpicaduras de agua',
    price: 59,
    monthlyQuota: 3,
    image: '/products/accessories/funda.png',
    category: 'proteccion',
    isRecommended: true,
    compatibleWith: ['all'],
  },
  {
    id: 'audifonos-1',
    name: 'Audifonos con microfono JBL',
    description: 'Ideal para clases virtuales con cancelacion de ruido',
    price: 129,
    monthlyQuota: 6,
    image: '/products/accessories/audifonos.png',
    category: 'audio',
    isRecommended: false,
    compatibleWith: ['all'],
  },
  {
    id: 'usb-hub-1',
    name: 'Hub USB-C 7 en 1',
    description: 'Expande tus puertos: HDMI, USB-A, SD, MicroSD',
    price: 149,
    monthlyQuota: 7,
    image: '/products/accessories/hub.png',
    category: 'conectividad',
    isRecommended: false,
    compatibleWith: ['all'],
  },
  {
    id: 'ssd-1',
    name: 'SSD Externo 500GB Samsung',
    description: 'Almacenamiento rapido y portatil para tus archivos',
    price: 199,
    monthlyQuota: 9,
    image: '/products/accessories/ssd.png',
    category: 'almacenamiento',
    isRecommended: false,
    compatibleWith: ['all'],
  },
  {
    id: 'cooler-1',
    name: 'Base enfriadora con ventiladores',
    description: 'Mantiene tu laptop fria durante uso intensivo',
    price: 79,
    monthlyQuota: 4,
    image: '/products/accessories/cooler.png',
    category: 'proteccion',
    isRecommended: false,
    compatibleWith: ['all'],
  },
];

export const mockInsurancePlans: InsurancePlan[] = [
  {
    id: 'basic',
    name: 'Proteccion Basica',
    monthlyPrice: 15,
    yearlyPrice: 180,
    tier: 'basic',
    isRecommended: false,
    coverage: [
      {
        name: 'Robo',
        description: 'Cobertura por robo con violencia o asalto',
        icon: 'Shield',
        maxAmount: 3000,
      },
    ],
    exclusions: ['Danos por liquidos', 'Danos accidentales', 'Perdida', 'Dano intencional'],
  },
  {
    id: 'standard',
    name: 'Proteccion Total',
    monthlyPrice: 29,
    yearlyPrice: 348,
    tier: 'standard',
    isRecommended: true,
    coverage: [
      {
        name: 'Robo',
        description: 'Cobertura por robo con violencia o asalto',
        icon: 'Shield',
        maxAmount: 5000,
      },
      {
        name: 'Danos accidentales',
        description: 'Caidas, golpes y fracturas de pantalla',
        icon: 'AlertTriangle',
        maxAmount: 3000,
      },
      {
        name: 'Danos por liquidos',
        description: 'Derrames de agua, cafe u otros liquidos',
        icon: 'Droplet',
        maxAmount: 2500,
      },
    ],
    exclusions: ['Perdida', 'Dano intencional'],
  },
  {
    id: 'premium',
    name: 'Proteccion Premium',
    monthlyPrice: 45,
    yearlyPrice: 540,
    tier: 'premium',
    isRecommended: false,
    coverage: [
      {
        name: 'Robo',
        description: 'Cobertura por robo con violencia o asalto',
        icon: 'Shield',
        maxAmount: 8000,
      },
      {
        name: 'Danos accidentales',
        description: 'Caidas, golpes y fracturas de pantalla',
        icon: 'AlertTriangle',
        maxAmount: 5000,
      },
      {
        name: 'Danos por liquidos',
        description: 'Derrames de agua, cafe u otros liquidos',
        icon: 'Droplet',
        maxAmount: 4000,
      },
      {
        name: 'Perdida',
        description: 'Extravio del equipo (con denuncia policial)',
        icon: 'Search',
        maxAmount: 6000,
      },
      {
        name: 'Extension de garantia',
        description: '+12 meses adicionales de garantia del fabricante',
        icon: 'Clock',
      },
    ],
    exclusions: ['Dano intencional'],
  },
];

// Sample product for upsell context
export const sampleProduct = {
  id: 'hp-victus-1',
  name: 'HP Victus 15',
  displayName: 'HP Victus 15 Gaming Laptop',
  price: 3499,
  monthlyQuota: 145,
  image: '/products/laptops/hp-victus.png',
};
