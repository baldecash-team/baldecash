// data/mockCatalogData.ts - BaldeCash Catalog Mock Data v0.4

import {
  CatalogProduct,
  FilterOption,
  FilterTooltipContent,
  GamaTier,
  ProductColor,
  ProductCondition,
  ProductTagType,
  StockStatus,
  UsageType,
} from '../types/catalog';

// Colores disponibles para productos (v0.5)
const productColorOptions: ProductColor[][] = [
  [
    { id: 'silver', name: 'Plata', hex: '#C0C0C0' },
    { id: 'black', name: 'Negro', hex: '#1a1a1a' },
    { id: 'gold', name: 'Dorado', hex: '#FFD700' },
    { id: 'blue', name: 'Azul', hex: '#4654CD' },
  ],
  [
    { id: 'black', name: 'Negro', hex: '#1a1a1a' },
    { id: 'white', name: 'Blanco', hex: '#FFFFFF' },
  ],
  [
    { id: 'silver', name: 'Plata', hex: '#C0C0C0' },
    { id: 'space-gray', name: 'Gris Espacial', hex: '#4A4A4A' },
    { id: 'rose-gold', name: 'Oro Rosa', hex: '#B76E79' },
  ],
  [
    { id: 'midnight', name: 'Medianoche', hex: '#191970' },
    { id: 'starlight', name: 'Luz Estelar', hex: '#F5F5DC' },
  ],
];

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

