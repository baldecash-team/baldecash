// lib/productMapper.ts - Maps API product (flat specs) to CatalogProduct (nested specs)

import type { ApiProduct } from './api';
import type {
  CatalogProduct,
  CatalogDeviceType,
  GamaTier,
  ProductCondition,
  StockStatus,
  UsageType,
  ProductTagType,
  ProductColor,
  ProductSpecs,
} from '../types/catalog';
import { calculateQuotaForTerm } from '../types/catalog';

// ============================================
// Helpers for parsing spec strings
// ============================================

function parseProcessorBrand(processorStr: string | undefined): 'intel' | 'amd' | 'apple' {
  if (!processorStr) return 'intel';
  const lower = processorStr.toLowerCase();
  if (lower.includes('amd') || lower.includes('ryzen')) return 'amd';
  if (lower.includes('apple') || lower.includes('m1') || lower.includes('m2') || lower.includes('m3') || lower.includes('m4')) return 'apple';
  return 'intel';
}

function parseResolution(resolutionStr: string | undefined): 'hd' | 'fhd' | 'qhd' | '4k' {
  if (!resolutionStr) return 'fhd';
  const lower = resolutionStr.toLowerCase();

  // Check for label names first
  if (lower.includes('4k') || lower.includes('uhd') || lower.includes('3840')) return '4k';
  if (lower.includes('qhd') || lower.includes('2560') || lower.includes('2k')) return 'qhd';
  if (lower.includes('fhd') || lower.includes('1920') || lower.includes('full hd') || lower.includes('1080')) return 'fhd';
  if (lower.includes('hd') || lower.includes('1366') || lower.includes('768') || lower.includes('720')) return 'hd';

  return 'fhd';
}

function parseDisplayType(screenTypeStr: string | undefined): 'ips' | 'tn' | 'oled' | 'va' {
  if (!screenTypeStr) return 'ips';
  const lower = screenTypeStr.toLowerCase();
  if (lower.includes('oled') || lower.includes('amoled')) return 'oled';
  if (lower.includes('va')) return 'va';
  if (lower.includes('tn')) return 'tn';
  return 'ips'; // IPS is the default/most common
}

function parseStorageType(storageTypeStr: string | undefined): 'ssd' | 'hdd' | 'emmc' {
  if (!storageTypeStr) return 'ssd';
  const lower = storageTypeStr.toLowerCase();
  if (lower.includes('hdd')) return 'hdd';
  if (lower.includes('emmc')) return 'emmc';
  return 'ssd';
}

function parseGpuType(gpuStr: string | undefined): 'integrated' | 'dedicated' {
  if (!gpuStr) return 'integrated';
  const lower = gpuStr.toLowerCase();
  if (lower.includes('rtx') || lower.includes('gtx') || lower.includes('geforce') || lower.includes('rx ') || lower.includes('radeon rx')) {
    return 'dedicated';
  }
  return 'integrated';
}

function parseGpuBrand(gpuStr: string | undefined): string {
  if (!gpuStr) return 'Intel';
  const lower = gpuStr.toLowerCase();
  if (lower.includes('nvidia') || lower.includes('geforce')) return 'NVIDIA';
  if (lower.includes('amd') || lower.includes('radeon')) return 'AMD';
  if (lower.includes('apple')) return 'Apple';
  if (lower.includes('qualcomm') || lower.includes('adreno')) return 'Qualcomm';
  if (lower.includes('arm') || lower.includes('mali')) return 'ARM';
  return 'Intel';
}

function parseGpuVram(gpuMemoryStr: string | undefined): number | undefined {
  if (!gpuMemoryStr) return undefined;
  const match = gpuMemoryStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : undefined;
}

// ============================================
// Gama inference from specs
// ============================================

function inferGama(specs: Record<string, string | number | boolean | null>, price: number): GamaTier {
  const ram = typeof specs.ram === 'number' ? specs.ram : 0;
  const gpuStr = typeof specs.gpu === 'string' ? specs.gpu : '';
  const hasDedicatedGpu = parseGpuType(gpuStr) === 'dedicated';

  // Price-based if price is available
  if (price > 0) {
    if (price >= 5000) return hasDedicatedGpu ? 'gamer' : 'creativa';
    if (price >= 3200) return 'profesional';
    if (price >= 2000) return 'estudiante';
    return 'economica';
  }

  // Spec-based fallback
  if (hasDedicatedGpu && ram >= 16) return 'gamer';
  if (ram >= 16) return 'profesional';
  if (ram >= 8) return 'estudiante';
  return 'economica';
}

