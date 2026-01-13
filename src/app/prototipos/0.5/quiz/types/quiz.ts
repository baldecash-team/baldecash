// Quiz Section Types - BaldeCash v0.5
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
  label: string;
  icon: string;
  description?: string;
  weight: Record<string, string | number | boolean>;
}

export interface QuizQuestion {
  id: string;
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
  specs: {
    ram: number;
    ramType?: string;
    ramExpandable?: boolean;
    storage: number;
    storageType: 'ssd' | 'hdd' | 'emmc';
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
}

export type QuizContext = 'hero' | 'catalog' | 'landing';

export interface HelpQuizProps {
  config: QuizConfig;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (results: QuizResult[], answers?: QuizAnswer[]) => void;
  /** Contexto donde se muestra el quiz: 'hero' navega al catálogo, 'catalog' aplica filtros */
  context?: QuizContext;
  /** Si está en modo clean (para propagar a URLs) */
  isCleanMode?: boolean;
}