// Webflow CDN laptop images
const webflowLaptops = [
  'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad8af9ed1fbf48ea397396_hp15.png',
  'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad88ee81af5459cee11a99_hp-nb-15-ef2511la-r5-5500u-8gb-256gbssd-156-w11-612b9laabim.jpg',
  'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad8633afc74e8146b99e4a_VICTUS-15-FA0031DX-1.jpg',
  'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad7ebb7cd44576556a7d0a_64ad7ac27cd445765564b11b_Dell_1505-removebg-preview.png',
  'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad7ac27cd445765564b11b_Dell%201505.jpg',
  'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad79b64b6011e52725b3a7_hyndai_hybook.png',
  'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad7929bd7b580e6de7247d_Lenovo%20Chromebook%20S330.jpg',
  'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad78aca11478d9ed058463_laptop_asus_x515ea.jpg',
  'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/623f67d99ae6d7aa236b8447_mac-gold.png',
  'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/623f67d5dc3c331e102b1f23_mac-grey.png',
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

      // Generate 1-4 tags per product based on properties
      const productTags: ProductTagType[] = [];

      // "Más vendido" - for popular/featured items
      if (seededRandom() > 0.7) {
        productTags.push('mas_vendido');
      }

      // "Recomendado" - for good value products (estudiante/profesional gama)
      if ((gamaInfo.gama === 'estudiante' || gamaInfo.gama === 'profesional') && seededRandom() > 0.6) {
        productTags.push('recomendado');
      }

      // "Cuota baja" - for products with low monthly quota
      if (quota < 120 && seededRandom() > 0.5) {
        productTags.push('cuota_baja');
      }

      // "Oferta" - for products with discount
      if (hasDiscount) {
        productTags.push('oferta');
      }

      const product: CatalogProduct = {
        id: `prod-${id}`,
        slug: `${brand.name.toLowerCase()}-laptop-${id}`,
        name: `${brand.name} Laptop ${processorModel.split(' ')[1]} ${ramSize}GB`,
        displayName: `Laptop ${brand.name} ${displaySize}"`,
        brand: brand.name.toLowerCase(),
        thumbnail: webflowLaptops[id % webflowLaptops.length],
        images: [
          webflowLaptops[id % webflowLaptops.length],
          webflowLaptops[(id + 1) % webflowLaptops.length],
          webflowLaptops[(id + 2) % webflowLaptops.length],
        ],
        colors: productColorOptions[id % productColorOptions.length],
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
        tags: productTags,
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
  storage: number[];
  storageType: string[];
  processorBrand: string[];
  displaySize: number[];
  displayType: string[];
  resolution: string[];
  refreshRate: number[];
  gpuType: string[];
  touchScreen: boolean | null;
  ramExpandable: boolean | null;
  backlitKeyboard: boolean | null;
  numericKeypad: boolean | null;
  fingerprint: boolean | null;
  hasWindows: boolean | null;
  hasThunderbolt: boolean | null;
  hasEthernet: boolean | null;
  hasSDCard: boolean | null;
  hasHDMI: boolean | null;
  minUSBPorts: number | null;
  gama: GamaTier[];
  condition: ProductCondition[];
  stock: StockStatus[];
}>): CatalogProduct[] {
  return mockProducts.filter((product) => {
    // Brand filter
    if (filters.brands?.length && !filters.brands.includes(product.brand)) {
      return false;
    }
    // Price range filter
    if (filters.priceRange) {
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }
    }
    // Quota range filter
    if (filters.quotaRange) {
      if (product.quotaMonthly < filters.quotaRange[0] || product.quotaMonthly > filters.quotaRange[1]) {
        return false;
      }
    }
    // Usage filter
    if (filters.usage?.length && !filters.usage.some((u) => product.usage.includes(u))) {
      return false;
    }
    // RAM filter
    if (filters.ram?.length && !filters.ram.includes(product.specs.ram.size)) {
      return false;
    }
    // Storage filter
    if (filters.storage?.length && !filters.storage.includes(product.specs.storage.size)) {
      return false;
    }
    // Storage type filter
    if (filters.storageType?.length && !filters.storageType.includes(product.specs.storage.type)) {
      return false;
    }
    // Processor brand filter
    if (filters.processorBrand?.length && !filters.processorBrand.includes(product.specs.processor.brand)) {
      return false;
    }
    // Display size filter
    if (filters.displaySize?.length && !filters.displaySize.includes(product.specs.display.size)) {
      return false;
    }
    // Display type filter
    if (filters.displayType?.length && !filters.displayType.includes(product.specs.display.type)) {
      return false;
    }
    // Resolution filter
    if (filters.resolution?.length && !filters.resolution.includes(product.specs.display.resolution)) {
      return false;
    }
    // Refresh rate filter
    if (filters.refreshRate?.length && !filters.refreshRate.includes(product.specs.display.refreshRate)) {
      return false;
    }
    // GPU type filter
    if (filters.gpuType?.length && !filters.gpuType.includes(product.specs.gpu.type)) {
      return false;
    }
    // Touch screen filter
    if (filters.touchScreen !== null && filters.touchScreen !== undefined) {
      if (product.specs.display.touchScreen !== filters.touchScreen) {
        return false;
      }
    }
    // RAM expandable filter
    if (filters.ramExpandable !== null && filters.ramExpandable !== undefined) {
      if (product.specs.ram.expandable !== filters.ramExpandable) {
        return false;
      }
    }
    // Backlit keyboard filter
    if (filters.backlitKeyboard !== null && filters.backlitKeyboard !== undefined) {
      if (product.specs.keyboard.backlit !== filters.backlitKeyboard) {
        return false;
      }
    }
    // Numeric keypad filter
    if (filters.numericKeypad !== null && filters.numericKeypad !== undefined) {
      if (product.specs.keyboard.numericPad !== filters.numericKeypad) {
        return false;
      }
    }
    // Fingerprint filter
    if (filters.fingerprint !== null && filters.fingerprint !== undefined) {
      if (product.specs.security.fingerprint !== filters.fingerprint) {
        return false;
      }
    }
    // Windows filter
    if (filters.hasWindows !== null && filters.hasWindows !== undefined) {
      if (product.specs.os.hasWindows !== filters.hasWindows) {
        return false;
      }
    }
    // Thunderbolt filter
    if (filters.hasThunderbolt !== null && filters.hasThunderbolt !== undefined) {
      if (product.specs.ports.thunderbolt !== filters.hasThunderbolt) {
        return false;
      }
    }
    // Ethernet filter
    if (filters.hasEthernet !== null && filters.hasEthernet !== undefined) {
      if (product.specs.connectivity.hasEthernet !== filters.hasEthernet) {
        return false;
      }
    }
    // SD Card filter
    if (filters.hasSDCard !== null && filters.hasSDCard !== undefined) {
      if (product.specs.ports.sdCard !== filters.hasSDCard) {
        return false;
      }
    }
    // HDMI filter
    if (filters.hasHDMI !== null && filters.hasHDMI !== undefined) {
      if (product.specs.ports.hdmi !== filters.hasHDMI) {
        return false;
      }
    }
    // Min USB ports filter
    if (filters.minUSBPorts !== null && filters.minUSBPorts !== undefined) {
      const totalUSB = product.specs.ports.usb + product.specs.ports.usbC;
      if (totalUSB < filters.minUSBPorts) {
        return false;
      }
    }
    // Gama filter
    if (filters.gama?.length && !filters.gama.includes(product.gama)) {
      return false;
    }
    // Condition filter
    if (filters.condition?.length && !filters.condition.includes(product.condition)) {
      return false;
    }
    // Stock filter
    if (filters.stock?.length && !filters.stock.includes(product.stock)) {
      return false;
    }
    return true;
  });
}

