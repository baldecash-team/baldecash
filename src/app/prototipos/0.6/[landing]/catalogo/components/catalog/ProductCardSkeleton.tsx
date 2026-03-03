'use client';

import React from 'react';
import { Card, CardBody, Skeleton } from '@nextui-org/react';
import { motion } from 'framer-motion';

type SkeletonVersion = 1 | 2 | 3;

interface ProductCardSkeletonProps {
  version?: SkeletonVersion;
  index?: number;
}

/**
 * V1 - Glow Gradient
 * Skeleton con efecto de brillo gradiente y colores de marca
 */
const GlowBox: React.FC<{ className?: string; delay?: number; glow?: boolean }> = ({
  className = '',
  delay = 0,
  glow = false
}) => (
  <motion.div
    className={`${className} ${glow ? 'shadow-[0_0_15px_rgba(70,84,205,0.3)]' : ''}`}
    initial={{ opacity: 0.3 }}
    animate={{
      opacity: [0.3, 0.6, 0.3],
      scale: glow ? [1, 1.02, 1] : 1,
    }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
      delay,
    }}
  />
);

const SkeletonV1: React.FC<{ index: number }> = ({ index }) => (
  <motion.div
    className="h-full w-full min-w-[min(305px,100%)] max-w-[398px]"
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, delay: index * 0.06 }}
  >
    <Card className="h-full border-0 shadow-lg overflow-hidden bg-white">
      <CardBody className="p-0 flex flex-col">
        {/* Image area - matching ProductCard structure */}
        <div className="relative bg-gradient-to-b from-neutral-50 to-white p-6">
          <GlowBox
            className="w-full h-44 rounded-xl bg-gradient-to-br from-neutral-100 via-[rgba(var(--color-primary-rgb),0.05)] to-[rgba(var(--color-secondary-rgb),0.05)]"
            delay={index * 0.1}
            glow
          />

          {/* Action buttons - top right */}
          <div className="absolute top-3 right-3 flex flex-col gap-1">
            <GlowBox
              className="w-10 h-10 rounded-full bg-white/90 shadow-md"
              delay={index * 0.1 + 0.1}
            />
            <GlowBox
              className="w-10 h-10 rounded-full bg-white/90 shadow-md"
              delay={index * 0.1 + 0.15}
            />
          </div>

          {/* Tags - top left */}
          <div className="absolute top-3 left-3 flex gap-1">
            <GlowBox
              className="h-5 w-16 rounded-full bg-gradient-to-r from-[rgba(var(--color-primary-rgb),0.2)] to-[rgba(var(--color-primary-rgb),0.1)]"
              delay={index * 0.1 + 0.05}
            />
          </div>
        </div>

        {/* Content - Centered */}
        <div className="p-5 text-center flex flex-col flex-1">
          {/* Brand */}
          <GlowBox
            className="h-3 w-20 rounded bg-[rgba(var(--color-primary-rgb),0.2)] mx-auto mb-2"
            delay={index * 0.1 + 0.2}
          />

          {/* Title */}
          <div className="space-y-1.5 mb-3">
            <GlowBox
              className="h-5 w-4/5 rounded bg-neutral-200/80 mx-auto"
              delay={index * 0.1 + 0.25}
            />
            <GlowBox
              className="h-5 w-3/5 rounded bg-neutral-200/60 mx-auto"
              delay={index * 0.1 + 0.3}
            />
          </div>

          {/* Color Selector */}
          <div className="flex justify-center gap-2 mb-4">
            {[0, 1, 2, 3].map((i) => (
              <GlowBox
                key={i}
                className="w-6 h-6 rounded-full bg-neutral-200"
                delay={index * 0.1 + 0.35 + i * 0.03}
              />
            ))}
          </div>

          {/* Specs - 4 lines with icons */}
          <div className="space-y-2 mb-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-center gap-2">
                <GlowBox
                  className="w-3.5 h-3.5 rounded bg-[rgba(var(--color-primary-rgb),0.2)]"
                  delay={index * 0.1 + 0.4 + i * 0.05}
                />
                <GlowBox
                  className="h-3 w-32 rounded bg-neutral-200/70"
                  delay={index * 0.1 + 0.4 + i * 0.05}
                />
              </div>
            ))}
          </div>

          {/* Price box */}
          <div className="bg-[rgba(var(--color-primary-rgb),0.05)] rounded-2xl py-4 px-6 mb-4">
            <GlowBox
              className="h-3 w-20 rounded bg-neutral-300/50 mx-auto mb-2"
              delay={index * 0.1 + 0.5}
            />
            <GlowBox
              className="h-10 w-36 rounded-lg bg-[rgba(var(--color-primary-rgb),0.2)] mx-auto mb-2"
              delay={index * 0.1 + 0.55}
              glow
            />
            <GlowBox
              className="h-3 w-40 rounded bg-neutral-300/50 mx-auto"
              delay={index * 0.1 + 0.6}
            />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* CTAs - 2 buttons */}
          <div className="flex gap-2 justify-center">
            <GlowBox
              className="h-11 w-28 rounded-xl bg-[rgba(var(--color-primary-rgb),0.1)] border border-[rgba(var(--color-primary-rgb),0.2)]"
              delay={index * 0.1 + 0.65}
            />
            <GlowBox
              className="h-11 w-28 rounded-xl bg-[rgba(var(--color-primary-rgb),0.3)]"
              delay={index * 0.1 + 0.7}
              glow
            />
          </div>
        </div>
      </CardBody>
    </Card>
  </motion.div>
);

