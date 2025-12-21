// data/mockCatalogData.ts - BaldeCash Catalog Mock Data v0.4

import {
  CatalogProduct,
  FilterOption,
  FilterTooltipContent,
  GamaTier,
  ProductCondition,
  StockStatus,
  UsageType,
} from '../types/catalog';

// ============================================
// Tooltips Explicativos para Specs Técnicas
// ============================================

export const filterTooltips: FilterTooltipContent = {
  ram: {
    title: '¿Qué es la RAM?',
    description:
      'Es la memoria que usa tu equipo para ejecutar programas. Más RAM = más programas abiertos simultáneamente.',
    recommendation: 'Mínimo 8GB para estudiantes, 16GB para diseño/programación.',
  },
  ssd: {
    title: '¿Qué es SSD?',
    description:
      'Es el disco donde se guardan tus archivos. SSD es más rápido que HDD tradicional.',
    recommendation: 'Mínimo 256GB, ideal 512GB para estudiantes.',
  },
  gpu: {
    title: '¿GPU dedicada o integrada?',
    description:
      'GPU dedicada es mejor para gaming y diseño. Integrada es suficiente para estudios y oficina.',
    recommendation: 'Dedicada solo si haces diseño 3D o gaming.',
  },
  processor: {
    title: '¿Intel o AMD?',
    description:
      'Ambas marcas son excelentes. AMD suele tener mejor relación precio-rendimiento.',
    recommendation: 'i5/Ryzen 5 para uso general, i7/Ryzen 7 para trabajo pesado.',
  },
  display: {
    title: '¿Qué tamaño de pantalla elegir?',
    description:
      'Pantallas de 13-14" son portátiles, 15-16" equilibran portabilidad y comodidad.',
    recommendation: '14" para movilidad, 15.6" para uso en escritorio.',
  },
  displayType: {
    title: '¿Qué tipo de panel elegir?',
    description:
      'IPS tiene mejores colores y ángulos de visión. TN es más económica. OLED tiene negros perfectos.',
    recommendation: 'IPS para uso general, OLED para diseño y entretenimiento.',
  },
  refreshRate: {
    title: '¿Qué es la tasa de refresco?',
    description:
      '60Hz es estándar. 120Hz+ hace que todo se vea más fluido, especialmente en gaming.',
    recommendation: '60Hz para estudios, 120Hz+ solo para gaming.',
  },
  resolution: {
    title: '¿Cuál resolución necesito?',
    description:
      'HD (1366x768) es básica. FHD (1920x1080) es ideal. QHD y 4K son para profesionales.',
    recommendation: 'FHD es el estándar recomendado para estudiantes.',
  },
  ramExpandable: {
    title: 'RAM expandible vs fija',
    description:
      'RAM expandible permite agregar más memoria en el futuro. RAM fija viene soldada.',
    recommendation: 'Expandible si planeas hacer upgrades, fija si no quieres complicarte.',
  },
  wifi: {
    title: '¿WiFi 6 es necesario?',
    description:
      'WiFi 6 es más rápido y estable con muchos dispositivos conectados.',
    recommendation: 'WiFi 5 es suficiente, WiFi 6 es ideal para streaming 4K.',
  },
  thunderbolt: {
    title: '¿Qué es Thunderbolt?',
    description:
      'Puerto ultra rápido para transferir datos, conectar monitores y cargar el equipo.',
    recommendation: 'Útil para usuarios avanzados con monitores externos.',
  },
  usage: {
    title: '¿Cómo elegir según el uso?',
    description:
      'Cada uso tiene requisitos diferentes. Gaming necesita GPU potente, diseño requiere pantalla de calidad.',
    recommendation: 'Selecciona el uso principal que le darás al equipo.',
  },
  condition: {
    title: '¿Nuevo o reacondicionado?',
    description:
      'Los equipos reacondicionados son revisados y reparados. Tienen garantía y menor precio.',
    recommendation: 'Reacondicionado es ideal si buscas ahorrar sin sacrificar calidad.',
  },
};

// ============================================
// Opciones de Filtros
// ============================================

