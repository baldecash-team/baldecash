'use client';

/**
 * QuizResultsV1 - Producto destacado + opciones secundarias
 * Muestra el mejor match como recomendación principal con énfasis visual,
 * y los demás resultados como alternativas en cards más pequeñas.
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
import { QuizResultsProps, QuizResult } from '../../../types/quiz';

export const QuizResultsV1: React.FC<QuizResultsProps> = ({
  results,
  onViewProduct,
  onRestartQuiz,
  onViewOtherOptions,
}) => {
  const topResult = results[0];
  const secondaryResults = results.slice(1); // Productos secundarios

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

  // Formatear RAM con tipo si está disponible
  const formatRam = () => {
    const ram = topResult.product.specs?.ram;
    const ramType = topResult.product.specs?.ramType;
    if (!ram) return 'N/A';
    return ramType ? `${ram}GB ${ramType}` : `${ram}GB`;
  };

  // Formatear almacenamiento
  const formatStorage = () => {
    const storage = topResult.product.specs?.storage;
    const storageType = topResult.product.specs?.storageType;
    if (!storage) return 'N/A';
    return `${storage}GB ${storageType?.toUpperCase() || 'SSD'}`;
  };

  return (
    <div className="space-y-6 w-full">
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
          Basado en tus respuestas, esta es nuestra recomendación
        </p>
      </motion.div>

      {/* Main product card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card
          className="border-2 overflow-hidden shadow-lg"
          style={{ borderColor: 'var(--color-primary)' }}
        >
          {/* Match badge header */}
          <div
            className="text-white px-4 py-2 flex items-center justify-between"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
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
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-primary)' }}>
                {topResult.product.brand}
              </p>
              <h3 className="text-lg font-bold text-neutral-800 mb-3">
                {topResult.product.displayName}
              </h3>

              {/* Specs grid */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-neutral-50 rounded-lg px-3 py-2 text-center">
                  <p className="text-xs text-neutral-500">RAM</p>
                  <p className="text-sm font-semibold text-neutral-700">
                    {formatRam()}
                  </p>
                </div>
                <div className="bg-neutral-50 rounded-lg px-3 py-2 text-center">
                  <p className="text-xs text-neutral-500">Almacenamiento</p>
                  <p className="text-sm font-semibold text-neutral-700">
                    {formatStorage()}
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
                  <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
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
                  className="flex-1 text-white font-semibold cursor-pointer"
                  style={{ backgroundColor: 'var(--color-primary)' }}
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

      {/* Secondary results */}
      {secondaryResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full"
        >
          <p className="text-sm text-neutral-500 font-medium mb-3">
            También te pueden interesar:
          </p>
          <div className="flex flex-col gap-3 w-full">
            {secondaryResults.map((result, index) => (
              <SecondaryProductCard
                key={result.product.id}
                result={result}
                onViewProduct={onViewProduct}
                delay={0.5 + index * 0.1}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Other options link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 + secondaryResults.length * 0.1 }}
        className="text-center pb-6"
      >
        <button
          onClick={onViewOtherOptions || onRestartQuiz}
          className="text-sm text-neutral-500 cursor-pointer transition-colors inline-flex items-center gap-1"
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = ''; }}
        >
          <RefreshCw className="w-4 h-4" />
          Ver más en el catálogo
        </button>
      </motion.div>
    </div>
  );
};

/**
 * Card horizontal para productos secundarios (layout de fila completa)
 */
const SecondaryProductCard: React.FC<{
  result: QuizResult;
  onViewProduct: (productId: string) => void;
  delay: number;
}> = ({ result, onViewProduct, delay }) => {
  const { product, matchScore } = result;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="w-full"
    >
      <Card
        isPressable
        onPress={() => onViewProduct(product.id)}
        className="border border-neutral-200 hover:border-[var(--color-primary)] transition-colors w-full"
      >
        <CardBody className="p-3 sm:p-4">
          <div className="flex items-center gap-4">
            {/* Product image */}
            <div className="bg-neutral-50 rounded-lg p-2 flex-shrink-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
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
                <span className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
                  {product.brand}
                </span>
                <Chip
                  size="sm"
                  variant="flat"
                  classNames={{
                    base: 'h-5 px-1.5 flex-shrink-0',
                    content: 'text-[10px] font-medium',
                  }}
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                    color: 'var(--color-primary)'
                  }}
                >
                  {matchScore}% match
                </Chip>
              </div>
              <p className="text-sm font-semibold text-neutral-800 line-clamp-2 mb-2">
                {product.displayName}
              </p>
              <div className="flex items-center justify-between">
                <p className="text-base font-bold" style={{ color: 'var(--color-primary)' }}>
                  S/{product.lowestQuota}
                  <span className="text-xs font-normal text-neutral-400">/mes</span>
                </p>
                {/* Visual indicator instead of nested button */}
                <div
                  className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-lg text-white"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Lo quiero
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default QuizResultsV1;
