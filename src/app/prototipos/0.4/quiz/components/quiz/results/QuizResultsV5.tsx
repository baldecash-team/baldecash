'use client';

/**
 * QuizResultsV5 - Carrusel horizontal deslizable
 *
 * Productos en carrusel horizontal swipeable.
 * Experiencia tipo app.
 */

import React, { useRef } from 'react';
import { Card, CardBody, Button, Chip } from '@nextui-org/react';
import { motion } from 'framer-motion';
import {
  Check,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Cpu,
  MemoryStick,
  HardDrive,
  Star,
} from 'lucide-react';
import { QuizResultsProps } from '../../../types/quiz';
import { getGamaLabel, getGamaColor } from '../../../data/mockQuizData';

export const QuizResultsV5: React.FC<QuizResultsProps> = ({
  results,
  onViewProduct,
  onRestartQuiz,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

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
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#4654CD] to-[#6366f1] mb-3">
          <Star className="w-7 h-7 text-white fill-white" />
        </div>
        <h2 className="text-xl font-bold text-neutral-800 mb-1">
          Tus laptops recomendadas
        </h2>
        <p className="text-sm text-neutral-500">
          Desliza para ver todas las opciones
        </p>
      </motion.div>

      {/* Carousel */}
      <div className="relative">
        {/* Navigation buttons */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-neutral-50 cursor-pointer -ml-2"
        >
          <ChevronLeft className="w-5 h-5 text-neutral-600" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-neutral-50 cursor-pointer -mr-2"
        >
          <ChevronRight className="w-5 h-5 text-neutral-600" />
        </button>

        {/* Cards container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 px-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {results.map((result, index) => {
            const { product, matchScore, reasons } = result;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 w-[260px] snap-center"
              >
                <Card
                  isPressable
                  onPress={() => onViewProduct(product.id)}
                  className={`h-full cursor-pointer transition-all ${
                    index === 0
                      ? 'border-2 border-[#4654CD] shadow-lg'
                      : 'border border-neutral-200 hover:border-[#4654CD]/50'
                  }`}
                >
                  <CardBody className="p-0">
                    {/* Image */}
                    <div className="relative bg-neutral-50 p-4 pb-6">
                      <Chip
                        size="sm"
                        className={`absolute top-2 left-2 ${
                          index === 0
                            ? 'bg-[#4654CD] text-white'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {matchScore}% match
                      </Chip>
                      {index === 0 && (
                        <Chip
                          size="sm"
                          className="absolute top-2 right-2 bg-[#f59e0b] text-white"
                          startContent={<Star className="w-3 h-3 fill-white" />}
                        >
                          #1
                        </Chip>
                      )}
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-full h-32 object-contain"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-neutral-500">
                          {product.brand}
                        </span>
                        <Chip
                          size="sm"
                          classNames={{
                            base: `${getGamaColor(product.gama)} px-1.5 h-5`,
                            content: 'text-[10px] font-medium',
                          }}
                        >
                          {getGamaLabel(product.gama)}
                        </Chip>
                      </div>
                      <h3 className="font-semibold text-sm text-neutral-800 line-clamp-2 mb-3 min-h-[2.5rem]">
                        {product.displayName}
                      </h3>

                      {/* Specs */}
                      <div className="space-y-1 mb-3 text-xs text-neutral-500">
                        <div className="flex items-center gap-1.5">
                          <MemoryStick className="w-3 h-3" />
                          <span>{product.specs.ram}GB RAM</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <HardDrive className="w-3 h-3" />
                          <span>{product.specs.storage}GB SSD</span>
                        </div>
                      </div>

                      {/* Reasons */}
                      {index === 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {reasons.slice(0, 2).map((reason, idx) => (
                            <Chip
                              key={idx}
                              size="sm"
                              startContent={<Check className="w-2.5 h-2.5" />}
                              classNames={{
                                base: 'bg-[#22c55e]/10 px-1.5 h-5',
                                content: 'text-[#22c55e] text-[10px]',
                              }}
                            >
                              {reason.length > 20 ? reason.slice(0, 20) + '...' : reason}
                            </Chip>
                          ))}
                        </div>
                      )}

                      {/* Price */}
                      <div className="border-t border-neutral-100 pt-3">
                        <p className="text-xl font-bold text-[#4654CD]">
                          S/{product.lowestQuota}
                          <span className="text-xs font-normal text-neutral-500">/mes</span>
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center gap-1.5">
        {results.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === 0 ? 'bg-[#4654CD] w-6' : 'bg-neutral-300'
            }`}
          />
        ))}
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
        <Button className="flex-1 bg-[#4654CD] text-white cursor-pointer">
          Ver catálogo
        </Button>
      </motion.div>
    </div>
  );
};

export default QuizResultsV5;