export const usageOptions: FilterOption[] = [
  { value: 'estudios', label: 'Estudios', count: 35, icon: 'GraduationCap' },
  { value: 'gaming', label: 'Gaming', count: 12, icon: 'Gamepad2' },
  { value: 'diseño', label: 'Diseño', count: 15, icon: 'Palette' },
  { value: 'oficina', label: 'Oficina', count: 30, icon: 'Briefcase' },
  { value: 'programacion', label: 'Programación', count: 20, icon: 'Code' },
];

export const brandOptions: FilterOption[] = [
  {
    value: 'lenovo',
    label: 'Lenovo',
    count: 11,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Lenovo_logo_2015.svg/200px-Lenovo_logo_2015.svg.png',
  },
  {
    value: 'hp',
    label: 'HP',
    count: 10,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/HP_logo_2012.svg/150px-HP_logo_2012.svg.png',
  },
  {
    value: 'asus',
    label: 'ASUS',
    count: 9,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/ASUS_Logo.svg/200px-ASUS_Logo.svg.png',
  },
  {
    value: 'acer',
    label: 'Acer',
    count: 8,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Acer_2011.svg/200px-Acer_2011.svg.png',
  },
  {
    value: 'dell',
    label: 'Dell',
    count: 7,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Dell_Logo.svg/150px-Dell_Logo.svg.png',
  },
  {
    value: 'msi',
    label: 'MSI',
    count: 5,
    logo: 'https://asset.msi.com/global/picture/image/feature/nb/2022-B12-Katana/msi-logo.svg',
  },
];

export const ramOptions: FilterOption[] = [
  { value: '4', label: '4 GB', count: 5 },
  { value: '8', label: '8 GB', count: 18 },
  { value: '16', label: '16 GB', count: 12 },
  { value: '32', label: '32 GB', count: 4 },
];

export const storageOptions: FilterOption[] = [
  { value: '256', label: '256 GB', count: 10 },
  { value: '512', label: '512 GB', count: 20 },
  { value: '1000', label: '1 TB', count: 9 },
];

export const displaySizeOptions: FilterOption[] = [
  { value: '13', label: '13"', count: 5 },
  { value: '14', label: '14"', count: 12 },
  { value: '15', label: '15.6"', count: 18 },
  { value: '17', label: '17"', count: 4 },
];

export const gamaOptions: FilterOption[] = [
  { value: 'economica', label: 'Económica', count: 8 },
  { value: 'estudiante', label: 'Estudiante', count: 15 },
  { value: 'profesional', label: 'Profesional', count: 12 },
  { value: 'creativa', label: 'Creativa', count: 8 },
  { value: 'gamer', label: 'Gamer', count: 7 },
];

export const conditionOptions: FilterOption[] = [
  { value: 'nuevo', label: 'Nuevo', count: 30 },
  { value: 'reacondicionado', label: 'Reacondicionado', count: 9 },
];

export const resolutionOptions: FilterOption[] = [
  { value: 'hd', label: 'HD (1366x768)', count: 8 },
  { value: 'fhd', label: 'Full HD (1920x1080)', count: 26 },
  { value: 'qhd', label: 'QHD (2560x1440)', count: 3 },
  { value: '4k', label: '4K (3840x2160)', count: 2 },
];

export const displayTypeOptions: FilterOption[] = [
  { value: 'ips', label: 'IPS', count: 28 },
  { value: 'tn', label: 'TN', count: 6 },
  { value: 'oled', label: 'OLED', count: 3 },
  { value: 'va', label: 'VA', count: 2 },
];

export const processorBrandOptions: FilterOption[] = [
  { value: 'intel', label: 'Intel', count: 25 },
  { value: 'amd', label: 'AMD', count: 14 },
];