/**
 * V2 - Shimmer Gradient
 * Skeleton con efecto shimmer/brillo que se mueve horizontalmente
 */
const ShimmerBox: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`relative overflow-hidden bg-neutral-200 ${className}`}>
    <div
      className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"
      style={{
        animation: 'shimmer 1.5s infinite',
      }}
    />
    <style jsx>{`
      @keyframes shimmer {
        100% {
          transform: translateX(100%);
        }
      }
    `}</style>
  </div>
);

const SkeletonV2: React.FC<{ index: number }> = ({ index }) => {
  return (
    <motion.div
      className="h-full w-full min-w-[min(305px,100%)] max-w-[398px]"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
    >
      <Card className="h-full border-0 shadow-lg overflow-hidden bg-white">
        <CardBody className="p-0 flex flex-col">
          {/* Image area */}
          <div className="relative bg-gradient-to-b from-neutral-50 to-white p-6">
            <ShimmerBox className="w-full h-44 rounded-xl !bg-gradient-to-br from-neutral-100 to-neutral-200" />

            {/* Action buttons - top right */}
            <div className="absolute top-3 right-3 flex flex-col gap-1">
              <ShimmerBox className="w-10 h-10 rounded-full !bg-white shadow-md" />
              <ShimmerBox className="w-10 h-10 rounded-full !bg-white shadow-md" />
            </div>

            {/* Tags - top left */}
            <div className="absolute top-3 left-3">
              <ShimmerBox className="h-5 w-16 rounded-full" />
            </div>
          </div>

          {/* Content - Centered */}
          <div className="p-5 text-center flex flex-col flex-1">
            {/* Brand */}
            <ShimmerBox className="h-3 w-20 rounded mx-auto mb-2 !bg-[rgba(var(--color-primary-rgb),0.2)]" />

            {/* Title */}
            <div className="space-y-1.5 mb-3">
              <ShimmerBox className="h-5 w-4/5 rounded mx-auto" />
              <ShimmerBox className="h-5 w-3/5 rounded mx-auto" />
            </div>

            {/* Color Selector */}
            <div className="flex justify-center gap-2 mb-4">
              {[0, 1, 2, 3].map((i) => (
                <ShimmerBox key={i} className="w-6 h-6 rounded-full" />
              ))}
            </div>

            {/* Specs - 4 lines */}
            <div className="space-y-2 mb-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-center gap-2">
                  <ShimmerBox className="w-3.5 h-3.5 rounded !bg-[rgba(var(--color-primary-rgb),0.2)]" />
                  <ShimmerBox className="h-3 w-32 rounded" />
                </div>
              ))}
            </div>

            {/* Price box */}
            <div className="bg-[rgba(var(--color-primary-rgb),0.05)] rounded-2xl py-4 px-6 mb-4">
              <ShimmerBox className="h-3 w-20 rounded mx-auto mb-2 !bg-neutral-300/50" />
              <ShimmerBox className="h-10 w-36 rounded-lg mx-auto mb-2 !bg-[rgba(var(--color-primary-rgb),0.2)]" />
              <ShimmerBox className="h-3 w-40 rounded mx-auto !bg-neutral-300/50" />
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* CTAs - 2 buttons */}
            <div className="flex gap-2 justify-center">
              <ShimmerBox className="h-11 w-28 rounded-xl !bg-[rgba(var(--color-primary-rgb),0.1)]" />
              <ShimmerBox className="h-11 w-28 rounded-xl !bg-[rgba(var(--color-primary-rgb),0.3)]" />
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

/**
 * V3 - Wave Stagger
 * Skeleton con animación de onda escalonada y efecto de rebote
 */
const WaveBox: React.FC<{ className?: string; delay?: number }> = ({ className = '', delay = 0 }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0.4 }}
    animate={{ opacity: [0.4, 0.7, 0.4] }}
    transition={{
      duration: 1.2,
      repeat: Infinity,
      ease: 'easeInOut',
      delay,
    }}
  />
);

