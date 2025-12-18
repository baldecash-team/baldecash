'use client';

/**
 * QuizResultsV1 - 1 producto "Perfecto para ti" destacado
 *
 * Muestra un unico producto como recomendacion principal
 * con enfasis visual y llamado a la accion claro.
 */

import React from 'react';
import { Card, CardBody, Button, Chip } from '@nextui-org/react';
import { motion } from 'framer-motion';
import {
  Check,
  Star,
  ShoppingCart,
  RefreshCw,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { QuizResultsProps } from '../../../types/quiz';

export const QuizResultsV1: React.FC<QuizResultsProps> = ({
  results,
  onViewProduct,
  onRestartQuiz,
}) => {
  const topResult = results[0];

  if (!topResult) {
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
      {/* Success header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="inline-flex items-center justify-center w-16 h-16 bg-[#22c55e]/10 rounded-full mb-4"
        >
          <Sparkles className="w-8 h-8 text-[#22c55e]" />
        </motion.div>
        <h2 className="text-2xl font-bold text-neutral-800 mb-1">
          ¡Encontramos tu laptop ideal!
        </h2>
        <p className="text-neutral-500">
          Basado en tus respuestas, esta es nuestra recomendacion
        </p>
      </motion.div>

      {/* Main product card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-2 border-[#4654CD] overflow-hidden shadow-lg">
          {/* Match badge */}
          <div className="bg-[#4654CD] text-white px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-medium">Perfecto para ti</span>
            </div>
            <Chip
              size="sm"
              radius="sm"
              classNames={{
                base: 'bg-white/20 px-2 py-0.5 h-auto',
                content: 'text-white text-xs font-medium',
              }}
            >
              {topResult.matchScore}% match
            </Chip>
          </div>

          <CardBody className="p-0">
            {/* Product image */}
            <div className="bg-neutral-50 p-6 flex items-center justify-center">
              <img
                src={topResult.product.image}
                alt={topResult.product.name}
                className="w-48 h-48 object-contain"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/200?text=Laptop';
                }}
              />
            </div>

            {/* Product info */}
            <div className="p-5">
              <p className="text-sm text-[#4654CD] font-medium mb-1">
                {topResult.product.brand}
              </p>
              <h3 className="text-lg font-bold text-neutral-800 mb-3">
                {topResult.product.displayName}
              </h3>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-neutral-50 rounded-lg px-3 py-2 text-center">
                  <p className="text-xs text-neutral-500">RAM</p>
                  <p className="text-sm font-semibold text-neutral-700">
                    {topResult.product.specs.ram}
                  </p>
                </div>
                <div className="bg-neutral-50 rounded-lg px-3 py-2 text-center">
                  <p className="text-xs text-neutral-500">Almacenamiento</p>
                  <p className="text-sm font-semibold text-neutral-700">
                    {topResult.product.specs.storage}
                  </p>
                </div>
              </div>

              {/* Match reasons */}
              <div className="space-y-2 mb-4">
                {topResult.reasons.map((reason, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-neutral-600"
                  >
                    <Check className="w-4 h-4 text-[#22c55e] flex-shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>

              {/* Price */}
              <div className="flex items-end justify-between mb-4 pb-4 border-b border-neutral-100">
                <div>
                  <p className="text-sm text-neutral-500">Desde</p>
                  <p className="text-2xl font-bold text-[#4654CD]">
                    S/{topResult.product.lowestQuota}
                    <span className="text-base font-normal text-neutral-500">/mes</span>
                  </p>
                </div>
                <p className="text-sm text-neutral-400">
                  Total: S/{topResult.product.price.toLocaleString()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-[#4654CD] text-white font-semibold cursor-pointer"
                  size="lg"
                  endContent={<ShoppingCart className="w-4 h-4" />}
                  onPress={() => onViewProduct(topResult.product.id)}
                >
                  Lo quiero
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Other options hint */}
      {results.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <button
            onClick={onRestartQuiz}
            className="text-sm text-neutral-500 hover:text-[#4654CD] cursor-pointer transition-colors inline-flex items-center gap-1"
          >
            <RefreshCw className="w-4 h-4" />
            Ver otras opciones
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default QuizResultsV1;