export const processorModelOptions: FilterOption[] = [
  // Intel
  { value: 'intel-celeron', label: 'Intel Celeron', count: 4 },
  { value: 'intel-core-i3', label: 'Intel Core i3', count: 6 },
  { value: 'intel-core-i5', label: 'Intel Core i5', count: 8 },
  { value: 'intel-core-i7', label: 'Intel Core i7', count: 5 },
  { value: 'intel-core-i9', label: 'Intel Core i9', count: 2 },
  // AMD
  { value: 'amd-ryzen-3', label: 'AMD Ryzen 3', count: 4 },
  { value: 'amd-ryzen-5', label: 'AMD Ryzen 5', count: 6 },
  { value: 'amd-ryzen-7', label: 'AMD Ryzen 7', count: 3 },
  { value: 'amd-ryzen-9', label: 'AMD Ryzen 9', count: 1 },
];

export const sortOptions = [
  { value: 'recommended', label: 'Recomendados' },
  { value: 'price_asc', label: 'Precio: Menor a mayor' },
  { value: 'price_desc', label: 'Precio: Mayor a menor' },
  { value: 'quota_asc', label: 'Cuota: Menor a mayor' },
  { value: 'newest', label: 'Más nuevos' },
  { value: 'popular', label: 'Más populares' },
];

// ============================================
// Generador de Productos Mock
// ============================================