// ============================================
// Dynamic Filter Counts
// ============================================

export interface FilterCounts {
  brands: Record<string, number>;
  usage: Record<string, number>;
  ram: Record<number, number>;
  storage: Record<number, number>;
  storageType: Record<string, number>;
  processorBrand: Record<string, number>;
  displaySize: Record<number, number>;
  displayType: Record<string, number>;
  resolution: Record<string, number>;
  refreshRate: Record<number, number>;
  gpuType: Record<string, number>;
  gama: Record<string, number>;
  condition: Record<string, number>;
  stock: Record<string, number>;
}

export function getFilterCounts(products: CatalogProduct[]): FilterCounts {
  const counts: FilterCounts = {
    brands: {},
    usage: {},
    ram: {},
    storage: {},
    storageType: {},
    processorBrand: {},
    displaySize: {},
    displayType: {},
    resolution: {},
    refreshRate: {},
    gpuType: {},
    gama: {},
    condition: {},
    stock: {},
  };

  products.forEach((product) => {
    // Brand
    counts.brands[product.brand] = (counts.brands[product.brand] || 0) + 1;

    // Usage (multiple values)
    product.usage.forEach((u) => {
      counts.usage[u] = (counts.usage[u] || 0) + 1;
    });

    // RAM
    counts.ram[product.specs.ram.size] = (counts.ram[product.specs.ram.size] || 0) + 1;

    // Storage
    counts.storage[product.specs.storage.size] = (counts.storage[product.specs.storage.size] || 0) + 1;

    // Storage type
    counts.storageType[product.specs.storage.type] = (counts.storageType[product.specs.storage.type] || 0) + 1;

    // Processor brand
    counts.processorBrand[product.specs.processor.brand] = (counts.processorBrand[product.specs.processor.brand] || 0) + 1;

    // Display size
    counts.displaySize[product.specs.display.size] = (counts.displaySize[product.specs.display.size] || 0) + 1;

    // Display type
    counts.displayType[product.specs.display.type] = (counts.displayType[product.specs.display.type] || 0) + 1;

    // Resolution
    counts.resolution[product.specs.display.resolution] = (counts.resolution[product.specs.display.resolution] || 0) + 1;

    // Refresh rate
    counts.refreshRate[product.specs.display.refreshRate] = (counts.refreshRate[product.specs.display.refreshRate] || 0) + 1;

    // GPU type
    counts.gpuType[product.specs.gpu.type] = (counts.gpuType[product.specs.gpu.type] || 0) + 1;

    // Gama
    counts.gama[product.gama] = (counts.gama[product.gama] || 0) + 1;

    // Condition
    counts.condition[product.condition] = (counts.condition[product.condition] || 0) + 1;

    // Stock
    counts.stock[product.stock] = (counts.stock[product.stock] || 0) + 1;
  });

  return counts;
}

/**
 * Apply dynamic counts to static filter options
 */
export function applyDynamicCounts(
  options: FilterOption[],
  counts: Record<string | number, number>
): FilterOption[] {
  return options.map((opt) => ({
    ...opt,
    count: counts[opt.value] || 0,
  }));
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
