'use client';

/**
 * HelpQuiz - Componente principal del Quiz de Ayuda v0.5
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

import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@nextui-org/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProduct } from '@/app/prototipos/0.5/wizard-solicitud/context/ProductContext';

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

// Data
import { quizQuestionsUsage, generateMockResults } from '../../data/mockQuizData';

// Component maps (simplificado para v0.5)
const layoutComponents = {
  4: QuizLayoutV4,
  5: QuizLayoutV5,
};

// URL helpers
const getWizardUrl = (isCleanMode: boolean) => {
  const baseUrl = '/prototipos/0.5/wizard-solicitud/wizard-preview/';
  return isCleanMode ? `${baseUrl}?mode=clean` : baseUrl;
};

// Configuración para cálculo de cuota
const WIZARD_SELECTED_TERM = 24;

const getCatalogUrlWithFilters = (answers: QuizAnswer[], isCleanMode: boolean) => {
  const baseUrl = '/prototipos/0.5/catalogo/catalog-preview';
  const params = new URLSearchParams();

  if (isCleanMode) {
    params.set('mode', 'clean');
  }

  // Mapear respuestas a parámetros de filtro
  answers.forEach((answer) => {
    const question = quizQuestionsUsage.find((q) => q.id === answer.questionId);
    if (!question) return;

    const selectedOption = question.options.find((opt) => opt.id === answer.selectedOptions[0]);
    if (!selectedOption?.weight) return;

    const weight = selectedOption.weight as Record<string, unknown>;

    // Usage
    if (weight.usage) {
      params.set('usage', answer.selectedOptions[0]);
    }

    // Budget -> quota range
    if (weight.budget) {
      const budgetMap: Record<string, string> = {
        low: '0-80',
        medium: '80-150',
        high: '150-250',
        premium: '250-500',
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
  config,
  isOpen,
  onClose,
  onComplete,
  context = 'catalog',
  isCleanMode = false,
}) => {
  const router = useRouter();
  const { setSelectedProduct } = useProduct();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [results, setResults] = useState<QuizResult[] | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Helper to save product to context
  const selectProductForWizard = useCallback((product: QuizProduct) => {
    setSelectedProduct({
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
    });
  }, [setSelectedProduct]);

  // Get questions (fijo: 7 preguntas, focus usage)
  const questions = useMemo((): QuizQuestion[] => {
    return quizQuestionsUsage.slice(0, config.questionCount);
  }, [config.questionCount]);

  const totalSteps = questions.length;
  const currentQuestion = questions[currentStep];

  // Get layout component based on config
  const LayoutComponent = layoutComponents[config.layoutVersion];

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

      // Simular cálculo
      await new Promise(resolve => setTimeout(resolve, 1000));

      const quizResults = generateMockResults(updatedAnswers);
      setResults(quizResults);
      setIsCalculating(false);
    } else {
      setCurrentStep((prev) => prev + 1);
      setSelectedOption(null);
    }
  }, [selectedOption, currentQuestion, answers, currentStep, totalSteps]);

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
      router.push(getWizardUrl(isCleanMode));
    },
    [results, onClose, handleRestart, router, isCleanMode, selectProductForWizard]
  );

  // Handle "Ver otras opciones"
  const handleViewOtherOptions = useCallback(() => {
    if (context === 'hero') {
      // En Hero: Cerrar y navegar al catálogo con filtros
      onClose();
      handleRestart();
      router.push(getCatalogUrlWithFilters(answers, isCleanMode));
    } else {
      // En Catalog: Cerrar y aplicar filtros mediante onComplete
      if (onComplete && results) {
        onComplete(results, answers);
      }
      onClose();
      handleRestart();
    }
  }, [context, onClose, handleRestart, router, answers, isCleanMode, onComplete, results]);

  // Handle close and reset
  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => {
      handleRestart();
    }, 300);
  }, [onClose, handleRestart]);

  // Render content
  const renderContent = () => {
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
            <Loader2 className="w-12 h-12 text-[#4654CD]" />
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
        <div className="flex flex-col h-full">
          <div className="flex-1">
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
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-100">
            <Button
              variant="light"
              isDisabled={currentStep === 0}
              startContent={<ArrowLeft className="w-4 h-4" />}
              onPress={handleBack}
              className="cursor-pointer"
            >
              Anterior
            </Button>

            <Button
              className="bg-[#4654CD] text-white font-semibold cursor-pointer"
              size="lg"
              isDisabled={!selectedOption}
              endContent={<ArrowRight className="w-4 h-4" />}
              onPress={handleNext}
            >
              {currentStep >= totalSteps - 1 ? 'Ver resultados' : 'Siguiente'}
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <LayoutComponent
      isOpen={isOpen}
      onClose={handleClose}
      currentStep={results ? totalSteps : currentStep}
      totalSteps={totalSteps}
    >
      {renderContent()}
    </LayoutComponent>
  );
};

export default HelpQuiz;
