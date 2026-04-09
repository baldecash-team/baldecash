/**
 * Mock data for Zona Gamer product detail.
 * Keys MUST match the slug used in GamerCatalogoClient mock products.
 * TODO: Remove when backend is ready.
 */

import type { ProductDetailResult } from '../api/productDetailApi';

const BASE = '/images/zona-gamer/catalogo-laptops';

function makeImages(folder: string, count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    url: `${BASE}/${folder}/${i + 1}.png`,
    alt: folder.replace(/-/g, ' '),
    type: (i === 0 ? 'main' : 'gallery') as 'main' | 'gallery',
  }));
}

function makePlans(price: number) {
  const plans = [
    { term: 12, factor: 0.098 },
    { term: 18, factor: 0.072 },
    { term: 24, factor: 0.058 },
  ];
  return plans.map(({ term, factor }) => ({
    term,
    tea: 29.9,
    tcea: 34.5,
    options: [
      { initialPercent: 0 as const, initialAmount: 0, monthlyQuota: Math.round(price * factor) },
      { initialPercent: 10 as const, initialAmount: Math.round(price * 0.1), monthlyQuota: Math.round(price * 0.9 * factor) },
      { initialPercent: 20 as const, initialAmount: Math.round(price * 0.2), monthlyQuota: Math.round(price * 0.8 * factor) },
    ],
  }));
}

const base = {
  category: 'laptop',
  deviceType: 'laptop',
  colors: [],
  colorSiblings: [],
  ports: [],
  software: [],
  features: [],
  badges: [],
  batteryLife: '',
  hasOS: true,
  osName: 'Windows 11',
  warranty: '1 año de garantía',
  stock: 5,
  rating: 4.5,
  reviewCount: 0,
};

function wrap(product: Record<string, unknown>, price: number): ProductDetailResult {
  return {
    product: { ...base, ...product } as ProductDetailResult['product'],
    paymentPlans: makePlans(price),
    similarProducts: [],
    limitations: [],
    certifications: [],
    isAvailable: true,
  };
}

