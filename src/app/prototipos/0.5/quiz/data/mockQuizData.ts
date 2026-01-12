// Mock Quiz Data - BaldeCash v0.5
// 7 preguntas, Focus V1: Solo por uso
// Usa productos del catálogo real

import { QuizQuestion, QuizProduct, QuizResult, QuizAnswer } from '../types/quiz';
import { mockProducts } from '@/app/prototipos/0.5/catalogo/data/mockCatalogData';
import { CatalogProduct, calculateQuotaWithInitial } from '@/app/prototipos/0.5/catalogo/types/catalog';

// Configuración fija para cálculo de cuota (igual que ProductCard)
const QUIZ_TERM = 24;
const QUIZ_INITIAL = 10;

// ============================================
// Predefined Quiz Questions - 7 preguntas
// ============================================

export const quizQuestionsUsage: QuizQuestion[] = [
  {
    id: 'usage',
    question: '¿Para qué usarás tu laptop principalmente?',
    helpText: 'Elige la actividad más importante para ti',
    options: [
      {
        id: 'estudios',
        label: 'Estudios y clases',
        icon: 'GraduationCap',
        description: 'Word, Excel, navegación, videollamadas',
        weight: { ram: 8, gpu: 'integrated', usage: 'study' },
      },
      {
        id: 'gaming',
        label: 'Gaming',
        icon: 'Gamepad2',
        description: 'Juegos modernos con buenos gráficos',
        weight: { ram: 16, gpu: 'dedicated', usage: 'gaming' },
      },
      {
        id: 'diseno',
        label: 'Diseño y edición',
        icon: 'Palette',
        description: 'Photoshop, Illustrator, Premiere',
        weight: { ram: 16, gpu: 'dedicated', usage: 'design' },
      },
      {
        id: 'oficina',
        label: 'Trabajo de oficina',
        icon: 'Briefcase',
        description: 'Email, documentos, hojas de cálculo',
        weight: { ram: 8, gpu: 'integrated', usage: 'office' },
      },
      {
        id: 'programacion',
        label: 'Programación',
        icon: 'Code',
        description: 'IDEs, compiladores, contenedores',
        weight: { ram: 16, storage: 512, usage: 'coding' },
      },
    ],
    type: 'single',
  },
  {
    id: 'budget',
    question: '¿Cuál es tu presupuesto mensual para cuotas?',
    helpText: 'Financiamos hasta en 24 meses',
    options: [
      {
        id: 'low',
        label: 'Hasta S/80',
        icon: 'Wallet',
        description: 'Equipos básicos',
        weight: { maxPrice: 2000, budget: 'low' },
      },
      {
        id: 'medium',
        label: 'S/80 - S/150',
        icon: 'Wallet',
        description: 'Equipos de gama media',
        weight: { maxPrice: 3500, budget: 'medium' },
      },
      {
        id: 'high',
        label: 'S/150 - S/250',
        icon: 'Wallet',
        description: 'Equipos de alta gama',
        weight: { maxPrice: 5000, budget: 'high' },
      },
      {
        id: 'premium',
        label: 'Más de S/250',
        icon: 'CreditCard',
        description: 'Equipos premium',
        weight: { maxPrice: 10000, budget: 'premium' },
      },
    ],
    type: 'single',
  },
  {
    id: 'priority',
    question: '¿Qué es lo más importante para ti?',
    helpText: 'Esto nos ayuda a encontrar la laptop ideal',
    options: [
      {
        id: 'portabilidad',
        label: 'Portabilidad',
        icon: 'Feather',
        description: 'Liviana, fácil de cargar',
        weight: { weight: 1.5, priority: 'portable' },
      },
      {
        id: 'bateria',
        label: 'Duración de batería',
        icon: 'Battery',
        description: 'Larga duración sin cargar',
        weight: { battery: 8, priority: 'battery' },
      },
      {
        id: 'pantalla',
        label: 'Pantalla grande',
        icon: 'Monitor',
        description: 'Más espacio para trabajar',
        weight: { display: 15.6, priority: 'display' },
      },
      {
        id: 'rendimiento',
        label: 'Máximo rendimiento',
        icon: 'Zap',
        description: 'La más potente posible',
        weight: { performance: 'high', priority: 'performance' },
      },
    ],
    type: 'single',
  },
  {
    id: 'brand_preference',
    question: '¿Tienes alguna marca preferida?',
    options: [
      { id: 'hp', label: 'HP', icon: 'Laptop', weight: { brand: 'HP' } },
      { id: 'lenovo', label: 'Lenovo', icon: 'Laptop', weight: { brand: 'Lenovo' } },
      { id: 'acer', label: 'Acer', icon: 'Laptop', weight: { brand: 'Acer' } },
      { id: 'asus', label: 'ASUS', icon: 'Laptop', weight: { brand: 'ASUS' } },
      { id: 'any', label: 'Me da igual', icon: 'Shuffle', weight: { brand: 'any' } },
    ],
    type: 'single',
  },
  {
    id: 'screen_size',
    question: '¿Qué tamaño de pantalla prefieres?',
    options: [
      { id: 'small', label: '13-14"', icon: 'Smartphone', description: 'Compacta y liviana', weight: { display: 14 } },
      { id: 'medium', label: '15.6"', icon: 'Monitor', description: 'Tamaño estándar', weight: { display: 15.6 } },
      { id: 'large', label: '16-17"', icon: 'MonitorPlay', description: 'Pantalla grande', weight: { display: 17 } },
    ],
    type: 'single',
  },
  {
    id: 'delivery',
    question: '¿Cuándo necesitas tu laptop?',
    options: [
      { id: 'urgent', label: 'Lo antes posible', icon: 'Clock', weight: { inStock: true } },
      { id: 'week', label: 'Esta semana', icon: 'Calendar', weight: { inStock: true } },
      { id: 'flexible', label: 'Puedo esperar', icon: 'CalendarDays', description: 'Sin prisa', weight: { inStock: false } },
    ],
    type: 'single',
  },
  {
    id: 'condition',
    question: '¿Equipo nuevo o reacondicionado?',
    options: [
      { id: 'new', label: 'Solo nuevo', icon: 'Sparkles', weight: { condition: 'new' } },
      { id: 'refurbished', label: 'Reacondicionado está bien', icon: 'Recycle', description: 'Ahorra hasta 40%', weight: { condition: 'any' } },
    ],
    type: 'single',
  },
];

