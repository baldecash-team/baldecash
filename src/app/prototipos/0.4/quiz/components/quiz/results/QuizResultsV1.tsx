'use client';

/**
 * QuizResultsV1 - Categoria + productos con cards de catalogo
 *
 * PREFERIDO (B.101 - basado en 0.3 V3): Muestra la categoria ideal
 * junto con productos usando el mismo card del catalogo.
 */

import React from 'react';
import { Card, CardBody, Button, Chip } from '@nextui-org/react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Gamepad2,
  Palette,
  Code,
  Briefcase,
  Check,
  RefreshCw,
  Filter,
  ArrowRight,
  Cpu,
  HardDrive,
  Monitor,
  MemoryStick,
  Gpu,
  Heart,
  LucideIcon,
} from 'lucide-react';
import { QuizResultsProps, QuizResult, QuizProduct } from '../../../types/quiz';
import { getGamaLabel, getGamaColor } from '../../../data/mockQuizData';

const categoryIcons: Record<string, LucideIcon> = {
  study: GraduationCap,
  gaming: Gamepad2,
  design: Palette,
  coding: Code,
  office: Briefcase,
};

const categoryInfo: Record<string, { name: string; description: string; color: string }> = {
  study: {
    name: 'Laptops para Estudios',
    description: 'Equipos confiables para tus clases y tareas',
    color: '#4654CD',
  },
  gaming: {
    name: 'Laptops Gamer',
    description: 'Potencia para los juegos mas exigentes',
    color: '#dc2626',
  },
  design: {
    name: 'Laptops para Diseno',
    description: 'Pantallas precisas y rendimiento creativo',
    color: '#7c3aed',
  },
  coding: {
    name: 'Laptops para Programacion',
    description: 'Rendimiento y memoria para desarrollo',
    color: '#059669',
  },
  office: {
    name: 'Laptops de Oficina',
    description: 'Productividad empresarial',
    color: '#0284c7',
  },
};

