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
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { useIsMobile } from '@/app/prototipos/_shared/hooks/useIsMobile';

// Dynamic storage key based on landing slug (fallback when no ProductProvider)
const getStorageKey = (landing: string) => `baldecash-${landing}-solicitar-selected-product`;

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
import { QuizLayoutV4Gamer } from './layout/QuizLayoutV4Gamer';
import { QuizLayoutV5Gamer } from './layout/QuizLayoutV5Gamer';

// Question component
import { QuizQuestionV1 } from './questions/QuizQuestionV1';
import { QuizQuestionV1Gamer } from './questions/QuizQuestionV1Gamer';

// Results component
import { QuizResultsV1 } from './results/QuizResultsV1';
import { QuizResultsV1Gamer } from './results/QuizResultsV1Gamer';

// Data and API
import { useQuiz } from '../../hooks/useQuiz';
import { submitQuizResponse, getQuizRecommendations, mapApiToQuizResults } from '../../../services/quizApi';
import { useAnalytics } from '@/app/prototipos/0.6/analytics/useAnalytics';

// URL helpers - updated for 0.6 dynamic routes
const getWizardUrl = (landing?: string) => {
  const landingSlug = landing || 'home';
  return routes.solicitar(landingSlug);
};

// Configuración para cálculo de cuota
const WIZARD_SELECTED_TERM = 24;