// ============================================
// Convertidor de CatalogProduct a QuizProduct
// ============================================

// Mapeo de gama del catálogo a gama del quiz
const mapGamaToQuiz = (gama: CatalogProduct['gama']): QuizProduct['gama'] => {
  const gamaMap: Record<CatalogProduct['gama'], QuizProduct['gama']> = {
    economica: 'entrada',
    estudiante: 'media',
    profesional: 'alta',
    creativa: 'alta',
    gamer: 'premium',
  };
  return gamaMap[gama] || 'media';
};

// Mapeo de stock del catálogo a stock del quiz
const mapStockToQuiz = (stock: CatalogProduct['stock']): QuizProduct['stock'] => {
  const stockMap: Record<CatalogProduct['stock'], NonNullable<QuizProduct['stock']>> = {
    available: 'available',
    limited: 'limited',
    on_demand: 'limited',
    out_of_stock: 'out',
  };
  return stockMap[stock];
};

const convertCatalogToQuizProduct = (product: CatalogProduct): QuizProduct => {
  // Mapear tags del catálogo a tags del quiz
  const quizTags: string[] = [];

  // Mapear usage a tags
  if (product.usage.includes('estudios')) quizTags.push('estudios');
  if (product.usage.includes('gaming')) quizTags.push('gaming');
  if (product.usage.includes('diseño')) quizTags.push('diseno');
  if (product.usage.includes('oficina')) quizTags.push('oficina');
  if (product.usage.includes('programacion')) quizTags.push('programacion');

  // Agregar tags basados en specs
  if (product.specs.ram.size >= 16) quizTags.push('potente');
  if (product.specs.gpu?.type === 'dedicated') quizTags.push('gaming', 'potente');
  if (product.gama === 'gamer') quizTags.push('premium', 'gaming');
  if (product.gama === 'economica') quizTags.push('basico');

  const quizGama = mapGamaToQuiz(product.gama);

  // Calcular cuota igual que ProductCard del catálogo
  const { quota } = calculateQuotaWithInitial(product.price, QUIZ_TERM, QUIZ_INITIAL);

  // Extraer horas de batería del string (ej: "8 horas" -> 8)
  const batteryHours = parseInt(product.specs.battery.life) || 6;

  return {
    id: product.id,
    name: product.name,
    displayName: product.displayName,
    brand: product.brand,
    image: product.thumbnail,
    thumbnail: product.thumbnail,
    price: product.price,
    lowestQuota: quota,
    specs: {
      ram: product.specs.ram.size,
      ramType: product.specs.ram.type,
      ramExpandable: product.specs.ram.expandable,
      storage: product.specs.storage.size,
      storageType: product.specs.storage.type as 'ssd' | 'hdd' | 'emmc',
      processor: product.specs.processor.model,
      displaySize: product.specs.display.size,
      resolution: product.specs.display.resolution,
      gpu: product.specs.gpu?.model,
      gpuType: product.specs.gpu?.type,
      weight: product.specs.dimensions.weight,
      batteryLife: batteryHours,
    },
    tags: [...new Set(quizTags)], // Eliminar duplicados
    gama: quizGama,
    isNew: product.isNew,
    discount: product.discount,
    stock: mapStockToQuiz(product.stock),
    condition: product.condition,
  };
};