// Seeded random number generator (determinístico para evitar hydration errors)
function createSeededRandom(seed: number) {
  return function() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

const seededRandom = createSeededRandom(12345);

const unsplashLaptops = [
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=300&fit=crop',
];

function generateProducts(): CatalogProduct[] {
  const products: CatalogProduct[] = [];
  let id = 1;

  const brands = [
    { name: 'Lenovo', count: 11 },
    { name: 'HP', count: 10 },
    { name: 'ASUS', count: 9 },
    { name: 'Acer', count: 8 },
    { name: 'Dell', count: 7 },
    { name: 'MSI', count: 5 },
  ];

  const gamaDistribution: { gama: GamaTier; priceRange: [number, number]; quota: [number, number] }[] = [
    { gama: 'economica', priceRange: [1200, 2000], quota: [50, 90] },
    { gama: 'estudiante', priceRange: [2000, 3200], quota: [90, 140] },
    { gama: 'profesional', priceRange: [3200, 4500], quota: [140, 200] },
    { gama: 'creativa', priceRange: [4500, 6000], quota: [200, 280] },
    { gama: 'gamer', priceRange: [5000, 8000], quota: [220, 400] },
  ];

  const usages: UsageType[][] = [
    ['estudios', 'oficina'],
    ['estudios', 'programacion'],
    ['gaming'],
    ['diseño', 'programacion'],
    ['oficina'],
    ['gaming', 'diseño'],
  ];

  const processors = [
    { brand: 'intel' as const, models: ['Core i3-1215U', 'Core i5-1235U', 'Core i5-1340P', 'Core i7-1355U', 'Core i7-1360P'] },
    { brand: 'amd' as const, models: ['Ryzen 3 7320U', 'Ryzen 5 7530U', 'Ryzen 5 7535U', 'Ryzen 7 7730U', 'Ryzen 7 7735U'] },
  ];

  const conditions: ProductCondition[] = ['nuevo', 'nuevo', 'nuevo', 'reacondicionado'];
  const stockStatuses: StockStatus[] = ['available', 'available', 'limited', 'on_demand'];

  brands.forEach((brand) => {
    for (let i = 0; i < brand.count; i++) {
      const gamaIndex = Math.floor(seededRandom() * gamaDistribution.length);
      const gamaInfo = gamaDistribution[gamaIndex];
      const price = Math.floor(
        gamaInfo.priceRange[0] + seededRandom() * (gamaInfo.priceRange[1] - gamaInfo.priceRange[0])
      );
      const quota = Math.floor(
        gamaInfo.quota[0] + seededRandom() * (gamaInfo.quota[1] - gamaInfo.quota[0])
      );

      const processorInfo = processors[seededRandom() > 0.6 ? 0 : 1];
      const processorModel = processorInfo.models[Math.floor(seededRandom() * processorInfo.models.length)];

      const ramSizes = gamaInfo.gama === 'economica' ? [4, 8] : gamaInfo.gama === 'estudiante' ? [8, 16] : [16, 32];
      const ramSize = ramSizes[Math.floor(seededRandom() * ramSizes.length)];

      const storageSizes = gamaInfo.gama === 'economica' ? [256] : gamaInfo.gama === 'estudiante' ? [256, 512] : [512, 1000];
      const storageSize = storageSizes[Math.floor(seededRandom() * storageSizes.length)];

      const displaySizes = [13.3, 14, 15.6, 17.3];
      const displaySize = displaySizes[Math.floor(seededRandom() * displaySizes.length)];

      const refreshRates = gamaInfo.gama === 'gamer' || gamaInfo.gama === 'creativa' ? [60, 120, 144] : [60];
      const refreshRate = refreshRates[Math.floor(seededRandom() * refreshRates.length)];

      const hasDiscount = seededRandom() > 0.7;
      const discountPercent = hasDiscount ? Math.floor(seededRandom() * 15) + 5 : 0;
      const originalPrice = hasDiscount ? Math.floor(price / (1 - discountPercent / 100)) : price;

      const product: CatalogProduct = {
        id: `prod-${id}`,
        slug: `${brand.name.toLowerCase()}-laptop-${id}`,
        name: `${brand.name} Laptop ${processorModel.split(' ')[1]} ${ramSize}GB`,
        displayName: `Laptop ${brand.name} ${displaySize}" para ${usages[i % usages.length][0]}`,
        brand: brand.name.toLowerCase(),
        thumbnail: unsplashLaptops[id % unsplashLaptops.length],
        images: [
          unsplashLaptops[id % unsplashLaptops.length],
          unsplashLaptops[(id + 1) % unsplashLaptops.length],
          unsplashLaptops[(id + 2) % unsplashLaptops.length],
        ],
        price,
        originalPrice: hasDiscount ? originalPrice : undefined,
        discount: hasDiscount ? discountPercent : undefined,
        quotaMonthly: quota,
        quotaBiweekly: Math.floor(quota / 2),
        quotaWeekly: Math.floor(quota / 4),
        maxTermMonths: 24,
        gama: gamaInfo.gama,
        condition: conditions[Math.floor(seededRandom() * conditions.length)],
        stock: stockStatuses[Math.floor(seededRandom() * stockStatuses.length)],
        stockQuantity: Math.floor(seededRandom() * 20) + 1,
        usage: usages[i % usages.length],
        isFeatured: seededRandom() > 0.8,
        isNew: seededRandom() > 0.7,
        specs: {
          processor: {
            brand: processorInfo.brand,
            model: processorModel,
            cores: processorInfo.brand === 'intel' ? (processorModel.includes('i7') ? 10 : processorModel.includes('i5') ? 8 : 6) : (processorModel.includes('7') ? 8 : 6),
            speed: `${(2.5 + seededRandom()).toFixed(1)} GHz`,
          },
          ram: {
            size: ramSize,
            type: 'DDR4',
            maxSize: ramSize * 2,
            expandable: seededRandom() > 0.4,
          },
          storage: {
            size: storageSize,
            type: 'ssd',
            hasSecondSlot: seededRandom() > 0.6,
          },
          display: {
            size: displaySize,
            resolution: gamaInfo.gama === 'economica' ? 'hd' : 'fhd',
            resolutionPixels: gamaInfo.gama === 'economica' ? '1366x768' : '1920x1080',
            type: gamaInfo.gama === 'creativa' ? 'oled' : 'ips',
            refreshRate,
            touchScreen: seededRandom() > 0.8,
          },
          gpu: {
            type: gamaInfo.gama === 'gamer' || gamaInfo.gama === 'creativa' ? 'dedicated' : 'integrated',
            brand: gamaInfo.gama === 'gamer' || gamaInfo.gama === 'creativa' ? 'NVIDIA' : processorInfo.brand === 'intel' ? 'Intel' : 'AMD',
            model: gamaInfo.gama === 'gamer' ? 'GeForce RTX 4060' : gamaInfo.gama === 'creativa' ? 'GeForce RTX 3050' : processorInfo.brand === 'intel' ? 'Intel Iris Xe' : 'AMD Radeon',
            vram: gamaInfo.gama === 'gamer' ? 8 : gamaInfo.gama === 'creativa' ? 4 : undefined,
          },
          connectivity: {
            wifi: seededRandom() > 0.5 ? 'WiFi 6' : 'WiFi 5',
            bluetooth: '5.0',
            hasEthernet: seededRandom() > 0.6,
          },
          ports: {
            usb: Math.floor(seededRandom() * 2) + 2,
            usbC: Math.floor(seededRandom() * 2) + 1,
            hdmi: seededRandom() > 0.2,
            thunderbolt: gamaInfo.gama === 'creativa' || gamaInfo.gama === 'profesional',
            sdCard: seededRandom() > 0.5,
            headphone: true,
          },
          keyboard: {
            backlit: gamaInfo.gama !== 'economica',
            numericPad: displaySize >= 15.6,
            language: 'Español Latino',
          },
          security: {
            fingerprint: gamaInfo.gama !== 'economica',
            facialRecognition: gamaInfo.gama === 'profesional' || gamaInfo.gama === 'creativa',
            tpmChip: true,
          },
          os: {
            hasWindows: seededRandom() > 0.2,
            windowsVersion: 'Windows 11 Home',
          },
          battery: {
            capacity: `${Math.floor(40 + seededRandom() * 30)}Wh`,
            life: `${Math.floor(6 + seededRandom() * 6)} horas`,
          },
          dimensions: {
            weight: Number((1.5 + seededRandom() * 1.5).toFixed(1)),
            thickness: Number((15 + seededRandom() * 10).toFixed(1)),
          },
        },
        createdAt: new Date(1703030400000 - Math.floor(seededRandom() * 90) * 24 * 60 * 60 * 1000).toISOString(),
      };

      products.push(product);
      id++;
    }
  });

  return products;
}

export const mockProducts: CatalogProduct[] = generateProducts();

// ============================================
// Funciones de Utilidad
// ============================================

export function getProductsByBrand(brand: string): CatalogProduct[] {
  return mockProducts.filter((p) => p.brand === brand.toLowerCase());
}

export function getProductsByGama(gama: GamaTier): CatalogProduct[] {
  return mockProducts.filter((p) => p.gama === gama);
}

export function getProductsByUsage(usage: UsageType): CatalogProduct[] {
  return mockProducts.filter((p) => p.usage.includes(usage));
}

export function getFilteredProducts(filters: Partial<{
  brands: string[];
  priceRange: [number, number];
  quotaRange: [number, number];
  usage: UsageType[];
  ram: number[];
  gama: GamaTier[];
}>): CatalogProduct[] {
  return mockProducts.filter((product) => {
    if (filters.brands?.length && !filters.brands.includes(product.brand)) {
      return false;
    }
    if (filters.priceRange) {
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }
    }
    if (filters.quotaRange) {
      if (product.quotaMonthly < filters.quotaRange[0] || product.quotaMonthly > filters.quotaRange[1]) {
        return false;
      }
    }
    if (filters.usage?.length && !filters.usage.some((u) => product.usage.includes(u))) {
      return false;
    }
    if (filters.ram?.length && !filters.ram.includes(product.specs.ram.size)) {
      return false;
    }
    if (filters.gama?.length && !filters.gama.includes(product.gama)) {
      return false;
    }
    return true;
  });
}

export function sortProducts(products: CatalogProduct[], sortBy: string): CatalogProduct[] {
  const sorted = [...products];

  switch (sortBy) {
    case 'price_asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'quota_asc':
      return sorted.sort((a, b) => a.quotaMonthly - b.quotaMonthly);
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'popular':
      return sorted.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    case 'recommended':
    default:
      return sorted.sort((a, b) => {
        const aScore = (a.isFeatured ? 10 : 0) + (a.stock === 'available' ? 5 : 0);
        const bScore = (b.isFeatured ? 10 : 0) + (b.stock === 'available' ? 5 : 0);
        return bScore - aScore;
      });
  }
}
