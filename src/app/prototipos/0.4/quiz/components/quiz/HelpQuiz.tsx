'use client';

/**
 * HelpQuiz - Componente principal del Quiz de Ayuda v0.4
 *
 * Orquesta todos los componentes del quiz segun la configuracion.
 * Consolidado con preferencias de 0.3:
 * - B.98: Layout V1 (modal full screen mobile)
 * - B.99: 7 preguntas
 * - B.100: Question Style V1 (chips/pills)
 * - B.101: Results V1 (categoria + cards catalogo)
 * - B.102: Focus V1 (solo por uso)
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@nextui-org/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

// Types
import {
  QuizConfig,
  QuizQuestion,
  QuizAnswer,
  QuizResult,
  HelpQuizProps,
} from '../../types/quiz';

// Layout components
import { QuizLayoutV1 } from './layout/QuizLayoutV1';
import { QuizLayoutV2 } from './layout/QuizLayoutV2';
import { QuizLayoutV3 } from './layout/QuizLayoutV3';
import { QuizLayoutV4 } from './layout/QuizLayoutV4';
import { QuizLayoutV5 } from './layout/QuizLayoutV5';
import { QuizLayoutV6 } from './layout/QuizLayoutV6';

// Question components
import { QuizQuestionV1 } from './questions/QuizQuestionV1';
import { QuizQuestionV2 } from './questions/QuizQuestionV2';
import { QuizQuestionV3 } from './questions/QuizQuestionV3';
import { QuizQuestionV4 } from './questions/QuizQuestionV4';
import { QuizQuestionV5 } from './questions/QuizQuestionV5';
import { QuizQuestionV6 } from './questions/QuizQuestionV6';

// Results components
import { QuizResultsV1 } from './results/QuizResultsV1';
import { QuizResultsV2 } from './results/QuizResultsV2';
import { QuizResultsV3 } from './results/QuizResultsV3';
import { QuizResultsV4 } from './results/QuizResultsV4';
import { QuizResultsV5 } from './results/QuizResultsV5';
import { QuizResultsV6 } from './results/QuizResultsV6';

// Data
import {
  quizQuestionsUsage,
  quizQuestionsPreferences,
  quizQuestionsHybrid,
  generateMockResults,
} from '../../data/mockQuizData';

// Component maps
const layoutComponents = {
  1: QuizLayoutV1,
  2: QuizLayoutV2,
  3: QuizLayoutV3,
  4: QuizLayoutV4,
  5: QuizLayoutV5,
  6: QuizLayoutV6,
};

const questionComponents = {
  1: QuizQuestionV1,
  2: QuizQuestionV2,
  3: QuizQuestionV3,
  4: QuizQuestionV4,
  5: QuizQuestionV5,
  6: QuizQuestionV6,
};

const resultsComponents = {
  1: QuizResultsV1,
  2: QuizResultsV2,
  3: QuizResultsV3,
  4: QuizResultsV4,
  5: QuizResultsV5,
  6: QuizResultsV6,
};

export const HelpQuiz: React.FC<HelpQuizProps> = ({
  config,
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [results, setResults] = useState<QuizResult[] | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Get questions based on focus version and question count
  const questions = useMemo((): QuizQuestion[] => {
    let baseQuestions: QuizQuestion[];

    switch (config.focusVersion) {
      case 1:
        baseQuestions = quizQuestionsUsage;
        break;
      case 2:
        baseQuestions = quizQuestionsPreferences;
        break;
      case 3:
        baseQuestions = quizQuestionsHybrid;
        break;
      default:
        baseQuestions = quizQuestionsUsage;
    }

    return baseQuestions.slice(0, config.questionCount);
  }, [config.focusVersion, config.questionCount]);

  const totalSteps = questions.length;
  const currentQuestion = questions[currentStep];

  // Get components based on config
  const LayoutComponent = layoutComponents[config.layoutVersion];
  const QuestionComponent = questionComponents[config.questionStyle];
  const ResultsComponent = resultsComponents[config.resultsVersion];

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
      setIsCalculating(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const quizResults = generateMockResults(updatedAnswers);
      setResults(quizResults);
      setIsCalculating(false);

      if (onComplete) {
        onComplete(quizResults);
      }
    } else {
      setCurrentStep((prev) => prev + 1);
      setSelectedOption(null);
    }
  }, [selectedOption, currentQuestion, answers, currentStep, totalSteps, onComplete]);

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

  // Handle view product
  const handleViewProduct = useCallback(
    (productId: string) => {
      console.log('View product:', productId);
      onClose();
    },
    [onClose]
  );

  // Handle close and reset
  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => {
      handleRestart();
    }, 300);
  }, [onClose, handleRestart]);

  // Render content
  const renderContent = () => {
    if (results) {
      return (
        <ResultsComponent
          results={results}
          onViewProduct={handleViewProduct}
          onRestartQuiz={handleRestart}
        />
      );
    }

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
                <QuestionComponent
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
