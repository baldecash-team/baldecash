'use client';

/**
 * QuizResultsV2 - 1 producto "Perfecto para ti" destacado
 *
 * Muestra un solo producto destacado como la mejor opcion.
 * Enfoque en conversion directa.
 */

import React from 'react';
import { Card, CardBody, Button, Chip } from '@nextui-org/react';
import { motion } from 'framer-motion';
import {
  Check,
  RefreshCw,
  ShoppingCart,
  ChevronRight,
  Cpu,
  HardDrive,
  MemoryStick,
  Sparkles,
  Star,
} from 'lucide-react';
import { QuizResultsProps } from '../../../types/quiz';
import { getGamaLabel, getGamaColor } from '../../../data/mockQuizData';

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

  const topResult = results[0];
  const { product, matchScore, reasons } = topResult;

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring' }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#4654CD] to-[#6366f1] mb-4"
        >
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-2xl font-black text-neutral-800 mb-1">
          ¡Encontramos tu laptop ideal!
        </h2>
        <p className="text-neutral-500">
          {matchScore}% compatible con tus necesidades
        </p>
      </motion.div>

      {/* Featured Product Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-2 border-[#4654CD] shadow-xl shadow-[#4654CD]/10 overflow-hidden">
          <CardBody className="p-0">
            {/* Image */}
            <div className="relative bg-gradient-to-br from-[#4654CD]/5 to-[#4654CD]/10 p-6">
              <Chip
                className="absolute top-3 left-3 bg-[#4654CD] text-white"
                size="sm"
                startContent={<Star className="w-3 h-3 fill-white" />}
              >
                Mejor match
              </Chip>
              <img
                src={product.thumbnail}
                alt={product.displayName}
                className="w-full h-48 object-contain mx-auto"
              />
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-neutral-500">{product.brand}</span>
                <Chip
                  size="sm"
                  classNames={{
                    base: `${getGamaColor(product.gama)} px-2 h-auto`,
                    content: 'text-xs font-medium',
                  }}
                >
                  {getGamaLabel(product.gama)}
                </Chip>
              </div>

              <h3 className="text-xl font-bold text-neutral-800 mb-3">
                {product.displayName}
              </h3>

              {/* Specs highlights */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 bg-neutral-50 rounded-lg">
                  <Cpu className="w-5 h-5 text-[#4654CD] mx-auto mb-1" />
                  <p className="text-xs text-neutral-600">{product.specs.processor.split(' ').slice(0, 2).join(' ')}</p>
                </div>
                <div className="text-center p-2 bg-neutral-50 rounded-lg">
                  <MemoryStick className="w-5 h-5 text-[#4654CD] mx-auto mb-1" />
                  <p className="text-xs text-neutral-600">{product.specs.ram}GB RAM</p>
                </div>
                <div className="text-center p-2 bg-neutral-50 rounded-lg">
                  <HardDrive className="w-5 h-5 text-[#4654CD] mx-auto mb-1" />
                  <p className="text-xs text-neutral-600">{product.specs.storage}GB</p>
                </div>
              </div>

              {/* Reasons */}
              <div className="space-y-2 mb-4">
                {reasons.map((reason, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-neutral-600">
                    <Check className="w-4 h-4 text-[#22c55e]" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>

              {/* Price */}
              <div className="border-t border-neutral-100 pt-4">
                <div className="flex items-baseline gap-2 mb-4">
                  <p className="text-3xl font-bold text-[#4654CD] font-['Baloo_2']">
                    S/{product.lowestQuota}
                  </p>
                  <span className="text-neutral-500">/mes</span>
                </div>

                <Button
                  className="w-full bg-[#4654CD] text-white font-semibold cursor-pointer"
                  size="lg"
                  endContent={<ShoppingCart className="w-4 h-4" />}
                  onPress={() => onViewProduct(product.id)}
                >
                  Ver producto
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Other options */}
      {results.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-sm text-neutral-500 text-center mb-3">
            Otras opciones que podrían gustarte
          </p>
          <div className="space-y-2">
            {results.slice(1, 3).map((result) => (
              <Card
                key={result.product.id}
                isPressable
                onPress={() => onViewProduct(result.product.id)}
                className="border border-neutral-200 hover:border-[#4654CD]/50"
              >
                <CardBody className="p-3 flex-row items-center gap-3">
                  <img
                    src={result.product.thumbnail}
                    alt={result.product.name}
                    className="w-12 h-12 object-contain"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-800 truncate">
                      {result.product.name}
                    </p>
                    <p className="text-sm text-[#4654CD] font-bold">
                      S/{result.product.lowestQuota}/mes
                    </p>
                  </div>
                  <Chip size="sm" className="bg-neutral-100">
                    {result.matchScore}%
                  </Chip>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </CardBody>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Restart */}
      <Button
        variant="light"
        className="w-full cursor-pointer"
        startContent={<RefreshCw className="w-4 h-4" />}
        onPress={onRestartQuiz}
      >
        Hacer quiz de nuevo
      </Button>
    </div>
  );
};

export default QuizResultsV2;
