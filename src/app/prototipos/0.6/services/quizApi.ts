/**
 * Quiz API Service - BaldeCash v0.6
 * Servicio para consumir datos de quiz desde el backend
 */

import type { QuizQuestion, QuizOption, QuizAnswer, QuizResult, QuizProduct } from '../quiz/types/quiz';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1';

// ============================================
// API Response Types
// ============================================

interface ApiQuizOption {
  id: number;
  code: string;
  label: string;
  description: string | null;
  icon: string | null;
  weight: Record<string, string | number | boolean | string[]>;
  display_order: number;
}

interface ApiQuizQuestion {
  id: number;
  code: string;
  question: string;
  help_text: string | null;
  question_type: 'single' | 'multiple' | 'scale';
  icon: string | null;
  display_order: number;
  is_required: boolean;
  options: ApiQuizOption[];
}

interface ApiQuizFull {
  id: number;
  code: string;
  name: string;
  description: string | null;
  results_version: number;
  results_count: number;
  scoring_mode: string;
  config: {
    allow_skip?: boolean;
    term_months?: number;
    animation_style?: string;
    initial_percent?: number;
    show_progress_bar?: boolean;
  } | null;
  questions: ApiQuizQuestion[];
}

interface ApiLandingQuizLookup {
  landing_id: number;
  landing_slug: string;
  has_quiz: boolean;
  id: number | null;
  quiz_id: number | null;
  is_active: boolean | null;
  config_override: Record<string, unknown> | null;
  quiz: ApiQuizFull | null;
}

interface ApiQuizResponseCreate {
  quiz_id: number;
  landing_id: number;
  session_id?: string;
  answers: { question_id: string; selected_options: string[] }[];
  recommended_product_id?: string;
  match_score?: number;
  context: 'hero' | 'catalog' | 'landing';
  action_taken?: 'view_product' | 'view_catalog' | 'abandoned';
}

// ============================================
// Frontend Response Types
// ============================================

export interface QuizData {
  id: number;
  code: string;
  name: string;
  description: string | null;
  resultsVersion: number;
  resultsCount: number;
  scoringMode: string;
  config: {
    allowSkip?: boolean;
    termMonths?: number;
    animationStyle?: string;
    initialPercent?: number;
    showProgressBar?: boolean;
  } | null;
  questions: QuizQuestion[];
}

export interface LandingQuizData {
  id: number;
  landingId: number;
  quizId: number;
  isActive: boolean;
  configOverride: Record<string, unknown> | null;
  quiz: QuizData;
}

// ============================================
// Transformers
// ============================================

function transformOption(apiOption: ApiQuizOption): QuizOption {
  return {
    id: apiOption.code, // Use code as id for frontend compatibility
    numericId: apiOption.id, // Keep numeric ID for backend API calls
    label: apiOption.label,
    icon: apiOption.icon || 'HelpCircle',
    description: apiOption.description || undefined,
    weight: apiOption.weight,
  };
}

function transformQuestion(apiQuestion: ApiQuizQuestion): QuizQuestion {
  return {
    id: apiQuestion.code, // Use code as id for frontend compatibility
    numericId: apiQuestion.id, // Keep numeric ID for backend API calls
    question: apiQuestion.question,
    helpText: apiQuestion.help_text || undefined,
    type: apiQuestion.question_type,
    options: apiQuestion.options.map(transformOption),
  };
}

function transformQuiz(apiQuiz: ApiQuizFull): QuizData {
  return {
    id: apiQuiz.id,
    code: apiQuiz.code,
    name: apiQuiz.name,
    description: apiQuiz.description,
    resultsVersion: apiQuiz.results_version,
    resultsCount: apiQuiz.results_count,
    scoringMode: apiQuiz.scoring_mode,
    config: apiQuiz.config ? {
      allowSkip: apiQuiz.config.allow_skip,
      termMonths: apiQuiz.config.term_months,
      animationStyle: apiQuiz.config.animation_style,
      initialPercent: apiQuiz.config.initial_percent,
      showProgressBar: apiQuiz.config.show_progress_bar,
    } : null,
    questions: apiQuiz.questions.map(transformQuestion),
  };
}

