import { FilterState, UsageType } from '../types/catalog';
import { QuizAnswer, QuizQuestion } from '@/app/prototipos/0.6/quiz/types/quiz';

export const mapQuizAnswersToFilters = (
  answers: QuizAnswer[],
  questions: QuizQuestion[],
  currentFilters: FilterState
): Partial<FilterState> => {
  const newFilters: Partial<FilterState> = {};

  answers.forEach((answer) => {
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) return;

    const selectedOption = question.options.find((opt) => opt.id === answer.selectedOptions[0]);
    if (!selectedOption?.weight) return;

    const weight = selectedOption.weight as Record<string, unknown>;

    if (weight.usage) {
      const usageMap: Record<string, string> = {
        study: 'estudios',
        gaming: 'gaming',
        design: 'diseno',
        office: 'oficina',
        coding: 'programacion',
      };
      const mappedUsage = usageMap[weight.usage as string];
      if (mappedUsage) {
        newFilters.usage = [mappedUsage as UsageType];
      }
    }

    if (weight.ram && typeof weight.ram === 'number') {
      newFilters.ram = [weight.ram];
    }

    if (weight.brand && weight.brand !== 'any') {
      newFilters.brands = [(weight.brand as string).toLowerCase()];
    }

    if (weight.budget) {
      const budgetMap: Record<string, [number, number]> = {
        low: [0, 80],
        medium: [80, 150],
        high: [150, 250],
        premium: [250, 500],
      };
      const range = budgetMap[weight.budget as string];
      if (range) {
        newFilters.quotaRange = range;
      }
    }

    if (weight.display && typeof weight.display === 'number') {
      if (weight.display <= 14) {
        newFilters.displaySize = [13.3, 14];
      } else if (weight.display <= 15.6) {
        newFilters.displaySize = [15.6];
      } else {
        newFilters.displaySize = [16, 17.3];
      }
    }

    if (weight.gpu) {
      if (weight.gpu === 'dedicated') {
        newFilters.gpuType = ['dedicated'];
      } else if (weight.gpu === 'integrated') {
        newFilters.gpuType = ['integrated'];
      }
    }

    if (weight.storage && typeof weight.storage === 'number') {
      newFilters.storage = [weight.storage];
    }

    if (weight.inStock === true) {
      newFilters.stock = ['available'];
    }

    if (weight.condition && weight.condition !== 'any') {
      const conditionMap: Record<string, string> = {
        new: 'nuevo',
        refurbished: 'reacondicionado',
      };
      const mappedCondition = conditionMap[weight.condition as string];
      if (mappedCondition) {
        newFilters.condition = [mappedCondition as 'nuevo' | 'reacondicionado'];
      }
    }
  });

  return newFilters;
};
