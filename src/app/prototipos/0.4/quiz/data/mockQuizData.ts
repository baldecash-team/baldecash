// Mock Quiz Data - BaldeCash v0.4
// Based on 0.3 with 7 questions (B.99) and Focus V1 (B.102)

import { QuizQuestion, QuizProduct, QuizResult, QuizAnswer } from '../types/quiz';

// ============================================
// Predefined Quiz Questions - 7 preguntas (B.99)
// Focus V1: Solo por uso (B.102)
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
        description: 'Mas espacio para trabajar',
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

export const quizQuestionsPreferences: QuizQuestion[] = quizQuestionsUsage.slice(3, 5);

export const quizQuestionsHybrid: QuizQuestion[] = quizQuestionsUsage;

// ============================================
// Mock Products for Results (formato catalogo)
// ============================================

export const mockQuizProducts: QuizProduct[] = [
  {
    id: 'hp-245-g9',
    name: 'HP 245 G9',
    displayName: 'HP 245 G9 - Ideal para estudios',
    brand: 'HP',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
    price: 1899,
    lowestQuota: 79,
    specs: {
      ram: 8,
      ramExpandable: true,
      storage: 256,
      storageType: 'ssd',
      processor: 'AMD Ryzen 5 5625U',
      displaySize: 14,
      resolution: 'hd',
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
    displayName: 'Lenovo IdeaPad 3 - Versatil y potente',
    brand: 'Lenovo',
    image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400',
    price: 2499,
    lowestQuota: 104,
    specs: {
      ram: 8,
      ramExpandable: true,
      storage: 512,
      storageType: 'ssd',
      processor: 'Intel Core i5-1235U',
      displaySize: 15.6,
      resolution: 'fhd',
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
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400',
    price: 2799,
    lowestQuota: 117,
    specs: {
      ram: 16,
      ramExpandable: true,
      storage: 512,
      storageType: 'ssd',
      processor: 'Intel Core i5-1335U',
      displaySize: 15.6,
      resolution: 'fhd',
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
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400',
    price: 2399,
    lowestQuota: 100,
    specs: {
      ram: 8,
      ramExpandable: true,
      storage: 512,
      storageType: 'ssd',
      processor: 'AMD Ryzen 5 5500U',
      displaySize: 15.6,
      resolution: 'fhd',
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
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400',
    price: 4299,
    lowestQuota: 179,
    specs: {
      ram: 16,
      ramExpandable: true,
      storage: 512,
      storageType: 'ssd',
      processor: 'Intel Core i5-12500H',
      displaySize: 16.1,
      resolution: 'fhd',
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
    image: 'https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=400',
    price: 5499,
    lowestQuota: 229,
    specs: {
      ram: 16,
      ramExpandable: true,
      storage: 1000,
      storageType: 'ssd',
      processor: 'AMD Ryzen 7 6800H',
      displaySize: 15.6,
      resolution: 'fhd',
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
// Helper functions
// ============================================

export const getGamaLabel = (gama: string): string => {
  const labels: Record<string, string> = {
    entrada: 'Entrada',
    media: 'Gama Media',
    alta: 'Alta Gama',
    premium: 'Premium',
  };
  return labels[gama] || gama;
};

export const getGamaColor = (gama: string): string => {
  const colors: Record<string, string> = {
    entrada: 'bg-neutral-100 text-neutral-700',
    media: 'bg-blue-100 text-blue-700',
    alta: 'bg-purple-100 text-purple-700',
    premium: 'bg-amber-100 text-amber-700',
  };
  return colors[gama] || 'bg-neutral-100 text-neutral-700';
};

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

// ============================================
// Category Mapping for Results
// ============================================

export const categoryMapping: Record<string, { name: string; description: string; icon: string }> = {
  study: {
    name: 'Laptops para Estudios',
    description: 'Equipos confiables para tus clases y tareas',
    icon: 'GraduationCap',
  },
  gaming: {
    name: 'Laptops Gamer',
    description: 'Potencia para los juegos más exigentes',
    icon: 'Gamepad2',
  },
  design: {
    name: 'Laptops para Diseño',
    description: 'Pantallas precisas y rendimiento creativo',
    icon: 'Palette',
  },
  coding: {
    name: 'Laptops para Programación',
    description: 'Rendimiento y memoria para desarrollo',
    icon: 'Code',
  },
  office: {
    name: 'Laptops de Oficina',
    description: 'Productividad empresarial',
    icon: 'Briefcase',
  },
};
