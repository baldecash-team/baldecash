// types/upsell.ts - BaldeCash v0.4 Upsell Types

export interface UpsellConfig {
  // D.1 - Introducción de accesorios
  accessoryIntroVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // D.3 - Cards de accesorios
  accessoryCardVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // D.4 - Límite de accesorios
  accessoryLimitVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // D.5 - Indicador de selección
  selectionIndicatorVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // D.6 - Botón de quitar
  removeButtonVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // D.8 - Desglose de precios
  priceBreakdownVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // E.1 - Introducción de seguros
  insuranceIntroVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // E.2 - Icono de protección
  protectionIconVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // E.3 - Comparación de planes
  planComparisonVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // E.4 - Badge de recomendado
  recommendedBadgeVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // E.5 - Visualización de cobertura
  coverageDisplayVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // E.7 - Modal de skip
  skipModalVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // E.8 - Botones del modal
  modalButtonsVersion: 1 | 2 | 3 | 4 | 5 | 6;
}

export const defaultUpsellConfig: UpsellConfig = {
  accessoryIntroVersion: 1,
  accessoryCardVersion: 1,
  accessoryLimitVersion: 1,
  selectionIndicatorVersion: 1,
  removeButtonVersion: 1,
  priceBreakdownVersion: 1,
  insuranceIntroVersion: 1,
  protectionIconVersion: 1,
  planComparisonVersion: 1,
  recommendedBadgeVersion: 1,
  coverageDisplayVersion: 1,
  skipModalVersion: 1,
  modalButtonsVersion: 1,
};

export type AccessoryCategory = 'protección' | 'audio' | 'almacenamiento' | 'conectividad';

export interface Accessory {
  id: string;
  name: string;
  description: string;
  price: number;
  monthlyQuota: number;
  image: string;
  category: AccessoryCategory;
  isRecommended: boolean;
  compatibleWith: string[];
}

export type InsuranceTier = 'basic' | 'standard' | 'premium';

export interface CoverageItem {
  name: string;
  description: string;
  icon: string;
  maxAmount?: number;
}

export interface InsurancePlan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  coverage: CoverageItem[];
  exclusions: string[];
  isRecommended: boolean;
  tier: InsuranceTier;
}

export interface UpsellState {
  selectedAccessories: string[];
  selectedInsurance: string | null;
  totalProductPrice: number;
  totalAccessoriesPrice: number;
  totalInsurancePrice: number;
  grandTotal: number;
  monthlyQuota: number;
}

// Mock data
export const mockAccessories: Accessory[] = [
  {
    id: 'mouse-1',
    name: 'Mouse inalámbrico Logitech M170',
    description: 'Mouse ergonómico con 12 meses de batería. Conexión USB plug and play.',
    price: 89,
    monthlyQuota: 4,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop',
    category: 'conectividad',
    isRecommended: true,
    compatibleWith: ['all'],
  },
  {
    id: 'funda-1',
    name: 'Funda protectora 15.6"',
    description: 'Funda acolchada con protección contra golpes y salpicaduras. Material resistente.',
    price: 59,
    monthlyQuota: 3,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop',
    category: 'protección',
    isRecommended: true,
    compatibleWith: ['all'],
  },
  {
    id: 'audifonos-1',
    name: 'Audífonos con micrófono',
    description: 'Ideal para clases virtuales. Micrófono con cancelación de ruido.',
    price: 79,
    monthlyQuota: 4,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
    category: 'audio',
    isRecommended: false,
    compatibleWith: ['all'],
  },
  {
    id: 'hub-1',
    name: 'Hub USB-C 7 en 1',
    description: 'HDMI, USB 3.0 x3, SD, microSD, USB-C PD. Expande tu conectividad.',
    price: 129,
    monthlyQuota: 6,
    image: 'https://images.unsplash.com/photo-1625723044792-44de16ccb4e8?w=300&h=300&fit=crop',
    category: 'conectividad',
    isRecommended: false,
    compatibleWith: ['all'],
  },
  {
    id: 'mochila-1',
    name: 'Mochila para laptop 15.6"',
    description: 'Mochila ergonómica con compartimento acolchado para laptop y bolsillos organizadores.',
    price: 149,
    monthlyQuota: 7,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop',
    category: 'protección',
    isRecommended: false,
    compatibleWith: ['all'],
  },
  {
    id: 'teclado-1',
    name: 'Teclado inalámbrico compacto',
    description: 'Teclado bluetooth con diseño compacto. Batería recargable de larga duración.',
    price: 99,
    monthlyQuota: 5,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&h=300&fit=crop',
    category: 'conectividad',
    isRecommended: false,
    compatibleWith: ['all'],
  },
];

export const mockInsurancePlans: InsurancePlan[] = [
  {
    id: 'basic',
    name: 'Protección Básica',
    monthlyPrice: 15,
    yearlyPrice: 180,
    tier: 'basic',
    isRecommended: false,
    coverage: [
      { name: 'Robo', description: 'Cobertura por robo con violencia', icon: 'Shield' },
    ],
    exclusions: ['Daños por líquidos', 'Daños accidentales', 'Pérdida', 'Daño de pantalla'],
  },
  {
    id: 'standard',
    name: 'Protección Total',
    monthlyPrice: 29,
    yearlyPrice: 348,
    tier: 'standard',
    isRecommended: true,
    coverage: [
      { name: 'Robo', description: 'Cobertura total por robo', icon: 'Shield' },
      { name: 'Daños accidentales', description: 'Caídas, golpes, daños físicos', icon: 'AlertTriangle' },
      { name: 'Daños por líquidos', description: 'Derrames de cualquier tipo', icon: 'Droplet' },
    ],
    exclusions: ['Pérdida', 'Daño intencional'],
  },
  {
    id: 'premium',
    name: 'Protección Premium',
    monthlyPrice: 45,
    yearlyPrice: 540,
    tier: 'premium',
    isRecommended: false,
    coverage: [
      { name: 'Todo lo de Total', description: 'Robo, daños, líquidos', icon: 'Shield' },
      { name: 'Pérdida', description: 'Cobertura por extravío del equipo', icon: 'Search' },
      { name: 'Extensión de garantía', description: '+12 meses adicionales de garantía', icon: 'Clock' },
      { name: 'Daño de pantalla', description: 'Reparación o reemplazo de pantalla', icon: 'Monitor' },
    ],
    exclusions: ['Daño intencional'],
  },
];

