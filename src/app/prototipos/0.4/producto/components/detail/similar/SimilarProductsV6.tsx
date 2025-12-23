'use client';

import { Card, CardBody, Button } from '@nextui-org/react';
import { useState } from 'react';

export interface SimilarProduct {
  id: string;
  name: string;
  thumbnail: string;
  monthlyQuota: number;
  quotaDifference: number;
  matchScore: number;
  differentiators: string[];
  slug: string;
}

export interface SimilarProductsProps {
  products: SimilarProduct[];
  currentQuota: number;
}

type QuizStep = 'intro' | 'budget' | 'features' | 'results';

export default function SimilarProductsV6({ products, currentQuota }: SimilarProductsProps) {
  const [quizStep, setQuizStep] = useState<QuizStep>('intro');
  const [budgetPreference, setBudgetPreference] = useState<'cheaper' | 'same' | 'flexible'>('same');
  const [featurePreference, setFeaturePreference] = useState<'similar' | 'better' | 'different'>('similar');

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://placehold.co/200x200/e5e7eb/64748b?text=Producto';
  };

  const handleProductClick = (slug: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/prototipos/0.4/producto/detail-preview?infoHeader=3&gallery=1&tabs=1&specs=2&pricing=4&cronograma=2&similar=2&limitations=6&certifications=1&mode=clean`;
    }
  };

  const getFilteredProducts = () => {
    let filtered = [...products];

    // Filter by budget preference
    if (budgetPreference === 'cheaper') {
      filtered = filtered.filter((p) => p.quotaDifference < 0);
    } else if (budgetPreference === 'same') {
      filtered = filtered.filter((p) => Math.abs(p.quotaDifference) <= 10);
    }

    // Sort by match score and budget
    filtered.sort((a, b) => {
      if (featurePreference === 'similar') {
        return b.matchScore - a.matchScore;
      } else if (featurePreference === 'better') {
        return a.quotaDifference - b.quotaDifference;
      } else {
        return a.matchScore - b.matchScore;
      }
    });

    return filtered.slice(0, 3);
  };

  const resetQuiz = () => {
    setQuizStep('intro');
    setBudgetPreference('same');
    setFeaturePreference('similar');
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-neutral-800 mb-2">
          ¿Es este el producto indicado para ti?
        </h3>
        <p className="text-neutral-600">
          Responde estas preguntas y te ayudaremos a encontrar la mejor opción
        </p>
      </div>

      {/* Quiz Intro */}
      {quizStep === 'intro' && (
        <Card className="bg-gradient-to-br from-[#4654CD] to-[#5865e8] text-white">
          <CardBody className="p-8 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <h4 className="text-2xl font-bold mb-3">
              Encuentra tu producto ideal
            </h4>
            <p className="mb-6 text-white/90">
              Te haremos 2 preguntas rápidas para mostrarte las mejores alternativas basadas en tu presupuesto y necesidades.
            </p>
            <Button
              size="lg"
              className="bg-white text-[#4654CD] font-bold"
              onPress={() => setQuizStep('budget')}
            >
              Comenzar Quiz
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Step 1: Budget */}
      {quizStep === 'budget' && (
        <Card>
          <CardBody className="p-6">
            <div className="mb-6">
              <p className="text-sm font-semibold text-[#4654CD] mb-2">
                PREGUNTA 1 DE 2
              </p>
              <h4 className="text-xl font-bold text-neutral-800 mb-2">
                ¿Cuál es tu presupuesto mensual?
              </h4>
              <p className="text-sm text-neutral-600">
                Tu cuota actual es de S/{currentQuota}/mes
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => setBudgetPreference('cheaper')}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  budgetPreference === 'cheaper'
                    ? 'border-[#22c55e] bg-[#22c55e]/5'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      budgetPreference === 'cheaper'
                        ? 'border-[#22c55e] bg-[#22c55e]'
                        : 'border-neutral-300'
                    }`}
                  >
                    {budgetPreference === 'cheaper' && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-800">
                      Busco ahorrar dinero
                    </p>
                    <p className="text-sm text-neutral-600">
                      Quiero pagar menos de S/{currentQuota}/mes
                    </p>
                  </div>
                  <span className="text-[#22c55e] font-bold">-S/</span>
                </div>
              </button>

              <button
                onClick={() => setBudgetPreference('same')}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  budgetPreference === 'same'
                    ? 'border-[#4654CD] bg-[#4654CD]/5'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      budgetPreference === 'same'
                        ? 'border-[#4654CD] bg-[#4654CD]'
                        : 'border-neutral-300'
                    }`}
                  >
                    {budgetPreference === 'same' && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-800">
                      Mantener cuota similar
                    </p>
                    <p className="text-sm text-neutral-600">
                      Alrededor de S/{currentQuota}/mes está bien
                    </p>
                  </div>
                  <span className="text-[#4654CD] font-bold">≈</span>
                </div>
              </button>

              <button
                onClick={() => setBudgetPreference('flexible')}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  budgetPreference === 'flexible'
                    ? 'border-amber-500 bg-amber-500/5'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      budgetPreference === 'flexible'
                        ? 'border-amber-500 bg-amber-500'
                        : 'border-neutral-300'
                    }`}
                  >
                    {budgetPreference === 'flexible' && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-800">
                      Puedo pagar más si vale la pena
                    </p>
                    <p className="text-sm text-neutral-600">
                      Busco mejor calidad, sin límite de cuota
                    </p>
                  </div>
                  <span className="text-amber-600 font-bold">+S/</span>
                </div>
              </button>
            </div>

            <Button
              color="primary"
              className="w-full"
              size="lg"
              onPress={() => setQuizStep('features')}
            >
              Siguiente pregunta →
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Step 2: Features */}
      {quizStep === 'features' && (
        <Card>
          <CardBody className="p-6">
            <div className="mb-6">
              <p className="text-sm font-semibold text-[#4654CD] mb-2">
                PREGUNTA 2 DE 2
              </p>
              <h4 className="text-xl font-bold text-neutral-800 mb-2">
                ¿Qué tan similar debe ser al producto actual?
              </h4>
              <p className="text-sm text-neutral-600">
                Esto nos ayuda a encontrar la mejor alternativa para ti
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => setFeaturePreference('similar')}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  featurePreference === 'similar'
                    ? 'border-[#4654CD] bg-[#4654CD]/5'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      featurePreference === 'similar'
                        ? 'border-[#4654CD] bg-[#4654CD]'
                        : 'border-neutral-300'
                    }`}
                  >
                    {featurePreference === 'similar' && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-800">
                      Muy similar
                    </p>
                    <p className="text-sm text-neutral-600">
                      Busco productos casi idénticos
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setFeaturePreference('better')}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  featurePreference === 'better'
                    ? 'border-[#4654CD] bg-[#4654CD]/5'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      featurePreference === 'better'
                        ? 'border-[#4654CD] bg-[#4654CD]'
                        : 'border-neutral-300'
                    }`}
                  >
                    {featurePreference === 'better' && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-800">
                      Mejores características
                    </p>
                    <p className="text-sm text-neutral-600">
                      Quiero algo con más funciones o calidad
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setFeaturePreference('different')}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  featurePreference === 'different'
                    ? 'border-[#4654CD] bg-[#4654CD]/5'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      featurePreference === 'different'
                        ? 'border-[#4654CD] bg-[#4654CD]'
                        : 'border-neutral-300'
                    }`}
                  >
                    {featurePreference === 'different' && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-800">
                      Alternativas diferentes
                    </p>
                    <p className="text-sm text-neutral-600">
                      Quiero explorar otras opciones
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <div className="flex gap-3">
              <Button
                color="default"
                variant="bordered"
                className="flex-1"
                onPress={() => setQuizStep('budget')}
              >
                ← Anterior
              </Button>
              <Button
                color="primary"
                className="flex-1"
                size="lg"
                onPress={() => setQuizStep('results')}
              >
                Ver resultados
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Results */}
      {quizStep === 'results' && (
        <div>
          <Card className="mb-6 bg-gradient-to-r from-[#4654CD]/10 to-[#5865e8]/10 border border-[#4654CD]/20">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#4654CD] mb-1">
                    TUS PREFERENCIAS
                  </p>
                  <p className="text-neutral-800">
                    {budgetPreference === 'cheaper' && 'Buscas ahorrar dinero'}
                    {budgetPreference === 'same' && 'Quieres mantener cuota similar'}
                    {budgetPreference === 'flexible' && 'Flexible con el presupuesto'}
                    {' • '}
                    {featurePreference === 'similar' && 'Productos muy similares'}
                    {featurePreference === 'better' && 'Mejores características'}
                    {featurePreference === 'different' && 'Alternativas diferentes'}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="light"
                  color="primary"
                  onPress={resetQuiz}
                >
                  Reiniciar
                </Button>
              </div>
            </CardBody>
          </Card>

          <h4 className="text-xl font-bold text-neutral-800 mb-4">
            Productos recomendados para ti
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getFilteredProducts().map((product, index) => {
              const isCheaper = product.quotaDifference < 0;

              return (
                <Card
                  key={product.id}
                  className={`cursor-pointer hover:shadow-lg transition-all ${
                    index === 0 ? 'ring-2 ring-[#4654CD]' : ''
                  }`}
                  isPressable
                  onPress={() => handleProductClick(product.slug)}
                >
                  <CardBody className="p-4">
                    {index === 0 && (
                      <div className="mb-2 bg-[#4654CD] text-white text-xs font-bold px-2 py-1 rounded-full w-fit">
                        MEJOR COINCIDENCIA
                      </div>
                    )}

                    <div className="relative w-full aspect-square mb-3 bg-neutral-100 rounded-lg overflow-hidden">
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                    </div>

                    <h5 className="font-semibold text-neutral-800 mb-2 line-clamp-2 h-12">
                      {product.name}
                    </h5>

                    {/* Quota - CRITICAL */}
                    <div className="mb-3">
                      <p className="text-2xl font-bold text-neutral-800">
                        S/{product.monthlyQuota}/mes
                      </p>
                      {product.quotaDifference !== 0 && (
                        <p
                          className={`text-sm font-bold ${
                            isCheaper ? 'text-[#22c55e]' : 'text-amber-600'
                          }`}
                        >
                          {isCheaper ? '' : '+'}S/{Math.abs(product.quotaDifference)}/mes vs actual
                        </p>
                      )}
                    </div>

                    <Button
                      color={isCheaper ? 'success' : 'primary'}
                      variant={index === 0 ? 'solid' : 'bordered'}
                      className="w-full"
                      size="sm"
                    >
                      Ver producto
                    </Button>
                  </CardBody>
                </Card>
              );
            })}
          </div>

          {getFilteredProducts().length === 0 && (
            <Card>
              <CardBody className="p-6 text-center">
                <p className="text-neutral-600 mb-3">
                  No encontramos productos que coincidan exactamente con tus preferencias.
                </p>
                <Button color="primary" variant="bordered" onPress={resetQuiz}>
                  Intentar de nuevo
                </Button>
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
