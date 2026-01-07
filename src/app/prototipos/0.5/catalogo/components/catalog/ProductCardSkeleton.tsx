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
    className="h-full"
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, delay: index * 0.06 }}
  >
    <Card className="h-full border border-[#4654CD]/20 bg-gradient-to-br from-white via-[#4654CD]/[0.02] to-[#03DBD0]/[0.02] overflow-hidden">
      <CardBody className="p-4">
        {/* Badges with brand colors */}
        <div className="flex gap-1.5 mb-3">
          <GlowBox
            className="h-5 w-14 rounded-full bg-gradient-to-r from-[#4654CD]/20 to-[#4654CD]/10"
            delay={index * 0.1}
          />
          <GlowBox
            className="h-5 w-20 rounded-full bg-gradient-to-r from-[#03DBD0]/20 to-[#03DBD0]/10"
            delay={index * 0.1 + 0.1}
          />
        </div>

        {/* Image with glow effect */}
        <div className="relative mb-4">
          <GlowBox
            className="w-full h-40 rounded-xl bg-gradient-to-br from-neutral-100 via-[#4654CD]/5 to-[#03DBD0]/5"
            delay={index * 0.1 + 0.15}
            glow
          />
        </div>

        {/* Brand */}
        <GlowBox
          className="h-3 w-16 rounded bg-neutral-200/80 mb-2"
          delay={index * 0.1 + 0.2}
        />

        {/* Title */}
        <div className="space-y-1.5 mb-3">
          <GlowBox
            className="h-4 w-full rounded bg-neutral-200/80"
            delay={index * 0.1 + 0.25}
          />
          <GlowBox
            className="h-4 w-3/4 rounded bg-neutral-200/60"
            delay={index * 0.1 + 0.3}
          />
        </div>

        {/* Specs with icons hint */}
        <div className="flex items-center gap-3 mb-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-1">
              <GlowBox
                className="h-3 w-3 rounded-full bg-[#4654CD]/20"
                delay={index * 0.1 + 0.35 + i * 0.05}
              />
              <GlowBox
                className="h-3 w-8 rounded bg-neutral-200/70"
                delay={index * 0.1 + 0.35 + i * 0.05}
              />
            </div>
          ))}
        </div>

        {/* Price with brand gradient */}
        <div className="mb-4">
          <GlowBox
            className="h-8 w-28 rounded-lg bg-gradient-to-r from-[#4654CD]/25 to-[#4654CD]/15 mb-1"
            delay={index * 0.1 + 0.4}
            glow
          />
          <GlowBox
            className="h-3 w-36 rounded bg-neutral-200/60"
            delay={index * 0.1 + 0.45}
          />
        </div>

        {/* Button with brand gradient */}
        <GlowBox
          className="h-10 w-full rounded-xl bg-gradient-to-r from-[#4654CD]/30 via-[#4654CD]/25 to-[#03DBD0]/20"
          delay={index * 0.1 + 0.5}
          glow
        />
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
      className="h-full"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
    >
      <Card className="h-full border border-neutral-200 overflow-hidden">
        <CardBody className="p-4">
          {/* Badges */}
          <div className="flex gap-1.5 mb-3">
            <ShimmerBox className="h-5 w-14 rounded" />
            <ShimmerBox className="h-5 w-20 rounded" />
          </div>

          {/* Image */}
          <div className="relative mb-4">
            <ShimmerBox className="w-full h-40 rounded-lg !bg-gradient-to-br from-neutral-100 to-neutral-200" />
          </div>

          {/* Brand */}
          <ShimmerBox className="h-3 w-16 rounded mb-2" />

          {/* Title */}
          <div className="space-y-1.5 mb-3">
            <ShimmerBox className="h-4 w-full rounded" />
            <ShimmerBox className="h-4 w-3/4 rounded" />
          </div>

          {/* Specs */}
          <div className="flex items-center gap-3 mb-3">
            <ShimmerBox className="h-4 w-12 rounded" />
            <ShimmerBox className="h-4 w-12 rounded" />
            <ShimmerBox className="h-4 w-12 rounded" />
          </div>

          {/* Price */}
          <div className="mb-4">
            <ShimmerBox className="h-8 w-28 rounded mb-1 !bg-[#4654CD]/20" />
            <ShimmerBox className="h-3 w-36 rounded" />
          </div>

          {/* Button */}
          <ShimmerBox className="h-10 w-full rounded-lg !bg-[#4654CD]/30" />
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
      className="h-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: staggerDelay }}
    >
      <Card className="h-full border border-neutral-200 bg-gradient-to-b from-white to-neutral-50/50">
        <CardBody className="p-4">
          {/* Badges with wave */}
          <div className="flex gap-1.5 mb-3">
            <WaveBox
              className="h-5 w-14 rounded-full bg-gradient-to-r from-[#4654CD]/20 to-[#03DBD0]/20"
              delay={staggerDelay}
            />
            <WaveBox
              className="h-5 w-20 rounded-full bg-neutral-200"
              delay={staggerDelay + 0.1}
            />
          </div>

          {/* Image placeholder with gradient */}
          <div className="relative mb-4 w-full h-40 rounded-xl bg-gradient-to-br from-neutral-100 via-neutral-50 to-neutral-100 flex items-center justify-center">
            <motion.div
              className="w-20 h-20 rounded-lg bg-neutral-200/60"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          {/* Brand */}
          <WaveBox className="h-3 w-16 rounded bg-neutral-200 mb-2" delay={staggerDelay + 0.2} />

          {/* Title */}
          <div className="space-y-1.5 mb-3">
            <WaveBox className="h-4 w-full rounded bg-neutral-200" delay={staggerDelay + 0.25} />
            <WaveBox className="h-4 w-2/3 rounded bg-neutral-200" delay={staggerDelay + 0.3} />
          </div>

          {/* Specs - dots */}
          <div className="flex items-center gap-4 mb-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-1">
                <WaveBox className="w-3 h-3 rounded-full bg-neutral-300" delay={staggerDelay + 0.35 + i * 0.05} />
                <WaveBox className="h-3 w-8 rounded bg-neutral-200" delay={staggerDelay + 0.35 + i * 0.05} />
              </div>
            ))}
          </div>

          {/* Price with brand color hint */}
          <div className="mb-4">
            <WaveBox
              className="h-8 w-28 rounded bg-gradient-to-r from-[#4654CD]/30 to-[#03DBD0]/20 mb-1"
              delay={staggerDelay + 0.4}
            />
            <WaveBox className="h-3 w-36 rounded bg-neutral-200" delay={staggerDelay + 0.45} />
          </div>

          {/* Button */}
          <WaveBox
            className="h-10 w-full rounded-xl bg-gradient-to-r from-[#4654CD]/40 to-[#4654CD]/30"
            delay={staggerDelay + 0.5}
          />
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