// Mock product for context
export const mockProductContext = {
  id: 'lenovo-ideapad-3',
  name: 'Lenovo IdeaPad 3 15.6"',
  price: 2499,
  monthlyQuota: 104,
  term: 24,
};

// Version descriptions for settings modal
export const versionDescriptions = {
  accessoryIntro: {
    1: 'Título sutil: "Complementa tu laptop" con iconos',
    2: 'Elegante: "Accesorios recomendados" (lifestyle)',
    3: 'Social: "Los estudiantes también llevan..." ilustración',
    4: 'Fintech: "Potencia tu experiencia" con animación',
    5: 'Split: "Accesorios" + badge "Opcionales"',
    6: 'Hero card: "Lleva tu equipo completo" (impacto)',
  },
  accessoryCard: {
    1: 'Grid uniforme 3 columnas (e-commerce)',
    2: 'Cards lifestyle tamaño variable',
    3: 'Cards con ilustraciones flat',
    4: 'Carrusel horizontal con snap (fintech)',
    5: 'Featured grande + grid pequeño',
    6: 'Cards gigantes una por fila',
  },
  accessoryLimit: {
    1: 'Sin límite visual, libertad total',
    2: 'Contador elegante "2 de 3 seleccionados"',
    3: 'Badge "Máximo 3" con ilustración',
    4: 'Progress bar animado (fintech)',
    5: 'Split: contador + warning',
    6: 'Warning gigante prominente',
  },
  selectionIndicator: {
    1: 'Checkmark verde + borde primario',
    2: 'Badge "Agregado" flotante',
    3: 'Cambio de color + check flat',
    4: 'Animación bounce + glow (fintech)',
    5: 'Card se mueve a "Seleccionados"',
    6: 'Card se expande con impacto',
  },
  removeButton: {
    1: 'X pequeña en esquina superior derecha',
    2: 'Toggle on/off integrado',
    3: 'Click en card para deseleccionar',
    4: 'Swipe mobile + X animada desktop',
    5: '"Quitar" solo en seleccionados',
    6: 'X grande al hover',
  },
  priceBreakdown: {
    1: 'Desglose siempre visible lateral',
    2: 'Tooltip/hover sobre total',
    3: 'Solo total + "Ver desglose"',
    4: 'Expandible animado (fintech)',
    5: 'Split: columna lateral fija',
    6: 'Prominente centrado debajo',
  },
  insuranceIntro: {
    1: 'Funcional: "Protege tu laptop"',
    2: 'Emocional: "Tranquilidad total" (lifestyle)',
    3: 'Claro: "Seguro contra accidentes" + ilustración',
    4: 'Fintech: "Tu laptop, siempre protegida" animado',
    5: 'Split: "Protección" + "Para tu tranquilidad"',
    6: 'Impacto: "¡No te arriesgues!"',
  },
  protectionIcon: {
    1: 'Escudo clásico con checkmark',
    2: 'Paraguas elegante (lifestyle)',
    3: 'Candado ilustración flat',
    4: 'Escudo animado con brillo',
    5: 'Split: escudo + beneficios',
    6: 'Escudo gigante hero',
  },
  planComparison: {
    1: 'Cards lado a lado (e-commerce)',
    2: 'Tabla comparativa checks/X',
    3: 'Slider menor a mayor cobertura',
    4: 'Cards hover detalle (fintech)',
    5: 'Split: preview + modal tabla',
    6: 'Cards gigantes apiladas',
  },
  recommendedBadge: {
    1: 'Badge "Recomendado" sobre card',
    2: 'Card más grande con borde elegante',
    3: 'Ilustración estrella/medalla',
    4: 'Animación pulso sutil (fintech)',
    5: 'Split: prominente + lista otros',
    6: 'Hero card central',
  },
  coverageDisplay: {
    1: 'Lista checks verdes / X rojas',
    2: 'Tabs "Cubre" / "No cubre"',
    3: 'Iconos flat verde/gris',
    4: 'Lista animada revela items',
    5: 'Split: coberturas / exclusiones',
    6: 'Coberturas prominentes, excl. pequeñas',
  },
  skipModal: {
    1: 'Persuasivo suave: "¿Estás seguro?"',
    2: 'Neutral: "Entendido, continuar"',
    3: 'Informativo + ilustración',
    4: 'Última oferta: "Última oportunidad..."',
    5: 'Split: riesgos / beneficios continuar',
    6: 'Impacto: "Tu laptop no estará protegida"',
  },
  modalButtons: {
    1: 'Simétricos mismo estilo',
    2: '"Agregar" primario destacado',
    3: 'Simétricos con iconos flat',
    4: '"Agregar" hover atractivo',
    5: 'Vertical: agregar arriba + sin abajo',
    6: '"Agregar" gigante, "Sin" link pequeño',
  },
} as const;