function inferUsage(gama: GamaTier): UsageType[] {
  switch (gama) {
    case 'gamer': return ['gaming'];
    case 'creativa': return ['diseño', 'programacion'];
    case 'profesional': return ['oficina', 'programacion'];
    case 'estudiante': return ['estudios', 'oficina'];
    case 'economica': return ['estudios'];
  }
}

// ============================================
// Device type mapping
// ============================================

function mapDeviceType(type: string | null): CatalogDeviceType | undefined {
  if (!type) return 'laptop';
  switch (type) {
    case 'laptop': return 'laptop';
    case 'celular': return 'celular';
    case 'tablet': return 'tablet';
    default: return 'laptop';
  }
}

// ============================================
// Condition mapping (backend "nueva" → frontend "nuevo")
// ============================================

function mapCondition(condition: string | null): ProductCondition {
  if (!condition) return 'nuevo';
  switch (condition) {
    case 'nueva': return 'nuevo';
    case 'reacondicionada': return 'reacondicionado';
    case 'open_box': return 'reacondicionado';
    default: return 'nuevo';
  }
}

// ============================================
// Stock mapping
// ============================================

function mapStock(stockAvailable: number): StockStatus {
  if (stockAvailable <= 0) return 'on_demand';
  if (stockAvailable <= 3) return 'limited';
  return 'available';
}

// ============================================
// Placeholder thumbnails by device type
// ============================================

const placeholderImages: Record<string, string> = {
  laptop: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad7929bd7b580e6de7247d_Lenovo%20Chromebook%20S330.jpg',
  celular: '/images/celulares/equipo-6941e1dc19ba1-1765925340.png',
  tablet: '/images/tablets/equipo-696025d65fda1-1767908822.png',
};

// ============================================
// Main mapper function
// ============================================