// Filtrar solo laptops del catálogo y convertirlas a QuizProduct
export const mockQuizProducts: QuizProduct[] = mockProducts
  .filter(p => !p.deviceType || p.deviceType === 'laptop')
  .map(convertCatalogToQuizProduct);

// ============================================
// Mock Results Generator
// ============================================

/**
 * Calcula una puntuación de match basada en las preferencias del usuario.
 * Usada para ordenar productos cuando hay múltiples coincidencias.
 */
const calculateMatchScore = (
  product: QuizProduct,
  priorityAnswer: string | undefined,
  screenSizeAnswer: string | undefined
): number => {
  let score = 50; // Base score

  // Scoring por priority (hasta +30 puntos)
  if (priorityAnswer) {
    switch (priorityAnswer) {
      case 'portabilidad':
        // Peso ≤ 1.5kg = +30, ≤ 1.8kg = +20, ≤ 2kg = +10
        const weight = product.specs.weight || 2;
        if (weight <= 1.5) score += 30;
        else if (weight <= 1.8) score += 20;
        else if (weight <= 2) score += 10;
        break;
      case 'bateria':
        // Batería ≥ 10h = +30, ≥ 8h = +20, ≥ 6h = +10
        const battery = product.specs.batteryLife || 6;
        if (battery >= 10) score += 30;
        else if (battery >= 8) score += 20;
        else if (battery >= 6) score += 10;
        break;
      case 'pantalla':
        // Pantalla ≥ 16" = +30, ≥ 15" = +20
        const displaySize = product.specs.displaySize;
        if (displaySize >= 16) score += 30;
        else if (displaySize >= 15) score += 20;
        break;
      case 'rendimiento':
        // RAM ≥ 16 = +15, GPU dedicada = +15
        if (product.specs.ram >= 16) score += 15;
        if (product.specs.gpuType === 'dedicated') score += 15;
        break;
    }
  }

  // Scoring por screen_size (hasta +20 puntos)
  if (screenSizeAnswer) {
    const displaySize = product.specs.displaySize;
    switch (screenSizeAnswer) {
      case 'small': // 13-14"
        if (displaySize >= 13 && displaySize <= 14.1) score += 20;
        else if (displaySize < 15) score += 10;
        break;
      case 'medium': // 15.6"
        if (displaySize >= 15 && displaySize <= 16) score += 20;
        else if (displaySize >= 14 && displaySize <= 17) score += 10;
        break;
      case 'large': // 16-17"
        if (displaySize >= 16) score += 20;
        else if (displaySize >= 15) score += 10;
        break;
    }
  }

  return score;
};