// ============================================
// API Functions
// ============================================

/**
 * Fetch active quiz for a landing
 * @param landingSlug - Landing slug (e.g., 'home', 'laptops')
 * @returns Quiz data with questions and options, or null if no quiz exists
 */
export async function fetchQuizForLanding(landingSlug: string): Promise<LandingQuizData | null> {
  const response = await fetch(`${API_BASE_URL}/public/quiz/landing/${landingSlug}`);

  if (!response.ok) {
    if (response.status === 404) {
      // Landing not found
      return null;
    }
    throw new Error(`Failed to fetch quiz: ${response.statusText}`);
  }

  const data: ApiLandingQuizLookup = await response.json();

  // Check if landing has an active quiz
  if (!data.has_quiz || !data.quiz) {
    return null;
  }

  // Transform to frontend format
  return {
    id: data.id!,
    landingId: data.landing_id,
    quizId: data.quiz_id!,
    isActive: data.is_active!,
    configOverride: data.config_override,
    quiz: transformQuiz(data.quiz),
  };
}

/**
 * Fetch quiz by ID
 * @param quizId - Quiz ID
 * @returns Quiz data with questions and options
 */
export async function fetchQuizById(quizId: number): Promise<QuizData> {
  const response = await fetch(`${API_BASE_URL}/public/quiz/${quizId}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Quiz not found: ${quizId}`);
    }
    throw new Error(`Failed to fetch quiz: ${response.statusText}`);
  }

  const data: ApiQuizFull = await response.json();
  return transformQuiz(data);
}

/**
 * Submit quiz response for analytics
 * @param data - Quiz response data
 */
