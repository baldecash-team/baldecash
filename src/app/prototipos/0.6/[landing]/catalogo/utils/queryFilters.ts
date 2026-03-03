/**
 * Query Params <-> Filters utilities
 * Sincroniza filtros del catálogo con la URL
 */

import {
  FilterState,
  defaultFilterState,
  SortOption,
  UsageType,
  GamaTier,
  CatalogDeviceType,
  GpuType,
  StockStatus,
  ProductCondition,
  ProductTagType,
  StorageType,
  ProcessorBrand,
  ProcessorModel,
  DisplayType,
  Resolution,
} from '../types/catalog';

/**
 * Parsea los query params de la URL y retorna filtros parciales
 */
export const parseFiltersFromParams = (
  searchParams: URLSearchParams
): Partial<FilterState> & { sort?: SortOption; searchQuery?: string } => {
  const filters: Partial<FilterState> & { sort?: SortOption; searchQuery?: string } = {};

  // Search query
  const q = searchParams.get('q');
  if (q) {
    filters.searchQuery = q;
  }

  // Device types (array de strings)
  const device = searchParams.get('device');
  if (device) {
    filters.deviceTypes = device.split(',').filter(Boolean) as CatalogDeviceType[];
  }

  // Brands (array de strings)
  const brand = searchParams.get('brand');
  if (brand) {
    filters.brands = brand.split(',').filter(Boolean);
  }

  // Usage (array de strings)
  const usage = searchParams.get('usage');
  if (usage) {
    // Mapear valores del quiz a valores del catálogo
    const usageMap: Record<string, UsageType> = {
      estudios: 'estudios',
      study: 'estudios',
      gaming: 'gaming',
      diseno: 'diseno',
      design: 'diseno',
      oficina: 'oficina',
      office: 'oficina',
      programacion: 'programacion',
      coding: 'programacion',
    };
    filters.usage = usage
      .split(',')
      .map((u) => usageMap[u.toLowerCase()] || u)
      .filter(Boolean) as UsageType[];
  }

  // Quota range (formato: min,max)
  const quota = searchParams.get('quota');
  if (quota) {
    const [min, max] = quota.split(',').map(Number);
    if (!isNaN(min) && !isNaN(max)) {
      filters.quotaRange = [min, max];
    }
  }

  // RAM (array de números)
  const ram = searchParams.get('ram');
  if (ram) {
    filters.ram = ram
      .split(',')
      .map(Number)
      .filter((n) => !isNaN(n));
  }

  // Storage (array de números)
  const storage = searchParams.get('storage');
  if (storage) {
    filters.storage = storage
      .split(',')
      .map(Number)
      .filter((n) => !isNaN(n));
  }

  // Gama (array de strings)
  const gama = searchParams.get('gama');
  if (gama) {
    filters.gama = gama.split(',').filter(Boolean) as GamaTier[];
  }

  // GPU Type (array de strings)
  const gpu = searchParams.get('gpu');
  if (gpu) {
    filters.gpuType = gpu.split(',').filter(Boolean) as GpuType[];
  }

  // Stock (array de strings)
  const stock = searchParams.get('stock');
  if (stock) {
    filters.stock = stock.split(',').filter(Boolean) as StockStatus[];
  }

  // Condition (array de strings) - mapear valores del quiz
  const condition = searchParams.get('condition');
  if (condition) {
    const conditionMap: Record<string, ProductCondition> = {
      new: 'nuevo',
      nuevo: 'nuevo',
      refurbished: 'reacondicionado',
      reacondicionado: 'reacondicionado',
    };
    filters.condition = condition
      .split(',')
      .map((c) => conditionMap[c.toLowerCase()] || c)
      .filter(Boolean) as ProductCondition[];
  }

  // Tags (array de strings)
  const tag = searchParams.get('tag');
  if (tag) {
    filters.tags = tag.split(',').filter(Boolean) as ProductTagType[];
  }

  // ============================================
  // SPECS FILTERS
  // ============================================

  // Storage Type (ssd, hdd, emmc)
  const storageType = searchParams.get('storageType');
  if (storageType) {
    filters.storageType = storageType.split(',').filter(Boolean) as StorageType[];
  }

  // Processor Brand (intel, amd, apple)
  const cpuBrand = searchParams.get('cpuBrand');
  if (cpuBrand) {
    filters.processorBrand = cpuBrand.split(',').filter(Boolean) as ProcessorBrand[];
  }

  // Processor Model (full processor name from API, e.g. "AMD Ryzen 5 5500U")
  const processor = searchParams.get('processor');
  if (processor) {
    // Decode URI component for special characters
    filters.processorModel = processor.split(',').map(decodeURIComponent).filter(Boolean) as ProcessorModel[];
  }

  // Display Size (array de números)
  const displaySize = searchParams.get('displaySize');
  if (displaySize) {
    filters.displaySize = displaySize
      .split(',')
      .map(Number)
      .filter((n) => !isNaN(n));
  }

  // Display Type (ips, tn, oled, va)
  const displayType = searchParams.get('displayType');
  if (displayType) {
    filters.displayType = displayType.split(',').filter(Boolean) as DisplayType[];
  }

  // Resolution (hd, fhd, qhd, 4k)
  const resolution = searchParams.get('resolution');
  if (resolution) {
    filters.resolution = resolution.split(',').filter(Boolean) as Resolution[];
  }

  // Touch Screen (boolean)
  const touch = searchParams.get('touch');
  if (touch !== null) {
    filters.touchScreen = touch === 'true';
  }

  // Refresh Rate (array de números)
  const refreshRate = searchParams.get('refreshRate');
  if (refreshRate) {
    filters.refreshRate = refreshRate
      .split(',')
      .map(Number)
      .filter((n) => !isNaN(n));
  }

  // Backlit Keyboard (boolean)
  const backlit = searchParams.get('backlit');
  if (backlit !== null) {
    filters.backlitKeyboard = backlit === 'true';
  }

  // Numeric Keypad (boolean)
  const numpad = searchParams.get('numpad');
  if (numpad !== null) {
    filters.numericKeypad = numpad === 'true';
  }

  // Fingerprint (boolean)
  const fingerprint = searchParams.get('fingerprint');
  if (fingerprint !== null) {
    filters.fingerprint = fingerprint === 'true';
  }

  // Has Windows (boolean)
  const windows = searchParams.get('windows');
  if (windows !== null) {
    filters.hasWindows = windows === 'true';
  }

  // Has Thunderbolt (boolean)
  const thunderbolt = searchParams.get('thunderbolt');
  if (thunderbolt !== null) {
    filters.hasThunderbolt = thunderbolt === 'true';
  }

  // Has Ethernet (boolean)
  const ethernet = searchParams.get('ethernet');
  if (ethernet !== null) {
    filters.hasEthernet = ethernet === 'true';
  }

  // Has SD Card (boolean)
  const sdcard = searchParams.get('sdcard');
  if (sdcard !== null) {
    filters.hasSDCard = sdcard === 'true';
  }

  // Has HDMI (boolean)
  const hdmi = searchParams.get('hdmi');
  if (hdmi !== null) {
    filters.hasHDMI = hdmi === 'true';
  }

  // Min USB Ports (number)
  const minUsb = searchParams.get('minUsb');
  if (minUsb !== null) {
    const parsed = Number(minUsb);
    if (!isNaN(parsed)) {
      filters.minUSBPorts = parsed;
    }
  }

  // RAM Expandable (boolean)
  const ramExp = searchParams.get('ramExp');
  if (ramExp !== null) {
    filters.ramExpandable = ramExp === 'true';
  }

  // Sort
  const sort = searchParams.get('sort');
  if (sort) {
    const validSorts: SortOption[] = [
      'recommended',
      'price_asc',
      'price_desc',
      'newest',
      'quota_asc',
      'popular',
    ];
    if (validSorts.includes(sort as SortOption)) {
      filters.sort = sort as SortOption;
    }
  }

  return filters;
};