export const generateMockResults = (answers: QuizAnswer[]): QuizResult[] => {
  // Extraer todas las respuestas
  const usageAnswer = answers.find(a => a.questionId === 'usage')?.selectedOptions[0];
  const budgetAnswer = answers.find(a => a.questionId === 'budget')?.selectedOptions[0];
  const brandAnswer = answers.find(a => a.questionId === 'brand_preference')?.selectedOptions[0];
  const priorityAnswer = answers.find(a => a.questionId === 'priority')?.selectedOptions[0];
  const screenSizeAnswer = answers.find(a => a.questionId === 'screen_size')?.selectedOptions[0];
  const deliveryAnswer = answers.find(a => a.questionId === 'delivery')?.selectedOptions[0];
  const conditionAnswer = answers.find(a => a.questionId === 'condition')?.selectedOptions[0];

  let filteredProducts = [...mockQuizProducts];

  // ============================================
  // FILTROS ESTRICTOS (con fallback)
  // ============================================

  // 1. Filter by usage (estricto)
  if (usageAnswer === 'estudios' || usageAnswer === 'oficina') {
    filteredProducts = filteredProducts.filter(p =>
      p.tags.includes('estudios') || p.tags.includes('oficina') || p.tags.includes('basico')
    );
  } else if (usageAnswer === 'gaming') {
    filteredProducts = filteredProducts.filter(p =>
      p.tags.includes('gaming') || p.tags.includes('potente')
    );
  } else if (usageAnswer === 'diseno' || usageAnswer === 'programacion') {
    filteredProducts = filteredProducts.filter(p =>
      p.tags.includes('potente') || p.tags.includes('diseno') || p.tags.includes('programacion')
    );
  }

  // 2. Filter by budget (estricto)
  if (budgetAnswer === 'low') {
    filteredProducts = filteredProducts.filter(p => p.lowestQuota <= 80);
  } else if (budgetAnswer === 'medium') {
    filteredProducts = filteredProducts.filter(p => p.lowestQuota <= 150);
  } else if (budgetAnswer === 'high') {
    filteredProducts = filteredProducts.filter(p => p.lowestQuota <= 250);
  }

  // 3. Filter by brand preference (con fallback)
  if (brandAnswer && brandAnswer !== 'any') {
    const brandFiltered = filteredProducts.filter(p =>
      p.brand.toLowerCase() === brandAnswer.toLowerCase()
    );
    if (brandFiltered.length > 0) {
      filteredProducts = brandFiltered;
    }
  }

  // 4. Filter by condition (nuevo) - con fallback
  if (conditionAnswer === 'new') {
    const newOnly = filteredProducts.filter(p => p.condition === 'nuevo');
    if (newOnly.length > 0) {
      filteredProducts = newOnly;
    }
    // Si no hay nuevos, seguimos con todos (fallback silencioso)
  }

  // 5. Filter by delivery/stock - con fallback
  if (deliveryAnswer === 'urgent' || deliveryAnswer === 'week') {
    const inStock = filteredProducts.filter(p => p.stock === 'available' || p.stock === 'limited');
    if (inStock.length > 0) {
      filteredProducts = inStock;
    }
    // Si no hay en stock, seguimos con todos (fallback silencioso)
  }

  // ============================================
  // FALLBACK PROGRESIVO si no hay resultados
  // ============================================

  if (filteredProducts.length === 0) {
    // Intentar solo con budget más relajado
    filteredProducts = [...mockQuizProducts];
    if (budgetAnswer === 'low') {
      filteredProducts = filteredProducts.filter(p => p.lowestQuota <= 100);
    } else if (budgetAnswer === 'medium') {
      filteredProducts = filteredProducts.filter(p => p.lowestQuota <= 180);
    }
  }

  // Si aún no hay resultados, devolver los 3 más económicos
  if (filteredProducts.length === 0) {
    filteredProducts = [...mockQuizProducts].sort((a, b) => a.lowestQuota - b.lowestQuota).slice(0, 3);
  }

  // ============================================
  // SCORING Y ORDENAMIENTO
  // ============================================

  // Calcular score para cada producto
  const scoredProducts = filteredProducts.map(product => ({
    product,
    score: calculateMatchScore(product, priorityAnswer, screenSizeAnswer),
  }));

  // Ordenar por score (mayor primero), luego por cuota (menor primero)
  scoredProducts.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.product.lowestQuota - b.product.lowestQuota;
  });

  // Generate results con match scores normalizados
  const maxScore = Math.max(...scoredProducts.map(s => s.score));

  return scoredProducts.slice(0, 3).map(({ product, score }, index) => ({
    matchScore: Math.round((score / maxScore) * 100),
    product,
    reasons: getMatchReasons(product, usageAnswer || '', budgetAnswer || '', priorityAnswer, screenSizeAnswer),
  }));
};

