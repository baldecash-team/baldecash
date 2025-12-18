'use client';

/**
 * QuizResultsV2 - Top 3 productos ordenados por match
 *
 * Muestra las 3 mejores opciones con porcentajes de
 * compatibilidad y comparacion visual.
 */

import React from 'react';
import { Card, CardBody, Button, Chip } from '@nextui-org/react';
import { motion } from 'framer-motion';
import {
  Check,
  Star,
  ShoppingCart,
  RefreshCw,
  Trophy,
  Medal,
  Award,
  ChevronRight,
} from 'lucide-react';
import { QuizResultsProps, QuizResult } from '../../../types/quiz';

const rankIcons = [Trophy, Medal, Award];
const rankColors = ['#4654CD', '#71717a', '#a16207'];
const rankLabels = ['Mejor opcion', 'Muy buena', 'Buena'];

interface ResultCardProps {
  result: QuizResult;
  rank: number;
  onViewProduct: (id: string) => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, rank, onViewProduct }) => {
  const RankIcon = rankIcons[rank] || Award;
  const rankColor = rankColors[rank] || '#71717a';
  const isTop = rank === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
    >
      <Card
        className={`transition-all cursor-pointer ${
          isTop
            ? 'border-2 border-[#4654CD] shadow-lg'
            : 'border border-neutral-200 hover:border-[#4654CD]/50 hover:shadow-md'
        }`}
        isPressable
        onPress={() => onViewProduct(result.product.id)}
      >
        <CardBody className="p-0">
          <div className="flex gap-4 p-4">
            {/* Rank indicator */}
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${rankColor}15` }}
              >
                <RankIcon className="w-5 h-5" style={{ color: rankColor }} />
              </div>
              <span className="text-xs font-medium" style={{ color: rankColor }}>
                #{rank + 1}
              </span>
            </div>

            {/* Product image */}
            <div className="w-20 h-20 bg-neutral-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <img
                src={result.product.image}
                alt={result.product.name}
                className="w-16 h-16 object-contain"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/80?text=Laptop';
                }}
              />
            </div>

            {/* Product info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <p className="text-xs text-[#4654CD] font-medium">
                    {result.product.brand}
                  </p>
                  <h3 className="font-semibold text-neutral-800 line-clamp-1">
                    {result.product.name}
                  </h3>
                </div>
                <Chip
                  size="sm"
                  radius="sm"
                  classNames={{
                    base: isTop
                      ? 'bg-[#4654CD] px-2 py-0.5 h-auto'
                      : 'bg-neutral-100 px-2 py-0.5 h-auto',
                    content: isTop
                      ? 'text-white text-xs font-medium'
                      : 'text-neutral-600 text-xs font-medium',
                  }}
                >
                  {result.matchScore}%
                </Chip>
              </div>

              {/* Quick specs */}
              <p className="text-xs text-neutral-500 mb-2">
                {result.product.specs.ram} · {result.product.specs.storage}
              </p>

              {/* Top reason */}
              <div className="flex items-center gap-1 text-xs text-neutral-600 mb-2">
                <Check className="w-3 h-3 text-[#22c55e]" />
                <span className="line-clamp-1">{result.reasons[0]}</span>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-[#4654CD]">
                  S/{result.product.lowestQuota}
                  <span className="text-sm font-normal text-neutral-500">/mes</span>
                </p>
                <ChevronRight className="w-5 h-5 text-neutral-400" />
              </div>
            </div>
          </div>

          {/* Top pick banner */}
          {isTop && (
            <div className="bg-[#4654CD]/5 px-4 py-2 border-t border-[#4654CD]/10">
              <p className="text-xs text-[#4654CD] font-medium text-center">
                <Star className="w-3 h-3 inline mr-1" />
                {rankLabels[rank]}
              </p>
            </div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
};

export const QuizResultsV2: React.FC<QuizResultsProps> = ({
  results,
  onViewProduct,
  onRestartQuiz,
}) => {
  if (results.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-500">No encontramos resultados</p>
        <Button
          variant="light"
          startContent={<RefreshCw className="w-4 h-4" />}
          onPress={onRestartQuiz}
          className="mt-4 cursor-pointer"
        >
          Intentar de nuevo
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-xl font-bold text-neutral-800 mb-1">
          Tu Top 3 Recomendaciones
        </h2>
        <p className="text-sm text-neutral-500">
          Ordenados por compatibilidad con tus preferencias
        </p>
      </motion.div>

      {/* Results list */}
      <div className="space-y-3">
        {results.slice(0, 3).map((result, index) => (
          <ResultCard
            key={result.product.id}
            result={result}
            rank={index}
            onViewProduct={onViewProduct}
          />
        ))}
      </div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <Button
          className="flex-1 bg-[#4654CD] text-white font-semibold cursor-pointer"
          size="lg"
          endContent={<ShoppingCart className="w-4 h-4" />}
          onPress={() => onViewProduct(results[0].product.id)}
        >
          Ver mejor opcion
        </Button>
        <Button
          variant="bordered"
          className="border-neutral-300 cursor-pointer"
          size="lg"
          startContent={<RefreshCw className="w-4 h-4" />}
          onPress={onRestartQuiz}
        >
          Repetir quiz
        </Button>
      </motion.div>
    </div>
  );
};

export default QuizResultsV2;
