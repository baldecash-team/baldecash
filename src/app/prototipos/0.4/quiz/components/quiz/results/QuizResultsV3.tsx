'use client';

/**
 * QuizResultsV3 - Top 3 productos ordenados por match
 *
 * Muestra los 3 mejores productos con scores de compatibilidad.
 * Permite comparar opciones facilmente.
 */

import React from 'react';
import { Card, CardBody, Button, Chip, Progress } from '@nextui-org/react';
import { motion } from 'framer-motion';
import {
  Check,
  RefreshCw,
  Trophy,
  Medal,
  Award,
  ChevronRight,
  Cpu,
  MemoryStick,
  HardDrive,
} from 'lucide-react';
import { QuizResultsProps } from '../../../types/quiz';

const rankIcons = [Trophy, Medal, Award];
const rankColors = ['#f59e0b', '#94a3b8', '#cd7f32'];

export const QuizResultsV3: React.FC<QuizResultsProps> = ({
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
          Tu Top 3 de laptops
        </h2>
        <p className="text-sm text-neutral-500">
          Basado en tus respuestas, estas son las mejores opciones
        </p>
      </motion.div>

      {/* Results list */}
      <div className="space-y-4">
        {results.slice(0, 3).map((result, index) => {
          const RankIcon = rankIcons[index] || Award;
          const rankColor = rankColors[index] || '#94a3b8';
          const { product, matchScore, reasons } = result;

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                isPressable
                onPress={() => onViewProduct(product.id)}
                className={`border-2 transition-all hover:shadow-lg cursor-pointer ${
                  index === 0
                    ? 'border-[#f59e0b] shadow-md'
                    : 'border-neutral-200 hover:border-[#4654CD]/50'
                }`}
              >
                <CardBody className="p-4">
                  <div className="flex gap-4">
                    {/* Rank indicator */}
                    <div className="flex flex-col items-center justify-center">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${rankColor}20` }}
                      >
                        <RankIcon className="w-5 h-5" style={{ color: rankColor }} />
                      </div>
                      <span className="text-xs font-bold mt-1" style={{ color: rankColor }}>
                        #{index + 1}
                      </span>
                    </div>

                    {/* Product image */}
                    <div className="w-20 h-20 bg-neutral-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-16 h-16 object-contain"
                      />
                    </div>

                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-neutral-500">
                          {product.brand}
                        </span>
                      </div>
                      <h3 className="font-semibold text-neutral-800 text-sm mb-2 line-clamp-1">
                        {product.displayName}
                      </h3>

                      {/* Match progress */}
                      <div className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-neutral-500">Compatibilidad</span>
                          <span className="font-bold text-[#4654CD]">{matchScore}%</span>
                        </div>
                        <Progress
                          value={matchScore}
                          classNames={{
                            base: 'h-1.5',
                            indicator: 'bg-[#4654CD]',
                            track: 'bg-neutral-200',
                          }}
                        />
                      </div>

                      {/* Quick specs */}
                      <div className="flex gap-3 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <MemoryStick className="w-3 h-3" />
                          {product.specs.ram}GB
                        </span>
                        <span className="flex items-center gap-1">
                          <HardDrive className="w-3 h-3" />
                          {product.specs.storage}GB
                        </span>
                      </div>
                    </div>

                    {/* Price and action */}
                    <div className="text-right flex flex-col justify-between">
                      <div>
                        <p className="text-lg font-bold text-[#4654CD]">
                          S/{product.lowestQuota}
                        </p>
                        <p className="text-xs text-neutral-500">/mes</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-neutral-300" />
                    </div>
                  </div>

                  {/* Reasons for match */}
                  {index === 0 && (
                    <div className="mt-3 pt-3 border-t border-neutral-100">
                      <div className="flex flex-wrap gap-1">
                        {reasons.slice(0, 3).map((reason, idx) => (
                          <Chip
                            key={idx}
                            size="sm"
                            startContent={<Check className="w-3 h-3" />}
                            classNames={{
                              base: 'bg-[#22c55e]/10 px-2 h-6',
                              content: 'text-[#22c55e] text-xs',
                            }}
                          >
                            {reason}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex gap-3"
      >
        <Button
          variant="bordered"
          className="flex-1 border-neutral-300 cursor-pointer"
          startContent={<RefreshCw className="w-4 h-4" />}
          onPress={onRestartQuiz}
        >
          Nuevo quiz
        </Button>
        <Button
          className="flex-1 bg-[#4654CD] text-white cursor-pointer"
          endContent={<ChevronRight className="w-4 h-4" />}
        >
          Ver catalogo
        </Button>
      </motion.div>
    </div>
  );
};

export default QuizResultsV3;
