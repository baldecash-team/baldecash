// Quiz Section Types - BaldeCash v0.3
// Generated from PROMPT_06_QUIZ_AYUDA.md

// ============================================
// Configuration Types
// ============================================

export interface QuizConfig {
  layoutVersion: 1 | 2 | 3;
  questionCount: 3 | 5 | 7;
  questionStyle: 1 | 2 | 3;
  resultsVersion: 1 | 2 | 3;
  focusVersion: 1 | 2 | 3;
}

export const defaultQuizConfig: QuizConfig = {
  layoutVersion: 1,
  questionCount: 5,
  questionStyle: 1,
  resultsVersion: 2,
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
  price: number;
  lowestQuota: number;
  specs: {
    ram: string;
    storage: string;
    processor: string;
    display: string;
  };
  tags: string[];
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
}

export interface QuizSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: QuizConfig;
  onConfigChange: (config: QuizConfig) => void;
}

export interface HelpQuizProps {
  config: QuizConfig;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (results: QuizResult[]) => void;
}

// ============================================
// Version Descriptions (for Settings Modal)
// ============================================

export const versionDescriptions = {
  layout: {
    1: 'Modal overlay centrado (foco total)',
    2: 'Widget lateral colapsable (siempre accesible)',
    3: 'Pagina dedicada /quiz (mas espacio)',
  },
  questionCount: {
    3: '3 preguntas - Ultra rapido',
    5: '5 preguntas - Balance ideal',
    7: '7 preguntas - Mayor precision',
  },
  questionStyle: {
    1: 'Cards con iconos grandes',
    2: 'Botones grandes horizontales',
    3: 'Slider/escala numerica',
  },
  results: {
    1: '1 producto "Perfecto para ti" destacado',
    2: 'Top 3 productos ordenados por match',
    3: 'Categoria recomendada + productos filtrados',
  },
  focus: {
    1: 'Solo por uso ("Para que la usaras?")',
    2: 'Solo por preferencias ("Que valoras mas?")',
    3: 'Hibrido: uso + presupuesto + preferencia',
  },
} as const;
