// Quiz Section Types - BaldeCash v0.4
// Based on 0.3 Quiz with consolidated preferences:
// B.98: Layout V1 (modal overlay, mobile full screen)
// B.99: 7 questions (mayor precision)
// B.100: Question Style V3 (chips/pills)
// B.101: Results V3 (categoria + productos, cards como catalogo)
// B.102: Focus V1 (solo por uso)

// ============================================
// Configuration Types
// ============================================

export interface QuizConfig {
  layoutVersion: 1 | 2 | 3 | 4 | 5 | 6;
  questionCount: 3 | 5 | 7;
  questionStyle: 1 | 2 | 3 | 4 | 5 | 6;
  resultsVersion: 1 | 2 | 3 | 4 | 5 | 6;
  focusVersion: 1 | 2 | 3;
}

export const defaultQuizConfig: QuizConfig = {
  layoutVersion: 1,
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
    ramExpandable?: boolean;
    storage: number;
    storageType: 'ssd' | 'hdd' | 'emmc';
    processor: string;
    displaySize: number;
    resolution: string;
    gpu?: string;
    gpuType?: 'integrated' | 'dedicated';
  };
  tags: string[];
  gama: 'entrada' | 'media' | 'alta' | 'premium';
  isNew?: boolean;
  discount?: number;
  stock?: 'available' | 'limited' | 'out';
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
  onComplete?: (results: QuizResult[], answers?: QuizAnswer[]) => void;
}

// ============================================
// Version Descriptions (for Settings Modal)
// ============================================

export const versionDescriptions = {
  layout: {
    1: 'Modal overlay centrado, full screen en mobile (PREFERIDO)',
    2: 'Widget lateral colapsable (siempre accesible)',
    3: 'Pagina dedicada /quiz (mas espacio)',
    4: 'Bottom sheet deslizable (mobile native)',
    5: 'Modal con pasos visuales (wizard style)',
    6: 'Chat conversacional (asistente virtual)',
  },
  questionCount: {
    3: '3 preguntas - Ultra rapido',
    5: '5 preguntas - Balance ideal',
    7: '7 preguntas - Mayor precision (PREFERIDO)',
  },
  questionStyle: {
    1: 'Chips/pills con animaciones (PREFERIDO - basado en 0.3 V3)',
    2: 'Cards con iconos grandes',
    3: 'Botones horizontales full-width',
    4: 'Grid de iconos compacto',
    5: 'Slider continuo (escala)',
    6: 'Opciones con imagenes',
  },
  results: {
    1: 'Categoria + productos con cards de catalogo (PREFERIDO)',
    2: '1 producto "Perfecto para ti" destacado',
    3: 'Top 3 productos ordenados por match',
    4: 'Comparativa lado a lado',
    5: 'Carrusel horizontal deslizable',
    6: 'Lista vertical compacta con filtros',
  },
  focus: {
    1: 'Solo por uso ("Para que la usaras?") - PREFERIDO',
    2: 'Solo por preferencias ("Que valoras mas?")',
    3: 'Hibrido: uso + presupuesto + preferencia',
  },
} as const;