const getMatchReasons = (
  product: QuizProduct,
  usage: string,
  budget: string,
  priority?: string,
  screenSize?: string
): string[] => {
  const reasons: string[] = [];

  // Razones basadas en uso
  if (product.tags.includes('estudios') && (usage === 'estudios' || usage === 'oficina')) {
    reasons.push('Ideal para tareas académicas');
  }
  if (product.tags.includes('gaming') && usage === 'gaming') {
    reasons.push('Optimizada para juegos');
  }
  if (product.tags.includes('diseno') && usage === 'diseno') {
    reasons.push('Perfecta para diseño y edición');
  }
  if (product.tags.includes('programacion') && usage === 'programacion') {
    reasons.push('Excelente para desarrollo');
  }

  // Razones basadas en priority
  if (priority === 'portabilidad' && (product.specs.weight || 2) <= 1.8) {
    reasons.push(`Ultraliviana: solo ${product.specs.weight}kg`);
  }
  if (priority === 'bateria' && (product.specs.batteryLife || 6) >= 8) {
    reasons.push(`Batería de larga duración: ${product.specs.batteryLife}h`);
  }
  if (priority === 'pantalla' && product.specs.displaySize >= 15.6) {
    reasons.push(`Pantalla amplia de ${product.specs.displaySize}"`);
  }
  if (priority === 'rendimiento' && (product.specs.ram >= 16 || product.specs.gpuType === 'dedicated')) {
    reasons.push('Alto rendimiento garantizado');
  }

  // Razones basadas en screen_size
  if (screenSize === 'small' && product.specs.displaySize <= 14.1) {
    reasons.push('Tamaño compacto ideal para movilidad');
  }
  if (screenSize === 'large' && product.specs.displaySize >= 16) {
    reasons.push('Pantalla grande para mayor comodidad');
  }

  // Razones basadas en specs (solo si no hay suficientes razones aún)
  if (reasons.length < 3 && product.specs.ram >= 16) {
    reasons.push('16GB RAM para multitarea fluida');
  } else if (reasons.length < 3 && product.specs.ram >= 8) {
    reasons.push('8GB RAM suficiente para tus tareas');
  }

  if (reasons.length < 3 && product.specs.gpuType === 'dedicated') {
    reasons.push('Gráfica dedicada para alto rendimiento');
  }

  if (reasons.length < 3 && product.specs.storage >= 512) {
    reasons.push('Amplio almacenamiento SSD');
  }

  // Razones basadas en gama
  if (reasons.length < 3 && product.gama === 'premium') {
    reasons.push('Equipo de gama premium');
  } else if (reasons.length < 3 && product.gama === 'alta') {
    reasons.push('Excelente relación calidad-precio');
  }

  // Siempre incluir la cuota si hay espacio
  if (reasons.length < 3) {
    reasons.push(`Cuota accesible de S/${product.lowestQuota}/mes`);
  }

  return reasons.slice(0, 3);
};
