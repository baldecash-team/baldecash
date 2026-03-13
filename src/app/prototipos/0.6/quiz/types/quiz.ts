// Quiz Section Types - BaldeCash v0.6
// Simplificado para producción con configuración fija

// ============================================
// Configuration Types
// ============================================

export interface QuizConfig {
  layoutVersion: 4 | 5; // V4 mobile, V5 desktop
  questionCount: 7;
  questionStyle: 1;
  resultsVersion: 1;
  focusVersion: 1;
}

export const defaultQuizConfig: QuizConfig = {
  layoutVersion: 5,
  questionCount: 7,
  questionStyle: 1,
  resultsVersion: 1,
  focusVersion: 1,
};

// ============================================
// Question Types
// ============================================

export type QuestionType = 'single' | 'multiple' | 'scale';

export interface QuizOption {
  id: string;
  numericId?: number; // ID numérico del backend para API calls
  label: string;
  icon: string;
  description?: string;
  weight: Record<string, string | number | boolean | string[]>;
}

export interface QuizQuestion {
  id: string;
  numericId?: number; // ID numérico del backend para API calls
  question: string;
  helpText?: string;
  options: QuizOption[];
  type: QuestionType;
}

// ============================================
// Answer & Result Types
// ============================================

export interface QuizAnswer {
  questionId: string;
  selectedOptions: string[];
}

export interface QuizProduct {
  id: string;
  name: string;
  displayName: string;
  brand: string;
  image: string;
  thumbnail: string;
  price: number;
  lowestQuota: number;
  termMonths: number;       // Plazo en meses (e.g., 24)
  initialPercent: number;   // Porcentaje de inicial (e.g., 0)
  specs: {
    ram: number;
    ramType?: string;
    ramExpandable?: boolean;
    storage: number;
    storageType: string;
    processor: string;
    displaySize: number;
    resolution: string;
    gpu?: string;
    gpuType?: 'integrated' | 'dedicated';
    weight?: number; // kg - para scoring de portabilidad
    batteryLife?: number; // horas - para scoring de batería
  };
  tags: string[];
  gama: 'entrada' | 'media' | 'alta' | 'premium';
  isNew?: boolean;
  discount?: number;
  stock?: 'available' | 'limited' | 'out';
  condition?: 'nuevo' | 'reacondicionado'; // para filtro de condición
  matchScore?: number;
}

export interface QuizResult {
  matchScore: number;
  product: QuizProduct;
  reasons: string[];
}

// ============================================
// Component Props Types
// ============================================

export interface QuizLayoutProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  currentStep: number;
  totalSteps: number;
}

export interface QuizQuestionProps {
  question: QuizQuestion;
  selectedOption: string | null;
  onSelect: (optionId: string) => void;
}

export interface QuizProgressProps {
  currentStep: number;
  totalSteps: number;
  questionText?: string;
}

export interface QuizResultsProps {
  results: QuizResult[];
  onViewProduct: (productId: string) => void;
  onRestartQuiz: () => void;
  /** Callback para "Ver otras opciones" */
  onViewOtherOptions?: () => void;
  /** Callback para agregar al carrito - v0.6.2: ahora pasa QuizProduct completo */
  onAddToCart?: (product: QuizProduct) => void;
  /** Lista de IDs de productos en el carrito */
  cartItems?: string[];
}

export type QuizContext = 'hero' | 'catalog' | 'landing';

export interface HelpQuizProps {
  /** @deprecated Config now comes from API - this prop is ignored */
  config?: QuizConfig;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (results: QuizResult[], answers?: QuizAnswer[], questions?: QuizQuestion[]) => void;
  /** Contexto donde se muestra el quiz: 'hero' navega al catálogo, 'catalog' aplica filtros */
  context?: QuizContext;
  /** Landing slug para URLs dinámicas */
  landing?: string;
  /** Callback para agregar al carrito - v0.6.2: ahora pasa QuizProduct completo */
  onAddToCart?: (product: QuizProduct) => void;
  /** Lista de IDs de productos en el carrito */
  cartItems?: string[];
}