export async function submitQuizResponse(data: {
  quizId: number;
  landingId: number;
  sessionId?: string;
  answers: QuizAnswer[];
  recommendedProductId?: string;
  matchScore?: number;
  context: 'hero' | 'catalog' | 'landing';
  actionTaken?: 'view_product' | 'view_catalog' | 'abandoned';
}): Promise<void> {
  const payload: ApiQuizResponseCreate = {
    quiz_id: data.quizId,
    landing_id: data.landingId,
    session_id: data.sessionId,
    answers: data.answers.map(a => ({
      question_id: a.questionId,
      selected_options: a.selectedOptions,
    })),
    recommended_product_id: data.recommendedProductId,
    match_score: data.matchScore,
    context: data.context,
    action_taken: data.actionTaken,
  };

  const response = await fetch(`${API_BASE_URL}/public/quiz/responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    // Don't throw - analytics failures should be silent
    console.error('Failed to submit quiz response:', response.statusText);
  }
}

// ============================================
// Recommendation API Types
// ============================================

interface RecommendRequest {
  answers: Array<{
    question_id: number;
    option_ids: number[];
  }>;
  landing_id?: number;
  limit?: number;
}

interface ProductSpecs {
  ram: number | null;
  ram_type: string | null;
  storage: number | null;
  storage_type: string | null;
  processor: string | null;
  screen_size: number | null;
  screen_resolution: string | null;
  gpu: string | null;
}

interface ProductRecommendation {
  id: number;
  sku: string;
  name: string;
  display_name: string;  // Formatted: "$Modelo $Procesador $RAM $Almacenamiento"
  slug: string;
  brand: string;
  brand_slug: string;
  image_url: string | null;
  list_price: number;
  original_price: number | null;
  monthly_payment: number;
  term_months: number;
  gama: string | null;
  condition: string;
  match_score: number;
  match_reasons: string[];
  specs: ProductSpecs;
}

export interface QuizUIConfig {
  result_title: string;
  result_subtitle: string;
  match_label: string;
  cta_primary: string;
  cta_secondary: string;
  others_title: string;
  product_type: string;
}

export interface RecommendResponse {
  products: ProductRecommendation[];
  filters_applied: Record<string, unknown>;
  total_matches: number;
  term_months: number;
  ui_config: QuizUIConfig;
}

// ============================================
// Recommendation Functions
// ============================================

/**
 * Map backend gama to frontend gama type
 */
function mapGama(gama: string | null): 'entrada' | 'media' | 'alta' | 'premium' {
  const mapping: Record<string, 'entrada' | 'media' | 'alta' | 'premium'> = {
    'economica': 'entrada',
    'estudiante': 'media',
    'profesional': 'alta',
    'creativa': 'alta',
    'gamer': 'premium'
  };
  return gama ? (mapping[gama] || 'media') : 'media';
}

/**
 * Format storage type for display
 * Extracts the main type from longer descriptions (e.g., "UFS 2.2 (ampliable...)" -> "UFS 2.2")
 */
function formatStorageType(type: string | null): string {
  if (!type) return 'SSD';
  // If it contains parentheses, take only the part before them
  const mainPart = type.split('(')[0].trim();
  return mainPart || type;
}

/**
 * Transform API recommendation response to frontend QuizResult format
 */
export function mapApiToQuizResults(apiResponse: RecommendResponse): QuizResult[] {
  return apiResponse.products.map((product) => ({
    matchScore: product.match_score,
    product: {
      id: String(product.id),
      name: product.name,
      displayName: product.display_name || product.name,
      brand: product.brand,
      image: product.image_url || '/images/placeholder-laptop.jpg',
      thumbnail: product.image_url || '/images/placeholder-laptop.jpg',
      price: product.list_price,
      lowestQuota: product.monthly_payment,
      specs: {
        ram: product.specs.ram ?? 8,
        ramType: product.specs.ram_type ?? undefined,
        storage: product.specs.storage ?? 256,
        storageType: formatStorageType(product.specs.storage_type),
        processor: product.specs.processor ?? 'N/A',
        displaySize: product.specs.screen_size ?? 15.6,
        resolution: product.specs.screen_resolution ?? '1920x1080',
        gpu: product.specs.gpu ?? undefined,
      },
      tags: product.match_reasons.map(r => r.toLowerCase().replace(/\s+/g, '-')),
      gama: mapGama(product.gama),
      condition: product.condition === 'nueva' ? 'nuevo' : 'reacondicionado',
      matchScore: product.match_score
    } as QuizProduct,
    reasons: product.match_reasons
  }));
}

/**
 * Get product recommendations based on quiz answers
 * @param quizId - Quiz ID
 * @param answers - User's quiz answers
 * @param questions - Quiz questions (to map codes to numeric IDs)
 * @param limit - Number of results to return (from quiz.results_count)
 * @param landingId - Landing ID to filter products (only shows products assigned to this landing)
 * @returns Recommendation response or null on error
 */
export async function getQuizRecommendations(
  quizId: number,
  answers: QuizAnswer[],
  questions: QuizQuestion[],
  limit: number = 5,
  landingId?: number
): Promise<RecommendResponse | null> {
  try {
    // Build lookup maps for code -> numericId
    const questionMap = new Map<string, number>();
    const optionMap = new Map<string, number>();

    questions.forEach(q => {
      questionMap.set(q.id, q.numericId || 0);
      q.options.forEach(opt => {
        optionMap.set(opt.id, opt.numericId || 0);
      });
    });

    // Transform frontend answer format to backend format using numeric IDs
    const requestBody: RecommendRequest = {
      answers: answers.map(a => ({
        question_id: questionMap.get(a.questionId) || 0,
        option_ids: a.selectedOptions
          .map(o => optionMap.get(o) || 0)
          .filter(id => id > 0)
      })).filter(a => a.question_id > 0 && a.option_ids.length > 0),
      landing_id: landingId,
      limit: Math.min(Math.max(limit, 1), 20) // Clamp between 1 and 20
    };

    // Validate we have at least one answer
    if (requestBody.answers.length === 0) {
      console.warn('[Quiz API] No valid answers to send');
      return null;
    }

    const response = await fetch(
      `${API_BASE_URL}/public/quiz/${quizId}/recommend`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      console.error('[Quiz API] Recommendation request failed:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[Quiz API] Error getting recommendations:', error);
    return null;
  }
}
