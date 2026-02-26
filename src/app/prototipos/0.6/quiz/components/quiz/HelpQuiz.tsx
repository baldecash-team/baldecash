'use client';

/**
 * HelpQuiz - Componente principal del Quiz de Ayuda v0.6
 *
 * Versión simplificada con configuración fija:
 * - Layout: V4 (mobile) / V5 (desktop)
 * - Questions: V1 (chips/pills)
 * - Results: V1 (producto destacado estilo 0.3)
 * - Focus: V1 (solo por uso)
 * - 7 preguntas
 *
 * Comportamiento por contexto:
 * - Hero: "Lo quiero" -> wizard, "Ver otras opciones" -> catálogo con filtros
 * - Catalog: "Lo quiero" -> wizard, "Ver otras opciones" -> cerrar y aplicar filtros
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Button } from '@nextui-org/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProductOptional, type SelectedProduct } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';
import { useIsMobile } from '@/app/prototipos/_shared/hooks/useIsMobile';

// Storage key for fallback when no ProductProvider
const STORAGE_KEY = 'baldecash-solicitar-selected-product';

// Types
import {
  QuizConfig,
  QuizQuestion,
  QuizAnswer,
  QuizResult,
  QuizProduct,
  HelpQuizProps,
} from '../../types/quiz';

// Layout components
import { QuizLayoutV4 } from './layout/QuizLayoutV4';
import { QuizLayoutV5 } from './layout/QuizLayoutV5';

// Question component
import { QuizQuestionV1 } from './questions/QuizQuestionV1';

// Results component
import { QuizResultsV1 } from './results/QuizResultsV1';

// Data and API
import { generateMockResults } from '../../data/mockQuizData';
import { useQuiz } from '../../hooks/useQuiz';
import { submitQuizResponse, getQuizRecommendations, mapApiToQuizResults } from '../../../services/quizApi';

// URL helpers - updated for 0.6 dynamic routes
const getWizardUrl = (isCleanMode: boolean, landing?: string) => {
  const landingSlug = landing || 'home';
  const baseUrl = `/prototipos/0.6/${landingSlug}/solicitar`;
  return isCleanMode ? `${baseUrl}?mode=clean` : baseUrl;
};

// Configuración para cálculo de cuota
const WIZARD_SELECTED_TERM = 24;

const getCatalogUrlWithFilters = (
  answers: QuizAnswer[],
  isCleanMode: boolean,
  landing: string | undefined,
  questionsSource: QuizQuestion[]
) => {
  const landingSlug = landing || 'home';
  const baseUrl = `/prototipos/0.6/${landingSlug}/catalogo`;
  const params = new URLSearchParams();

  if (isCleanMode) {
    params.set('mode', 'clean');
  }

  // Mapear respuestas a parámetros de filtro
  answers.forEach((answer) => {
    const question = questionsSource.find((q) => q.id === answer.questionId);
    if (!question) return;

    const selectedOption = question.options.find((opt) => opt.id === answer.selectedOptions[0]);
    if (!selectedOption?.weight) return;

    const weight = selectedOption.weight as Record<string, unknown>;

    // Usage
    if (weight.usage) {
      params.set('usage', answer.selectedOptions[0]);
    }

    // Budget -> quota range (formato: min,max)
    if (weight.budget) {
      const budgetMap: Record<string, string> = {
        low: '0,80',
        medium: '80,150',
        high: '150,250',
        premium: '250,500',
      };
      const range = budgetMap[weight.budget as string];
      if (range) {
        params.set('quota', range);
      }
    }

    // Brand
    if (weight.brand && weight.brand !== 'any') {
      params.set('brand', (weight.brand as string).toLowerCase());
    }

    // RAM
    if (weight.ram && typeof weight.ram === 'number') {
      params.set('ram', String(weight.ram));
    }

    // GPU
    if (weight.gpu) {
      params.set('gpu', weight.gpu as string);
    }

    // Storage
    if (weight.storage && typeof weight.storage === 'number') {
      params.set('storage', String(weight.storage));
    }

    // Display size
    if (weight.display && typeof weight.display === 'number') {
      // No hay filtro directo por display en URL, pero se puede agregar si es necesario
    }

    // Stock (inStock)
    if (weight.inStock === true) {
      params.set('stock', 'available');
    }

    // Condition
    if (weight.condition && weight.condition !== 'any') {
      params.set('condition', weight.condition as string);
    }
  });

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

export const HelpQuiz: React.FC<HelpQuizProps> = ({
  // config is deprecated - values now come from API
  isOpen,
  onClose,
  onComplete,
  context = 'catalog',
  isCleanMode = false,
  landing,
}) => {
  const router = useRouter();
  // Use optional hook - may be null if outside ProductProvider (e.g., Hero page)
  const productContext = useProductOptional();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [results, setResults] = useState<QuizResult[] | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Scroll al inicio cuando cambian los resultados o el paso
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [results, currentStep]);

  // Fetch quiz data from API
  const {
    questions: apiQuestions,
    quizId,
    landingId,
    resultsCount,
    loading: quizLoading,
    error: quizError,
    hasQuiz,
    refetch: refetchQuiz,
  } = useQuiz({ landingSlug: landing || 'home' });

  // Mobile detection for layout (using shared hook)
  const isMobile = useIsMobile();

  // Helper to save product - uses context if available, otherwise localStorage
  const selectProductForWizard = useCallback((product: QuizProduct) => {
    const selectedProduct: SelectedProduct = {
      id: product.id,
      name: product.displayName,
      shortName: product.name,
      brand: product.brand,
      price: product.price,
      monthlyPayment: product.lowestQuota,
      months: WIZARD_SELECTED_TERM,
      image: product.thumbnail || product.image,
      specs: {
        processor: product.specs?.processor || '',
        ram: product.specs?.ram ? `${product.specs.ram}GB RAM` : '',
        storage: product.specs?.storage ? `${product.specs.storage}GB ${product.specs.storageType?.toUpperCase() || 'SSD'}` : '',
      },
    };

    // If we have context, use it
    if (productContext?.setSelectedProduct) {
      productContext.setSelectedProduct(selectedProduct);
    } else {
      // Fallback: save directly to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedProduct));
      } catch {
        // localStorage not available
      }
    }
  }, [productContext]);

  // Get questions from API (all questions come from backend)
  const questions = apiQuestions;

  const totalSteps = questions.length;
  const currentQuestion = questions[currentStep];

  // Get layout component based on device (mobile: V4 bottom sheet, desktop: V5 modal)
  const LayoutComponent = isMobile ? QuizLayoutV4 : QuizLayoutV5;

  // Handle option selection
  const handleSelectOption = useCallback((optionId: string) => {
    setSelectedOption(optionId);
  }, []);

  // Handle next step
  const handleNext = useCallback(async () => {
    if (!selectedOption || !currentQuestion) return;

    const newAnswer: QuizAnswer = {
      questionId: currentQuestion.id,
      selectedOptions: [selectedOption],
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (currentStep >= totalSteps - 1) {
      // Mostrar loading y luego resultados
      setIsCalculating(true);

      let quizResults: QuizResult[];

      // Intentar obtener recomendaciones de la API
      if (quizId) {
        const apiResponse = await getQuizRecommendations(
          quizId,
          updatedAnswers,
          questions, // Pass questions to map codes to numeric IDs
          resultsCount,
          landingId || undefined
        );

        if (apiResponse && apiResponse.products.length > 0) {
          // Usar resultados de la API
          quizResults = mapApiToQuizResults(apiResponse);
          console.log('[Quiz] Using API recommendations:', quizResults.length, 'limit:', resultsCount, 'landing:', landingId);
        } else {
          // Fallback a mock si API falla o no hay resultados
          console.log('[Quiz] Fallback to mock data');
          quizResults = generateMockResults(updatedAnswers);
        }
      } else {
        // Sin quizId, usar mock
        console.log('[Quiz] No quizId, using mock data');
        quizResults = generateMockResults(updatedAnswers);
      }

      setResults(quizResults);
      setIsCalculating(false);

      // Submit analytics
      if (quizId && landingId) {
        const topResult = quizResults[0];
        submitQuizResponse({
          quizId,
          landingId,
          answers: updatedAnswers,
          recommendedProductId: topResult?.product.id,
          matchScore: topResult?.matchScore,
          context: context as 'hero' | 'catalog' | 'landing',
        }).catch(() => {
          // Silent fail - analytics shouldn't block UX
        });
      }
    } else {
      setCurrentStep((prev) => prev + 1);
      setSelectedOption(null);
    }
  }, [selectedOption, currentQuestion, answers, currentStep, totalSteps, quizId, questions, resultsCount, landingId, context]);

  // Handle back
  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      const previousAnswer = answers[currentStep - 1];
      setSelectedOption(previousAnswer?.selectedOptions[0] || null);
      setAnswers((prev) => prev.slice(0, -1));
    }
  }, [currentStep, answers]);

  // Handle restart
  const handleRestart = useCallback(() => {
    setCurrentStep(0);
    setAnswers([]);
    setSelectedOption(null);
    setResults(null);
  }, []);

  // Handle "Lo quiero" - navegar al wizard
  const handleViewProduct = useCallback(
    (productId: string) => {
      // Guardar el producto seleccionado en el contexto
      if (results) {
        const selectedResult = results.find((r) => r.product.id === productId);
        if (selectedResult) {
          selectProductForWizard(selectedResult.product);
        }
      }

      // Cerrar modal y resetear
      onClose();
      handleRestart();

      // Navegar al wizard
      router.push(getWizardUrl(isCleanMode, landing));
    },
    [results, onClose, handleRestart, router, isCleanMode, landing, selectProductForWizard]
  );

  // Handle "Ver otras opciones"
  const handleViewOtherOptions = useCallback(() => {
    if (context === 'hero') {
      // En Hero: Cerrar y navegar al catálogo con filtros
      onClose();
      handleRestart();
      router.push(getCatalogUrlWithFilters(answers, isCleanMode, landing, questions));
    } else {
      // En Catalog: Cerrar y aplicar filtros mediante onComplete
      if (onComplete && results) {
        onComplete(results, answers, questions);
      }
      onClose();
      handleRestart();
    }
  }, [context, onClose, handleRestart, router, answers, isCleanMode, landing, onComplete, results, questions]);

  // Handle close and reset
  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => {
      handleRestart();
    }, 300);
  }, [onClose, handleRestart]);

  // Render content
  const renderContent = () => {
    // Mostrar loading mientras carga el quiz
    if (quizLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="w-12 h-12" style={{ color: 'var(--color-primary)' }} />
          </motion.div>
          <p className="mt-4 text-neutral-600 font-medium">
            Cargando preguntas...
          </p>
        </div>
      );
    }

    // Si no hay quiz para esta landing, cerrar el modal silenciosamente
    if (!hasQuiz && !quizError) {
      // Cerrar automáticamente después de un breve momento
      setTimeout(() => handleClose(), 100);
      return null;
    }

    // Mostrar error solo si hubo un error real de carga
    if (quizError) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-neutral-700 font-medium mb-2">
            No pudimos cargar el quiz
          </p>
          <p className="text-sm text-neutral-500 mb-4">
            {quizError}
          </p>
          <div className="flex gap-3">
            <Button
              variant="light"
              onPress={handleClose}
              className="cursor-pointer"
            >
              Cerrar
            </Button>
            <Button
              className="text-white cursor-pointer"
              style={{ backgroundColor: 'var(--color-primary)' }}
              onPress={() => refetchQuiz()}
            >
              Reintentar
            </Button>
          </div>
        </div>
      );
    }

    // Mostrar resultados
    if (results) {
      return (
        <QuizResultsV1
          results={results}
          onViewProduct={handleViewProduct}
          onRestartQuiz={handleRestart}
          onViewOtherOptions={handleViewOtherOptions}
        />
      );
    }

    // Mostrar loading
    if (isCalculating) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="w-12 h-12" style={{ color: 'var(--color-primary)' }} />
          </motion.div>
          <p className="mt-4 text-neutral-600 font-medium">
            Analizando tus respuestas...
          </p>
          <p className="text-sm text-neutral-400">
            Buscando la laptop ideal para ti
          </p>
        </div>
      );
    }

    // Mostrar pregunta actual
    if (currentQuestion) {
      return (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <QuizQuestionV1
              question={currentQuestion}
              selectedOption={selectedOption}
              onSelect={handleSelectOption}
            />
          </motion.div>
        </AnimatePresence>
      );
    }

    return null;
  };

  // Render footer with navigation buttons (only for questions, not results)
  const renderFooter = () => {
    if (results || isCalculating || !currentQuestion) {
      return null;
    }

    return (
      <div className="flex items-center justify-between w-full">
        {currentStep === 0 ? (
          <Button
            variant="light"
            startContent={<X className="w-4 h-4" />}
            onPress={handleClose}
            className="cursor-pointer"
          >
            Cancelar
          </Button>
        ) : (
          <Button
            variant="light"
            startContent={<ArrowLeft className="w-4 h-4" />}
            onPress={handleBack}
            className="cursor-pointer"
          >
            Anterior
          </Button>
        )}

        <Button
          className="text-white font-semibold cursor-pointer"
          style={{ backgroundColor: 'var(--color-primary)' }}
          size="lg"
          isDisabled={!selectedOption}
          endContent={<ArrowRight className="w-4 h-4" />}
          onPress={handleNext}
        >
          {currentStep >= totalSteps - 1 ? 'Ver resultados' : 'Siguiente'}
        </Button>
      </div>
    );
  };

  return (
    <LayoutComponent
      isOpen={isOpen}
      onClose={handleClose}
      currentStep={results ? totalSteps : currentStep}
      totalSteps={totalSteps}
      footer={renderFooter()}
    >
      {renderContent()}
    </LayoutComponent>
  );
};

export default HelpQuiz;
