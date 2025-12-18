'use client';

/**
 * QuizResultsV3 - Categoria recomendada + productos filtrados
 *
 * Muestra la categoria ideal para el usuario junto con
 * productos de esa categoria como sugerencias.
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
  ShoppingCart,
  RefreshCw,
  ArrowRight,
  Filter,
  LucideIcon,
} from 'lucide-react';
import { QuizResultsProps, QuizResult } from '../../../types/quiz';

const categoryIcons: Record<string, LucideIcon> = {
  study: GraduationCap,
  gaming: Gamepad2,
  design: Palette,
  coding: Code,
  office: Briefcase,
};

const categoryInfo: Record<
  string,
  { name: string; description: string; color: string }
> = {
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

interface ProductMiniCardProps {
  result: QuizResult;
  index: number;
  onViewProduct: (id: string) => void;
}

const ProductMiniCard: React.FC<ProductMiniCardProps> = ({
  result,
  index,
  onViewProduct,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.1 }}
    >
      <Card
        className="border border-neutral-200 hover:border-[#4654CD]/50 hover:shadow-md transition-all cursor-pointer"
        isPressable
        onPress={() => onViewProduct(result.product.id)}
      >
        <CardBody className="p-3">
          <div className="flex gap-3">
            {/* Image */}
            <div className="w-16 h-16 bg-neutral-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <img
                src={result.product.image}
                alt={result.product.name}
                className="w-14 h-14 object-contain"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/60?text=Laptop';
                }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-500">{result.product.brand}</p>
              <h4 className="text-sm font-semibold text-neutral-800 line-clamp-1">
                {result.product.name}
              </h4>
              <div className="flex items-center justify-between mt-1">
                <p className="text-base font-bold text-[#4654CD]">
                  S/{result.product.lowestQuota}/mes
                </p>
                <Chip
                  size="sm"
                  radius="sm"
                  classNames={{
                    base: 'bg-[#4654CD]/10 px-2 py-0.5 h-auto',
                    content: 'text-[#4654CD] text-xs font-medium',
                  }}
                >
                  {result.matchScore}%
                </Chip>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export const QuizResultsV3: React.FC<QuizResultsProps> = ({
  results,
  onViewProduct,
  onRestartQuiz,
}) => {
  // Determine category from first result's tags
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
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4"
          style={{ backgroundColor: `${info.color}15` }}
        >
          <CategoryIcon className="w-10 h-10" style={{ color: info.color }} />
        </motion.div>
        <h2 className="text-xl font-bold text-neutral-800 mb-1">
          Te recomendamos
        </h2>
        <h3
          className="text-2xl font-black mb-2"
          style={{ color: info.color }}
        >
          {info.name}
        </h3>
        <p className="text-neutral-500">{info.description}</p>
      </motion.div>

      {/* Category features */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-neutral-50 rounded-xl p-4"
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

      {/* Products in category */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-neutral-800">
            Productos recomendados
          </h4>
          <span className="text-sm text-neutral-500">
            {results.length} opciones
          </span>
        </div>
        <div className="space-y-3">
          {results.slice(0, 3).map((result, index) => (
            <ProductMiniCard
              key={result.product.id}
              result={result}
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
            size="lg"
            startContent={<RefreshCw className="w-4 h-4" />}
            onPress={onRestartQuiz}
          >
            Nuevo quiz
          </Button>
          <Button
            variant="light"
            className="flex-1 cursor-pointer"
            size="lg"
            endContent={<ArrowRight className="w-4 h-4" />}
          >
            Ver todo el catalogo
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default QuizResultsV3;
