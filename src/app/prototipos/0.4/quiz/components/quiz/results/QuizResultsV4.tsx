'use client';

/**
 * QuizResultsV4 - Comparativa lado a lado
 *
 * Permite comparar los productos recomendados
 * en una tabla comparativa.
 */

import React from 'react';
import { Card, CardBody, Button, Chip } from '@nextui-org/react';
import { motion } from 'framer-motion';
import {
  Check,
  X,
  RefreshCw,
  ShoppingCart,
  Cpu,
  MemoryStick,
  HardDrive,
  Monitor,
  Gpu,
} from 'lucide-react';
import { QuizResultsProps } from '../../../types/quiz';

export const QuizResultsV4: React.FC<QuizResultsProps> = ({
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

  const topResults = results.slice(0, 3);

  const specRows = [
    { label: 'Procesador', key: 'processor', icon: Cpu },
    { label: 'RAM', key: 'ram', icon: MemoryStick, suffix: 'GB' },
    { label: 'Almacenamiento', key: 'storage', icon: HardDrive, suffix: 'GB' },
    { label: 'Pantalla', key: 'displaySize', icon: Monitor, suffix: '"' },
    { label: 'Grafica', key: 'gpu', icon: Gpu },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mb-4"
      >
        <h2 className="text-lg font-bold text-neutral-800">
          Compara tus opciones
        </h2>
        <p className="text-sm text-neutral-500">
          Elige la que mejor se adapte a ti
        </p>
      </motion.div>

      {/* Comparison table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-x-auto -mx-4 px-4"
      >
        <div className="min-w-[600px]">
          {/* Product headers */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="col-span-1" />
            {topResults.map((result, idx) => (
              <Card
                key={result.product.id}
                className={`${idx === 0 ? 'ring-2 ring-[#4654CD]' : 'border border-neutral-200'}`}
              >
                <CardBody className="p-3 text-center">
                  {idx === 0 && (
                    <Chip
                      size="sm"
                      className="bg-[#4654CD] text-white mb-2 mx-auto"
                    >
                      Recomendado
                    </Chip>
                  )}
                  <img
                    src={result.product.thumbnail}
                    alt={result.product.name}
                    className="w-16 h-16 object-contain mx-auto mb-2"
                  />
                  <p className="text-xs text-neutral-500">{result.product.brand}</p>
                  <p className="text-sm font-semibold text-neutral-800 line-clamp-2">
                    {result.product.name}
                  </p>
                  <p className="text-lg font-bold text-[#4654CD] mt-1">
                    S/{result.product.lowestQuota}
                    <span className="text-xs font-normal text-neutral-500">/mes</span>
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Specs rows */}
          <div className="space-y-1">
            {specRows.map((spec, idx) => {
              const Icon = spec.icon;
              return (
                <div
                  key={spec.key}
                  className={`grid grid-cols-4 gap-2 py-2 ${
                    idx % 2 === 0 ? 'bg-neutral-50' : 'bg-white'
                  } rounded-lg`}
                >
                  <div className="col-span-1 flex items-center gap-2 px-3">
                    <Icon className="w-4 h-4 text-[#4654CD]" />
                    <span className="text-sm text-neutral-600">{spec.label}</span>
                  </div>
                  {topResults.map((result) => {
                    const value = result.product.specs[spec.key as keyof typeof result.product.specs];
                    return (
                      <div key={result.product.id} className="text-center text-sm">
                        {value ? (
                          <span className="text-neutral-800">
                            {value}
                            {spec.suffix || ''}
                          </span>
                        ) : (
                          <X className="w-4 h-4 text-neutral-300 mx-auto" />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Match score row */}
            <div className="grid grid-cols-4 gap-2 py-2 bg-[#4654CD]/5 rounded-lg">
              <div className="col-span-1 flex items-center gap-2 px-3">
                <Check className="w-4 h-4 text-[#4654CD]" />
                <span className="text-sm font-medium text-[#4654CD]">Match</span>
              </div>
              {topResults.map((result) => (
                <div key={result.product.id} className="text-center">
                  <span className="text-lg font-bold text-[#4654CD]">
                    {result.matchScore}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            <div className="col-span-1" />
            {topResults.map((result, idx) => (
              <Button
                key={result.product.id}
                className={`w-full cursor-pointer ${
                  idx === 0
                    ? 'bg-[#4654CD] text-white'
                    : 'bg-white border border-neutral-300 text-neutral-700'
                }`}
                size="sm"
                onPress={() => onViewProduct(result.product.id)}
              >
                Ver detalle
              </Button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Restart button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="pt-4"
      >
        <Button
          variant="light"
          className="w-full cursor-pointer"
          startContent={<RefreshCw className="w-4 h-4" />}
          onPress={onRestartQuiz}
        >
          Hacer quiz de nuevo
        </Button>
      </motion.div>
    </div>
  );
};

export default QuizResultsV4;