export function mapApiProductToCatalog(apiProduct: ApiProduct): CatalogProduct {
  const specs = apiProduct.specs;
  const deviceType = mapDeviceType(apiProduct.type);
  const price = apiProduct.price || 0;

  // Calculate quotas (will be 0 if price is 0)
  const quotaMonthly = price > 0 ? calculateQuotaForTerm(price, 24) : 0;
  const quotaBiweekly = Math.floor(quotaMonthly / 2);
  const quotaWeekly = Math.floor(quotaMonthly / 4);

  // Parse spec values (safe access with defaults)
  const processorStr = typeof specs.processor === 'string' ? specs.processor : '';
  const processorSpeed = typeof specs.processor_speed === 'string' ? specs.processor_speed : '';
  const gpuStr = typeof specs.gpu === 'string' ? specs.gpu : '';
  const gpuMemoryStr = typeof specs.gpu_memory === 'string' ? specs.gpu_memory : '';
  const ramSize = typeof specs.ram === 'number' ? specs.ram : 0;
  const ramType = typeof specs.ram_type === 'string' ? specs.ram_type : 'DDR4';
  const storageSize = typeof specs.storage === 'number' ? specs.storage : 0;
  const storageTypeStr = typeof specs.storage_type === 'string' ? specs.storage_type : '';
  const screenSize = typeof specs.screen_size === 'number' ? specs.screen_size : 0;
  const screenResolution = typeof specs.screen_resolution === 'string' ? specs.screen_resolution : '';
  const screenType = typeof specs.screen_type === 'string' ? specs.screen_type : '';
  const refreshRate = typeof specs.refresh_rate === 'number' ? specs.refresh_rate : 60;
  const batteryCapacity = typeof specs.battery_capacity === 'string' ? specs.battery_capacity : '';
  const weight = typeof specs.weight === 'number' ? specs.weight : 0;
  const osStr = typeof specs.operating_system === 'string' ? specs.operating_system : '';
  const wifiVersion = typeof specs.wifi_version === 'string' ? specs.wifi_version : 'WiFi 5';
  const bluetoothVersion = typeof specs.bluetooth_version === 'string' ? specs.bluetooth_version : '5.0';

  // Infer gama and usage
  const gama = inferGama(specs, price);
  const usage = inferUsage(gama);

  // Build nested specs
  const productSpecs: ProductSpecs = {
    processor: {
      brand: parseProcessorBrand(processorStr),
      model: processorStr || 'No especificado',
      cores: 0,
      speed: processorSpeed || '',
    },
    ram: {
      size: ramSize,
      type: ramType,
      maxSize: ramSize * 2,
      expandable: ramSize >= 8 && deviceType === 'laptop',
    },
    storage: {
      size: storageSize,
      type: parseStorageType(storageTypeStr),
      hasSecondSlot: false,
    },
    display: {
      size: screenSize,
      resolution: parseResolution(screenResolution),
      resolutionPixels: screenResolution || '1920x1080',
      type: parseDisplayType(screenType),
      refreshRate: refreshRate,
      touchScreen: deviceType !== 'laptop',
    },
    gpu: {
      type: parseGpuType(gpuStr),
      brand: parseGpuBrand(gpuStr),
      model: gpuStr || 'Integrado',
      vram: parseGpuVram(gpuMemoryStr),
    },
    connectivity: {
      wifi: wifiVersion,
      bluetooth: bluetoothVersion,
      hasEthernet: false,
    },
    ports: {
      usb: 0,
      usbC: 0,
      hdmi: false,
      thunderbolt: false,
      sdCard: false,
      headphone: true,
    },
    keyboard: {
      backlit: gama !== 'economica' && deviceType === 'laptop',
      numericPad: screenSize >= 15.6 && deviceType === 'laptop',
      language: deviceType === 'laptop' ? 'Español Latino' : 'Virtual',
    },
    security: {
      fingerprint: false,
      facialRecognition: false,
      tpmChip: false,
    },
    os: {
      hasWindows: osStr.toLowerCase().includes('windows'),
      windowsVersion: osStr.toLowerCase().includes('windows') ? osStr : undefined,
    },
    battery: {
      capacity: batteryCapacity || 'No especificada',
      life: 'No especificada',
    },
    dimensions: {
      weight: weight,
      thickness: 0,
    },
  };

  // Build tags
  const tags: ProductTagType[] = [];
  if (apiProduct.is_featured) tags.push('recomendado');
  if (apiProduct.labels.includes('nuevo')) tags.push('recomendado');

  // Build colors from API variants
  const colors: ProductColor[] = apiProduct.colors.map((c) => ({
    id: c.id,
    name: c.name,
    hex: c.hex,
  }));

  // Thumbnail: first image or placeholder
  const thumbnail = apiProduct.images.length > 0
    ? apiProduct.images[0]
    : placeholderImages[deviceType || 'laptop'] || placeholderImages.laptop;

  // Brand name for display
  const brandName = apiProduct.brand.name || 'Sin marca';
  const brandSlug = apiProduct.brand.slug || brandName.toLowerCase();

  // Build display name
  const displayName = deviceType
    ? `${deviceType.charAt(0).toUpperCase() + deviceType.slice(1)} ${brandName} ${screenSize > 0 ? `${screenSize}"` : ''}`.trim()
    : apiProduct.name;

  return {
    id: `api-${apiProduct.id}`,
    slug: apiProduct.slug,
    name: apiProduct.short_name || apiProduct.name,
    displayName: displayName,
    brand: brandSlug,
    brandLogo: apiProduct.brand.logo_url || undefined,
    thumbnail: thumbnail,
    images: apiProduct.images.length > 0 ? apiProduct.images : [thumbnail],
    colors: colors.length > 0 ? colors : undefined,
    deviceType: deviceType,
    price: price,
    originalPrice: undefined,
    discount: undefined,
    quotaMonthly: quotaMonthly,
    quotaBiweekly: quotaBiweekly,
    quotaWeekly: quotaWeekly,
    maxTermMonths: 24,
    gama: gama,
    condition: mapCondition(apiProduct.condition),
    stock: mapStock(apiProduct.stock_available),
    stockQuantity: apiProduct.stock_available,
    usage: usage,
    isFeatured: apiProduct.is_featured,
    isNew: apiProduct.labels.includes('nuevo'),
    tags: tags,
    specs: productSpecs,
    createdAt: new Date().toISOString(),
  };
}