const getCatalogUrlWithFilters = (
  answers: QuizAnswer[],
  landing: string | undefined,
  questionsSource: QuizQuestion[]
) => {
  const landingSlug = landing || 'home';
  const baseUrl = routes.catalogo(landingSlug);
  const params = new URLSearchParams();

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
  landing,
  onAddToCart,
  cartItems = [],
  gamerTheme: T,
  isDark = false,
}) => {
  const isGamer = !!T;
  const router = useRouter();
  // Use optional hook - may be null if outside ProductProvider (e.g., Hero page)
  const productContext = useProductOptional();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [results, setResults] = useState<QuizResult[] | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const analytics = useAnalytics();
  const quizStartTsRef = useRef<number | null>(null);

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
      slug: product.slug,
      name: product.displayName,
      shortName: product.name,
      brand: product.brand,
      price: product.price,
      monthlyPayment: product.lowestQuota,
      months: product.termMonths || WIZARD_SELECTED_TERM,
      initialPercent: product.initialPercent || 0,
      initialAmount: 0,
      image: product.thumbnail || product.image,
      type: product.deviceType,
      variantId: product.variantId,
      colorName: product.colorName,
      colorHex: product.colorHex,
      paymentFrequency: product.paymentFrequency,
      specs: {
        processor: product.specs?.processor || '',
        ram: product.specs?.ram ? `${product.specs.ram}GB RAM` : '',
        storage: product.specs?.storage ? `${product.specs.storage}GB ${product.specs.storageType?.toUpperCase() || 'SSD'}` : '',
      },
    };

    // If we have context, use it
    if (productContext?.setSelectedProduct) {
      // Clear cart and accessories - user explicitly selected THIS product
      productContext.clearCartProducts?.();
      productContext.clearAccessories?.();
      productContext.setSelectedProduct(selectedProduct);
    } else {
      // Fallback: save directly to localStorage and clear cart storage
      const landingKey = landing || 'home';
      try {
        localStorage.setItem(getStorageKey(landingKey), JSON.stringify(selectedProduct));
        // Also clear cart from localStorage
        localStorage.removeItem(`baldecash-${landingKey}-solicitar-cart-products`);
        localStorage.removeItem(`baldecash-${landingKey}-solicitar-selected-accessories`);
      } catch {
        // localStorage not available
      }
    }
  }, [productContext, landing]);

  // Get questions from API (all questions come from backend)
  const questions = apiQuestions;

  // Skip-logic: returns true if a question should be shown given current answers
  const isQuestionVisible = useCallback((question: typeof questions[0], answeredSoFar: QuizAnswer[]): boolean => {
    if (!question.conditions || question.conditions.length === 0) return true;
    return question.conditions.every((cond) => {
      const answer = answeredSoFar.find((a) => {
        // Match by numericId (conditions use numeric IDs from backend)
        const q = questions.find((qq) => qq.id === a.questionId);
        return q?.numericId === cond.dependsOnQuestionId;
      });
      if (!answer) return false;
      return cond.requiredOptionCodes.some((code) => {
        // Match option code against selected option IDs (frontend uses codes as IDs)
        return answer.selectedOptions.includes(code);
      });
    });
  }, [questions]);

  // Visible questions based on answers given so far
  const visibleQuestions = useMemo(
    () => questions.filter((q) => isQuestionVisible(q, answers)),
    [questions, answers, isQuestionVisible]
  );

  const totalSteps = visibleQuestions.length;
  const currentQuestion = visibleQuestions[currentStep];

  // Emit quiz_start / quiz_abandon based on modal visibility.
  // El start se dispara solo la primera vez que se abre con preguntas cargadas.
  useEffect(() => {
    if (isOpen && questions.length > 0 && quizStartTsRef.current === null) {
      quizStartTsRef.current = Date.now();
      analytics.trackQuizStart({ context, question_count: questions.length });
    }
    if (!isOpen && quizStartTsRef.current !== null && !results) {
      // Cerró antes de terminar
      analytics.trackQuizAbandon({
        context,
        step: currentStep,
        total: questions.length,
      });
      quizStartTsRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, questions.length]);

  // Get layout component for non-gamer path
  const LayoutComponent = isMobile ? QuizLayoutV4 : QuizLayoutV5;
  // Gamer layout components selected below at render time

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

    analytics.trackQuizAnswer({
      question_id: currentQuestion.id,
      option_id: selectedOption,
      step: currentStep + 1,
      total: totalSteps,
    });

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (currentStep >= totalSteps - 1) {
      // Mostrar loading y luego resultados
      setIsCalculating(true);

      let quizResults: QuizResult[];

      // Obtener recomendaciones de la API
      if (quizId) {
        const apiResponse = await getQuizRecommendations(
          quizId,
          updatedAnswers,
          questions, // Pass questions to map codes to numeric IDs
          resultsCount,
          landingId || undefined
        );

        if (apiResponse && apiResponse.products.length > 0) {
          quizResults = mapApiToQuizResults(apiResponse);
        } else {
          quizResults = [];
        }
      } else {
        console.error('[Quiz] No quizId available');
        quizResults = [];
      }

      // Limit results to configured resultsCount
      const finalResults = quizResults.slice(0, resultsCount);
      setResults(finalResults);
      setIsCalculating(false);

      // Quiz finish analytics
      const duration = quizStartTsRef.current ? Date.now() - quizStartTsRef.current : undefined;
      analytics.trackQuizFinish({
        context,
        result_count: finalResults.length,
        duration_ms: duration,
      });
      quizStartTsRef.current = null;

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
  }, [selectedOption, currentQuestion, answers, currentStep, totalSteps, quizId, questions, visibleQuestions, resultsCount, landingId, context]);

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

  // Helper to clean up body styles (in case modal left them)
  const cleanupBodyStyles = useCallback(() => {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.overflow = '';
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

      // Limpiar estilos del body antes de navegar (el modal mobile los bloquea)
      cleanupBodyStyles();

      // Navegar al wizard
      router.push(getWizardUrl(landing));
    },
    [results, onClose, handleRestart, router, landing, selectProductForWizard, cleanupBodyStyles]
  );

  // Handle "Ver otras opciones"
  const handleViewOtherOptions = useCallback(() => {
    if (context === 'hero') {
      // En Hero: Cerrar y navegar al catálogo con filtros
      onClose();
      handleRestart();
      cleanupBodyStyles();
      router.push(getCatalogUrlWithFilters(answers, landing, questions));
    } else {
      // En Catalog: Cerrar y aplicar filtros mediante onComplete
      if (onComplete && results) {
        onComplete(results, answers, questions);
      }
      onClose();
      handleRestart();
      cleanupBodyStyles();
    }
  }, [context, onClose, handleRestart, router, answers, landing, onComplete, results, questions, cleanupBodyStyles]);

  // Handle close and reset
  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => {
      handleRestart();
    }, 300);
  }, [onClose, handleRestart]);

  const F_RAJ = "'Rajdhani', sans-serif";

  // Render content
  const renderContent = () => {
    // Mostrar loading mientras carga el quiz
    if (quizLoading) {
      return isGamer && T ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <Loader2 size={40} style={{ color: T.neonCyan }} />
          </motion.div>
          <p style={{ marginTop: 16, color: T.textMuted, fontFamily: F_RAJ, fontSize: 14 }}>Cargando preguntas...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <Loader2 className="w-12 h-12" style={{ color: 'var(--color-primary)' }} />
          </motion.div>
          <p className="mt-4 text-neutral-600 font-medium">Cargando preguntas...</p>
        </div>
      );
    }

    // Si no hay quiz para esta landing, cerrar el modal silenciosamente
    if (!hasQuiz && !quizError) {
      setTimeout(() => handleClose(), 100);
      return null;
    }

    // Mostrar error solo si hubo un error real de carga
    if (quizError) {
      return isGamer && T ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,0,85,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <X size={28} style={{ color: '#ff0055' }} />
          </div>
          <p style={{ color: T.textPrimary, fontFamily: F_RAJ, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>No pudimos cargar el quiz</p>
          <p style={{ color: T.textMuted, fontFamily: F_RAJ, fontSize: 13, marginBottom: 20 }}>{quizError}</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={handleClose} style={{ padding: '8px 18px', borderRadius: 8, background: 'transparent', border: `1px solid ${T.border}`, color: T.textSecondary, fontFamily: F_RAJ, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cerrar</button>
            <button onClick={() => refetchQuiz()} style={{ padding: '8px 18px', borderRadius: 8, background: T.neonCyan, border: 'none', color: isDark ? '#0a0a0a' : '#fff', fontFamily: F_RAJ, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Reintentar</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-neutral-700 font-medium mb-2">No pudimos cargar el quiz</p>
          <p className="text-sm text-neutral-500 mb-4">{quizError}</p>
          <div className="flex gap-3">
            <Button variant="light" onPress={handleClose} className="cursor-pointer">Cerrar</Button>
            <Button className="text-white cursor-pointer" style={{ backgroundColor: 'var(--color-primary)' }} onPress={() => refetchQuiz()}>Reintentar</Button>
          </div>
        </div>
      );
    }

    // Mostrar resultados
    if (results) {
      return isGamer && T ? (
        <QuizResultsV1Gamer
          results={results}
          onViewProduct={handleViewProduct}
          onRestartQuiz={handleRestart}
          onViewOtherOptions={handleViewOtherOptions}
          onAddToCart={onAddToCart}
          cartItems={cartItems}
          T={T}
          isDark={isDark}
        />
      ) : (
        <QuizResultsV1
          results={results}
          onViewProduct={handleViewProduct}
          onRestartQuiz={handleRestart}
          onViewOtherOptions={handleViewOtherOptions}
          onAddToCart={onAddToCart}
          cartItems={cartItems}
        />
      );
    }

    // Mostrar loading de cálculo
    if (isCalculating) {
      return isGamer && T ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <Loader2 size={40} style={{ color: T.neonCyan }} />
          </motion.div>
          <p style={{ marginTop: 16, color: T.textPrimary, fontFamily: F_RAJ, fontSize: 14, fontWeight: 600 }}>Analizando tus respuestas...</p>
          <p style={{ color: T.textMuted, fontFamily: F_RAJ, fontSize: 12, marginTop: 4 }}>Buscando el equipo ideal para ti</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <Loader2 className="w-12 h-12" style={{ color: 'var(--color-primary)' }} />
          </motion.div>
          <p className="mt-4 text-neutral-600 font-medium">Analizando tus respuestas...</p>
          <p className="text-sm text-neutral-400">Buscando la laptop ideal para ti</p>
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
            {isGamer && T ? (
              <QuizQuestionV1Gamer
                question={currentQuestion}
                selectedOption={selectedOption}
                onSelect={handleSelectOption}
                T={T}
                isDark={isDark}
              />
            ) : (
              <QuizQuestionV1
                question={currentQuestion}
                selectedOption={selectedOption}
                onSelect={handleSelectOption}
              />
            )}
          </motion.div>
        </AnimatePresence>
      );
    }

    return null;
  };

  // Render footer with navigation buttons (only for questions, not results)
  const renderFooter = () => {
    if (results || isCalculating || !currentQuestion) return null;

    if (isGamer && T) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          {currentStep === 0 ? (
            <button
              onClick={handleClose}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: 'transparent', border: `1px solid ${T.border}`, color: T.textSecondary, fontFamily: F_RAJ, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              <X size={14} /> Cancelar
            </button>
          ) : (
            <button
              onClick={handleBack}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: 'transparent', border: `1px solid ${T.border}`, color: T.textSecondary, fontFamily: F_RAJ, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              <ArrowLeft size={14} /> Anterior
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!selectedOption}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 22px', borderRadius: 10,
              background: selectedOption ? T.neonCyan : T.border,
              border: 'none',
              color: selectedOption ? (isDark ? '#0a0a0a' : '#fff') : T.textMuted,
              fontFamily: F_RAJ, fontSize: 15, fontWeight: 700,
              cursor: selectedOption ? 'pointer' : 'not-allowed',
              boxShadow: selectedOption ? `0 0 12px ${T.neonCyan}40` : 'none',
              transition: 'all 0.2s',
            }}
          >
            {currentStep >= totalSteps - 1 ? 'Ver resultados' : 'Siguiente'}
            <ArrowRight size={15} />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between w-full">
        {currentStep === 0 ? (
          <Button variant="light" startContent={<X className="w-4 h-4" />} onPress={handleClose} className="cursor-pointer">
            Cancelar
          </Button>
        ) : (
          <Button variant="light" startContent={<ArrowLeft className="w-4 h-4" />} onPress={handleBack} className="cursor-pointer">
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

  const sharedLayoutProps = {
    isOpen,
    onClose: handleClose,
    currentStep: results ? totalSteps : currentStep,
    totalSteps,
    footer: renderFooter(),
  };

  if (isGamer && T) {
    const GamerLayout = isMobile ? QuizLayoutV4Gamer : QuizLayoutV5Gamer;
    return (
      <GamerLayout {...sharedLayoutProps} T={T} isDark={isDark}>
        {renderContent()}
      </GamerLayout>
    );
  }

  return (
    <LayoutComponent {...sharedLayoutProps}>
      {renderContent()}
    </LayoutComponent>
  );
};

export default HelpQuiz;