/**
 * Construye query params a partir de los filtros actuales
 * Solo incluye valores que difieren del default
 */
export const buildParamsFromFilters = (
  filters: FilterState,
  sort: SortOption,
  searchQuery?: string
): URLSearchParams => {
  const params = new URLSearchParams();

  // Search query
  if (searchQuery && searchQuery.trim()) {
    params.set('q', searchQuery.trim());
  }

  // Device types
  if (filters.deviceTypes.length > 0) {
    params.set('device', filters.deviceTypes.join(','));
  }

  // Brands
  if (filters.brands.length > 0) {
    params.set('brand', filters.brands.join(','));
  }

  // Usage
  if (filters.usage.length > 0) {
    params.set('usage', filters.usage.join(','));
  }

  // Quota range (solo si difiere del default)
  if (
    filters.quotaRange[0] !== defaultFilterState.quotaRange[0] ||
    filters.quotaRange[1] !== defaultFilterState.quotaRange[1]
  ) {
    params.set('quota', `${filters.quotaRange[0]},${filters.quotaRange[1]}`);
  }

  // RAM
  if (filters.ram.length > 0) {
    params.set('ram', filters.ram.join(','));
  }

  // Storage
  if (filters.storage.length > 0) {
    params.set('storage', filters.storage.join(','));
  }

  // Gama
  if (filters.gama.length > 0) {
    params.set('gama', filters.gama.join(','));
  }

  // GPU Type
  if (filters.gpuType.length > 0) {
    params.set('gpu', filters.gpuType.join(','));
  }

  // Stock
  if (filters.stock.length > 0) {
    params.set('stock', filters.stock.join(','));
  }

  // Condition
  if (filters.condition.length > 0) {
    params.set('condition', filters.condition.join(','));
  }

  // Tags
  if (filters.tags.length > 0) {
    params.set('tag', filters.tags.join(','));
  }

  // ============================================
  // SPECS FILTERS
  // ============================================

  // Storage Type
  if (filters.storageType.length > 0) {
    params.set('storageType', filters.storageType.join(','));
  }

  // Processor Brand
  if (filters.processorBrand.length > 0) {
    params.set('cpuBrand', filters.processorBrand.join(','));
  }

  // Processor Model (encode URI component for special characters)
  if (filters.processorModel.length > 0) {
    params.set('processor', filters.processorModel.map(encodeURIComponent).join(','));
  }

  // Display Size
  if (filters.displaySize.length > 0) {
    params.set('displaySize', filters.displaySize.join(','));
  }

  // Display Type
  if (filters.displayType.length > 0) {
    params.set('displayType', filters.displayType.join(','));
  }

  // Resolution
  if (filters.resolution.length > 0) {
    params.set('resolution', filters.resolution.join(','));
  }

  // Touch Screen
  if (filters.touchScreen !== null) {
    params.set('touch', String(filters.touchScreen));
  }

  // Refresh Rate
  if (filters.refreshRate.length > 0) {
    params.set('refreshRate', filters.refreshRate.join(','));
  }

  // Backlit Keyboard
  if (filters.backlitKeyboard !== null) {
    params.set('backlit', String(filters.backlitKeyboard));
  }

  // Numeric Keypad
  if (filters.numericKeypad !== null) {
    params.set('numpad', String(filters.numericKeypad));
  }

  // Fingerprint
  if (filters.fingerprint !== null) {
    params.set('fingerprint', String(filters.fingerprint));
  }

  // Has Windows
  if (filters.hasWindows !== null) {
    params.set('windows', String(filters.hasWindows));
  }

  // Has Thunderbolt
  if (filters.hasThunderbolt !== null) {
    params.set('thunderbolt', String(filters.hasThunderbolt));
  }

  // Has Ethernet
  if (filters.hasEthernet !== null) {
    params.set('ethernet', String(filters.hasEthernet));
  }

  // Has SD Card
  if (filters.hasSDCard !== null) {
    params.set('sdcard', String(filters.hasSDCard));
  }

  // Has HDMI
  if (filters.hasHDMI !== null) {
    params.set('hdmi', String(filters.hasHDMI));
  }

  // Min USB Ports
  if (filters.minUSBPorts !== null) {
    params.set('minUsb', String(filters.minUSBPorts));
  }

  // RAM Expandable
  if (filters.ramExpandable !== null) {
    params.set('ramExp', String(filters.ramExpandable));
  }

  // Sort (solo si no es el default)
  if (sort !== 'recommended') {
    params.set('sort', sort);
  }

  return params;
};

