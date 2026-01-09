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

// Types
import {
  QuizConfig,
  QuizQuestion,
  QuizAnswer,
  QuizResult,
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

const getCatalogUrlWithFilters = (answers: QuizAnswer[], isCleanMode: boolean) => {
  const baseUrl = '/prototipos/0.5/catalogo/catalog-preview';
  const params = new URLSearchParams();

  if (isCleanMode) {
    params.set('mode', 'clean');
  }

  // Mapear respuestas a parámetros de filtro
  answers.forEach((answer) => {
    if (answer.questionId === 'usage' && answer.selectedOptions[0]) {
      params.set('usage', answer.selectedOptions[0]);
    }
    if (answer.questionId === 'budget' && answer.selectedOptions[0]) {
      params.set('budget', answer.selectedOptions[0]);
    }
    if (answer.questionId === 'brand_preference' && answer.selectedOptions[0] !== 'any') {
      params.set('brand', answer.selectedOptions[0]);
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
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [results, setResults] = useState<QuizResult[] | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

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
      // Cerrar modal y resetear
      onClose();
      handleRestart();

      // Navegar al wizard
      router.push(getWizardUrl(isCleanMode));
    },
    [onClose, handleRestart, router, isCleanMode]
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
