'use client';

/**
 * QuizResultsV6 - Lista vertical compacta con filtros
 *
 * Lista compacta con opcion de filtrar por caracteristicas.
 * Eficiente para muchos resultados.
 */

import React, { useState } from 'react';
import { Card, CardBody, Button, Chip, Tabs, Tab } from '@nextui-org/react';
import { motion } from 'framer-motion';
import {
  Check,
  RefreshCw,
  ChevronRight,
  Filter,
  SortDesc,
  Star,
  Zap,
  Wallet,
} from 'lucide-react';
import { QuizResultsProps, QuizResult } from '../../../types/quiz';

type SortType = 'match' | 'price' | 'specs';

export const QuizResultsV6: React.FC<QuizResultsProps> = ({
  results,
  onViewProduct,
  onRestartQuiz,
}) => {
  const [sortBy, setSortBy] = useState<SortType>('match');

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

  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.product.lowestQuota - b.product.lowestQuota;
      case 'specs':
        return b.product.specs.ram - a.product.specs.ram;
      default:
        return b.matchScore - a.matchScore;
    }
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-lg font-bold text-neutral-800">
            {results.length} laptops encontradas
          </h2>
          <p className="text-sm text-neutral-500">
            Ordenadas por compatibilidad
          </p>
        </div>
        <Chip
          size="sm"
          className="bg-[#4654CD]/10 text-[#4654CD]"
          startContent={<Check className="w-3 h-3" />}
        >
          Quiz completado
        </Chip>
      </motion.div>

      {/* Sort tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Tabs
          selectedKey={sortBy}
          onSelectionChange={(key) => setSortBy(key as SortType)}
          size="sm"
          classNames={{
            tabList: 'bg-neutral-100 p-1 rounded-lg',
            tab: 'h-8',
            cursor: 'bg-white shadow-sm',
          }}
        >
          <Tab
            key="match"
            title={
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" />
                <span>Match</span>
              </div>
            }
          />
          <Tab
            key="price"
            title={
              <div className="flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" />
                <span>Precio</span>
              </div>
            }
          />
          <Tab
            key="specs"
            title={
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>Specs</span>
              </div>
            }
          />
        </Tabs>
      </motion.div>

      {/* Results list */}
      <div className="space-y-2">
        {sortedResults.map((result, index) => {
          const { product, matchScore } = result;
          const isTop = index === 0 && sortBy === 'match';

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                isPressable
                onPress={() => onViewProduct(product.id)}
                className={`cursor-pointer transition-all ${
                  isTop
                    ? 'border-2 border-[#4654CD] bg-[#4654CD]/5'
                    : 'border border-neutral-200 hover:border-[#4654CD]/50'
                }`}
              >
                <CardBody className="p-3">
                  <div className="flex items-center gap-3">
                    {/* Rank */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                        isTop
                          ? 'bg-[#4654CD] text-white'
                          : 'bg-neutral-100 text-neutral-500'
                      }`}
                    >
                      {index + 1}
                    </div>

                    {/* Image */}
                    <div className="w-14 h-14 bg-neutral-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-12 h-12 object-contain"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs text-neutral-500">
                          {product.brand}
                        </span>
                        {isTop && (
                          <Chip
                            size="sm"
                            classNames={{
                              base: 'bg-[#f59e0b] h-4 px-1.5',
                              content: 'text-white text-[10px] font-medium',
                            }}
                          >
                            TOP
                          </Chip>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-neutral-800 truncate">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-neutral-500 mt-0.5">
                        <span>{product.specs.ram}GB RAM</span>
                        <span>{product.specs.storage}GB</span>
                      </div>
                    </div>

                    {/* Price & match */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-bold text-[#4654CD]">
                        S/{product.lowestQuota}
                      </p>
                      <p className="text-xs text-neutral-500">/mes</p>
                      <Chip
                        size="sm"
                        classNames={{
                          base: 'bg-neutral-100 h-5 px-2 mt-1',
                          content: 'text-neutral-600 text-xs',
                        }}
                      >
                        {matchScore}%
                      </Chip>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-neutral-300 flex-shrink-0" />
                  </div>
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
        transition={{ delay: 0.3 }}
        className="flex gap-3 pt-2"
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
          startContent={<Filter className="w-4 h-4" />}
        >
          Ver catálogo
        </Button>
      </motion.div>
    </div>
  );
};

export default QuizResultsV6;