/**
 * Combina filtros de URL con el estado default
 */
export const mergeFiltersWithDefaults = (
  urlFilters: Partial<FilterState>
): FilterState => {
  return {
    ...defaultFilterState,
    ...urlFilters,
  };
};

/**
 * Verifica si hay filtros activos (distintos del default)
 */
export const hasActiveFilters = (filters: FilterState): boolean => {
  return (
    // Basic filters
    filters.deviceTypes.length > 0 ||
    filters.brands.length > 0 ||
    filters.usage.length > 0 ||
    filters.quotaRange[0] !== defaultFilterState.quotaRange[0] ||
    filters.quotaRange[1] !== defaultFilterState.quotaRange[1] ||
    filters.gama.length > 0 ||
    filters.condition.length > 0 ||
    filters.stock.length > 0 ||
    filters.tags.length > 0 ||
    // Specs - arrays
    filters.ram.length > 0 ||
    filters.storage.length > 0 ||
    filters.storageType.length > 0 ||
    filters.processorBrand.length > 0 ||
    filters.processorModel.length > 0 ||
    filters.gpuType.length > 0 ||
    filters.displaySize.length > 0 ||
    filters.displayType.length > 0 ||
    filters.resolution.length > 0 ||
    filters.refreshRate.length > 0 ||
    // Specs - booleans
    filters.touchScreen !== null ||
    filters.backlitKeyboard !== null ||
    filters.numericKeypad !== null ||
    filters.fingerprint !== null ||
    filters.hasWindows !== null ||
    filters.hasThunderbolt !== null ||
    filters.hasEthernet !== null ||
    filters.hasSDCard !== null ||
    filters.hasHDMI !== null ||
    filters.minUSBPorts !== null ||
    filters.ramExpandable !== null
  );
};
