// Mock Quiz Data - BaldeCash v0.5
// 7 preguntas, Focus V1: Solo por uso

import { QuizQuestion, QuizProduct, QuizResult, QuizAnswer } from '../types/quiz';

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
// Mock Products for Results
// ============================================

// Imágenes del banco de imágenes (Webflow CDN)
const laptopImages = {
  hp15: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad8af9ed1fbf48ea397396_hp15.png',
  hpVictus: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad8633afc74e8146b99e4a_VICTUS-15-FA0031DX-1.jpg',
  lenovo: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad7929bd7b580e6de7247d_Lenovo%20Chromebook%20S330.jpg',
  asusVivobook: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad78aca11478d9ed058463_laptop_asus_x515ea.jpg',
  dell: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad7ac27cd445765564b11b_Dell%201505.jpg',
  hyundai: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad79b64b6011e52725b3a7_hyndai_hybook.png',
};

export const mockQuizProducts: QuizProduct[] = [
  {
    id: 'hp-245-g9',
    name: 'HP 245 G9',
    displayName: 'HP 245 G9 - Ideal para estudios',
    brand: 'HP',
    image: laptopImages.hp15,
    thumbnail: laptopImages.hp15,
    price: 1899,
    lowestQuota: 79,
    specs: {
      ram: 8,
      ramType: 'DDR4',
      ramExpandable: true,
      storage: 256,
      storageType: 'ssd',
      processor: 'AMD Ryzen 5 5625U',
      displaySize: 14,
      resolution: 'HD',
      gpuType: 'integrated',
    },
    tags: ['estudios', 'oficina', 'basico'],
    gama: 'entrada',
    isNew: false,
    stock: 'available',
  },
  {
    id: 'lenovo-ideapad-3',
    name: 'Lenovo IdeaPad 3',
    displayName: 'Lenovo IdeaPad 3 - Versátil y potente',
    brand: 'Lenovo',
    image: laptopImages.lenovo,
    thumbnail: laptopImages.lenovo,
    price: 2499,
    lowestQuota: 104,
    specs: {
      ram: 8,
      ramType: 'DDR4',
      ramExpandable: true,
      storage: 512,
      storageType: 'ssd',
      processor: 'Intel Core i5-1235U',
      displaySize: 15.6,
      resolution: 'FHD',
      gpuType: 'integrated',
    },
    tags: ['estudios', 'programacion', 'versatil'],
    gama: 'media',
    isNew: true,
    stock: 'available',
  },
  {
    id: 'acer-aspire-5',
    name: 'Acer Aspire 5',
    displayName: 'Acer Aspire 5 - Rendimiento confiable',
    brand: 'Acer',
    image: laptopImages.dell,
    thumbnail: laptopImages.dell,
    price: 2799,
    lowestQuota: 117,
    specs: {
      ram: 16,
      ramType: 'DDR4',
      ramExpandable: true,
      storage: 512,
      storageType: 'ssd',
      processor: 'Intel Core i5-1335U',
      displaySize: 15.6,
      resolution: 'FHD',
      gpuType: 'integrated',
    },
    tags: ['programacion', 'diseno', 'potente'],
    gama: 'media',
    isNew: false,
    stock: 'available',
  },
  {
    id: 'asus-vivobook-15',
    name: 'ASUS VivoBook 15',
    displayName: 'ASUS VivoBook 15 - Elegante y eficiente',
    brand: 'ASUS',
    image: laptopImages.asusVivobook,
    thumbnail: laptopImages.asusVivobook,
    price: 2399,
    lowestQuota: 100,
    specs: {
      ram: 8,
      ramType: 'DDR4',
      ramExpandable: true,
      storage: 512,
      storageType: 'ssd',
      processor: 'AMD Ryzen 5 5500U',
      displaySize: 15.6,
      resolution: 'FHD',
      gpuType: 'integrated',
    },
    tags: ['estudios', 'diseno', 'elegante'],
    gama: 'media',
    isNew: false,
    stock: 'limited',
  },
  {
    id: 'hp-victus-16',
    name: 'HP Victus 16',
    displayName: 'HP Victus 16 - Gaming y rendimiento',
    brand: 'HP',
    image: laptopImages.hpVictus,
    thumbnail: laptopImages.hpVictus,
    price: 4299,
    lowestQuota: 179,
    specs: {
      ram: 16,
      ramType: 'DDR5',
      ramExpandable: true,
      storage: 512,
      storageType: 'ssd',
      processor: 'Intel Core i5-12500H',
      displaySize: 16.1,
      resolution: 'FHD',
      gpu: 'NVIDIA RTX 3050',
      gpuType: 'dedicated',
    },
    tags: ['gaming', 'diseno', 'potente'],
    gama: 'alta',
    isNew: true,
    discount: 300,
    stock: 'available',
  },
  {
    id: 'lenovo-legion-5',
    name: 'Lenovo Legion 5',
    displayName: 'Lenovo Legion 5 - El mejor para gaming',
    brand: 'Lenovo',
    image: laptopImages.hyundai,
    thumbnail: laptopImages.hyundai,
    price: 5499,
    lowestQuota: 229,
    specs: {
      ram: 16,
      ramType: 'DDR5',
      ramExpandable: true,
      storage: 1000,
      storageType: 'ssd',
      processor: 'AMD Ryzen 7 6800H',
      displaySize: 15.6,
      resolution: 'FHD',
      gpu: 'NVIDIA RTX 4060',
      gpuType: 'dedicated',
    },
    tags: ['gaming', 'diseno', 'premium'],
    gama: 'premium',
    isNew: true,
    stock: 'limited',
  },
];

