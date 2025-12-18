// Mock Quiz Data - BaldeCash v0.3
// Generated from PROMPT_06_QUIZ_AYUDA.md

import { QuizQuestion, QuizProduct, QuizResult } from '../types/quiz';

// ============================================
// Predefined Quiz Questions
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
        description: 'Word, Excel, navegacion, videollamadas',
        weight: { ram: 8, gpu: 'integrated', usage: 'study' },
      },
      {
        id: 'gaming',
        label: 'Gaming',
        icon: 'Gamepad2',
        description: 'Juegos modernos con buenos graficos',
        weight: { ram: 16, gpu: 'dedicated', usage: 'gaming' },
      },
      {
        id: 'diseno',
        label: 'Diseno y edicion',
        icon: 'Palette',
        description: 'Photoshop, Illustrator, Premiere',
        weight: { ram: 16, gpu: 'dedicated', usage: 'design' },
      },
      {
        id: 'oficina',
        label: 'Trabajo de oficina',
        icon: 'Briefcase',
        description: 'Email, documentos, hojas de calculo',
        weight: { ram: 8, gpu: 'integrated', usage: 'office' },
      },
      {
        id: 'programacion',
        label: 'Programacion',
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
        description: 'Equipos basicos',
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
        label: 'Mas de S/250',
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
        description: 'Liviana, facil de cargar',
        weight: { weight: 1.5, priority: 'portable' },
      },
      {
        id: 'bateria',
        label: 'Duracion de bateria',
        icon: 'Battery',
        description: 'Larga duracion sin cargar',
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
        label: 'Maximo rendimiento',
        icon: 'Zap',
        description: 'La mas potente posible',
        weight: { performance: 'high', priority: 'performance' },
      },
    ],
    type: 'single',
  },
];

export const quizQuestionsPreferences: QuizQuestion[] = [
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
      { id: 'medium', label: '15.6"', icon: 'Monitor', description: 'Tamano estandar', weight: { display: 15.6 } },
      { id: 'large', label: '16-17"', icon: 'MonitorPlay', description: 'Pantalla grande', weight: { display: 17 } },
    ],
    type: 'single',
  },
];

export const quizQuestionsHybrid: QuizQuestion[] = [
  ...quizQuestionsUsage,
  ...quizQuestionsPreferences.slice(0, 2),
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
      { id: 'refurbished', label: 'Reacondicionado esta bien', icon: 'Recycle', description: 'Ahorra hasta 40%', weight: { condition: 'any' } },
    ],
    type: 'single',
  },
];

// ============================================
// Mock Products for Results
// ============================================

export const mockQuizProducts: QuizProduct[] = [
  {
    id: 'hp-245-g9',
    name: 'HP 245 G9',
    displayName: 'HP 245 G9 - Ideal para estudios',
    brand: 'HP',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
    price: 1899,
    lowestQuota: 79,
    specs: {
      ram: '8GB DDR4',
      storage: '256GB SSD',
      processor: 'AMD Ryzen 5',
      display: '14" HD',
    },
    tags: ['estudios', 'oficina', 'basico'],
  },
  {
    id: 'lenovo-ideapad-3',
    name: 'Lenovo IdeaPad 3',
    displayName: 'Lenovo IdeaPad 3 - Versatil y potente',
    brand: 'Lenovo',
    image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400',
    price: 2499,
    lowestQuota: 104,
    specs: {
      ram: '8GB DDR4',
      storage: '512GB SSD',
      processor: 'Intel Core i5',
      display: '15.6" FHD',
    },
    tags: ['estudios', 'programacion', 'versatil'],
  },
  {
    id: 'acer-aspire-5',
    name: 'Acer Aspire 5',
    displayName: 'Acer Aspire 5 - Rendimiento confiable',
    brand: 'Acer',
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400',
    price: 2799,
    lowestQuota: 117,
    specs: {
      ram: '16GB DDR4',
      storage: '512GB SSD',
      processor: 'Intel Core i5',
      display: '15.6" FHD IPS',
    },
    tags: ['programacion', 'diseno', 'potente'],
  },
  {
    id: 'asus-vivobook-15',
    name: 'ASUS VivoBook 15',
    displayName: 'ASUS VivoBook 15 - Elegante y eficiente',
    brand: 'ASUS',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400',
    price: 2399,
    lowestQuota: 100,
    specs: {
      ram: '8GB DDR4',
      storage: '512GB SSD',
      processor: 'AMD Ryzen 5',
      display: '15.6" FHD',
    },
    tags: ['estudios', 'diseno', 'elegante'],
  },
  {
    id: 'hp-victus-16',
    name: 'HP Victus 16',
    displayName: 'HP Victus 16 - Gaming y rendimiento',
    brand: 'HP',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400',
    price: 4299,
    lowestQuota: 179,
    specs: {
      ram: '16GB DDR5',
      storage: '512GB SSD',
      processor: 'Intel Core i5',
      display: '16.1" FHD 144Hz',
    },
    tags: ['gaming', 'diseno', 'potente'],
  },
  {
    id: 'lenovo-legion-5',
    name: 'Lenovo Legion 5',
    displayName: 'Lenovo Legion 5 - El mejor para gaming',
    brand: 'Lenovo',
    image: 'https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=400',
    price: 5499,
    lowestQuota: 229,
    specs: {
      ram: '16GB DDR5',
      storage: '1TB SSD',
      processor: 'AMD Ryzen 7',
      display: '15.6" FHD 165Hz',
    },
    tags: ['gaming', 'diseno', 'premium'],
  },
];

// ============================================
// Mock Results Generator
// ============================================

export const generateMockResults = (answers: { questionId: string; selectedOptions: string[] }[]): QuizResult[] => {
  // Simple mock algorithm - in production this would be more sophisticated
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
    reasons.push('Ideal para tareas academicas');
  }
  if (product.tags.includes('gaming')) {
    reasons.push('Excelente para juegos');
  }
  if (product.tags.includes('potente')) {
    reasons.push('Alto rendimiento garantizado');
  }
  if (product.specs.ram.includes('16GB')) {
    reasons.push('RAM suficiente para multitarea');
  }
  if (product.specs.storage.includes('512GB') || product.specs.storage.includes('1TB')) {
    reasons.push('Amplio almacenamiento');
  }

  // Always include at least one reason about the quota
  reasons.push(`Cuota accesible de S/${product.lowestQuota}/mes`);

  return reasons.slice(0, 3);
};

// ============================================
// Category Mapping for V3 Results
// ============================================

export const categoryMapping: Record<string, { name: string; description: string; icon: string }> = {
  study: {
    name: 'Laptops para Estudios',
    description: 'Equipos confiables para tus clases y tareas',
    icon: 'GraduationCap',
  },
  gaming: {
    name: 'Laptops Gamer',
    description: 'Potencia para los juegos mas exigentes',
    icon: 'Gamepad2',
  },
  design: {
    name: 'Laptops para Diseno',
    description: 'Pantallas precisas y rendimiento creativo',
    icon: 'Palette',
  },
  coding: {
    name: 'Laptops para Programacion',
    description: 'Rendimiento y memoria para desarrollo',
    icon: 'Code',
  },
  office: {
    name: 'Laptops de Oficina',
    description: 'Productividad empresarial',
    icon: 'Briefcase',
  },
};
