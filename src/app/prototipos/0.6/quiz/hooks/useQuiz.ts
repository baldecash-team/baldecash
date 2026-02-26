/**
 * useQuiz Hook - BaldeCash v0.6
 * Hook para cargar datos del quiz desde la API
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { QuizQuestion } from '../types/quiz';
import { fetchQuizForLanding, type LandingQuizData } from '../../services/quizApi';

interface UseQuizOptions {
  /** Landing slug para cargar el quiz asociado */
  landingSlug?: string;
  /** Si debe cargar los datos automáticamente al montar */
  autoLoad?: boolean;
}

interface UseQuizReturn {
  /** Preguntas del quiz */
  questions: QuizQuestion[];
  /** ID del quiz (para analytics) */
  quizId: number | null;
  /** ID del landing (para analytics) */
  landingId: number | null;
  /** Configuración del quiz desde la API */
  quizConfig: LandingQuizData['quiz']['config'] | null;
  /** Número de resultados a mostrar (desde admin) */
  resultsCount: number;
  /** Estado de carga */
  loading: boolean;
  /** Error si ocurrió alguno (solo errores reales, no "sin quiz") */
  error: string | null;
  /** Indica si la landing tiene un quiz activo */
  hasQuiz: boolean;
  /** Recargar datos */
  refetch: () => Promise<void>;
}

/**
 * Hook para cargar quiz desde la API
 *
 * @example
 * ```tsx
 * const { questions, loading, error, quizId, landingId } = useQuiz({ landingSlug: 'home' });
 *
 * if (loading) return <Spinner />;
 * if (error) return <ErrorMessage message={error} />;
 *
 * return <Quiz questions={questions} />;
 * ```
 */
export function useQuiz(options: UseQuizOptions = {}): UseQuizReturn {
  const { landingSlug = 'home', autoLoad = true } = options;

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizId, setQuizId] = useState<number | null>(null);
  const [landingId, setLandingId] = useState<number | null>(null);
  const [quizConfig, setQuizConfig] = useState<LandingQuizData['quiz']['config'] | null>(null);
  const [resultsCount, setResultsCount] = useState<number>(5); // Default: 5
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasQuiz, setHasQuiz] = useState(false);

  const loadQuiz = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchQuizForLanding(landingSlug);

      if (data === null) {
        // No quiz for this landing - this is normal, not an error
        setHasQuiz(false);
        setQuestions([]);
        setQuizId(null);
        setLandingId(null);
        setQuizConfig(null);
        setResultsCount(5);
        return;
      }

      setHasQuiz(true);
      setQuestions(data.quiz.questions);
      setQuizId(data.quizId);
      setLandingId(data.landingId);
      setQuizConfig(data.quiz.config);
      setResultsCount(data.quiz.resultsCount || 5);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar el quiz';
      console.error(`useQuiz: ${errorMessage}`);
      setHasQuiz(false);
      setQuestions([]);
      setQuizId(null);
      setLandingId(null);
      setQuizConfig(null);
      setResultsCount(5);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [landingSlug]);

  useEffect(() => {
    if (autoLoad) {
      loadQuiz();
    }
  }, [autoLoad, loadQuiz]);

  return {
    questions,
    quizId,
    landingId,
    quizConfig,
    resultsCount,
    loading,
    error,
    hasQuiz,
    refetch: loadQuiz,
  };
}

export default useQuiz;