// ProductCard igual al catalogo (B.101)
interface ProductCardProps {
  product: QuizProduct;
  matchScore: number;
  index: number;
  onViewProduct: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  matchScore,
  index,
  onViewProduct,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.1 }}
    >
      <Card
        className="border border-neutral-200 hover:border-[#4654CD]/50 transition-all hover:shadow-md cursor-pointer"
        isPressable
        onPress={() => onViewProduct(product.id)}
      >
        <CardBody className="p-0">
          {/* Image Container */}
          <div className="relative aspect-[4/3] bg-neutral-50 p-3">
            {/* Match badge */}
            <div className="absolute top-2 left-2 z-10">
              <Chip
                size="sm"
                radius="sm"
                classNames={{
                  base: 'bg-[#4654CD] px-2.5 py-1 h-auto',
                  content: 'text-white text-xs font-medium',
                }}
              >
                {matchScore}% match
              </Chip>
            </div>

            {/* Badges */}
            <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
              {product.isNew && (
                <Chip
                  size="sm"
                  radius="sm"
                  classNames={{
                    base: 'bg-[#3b82f6] px-2 py-0.5 h-auto',
                    content: 'text-white text-xs font-medium',
                  }}
                >
                  Nuevo
                </Chip>
              )}
              {product.discount && (
                <Chip
                  size="sm"
                  radius="sm"
                  classNames={{
                    base: 'bg-[#ef4444] px-2 py-0.5 h-auto',
                    content: 'text-white text-xs font-medium',
                  }}
                >
                  -S/{product.discount}
                </Chip>
              )}
            </div>

            {/* Product Image */}
            <img
              src={product.thumbnail}
              alt={product.displayName}
              className="w-full h-full object-contain"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/200?text=Laptop';
              }}
            />
          </div>

          {/* Content */}
          <div className="p-3 sm:p-4">
            {/* Brand & Gama */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-neutral-500 uppercase tracking-wide">
                {product.brand}
              </span>
              <Chip
                size="sm"
                radius="sm"
                classNames={{
                  base: `${getGamaColor(product.gama)} px-2 py-0.5 h-auto`,
                  content: 'text-xs font-medium',
                }}
              >
                {getGamaLabel(product.gama)}
              </Chip>
            </div>

            {/* Product Name */}
            <h3 className="font-semibold text-neutral-800 text-sm line-clamp-2 mb-2 min-h-[2.5rem]">
              {product.displayName}
            </h3>

            {/* Technical Specs */}
            <div className="space-y-1 mb-2">
              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <Cpu className="w-3 h-3 text-[#4654CD]" />
                <span className="truncate">{product.specs.processor}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <MemoryStick className="w-3 h-3 text-[#4654CD]" />
                <span>{product.specs.ram}GB RAM</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <HardDrive className="w-3 h-3 text-[#4654CD]" />
                <span>{product.specs.storage}GB {product.specs.storageType.toUpperCase()}</span>
              </div>
            </div>

            {/* GPU Badge */}
            {product.specs.gpuType === 'dedicated' && product.specs.gpu && (
              <Chip
                size="sm"
                radius="sm"
                startContent={<Gpu className="w-3 h-3" />}
                classNames={{
                  base: 'bg-[#22c55e]/10 px-2 py-0.5 h-auto mb-2',
                  content: 'text-[#22c55e] text-xs font-medium',
                }}
              >
                {product.specs.gpu}
              </Chip>
            )}

            {/* Price */}
            <div className="border-t border-neutral-100 pt-2">
              <p className="text-xl font-bold text-[#4654CD] font-['Baloo_2']">
                S/{product.lowestQuota}
                <span className="text-sm font-normal text-neutral-500">/mes</span>
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export const QuizResultsV1: React.FC<QuizResultsProps> = ({
  results,
  onViewProduct,
  onRestartQuiz,
}) => {
  const determineCategory = (): string => {
    if (results.length === 0) return 'study';
    const tags = results[0].product.tags;
    if (tags.includes('gaming')) return 'gaming';
    if (tags.includes('diseno')) return 'design';
    if (tags.includes('programacion')) return 'coding';
    if (tags.includes('oficina')) return 'office';
    return 'study';
  };

  const category = determineCategory();
  const info = categoryInfo[category] || categoryInfo.study;
  const CategoryIcon = categoryIcons[category] || GraduationCap;

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
      {/* Category recommendation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring' }}
          className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mb-4"
          style={{ backgroundColor: `${info.color}15` }}
        >
          <CategoryIcon className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: info.color }} />
        </motion.div>
        <h2 className="text-lg sm:text-xl font-bold text-neutral-800 mb-1">
          Te recomendamos
        </h2>
        <h3
          className="text-xl sm:text-2xl font-black mb-2"
          style={{ color: info.color }}
        >
          {info.name}
        </h3>
        <p className="text-sm text-neutral-500">{info.description}</p>
      </motion.div>

      {/* Category features */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-neutral-50 rounded-xl p-3 sm:p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Check className="w-5 h-5 text-[#22c55e]" />
          <span className="text-sm font-medium text-neutral-700">
            Lo que encontraras en esta categoria:
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {results[0].reasons.map((reason, index) => (
            <Chip
              key={index}
              size="sm"
              radius="sm"
              classNames={{
                base: 'bg-white border border-neutral-200 px-2.5 py-1 h-auto',
                content: 'text-neutral-600 text-xs',
              }}
            >
              {reason}
            </Chip>
          ))}
        </div>
      </motion.div>

      {/* Products - usando cards estilo catalogo */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-neutral-800">
            Productos recomendados
          </h4>
          <span className="text-sm text-neutral-500">
            {results.length} opciones
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {results.slice(0, 3).map((result, index) => (
            <ProductCard
              key={result.product.id}
              product={result.product}
              matchScore={result.matchScore}
              index={index}
              onViewProduct={onViewProduct}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col gap-3"
      >
        <Button
          className="w-full bg-[#4654CD] text-white font-semibold cursor-pointer"
          size="lg"
          endContent={<Filter className="w-4 h-4" />}
        >
          Ver todas en esta categoria
        </Button>
        <div className="flex gap-3">
          <Button
            variant="bordered"
            className="flex-1 border-neutral-300 cursor-pointer"
            startContent={<RefreshCw className="w-4 h-4" />}
            onPress={onRestartQuiz}
          >
            Nuevo quiz
          </Button>
          <Button
            variant="light"
            className="flex-1 cursor-pointer"
            endContent={<ArrowRight className="w-4 h-4" />}
          >
            Ver catalogo
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default QuizResultsV1;