// Keys = exact slugs from GamerCatalogoClient mockGamingProducts
export const GAMER_MOCK_PRODUCTS: Record<string, ProductDetailResult> = {
  // ── mock-1: Lenovo LOQ 15ARP9
  'lenovo-loq-15arp9': wrap({
    id: 'gm-1', slug: 'lenovo-loq-15arp9',
    name: 'LOQ 15ARP9', displayName: 'Lenovo LOQ 15ARP9', brand: 'Lenovo',
    price: 4399, lowestQuota: 345,
    images: makeImages('Lenovo-LOQ-15ARP9', 6),
    description: 'Laptop gamer Lenovo LOQ con AMD Ryzen 7 y RTX 4050, diseño compacto y potente.',
    shortDescription: 'LOQ 15 AMD Ryzen gaming compacto',
    specs: [
      { category: 'Procesador', icon: 'cpu', specs: [{ label: 'Modelo', value: 'AMD Ryzen 7 7435HS', highlight: true }, { label: 'Núcleos', value: '8 núcleos / 16 hilos' }] },
      { category: 'Memoria RAM', icon: 'memory', specs: [{ label: 'Capacidad', value: '16 GB DDR5', highlight: true }] },
      { category: 'Almacenamiento', icon: 'storage', specs: [{ label: 'SSD', value: '512 GB NVMe', highlight: true }] },
      { category: 'Pantalla', icon: 'display', specs: [{ label: 'Tamaño', value: '15.6" FHD 144Hz', highlight: true }] },
      { category: 'GPU', icon: 'gpu', specs: [{ label: 'Tarjeta gráfica', value: 'NVIDIA RTX 4050 6GB', highlight: true }] },
    ],
  }, 4399),

  // ── mock-2: HP Victus 15-FB3022LA
  'hp-victus-15-fb3022la': wrap({
    id: 'gm-2', slug: 'hp-victus-15-fb3022la',
    name: 'Victus 15-FB3022LA', displayName: 'HP Victus 15-FB3022LA', brand: 'HP',
    price: 4799, lowestQuota: 375,
    images: makeImages('HP-Victus-15-FB3022LA', 5),
    description: 'Laptop gamer HP Victus con AMD Ryzen 7 8845HS y RTX 4050 para gaming fluido.',
    shortDescription: 'Victus 15 AMD Ryzen 7 + RTX 4050',
    specs: [
      { category: 'Procesador', icon: 'cpu', specs: [{ label: 'Modelo', value: 'AMD Ryzen 7 8845HS', highlight: true }, { label: 'Núcleos', value: '8 núcleos / 16 hilos' }] },
      { category: 'Memoria RAM', icon: 'memory', specs: [{ label: 'Capacidad', value: '16 GB DDR5', highlight: true }] },
      { category: 'Almacenamiento', icon: 'storage', specs: [{ label: 'SSD', value: '512 GB NVMe', highlight: true }] },
      { category: 'Pantalla', icon: 'display', specs: [{ label: 'Tamaño', value: '15.6" FHD 144Hz', highlight: true }] },
      { category: 'GPU', icon: 'gpu', specs: [{ label: 'Tarjeta gráfica', value: 'NVIDIA RTX 4050 6GB', highlight: true }] },
    ],
  }, 4799),

  // ── mock-3: HP VICTUS 15-fb3013la
  'hp-15-fb3013la': wrap({
    id: 'gm-3', slug: 'hp-15-fb3013la',
    name: '15-fb3013la', displayName: 'HP VICTUS 15-fb3013la', brand: 'HP',
    price: 5099, lowestQuota: 383,
    images: makeImages('HP-15-fb3013la', 5),
    description: 'Laptop gamer HP Victus con Ryzen 7 8845HS y RTX 4050, 1TB SSD.',
    shortDescription: 'Victus 15 con 1TB SSD y RTX 4050',
    specs: [
      { category: 'Procesador', icon: 'cpu', specs: [{ label: 'Modelo', value: 'AMD Ryzen 7 8845HS', highlight: true }, { label: 'Núcleos', value: '8 núcleos / 16 hilos' }] },
      { category: 'Memoria RAM', icon: 'memory', specs: [{ label: 'Capacidad', value: '16 GB DDR5', highlight: true }] },
      { category: 'Almacenamiento', icon: 'storage', specs: [{ label: 'SSD', value: '1 TB NVMe', highlight: true }] },
      { category: 'Pantalla', icon: 'display', specs: [{ label: 'Tamaño', value: '15.6" FHD 144Hz', highlight: true }] },
      { category: 'GPU', icon: 'gpu', specs: [{ label: 'Tarjeta gráfica', value: 'NVIDIA RTX 4050 6GB', highlight: true }] },
    ],
  }, 5099),

  // ── mock-4: ASUS TUF Gaming F16 FX607VU-RL048
  'asus-tuf-f16-fx607vu': wrap({
    id: 'gm-4', slug: 'asus-tuf-f16-fx607vu',
    name: 'TUF Gaming F16', displayName: 'ASUS TUF Gaming F16 FX607VU-RL048', brand: 'ASUS',
    price: 4299, lowestQuota: 339,
    images: makeImages('ASUS-TUF-Gaming-F16-FX607VU-RL048', 6),
    description: 'Laptop gamer ASUS TUF Gaming F16 con Intel Core Ultra 5 y RTX 4050.',
    shortDescription: 'TUF Gaming F16 Intel Core Ultra 5',
    specs: [
      { category: 'Procesador', icon: 'cpu', specs: [{ label: 'Modelo', value: 'Intel Core Ultra 5 235H', highlight: true }, { label: 'Núcleos', value: '14 núcleos' }] },
      { category: 'Memoria RAM', icon: 'memory', specs: [{ label: 'Capacidad', value: '16 GB DDR5', highlight: true }] },
      { category: 'Almacenamiento', icon: 'storage', specs: [{ label: 'SSD', value: '512 GB NVMe', highlight: true }] },
      { category: 'Pantalla', icon: 'display', specs: [{ label: 'Tamaño', value: '16" FHD 144Hz', highlight: true }] },
      { category: 'GPU', icon: 'gpu', specs: [{ label: 'Tarjeta gráfica', value: 'NVIDIA RTX 4050 6GB', highlight: true }] },
    ],
  }, 4299),

  // ── mock-5: ASUS TUF Gaming F16 FX607VJB-RL209
  'asus-tuf-f16-fx607vjb': wrap({
    id: 'gm-5', slug: 'asus-tuf-f16-fx607vjb',
    name: 'TUF Gaming F16', displayName: 'ASUS TUF Gaming F16 FX607VJB-RL209', brand: 'ASUS',
    price: 3999, lowestQuota: 318,
    images: makeImages('ASUS-TUF-Gaming-F16-FX607VJB-RL209', 6),
    description: 'Laptop gamer ASUS TUF Gaming F16 con Intel Core Ultra 5 y RTX 3050.',
    shortDescription: 'TUF Gaming F16 con RTX 3050',
    specs: [
      { category: 'Procesador', icon: 'cpu', specs: [{ label: 'Modelo', value: 'Intel Core Ultra 5 235H', highlight: true }, { label: 'Núcleos', value: '14 núcleos' }] },
      { category: 'Memoria RAM', icon: 'memory', specs: [{ label: 'Capacidad', value: '8 GB DDR5', highlight: true }] },
      { category: 'Almacenamiento', icon: 'storage', specs: [{ label: 'SSD', value: '512 GB NVMe', highlight: true }] },
      { category: 'Pantalla', icon: 'display', specs: [{ label: 'Tamaño', value: '16" FHD 144Hz', highlight: true }] },
      { category: 'GPU', icon: 'gpu', specs: [{ label: 'Tarjeta gráfica', value: 'NVIDIA RTX 3050 4GB', highlight: true }] },
    ],
  }, 3999),

  // ── mock-6: ASUS F16 FX608JH-RV010
  'asus-f16-fx608jh': wrap({
    id: 'gm-6', slug: 'asus-f16-fx608jh',
    name: 'F16 FX608JH', displayName: 'ASUS F16 FX608JH-RV010', brand: 'ASUS',
    price: 5499, lowestQuota: 428,
    images: makeImages('ASUS-F16-FX608JH-RV010', 7),
    description: 'Laptop gamer ASUS F16 con Intel Core i5-13500H y RTX 4050.',
    shortDescription: 'F16 Intel i5 + RTX 4050',
    specs: [
      { category: 'Procesador', icon: 'cpu', specs: [{ label: 'Modelo', value: 'Intel Core i5-13500H', highlight: true }, { label: 'Núcleos', value: '12 núcleos / 16 hilos' }] },
      { category: 'Memoria RAM', icon: 'memory', specs: [{ label: 'Capacidad', value: '16 GB DDR5', highlight: true }] },
      { category: 'Almacenamiento', icon: 'storage', specs: [{ label: 'SSD', value: '512 GB NVMe', highlight: true }] },
      { category: 'Pantalla', icon: 'display', specs: [{ label: 'Tamaño', value: '16" FHD 144Hz', highlight: true }] },
      { category: 'GPU', icon: 'gpu', specs: [{ label: 'Tarjeta gráfica', value: 'NVIDIA RTX 4050 6GB', highlight: true }] },
    ],
  }, 5499),

  // ── mock-7: ASUS ROG Strix G614PM-RV127W
  'asus-g614pm': wrap({
    id: 'gm-7', slug: 'asus-g614pm',
    name: 'G614PM', displayName: 'ASUS ROG Strix G614PM-RV127W', brand: 'ASUS',
    price: 8599, lowestQuota: 671,
    images: makeImages('ASUS-G614PM-RV127W', 5),
    description: 'Laptop gamer premium ASUS ROG con Ryzen 9 8945HS y RTX 5060.',
    shortDescription: 'ROG Strix con Ryzen 9 y RTX 5060',
    specs: [
      { category: 'Procesador', icon: 'cpu', specs: [{ label: 'Modelo', value: 'AMD Ryzen 9 8945HS', highlight: true }, { label: 'Núcleos', value: '8 núcleos / 16 hilos' }] },
      { category: 'Memoria RAM', icon: 'memory', specs: [{ label: 'Capacidad', value: '16 GB DDR5', highlight: true }] },
      { category: 'Almacenamiento', icon: 'storage', specs: [{ label: 'SSD', value: '1 TB NVMe', highlight: true }] },
      { category: 'Pantalla', icon: 'display', specs: [{ label: 'Tamaño', value: '16" FHD 240Hz', highlight: true }] },
      { category: 'GPU', icon: 'gpu', specs: [{ label: 'Tarjeta gráfica', value: 'NVIDIA RTX 5060 8GB', highlight: true }] },
    ],
  }, 8599),

  // ── mock-8: HP Victus 15-fb3020la
  'hp-victus-15-fb3020la': wrap({
    id: 'gm-8', slug: 'hp-victus-15-fb3020la',
    name: 'Victus 15-fb3020la', displayName: 'HP Victus 15-fb3020la', brand: 'HP',
    price: 3899, lowestQuota: 309,
    images: makeImages('VICTUS-15-fb3020la', 5),
    description: 'Laptop gamer HP Victus con Ryzen 7 y RTX 3050, ideal para gaming y estudios.',
    shortDescription: 'Victus 15 Ryzen 7 + RTX 3050',
    specs: [
      { category: 'Procesador', icon: 'cpu', specs: [{ label: 'Modelo', value: 'AMD Ryzen 7 7435HS', highlight: true }, { label: 'Núcleos', value: '8 núcleos / 16 hilos' }] },
      { category: 'Memoria RAM', icon: 'memory', specs: [{ label: 'Capacidad', value: '16 GB DDR5', highlight: true }] },
      { category: 'Almacenamiento', icon: 'storage', specs: [{ label: 'SSD', value: '512 GB NVMe', highlight: true }] },
      { category: 'Pantalla', icon: 'display', specs: [{ label: 'Tamaño', value: '15.6" FHD 144Hz', highlight: true }] },
      { category: 'GPU', icon: 'gpu', specs: [{ label: 'Tarjeta gráfica', value: 'NVIDIA RTX 3050 4GB', highlight: true }] },
    ],
  }, 3899),

  // ── mock-9: HP Victus 15-fb3021la
  'hp-victus-15-fb3021la': wrap({
    id: 'gm-9', slug: 'hp-victus-15-fb3021la',
    name: 'Victus 15-fb3021la', displayName: 'HP Victus 15-fb3021la', brand: 'HP',
    price: 4399, lowestQuota: 346,
    images: makeImages('VICTUS-15-fb3021la', 5),
    description: 'Laptop gamer HP Victus con Ryzen 7 8845HS y RTX 4050.',
    shortDescription: 'Victus 15 Ryzen 7 8845HS + RTX 4050',
    specs: [
      { category: 'Procesador', icon: 'cpu', specs: [{ label: 'Modelo', value: 'AMD Ryzen 7 8845HS', highlight: true }, { label: 'Núcleos', value: '8 núcleos / 16 hilos' }] },
      { category: 'Memoria RAM', icon: 'memory', specs: [{ label: 'Capacidad', value: '16 GB DDR5', highlight: true }] },
      { category: 'Almacenamiento', icon: 'storage', specs: [{ label: 'SSD', value: '512 GB NVMe', highlight: true }] },
      { category: 'Pantalla', icon: 'display', specs: [{ label: 'Tamaño', value: '15.6" FHD 144Hz', highlight: true }] },
      { category: 'GPU', icon: 'gpu', specs: [{ label: 'Tarjeta gráfica', value: 'NVIDIA RTX 4050 6GB', highlight: true }] },
    ],
  }, 4399),

  // ── mock-10: HP Victus 15-FB3019LA
  'hp-victus-15-fb3019la': wrap({
    id: 'gm-10', slug: 'hp-victus-15-fb3019la',
    name: 'Victus 15-FB3019LA', displayName: 'HP Victus 15-FB3019LA', brand: 'HP',
    price: 3499, lowestQuota: 283,
    images: makeImages('HP-Victus-15-FB3019LA', 5),
    description: 'Laptop gamer HP Victus con Ryzen 7 y RTX 3050, gran relación precio-rendimiento.',
    shortDescription: 'Victus 15 Ryzen 7 cuota baja',
    specs: [
      { category: 'Procesador', icon: 'cpu', specs: [{ label: 'Modelo', value: 'AMD Ryzen 7 7435HS', highlight: true }, { label: 'Núcleos', value: '8 núcleos / 16 hilos' }] },
      { category: 'Memoria RAM', icon: 'memory', specs: [{ label: 'Capacidad', value: '8 GB DDR5', highlight: true }] },
      { category: 'Almacenamiento', icon: 'storage', specs: [{ label: 'SSD', value: '512 GB NVMe', highlight: true }] },
      { category: 'Pantalla', icon: 'display', specs: [{ label: 'Tamaño', value: '15.6" FHD 144Hz', highlight: true }] },
      { category: 'GPU', icon: 'gpu', specs: [{ label: 'Tarjeta gráfica', value: 'NVIDIA RTX 3050 4GB', highlight: true }] },
    ],
  }, 3499),

  // ── mock-11: Lenovo LOQ 15ARP9 R5 (Combo)
  'lenovo-loq-15arp9-r5': wrap({
    id: 'gm-11', slug: 'lenovo-loq-15arp9-r5',
    name: 'LOQ 15ARP9', displayName: 'Lenovo LOQ 15ARP9 R5', brand: 'Lenovo',
    price: 3299, lowestQuota: 266,
    images: makeImages('Lenovo-LOQ-15ARP9-Combo', 8),
    description: 'Pack gamer Lenovo LOQ con Ryzen 5 y RTX 3050, incluye accesorios.',
    shortDescription: 'LOQ 15 Ryzen 5 Combo gaming',
    specs: [
      { category: 'Procesador', icon: 'cpu', specs: [{ label: 'Modelo', value: 'AMD Ryzen 5 7535HS', highlight: true }, { label: 'Núcleos', value: '6 núcleos / 12 hilos' }] },
      { category: 'Memoria RAM', icon: 'memory', specs: [{ label: 'Capacidad', value: '8 GB DDR5', highlight: true }] },
      { category: 'Almacenamiento', icon: 'storage', specs: [{ label: 'SSD', value: '512 GB NVMe', highlight: true }] },
      { category: 'Pantalla', icon: 'display', specs: [{ label: 'Tamaño', value: '15.6" FHD 144Hz', highlight: true }] },
      { category: 'GPU', icon: 'gpu', specs: [{ label: 'Tarjeta gráfica', value: 'NVIDIA RTX 3050 4GB', highlight: true }] },
    ],
  }, 3299),

  // ── mock-12: Lenovo LOQ 15IAX9
  'lenovo-loq-15iax9': wrap({
    id: 'gm-12', slug: 'lenovo-loq-15iax9',
    name: 'LOQ 15IAX9', displayName: 'Lenovo LOQ 15IAX9', brand: 'Lenovo',
    price: 4799, lowestQuota: 375,
    images: makeImages('Lenovo-LOQ-15IAX9', 5),
    description: 'Laptop gamer Lenovo LOQ con Intel Core i5 y RTX 4050.',
    shortDescription: 'LOQ 15 Intel Core i5 + RTX 4050',
    specs: [
      { category: 'Procesador', icon: 'cpu', specs: [{ label: 'Modelo', value: 'Intel Core i5-12450HX', highlight: true }, { label: 'Núcleos', value: '8 núcleos / 12 hilos' }] },
      { category: 'Memoria RAM', icon: 'memory', specs: [{ label: 'Capacidad', value: '16 GB DDR5', highlight: true }] },
      { category: 'Almacenamiento', icon: 'storage', specs: [{ label: 'SSD', value: '512 GB NVMe', highlight: true }] },
      { category: 'Pantalla', icon: 'display', specs: [{ label: 'Tamaño', value: '15.6" FHD 144Hz', highlight: true }] },
      { category: 'GPU', icon: 'gpu', specs: [{ label: 'Tarjeta gráfica', value: 'NVIDIA RTX 4050 6GB', highlight: true }] },
    ],
  }, 4799),

  // ── mock-13: Lenovo Legion 7
  'lenovo-legion-7': wrap({
    id: 'gm-13', slug: 'lenovo-legion-7',
    name: 'Legion 7', displayName: 'Lenovo Legion 7', brand: 'Lenovo',
    price: 9999, lowestQuota: 780,
    images: makeImages('Lenovo-Legion-7', 5),
    description: 'Laptop gamer premium Lenovo Legion 7 con 32GB DDR5 y 2TB SSD.',
    shortDescription: 'Legion 7 premium máximo rendimiento',
    specs: [
      { category: 'Procesador', icon: 'cpu', specs: [{ label: 'Modelo', value: 'AMD Ryzen 9 (por confirmar)', highlight: true }, { label: 'Núcleos', value: '8 núcleos / 16 hilos' }] },
      { category: 'Memoria RAM', icon: 'memory', specs: [{ label: 'Capacidad', value: '32 GB DDR5', highlight: true }] },
      { category: 'Almacenamiento', icon: 'storage', specs: [{ label: 'SSD', value: '2 TB NVMe', highlight: true }] },
      { category: 'Pantalla', icon: 'display', specs: [{ label: 'Tamaño', value: '16" QHD 165Hz', highlight: true }, { label: 'Panel', value: 'IPS' }] },
      { category: 'GPU', icon: 'gpu', specs: [{ label: 'Tarjeta gráfica', value: 'NVIDIA RTX 4080 12GB', highlight: true }] },
    ],
  }, 9999),

  // ── mock-14: ASUS ROG STRIX G615LM-RV015W
  'asus-rog-strix-g615lm': wrap({
    id: 'gm-14', slug: 'asus-rog-strix-g615lm',
    name: 'ROG STRIX G615LM', displayName: 'ASUS ROG STRIX G615LM-RV015W', brand: 'ASUS',
    price: 8499, lowestQuota: 660,
    images: makeImages('ASUS-ROG-STRIX-G615LM-RV015W', 6),
    description: 'Laptop gamer ASUS ROG Strix G16 de alta gama.',
    shortDescription: 'ROG Strix G16 alta gama',
    specs: [
      { category: 'Procesador', icon: 'cpu', specs: [{ label: 'Modelo', value: 'AMD Ryzen 9 (por confirmar)', highlight: true }, { label: 'Núcleos', value: '8 núcleos / 16 hilos' }] },
      { category: 'Memoria RAM', icon: 'memory', specs: [{ label: 'Capacidad', value: '16 GB DDR5', highlight: true }] },
      { category: 'Almacenamiento', icon: 'storage', specs: [{ label: 'SSD', value: '1 TB NVMe', highlight: true }] },
      { category: 'Pantalla', icon: 'display', specs: [{ label: 'Tamaño', value: '16" FHD 144Hz', highlight: true }] },
      { category: 'GPU', icon: 'gpu', specs: [{ label: 'Tarjeta gráfica', value: 'NVIDIA RTX 4060 8GB', highlight: true }] },
    ],
  }, 8499),

  // ── mock-15: ASUS ROG G614FM-RV009W
  'asus-rog-g614fm': wrap({
    id: 'gm-15', slug: 'asus-rog-g614fm',
    name: 'ROG G614FM', displayName: 'ASUS ROG G614FM-RV009W', brand: 'ASUS',
    price: 8499, lowestQuota: 660,
    images: makeImages('ASUS-ROG-G614FM-RV009W', 8),
    description: 'Laptop gamer ASUS ROG G614FM con pantalla de alta frecuencia.',
    shortDescription: 'ROG G614FM alta frecuencia',
    specs: [
      { category: 'Procesador', icon: 'cpu', specs: [{ label: 'Modelo', value: 'AMD Ryzen 9 (por confirmar)', highlight: true }, { label: 'Núcleos', value: '8 núcleos / 16 hilos' }] },
      { category: 'Memoria RAM', icon: 'memory', specs: [{ label: 'Capacidad', value: '16 GB DDR5', highlight: true }] },
      { category: 'Almacenamiento', icon: 'storage', specs: [{ label: 'SSD', value: '1 TB NVMe', highlight: true }] },
      { category: 'Pantalla', icon: 'display', specs: [{ label: 'Tamaño', value: '16" FHD 144Hz', highlight: true }] },
      { category: 'GPU', icon: 'gpu', specs: [{ label: 'Tarjeta gráfica', value: 'NVIDIA RTX 4060 8GB', highlight: true }] },
    ],
  }, 8499),

  // ── mock-16: Lenovo Legion 5 Pro
  'lenovo-legion-5-pro': wrap({
    id: 'gm-16', slug: 'lenovo-legion-5-pro',
    name: 'Legion 5 Pro', displayName: 'Lenovo Legion Pro 5', brand: 'Lenovo',
    price: 8999, lowestQuota: 700,
    images: makeImages('Lenovo-Legion-5-Pro', 4),
    description: 'Laptop gamer Lenovo Legion Pro 5 con pantalla QHD y gráficos de gama alta.',
    shortDescription: 'Legion Pro 5 QHD gaming profesional',
    specs: [
      { category: 'Procesador', icon: 'cpu', specs: [{ label: 'Modelo', value: 'AMD Ryzen 9 (por confirmar)', highlight: true }, { label: 'Núcleos', value: '8 núcleos / 16 hilos' }] },
      { category: 'Memoria RAM', icon: 'memory', specs: [{ label: 'Capacidad', value: '32 GB DDR5', highlight: true }] },
      { category: 'Almacenamiento', icon: 'storage', specs: [{ label: 'SSD', value: '1 TB NVMe', highlight: true }] },
      { category: 'Pantalla', icon: 'display', specs: [{ label: 'Tamaño', value: '16" QHD 165Hz', highlight: true }, { label: 'Panel', value: 'IPS' }] },
      { category: 'GPU', icon: 'gpu', specs: [{ label: 'Tarjeta gráfica', value: 'NVIDIA RTX 4070 8GB', highlight: true }] },
    ],
  }, 8999),

  // ── mock-17: HP OMEN 17-db1001la
  'hp-omen-17-db1001la': wrap({
    id: 'gm-17', slug: 'hp-omen-17-db1001la',
    name: 'OMEN 17-db1001la', displayName: 'HP OMEN 17-db1001la', brand: 'HP',
    price: 7999, lowestQuota: 620,
    images: makeImages('HP-OMEN-17-db1001la', 4),
    description: 'Laptop gamer HP OMEN 17 con pantalla grande y rendimiento premium.',
    shortDescription: 'OMEN 17 pantalla grande y potencia',
    specs: [
      { category: 'Procesador', icon: 'cpu', specs: [{ label: 'Modelo', value: 'AMD Ryzen 7 8845HS', highlight: true }, { label: 'Núcleos', value: '8 núcleos / 16 hilos' }] },
      { category: 'Memoria RAM', icon: 'memory', specs: [{ label: 'Capacidad', value: '16 GB DDR5', highlight: true }] },
      { category: 'Almacenamiento', icon: 'storage', specs: [{ label: 'SSD', value: '1 TB NVMe', highlight: true }] },
      { category: 'Pantalla', icon: 'display', specs: [{ label: 'Tamaño', value: '17.3" FHD 144Hz', highlight: true }] },
      { category: 'GPU', icon: 'gpu', specs: [{ label: 'Tarjeta gráfica', value: 'NVIDIA RTX 4060 8GB', highlight: true }] },
    ],
  }, 7999),

  // ── mock-18: ASUS TUF FX608JHR-RV006
  'asus-tuf-fx608jhr': wrap({
    id: 'gm-18', slug: 'asus-tuf-fx608jhr',
    name: 'TUF FX608JHR', displayName: 'ASUS TUF FX608JHR-RV006', brand: 'ASUS',
    price: 7499, lowestQuota: 580,
    images: makeImages('ASUS-TUF-FX608JHR-RV006', 7),
    description: 'Laptop gamer ASUS TUF con Intel Core i7 y 1TB SSD.',
    shortDescription: 'TUF FX608JHR Intel i7 + 1TB',
    specs: [
      { category: 'Procesador', icon: 'cpu', specs: [{ label: 'Modelo', value: 'Intel Core i7-13700H', highlight: true }, { label: 'Núcleos', value: '14 núcleos / 20 hilos' }] },
      { category: 'Memoria RAM', icon: 'memory', specs: [{ label: 'Capacidad', value: '16 GB DDR5', highlight: true }] },
      { category: 'Almacenamiento', icon: 'storage', specs: [{ label: 'SSD', value: '1 TB NVMe', highlight: true }] },
      { category: 'Pantalla', icon: 'display', specs: [{ label: 'Tamaño', value: '16" FHD 144Hz', highlight: true }] },
      { category: 'GPU', icon: 'gpu', specs: [{ label: 'Tarjeta gráfica', value: 'NVIDIA RTX 4050 6GB', highlight: true }] },
    ],
  }, 7499),

  // ── mock-19: HP OMEN 16-ap0001la
  'hp-omen-16-ap0001la': wrap({
    id: 'gm-19', slug: 'hp-omen-16-ap0001la',
    name: 'OMEN 16-ap0001la', displayName: 'HP OMEN 16-ap0001la', brand: 'HP',
    price: 7999, lowestQuota: 620,
    images: makeImages('HP-OMEN-16-ap0001la', 5),
    description: 'Laptop gamer HP OMEN 16 con Ryzen 7 8845HS y 1TB SSD.',
    shortDescription: 'OMEN 16 Ryzen 7 + 1TB',
    specs: [
      { category: 'Procesador', icon: 'cpu', specs: [{ label: 'Modelo', value: 'AMD Ryzen 7 8845HS', highlight: true }, { label: 'Núcleos', value: '8 núcleos / 16 hilos' }] },
      { category: 'Memoria RAM', icon: 'memory', specs: [{ label: 'Capacidad', value: '16 GB DDR5', highlight: true }] },
      { category: 'Almacenamiento', icon: 'storage', specs: [{ label: 'SSD', value: '1 TB NVMe', highlight: true }] },
      { category: 'Pantalla', icon: 'display', specs: [{ label: 'Tamaño', value: '16" FHD 144Hz', highlight: true }] },
      { category: 'GPU', icon: 'gpu', specs: [{ label: 'Tarjeta gráfica', value: 'NVIDIA RTX 4060 8GB', highlight: true }] },
    ],
  }, 7999),

  // ── mock-20: ASUS TUF GAMING A15
  'asus-tuf-gaming-a15': wrap({
    id: 'gm-20', slug: 'asus-tuf-gaming-a15',
    name: 'TUF GAMING A15', displayName: 'ASUS TUF GAMING A15', brand: 'ASUS',
    price: 5999, lowestQuota: 465,
    images: makeImages('ASUS-TUF-GAMING-A15', 6),
    description: 'Laptop gamer ASUS TUF Gaming A15 con AMD Ryzen 7 y gráficos NVIDIA.',
    shortDescription: 'TUF A15 AMD Ryzen 7',
    specs: [
      { category: 'Procesador', icon: 'cpu', specs: [{ label: 'Modelo', value: 'AMD Ryzen 7 7435HS', highlight: true }, { label: 'Núcleos', value: '8 núcleos / 16 hilos' }] },
      { category: 'Memoria RAM', icon: 'memory', specs: [{ label: 'Capacidad', value: '16 GB DDR5', highlight: true }] },
      { category: 'Almacenamiento', icon: 'storage', specs: [{ label: 'SSD', value: '512 GB NVMe', highlight: true }] },
      { category: 'Pantalla', icon: 'display', specs: [{ label: 'Tamaño', value: '15.6" FHD 144Hz', highlight: true }] },
      { category: 'GPU', icon: 'gpu', specs: [{ label: 'Tarjeta gráfica', value: 'NVIDIA RTX 4050 6GB', highlight: true }] },
    ],
  }, 5999),

  // ── mock-21: ASUS TUF FX607VJ-RL016
  'asus-tuf-fx607vj': wrap({
    id: 'gm-21', slug: 'asus-tuf-fx607vj',
    name: 'TUF FX607VJ', displayName: 'ASUS TUF FX607VJ-RL016', brand: 'ASUS',
    price: 4299, lowestQuota: 339,
    images: makeImages('ASUS-TUF-FX607VJ-RL016', 5),
    description: 'Laptop gamer ASUS TUF con Intel Core i5 y RTX, buena relación calidad-precio.',
    shortDescription: 'TUF FX607VJ calidad-precio',
    specs: [
      { category: 'Procesador', icon: 'cpu', specs: [{ label: 'Modelo', value: 'Intel Core i5-13500H', highlight: true }, { label: 'Núcleos', value: '12 núcleos / 16 hilos' }] },
      { category: 'Memoria RAM', icon: 'memory', specs: [{ label: 'Capacidad', value: '8 GB DDR5', highlight: true }] },
      { category: 'Almacenamiento', icon: 'storage', specs: [{ label: 'SSD', value: '512 GB NVMe', highlight: true }] },
      { category: 'Pantalla', icon: 'display', specs: [{ label: 'Tamaño', value: '16" FHD 144Hz', highlight: true }] },
      { category: 'GPU', icon: 'gpu', specs: [{ label: 'Tarjeta gráfica', value: 'NVIDIA RTX 4050 6GB', highlight: true }] },
    ],
  }, 4299),
};

/**
 * Look up a mock product by slug (exact match).
 */
export function findGamerMockProduct(slug: string): ProductDetailResult | null {
  return GAMER_MOCK_PRODUCTS[slug.toLowerCase()] || null;
}