const SkeletonV3: React.FC<{ index: number }> = ({ index }) => {
  const staggerDelay = index * 0.1;

  return (
    <motion.div
      className="h-full w-full min-w-[min(305px,100%)] max-w-[398px]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: staggerDelay }}
    >
      <Card className="h-full border-0 shadow-lg overflow-hidden bg-white">
        <CardBody className="p-0 flex flex-col">
          {/* Image area - matching ProductCard structure */}
          <div className="relative bg-gradient-to-b from-neutral-50 to-white p-6">
            <div className="w-full h-44 rounded-xl bg-gradient-to-br from-neutral-100 via-neutral-50 to-neutral-100 flex items-center justify-center">
              <motion.div
                className="w-20 h-20 rounded-lg bg-neutral-200/60"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            {/* Action buttons - top right */}
            <div className="absolute top-3 right-3 flex flex-col gap-1">
              <WaveBox
                className="w-10 h-10 rounded-full bg-white/90 shadow-md"
                delay={staggerDelay + 0.1}
              />
              <WaveBox
                className="w-10 h-10 rounded-full bg-white/90 shadow-md"
                delay={staggerDelay + 0.15}
              />
            </div>

            {/* Tags - top left */}
            <div className="absolute top-3 left-3 flex gap-1">
              <WaveBox
                className="h-5 w-16 rounded-full bg-gradient-to-r from-[rgba(var(--color-primary-rgb),0.2)] to-[rgba(var(--color-secondary-rgb),0.2)]"
                delay={staggerDelay + 0.05}
              />
            </div>
          </div>

          {/* Content - Centered */}
          <div className="p-5 text-center flex flex-col flex-1">
            {/* Brand */}
            <WaveBox
              className="h-3 w-20 rounded bg-[rgba(var(--color-primary-rgb),0.2)] mx-auto mb-2"
              delay={staggerDelay + 0.2}
            />

            {/* Title */}
            <div className="space-y-1.5 mb-3">
              <WaveBox
                className="h-5 w-4/5 rounded bg-neutral-200/80 mx-auto"
                delay={staggerDelay + 0.25}
              />
              <WaveBox
                className="h-5 w-3/5 rounded bg-neutral-200/60 mx-auto"
                delay={staggerDelay + 0.3}
              />
            </div>

            {/* Color Selector */}
            <div className="flex justify-center gap-2 mb-4">
              {[0, 1, 2, 3].map((i) => (
                <WaveBox
                  key={i}
                  className="w-6 h-6 rounded-full bg-neutral-200"
                  delay={staggerDelay + 0.35 + i * 0.03}
                />
              ))}
            </div>

            {/* Specs - 4 lines with icons */}
            <div className="space-y-2 mb-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-center gap-2">
                  <WaveBox
                    className="w-3.5 h-3.5 rounded bg-[rgba(var(--color-primary-rgb),0.2)]"
                    delay={staggerDelay + 0.4 + i * 0.05}
                  />
                  <WaveBox
                    className="h-3 w-32 rounded bg-neutral-200/70"
                    delay={staggerDelay + 0.4 + i * 0.05}
                  />
                </div>
              ))}
            </div>

            {/* Price box */}
            <div className="bg-[rgba(var(--color-primary-rgb),0.05)] rounded-2xl py-4 px-6 mb-4">
              <WaveBox
                className="h-3 w-20 rounded bg-neutral-300/50 mx-auto mb-2"
                delay={staggerDelay + 0.5}
              />
              <WaveBox
                className="h-10 w-36 rounded-lg bg-[rgba(var(--color-primary-rgb),0.2)] mx-auto mb-2"
                delay={staggerDelay + 0.55}
              />
              <WaveBox
                className="h-3 w-40 rounded bg-neutral-300/50 mx-auto"
                delay={staggerDelay + 0.6}
              />
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* CTAs - 2 buttons */}
            <div className="flex gap-2 justify-center">
              <WaveBox
                className="h-11 w-28 rounded-xl bg-[rgba(var(--color-primary-rgb),0.1)] border border-[rgba(var(--color-primary-rgb),0.2)]"
                delay={staggerDelay + 0.65}
              />
              <WaveBox
                className="h-11 w-28 rounded-xl bg-[rgba(var(--color-primary-rgb),0.3)]"
                delay={staggerDelay + 0.7}
              />
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

/**
 * ProductCardSkeleton
 * Componente wrapper que renderiza la versión seleccionada
 */
export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({
  version = 1,
  index = 0,
}) => {
  switch (version) {
    case 1:
      return <SkeletonV1 index={index} />;
    case 2:
      return <SkeletonV2 index={index} />;
    case 3:
      return <SkeletonV3 index={index} />;
    default:
      return <SkeletonV1 index={index} />;
  }
};

// Version labels for settings
export const skeletonVersionLabels: Record<SkeletonVersion, { name: string; description: string }> = {
  1: { name: 'Glow Gradient', description: 'Efecto de brillo con gradientes de marca' },
  2: { name: 'Shimmer Sweep', description: 'Efecto de brillo que se mueve horizontalmente' },
  3: { name: 'Wave Stagger', description: 'Animación de onda escalonada con rebote' },
};