// ============================================
// Mock Results Generator
// ============================================

export const generateMockResults = (answers: QuizAnswer[]): QuizResult[] => {
  const usageAnswer = answers.find(a => a.questionId === 'usage')?.selectedOptions[0];
  const budgetAnswer = answers.find(a => a.questionId === 'budget')?.selectedOptions[0];

  let filteredProducts = [...mockQuizProducts];

  // Filter by usage
  if (usageAnswer === 'estudios' || usageAnswer === 'oficina') {
    filteredProducts = filteredProducts.filter(p => p.tags.includes('estudios') || p.tags.includes('basico'));
  } else if (usageAnswer === 'gaming') {
    filteredProducts = filteredProducts.filter(p => p.tags.includes('gaming'));
  } else if (usageAnswer === 'diseno' || usageAnswer === 'programacion') {
    filteredProducts = filteredProducts.filter(p => p.tags.includes('potente') || p.tags.includes('diseno'));
  }

  // Filter by budget
  if (budgetAnswer === 'low') {
    filteredProducts = filteredProducts.filter(p => p.price <= 2000);
  } else if (budgetAnswer === 'medium') {
    filteredProducts = filteredProducts.filter(p => p.price <= 3500);
  } else if (budgetAnswer === 'high') {
    filteredProducts = filteredProducts.filter(p => p.price <= 5000);
  }

  // If no products match, return top 3 by lowest quota
  if (filteredProducts.length === 0) {
    filteredProducts = [...mockQuizProducts].sort((a, b) => a.lowestQuota - b.lowestQuota).slice(0, 3);
  }

  // Generate results with match scores
  return filteredProducts.slice(0, 3).map((product, index) => ({
    matchScore: 95 - (index * 8),
    product,
    reasons: getMatchReasons(product, usageAnswer || '', budgetAnswer || ''),
  }));
};

const getMatchReasons = (product: QuizProduct, usage: string, budget: string): string[] => {
  const reasons: string[] = [];

  if (product.tags.includes('estudios')) {
    reasons.push('Ideal para tareas académicas');
  }
  if (product.tags.includes('gaming')) {
    reasons.push('Excelente para juegos');
  }
  if (product.tags.includes('potente')) {
    reasons.push('Alto rendimiento garantizado');
  }
  if (product.specs.ram >= 16) {
    reasons.push('RAM suficiente para multitarea');
  }
  if (product.specs.storage >= 512) {
    reasons.push('Amplio almacenamiento');
  }

  reasons.push(`Cuota accesible de S/${product.lowestQuota}/mes`);

  return reasons.slice(0, 3);
};
