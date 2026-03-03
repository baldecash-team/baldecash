'use client';

/**
 * NotFoundContent - Componente 404 para prototipos 0.6
 * Diseño limpio sin Navbar/Footer, con animaciones y branding BaldeCash
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@nextui-org/react';
import { Home, ArrowLeft, Search, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NotFoundContentProps {
  /** URL personalizada para el botón "Ir al inicio" */
  homeUrl?: string;
}

export const NotFoundContent: React.FC<NotFoundContentProps> = ({
  homeUrl = '/prototipos/0.6/home'
}) => {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  };

  const numberVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number],
      },
    },
  };

  const floatAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white flex flex-col overflow-hidden" style={{ ['--tw-gradient-to' as string]: 'color-mix(in srgb, var(--color-primary, #4654CD) 5%, transparent)' }}>
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary, #4654CD) 10%, transparent)' }}
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut' as const,
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-secondary, #03DBD0) 10%, transparent)' }}
            animate={{
              x: [0, -40, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut' as const,
            }}
          />
        </div>

        <motion.div
          className="relative z-10 text-center max-w-lg mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Animated 404 Number */}
          <motion.div className="relative mb-8" animate={floatAnimation}>
            <motion.div
              className="flex items-center justify-center gap-2 md:gap-4"
              variants={numberVariants}
            >
              <motion.span
                className="text-8xl md:text-[140px] font-black leading-none font-['Baloo_2']"
                style={{ color: 'var(--color-primary, #4654CD)' }}
                whileHover={{ scale: 1.1, rotate: -5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                4
              </motion.span>
              <motion.div
                className="relative"
                animate={pulseAnimation}
              >
                <div
                  className="w-16 h-16 md:w-28 md:h-28 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary, #4654CD) 10%, transparent)' }}
                >
                  <Search className="w-8 h-8 md:w-14 md:h-14" style={{ color: 'var(--color-primary, #4654CD)' }} />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full border-4"
                  style={{ borderColor: 'color-mix(in srgb, var(--color-primary, #4654CD) 30%, transparent)' }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeOut' as const,
                  }}
                />
              </motion.div>
              <motion.span
                className="text-8xl md:text-[140px] font-black leading-none font-['Baloo_2']"
                style={{ color: 'var(--color-primary, #4654CD)' }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                4
              </motion.span>
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-2xl md:text-3xl font-bold text-neutral-800 mb-3 font-['Baloo_2']"
            variants={itemVariants}
          >
            Página no disponible
          </motion.h1>

          {/* Description */}
          <motion.p
            className="text-neutral-500 text-base md:text-lg mb-8 max-w-md mx-auto"
            variants={itemVariants}
          >
            La página que buscas no existe o ya no está activa.
            No te preocupes, te ayudamos a volver.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
            variants={itemVariants}
          >
            <Button
              size="lg"
              className="w-full sm:w-auto text-white font-semibold cursor-pointer px-8"
              style={{ backgroundColor: 'var(--color-primary, #4654CD)' }}
              startContent={<Home className="w-5 h-5" />}
              onPress={() => router.push(homeUrl)}
              onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(0.9)'}
              onMouseLeave={(e) => e.currentTarget.style.filter = ''}
            >
              Ir al inicio
            </Button>
            <Button
              size="lg"
              variant="bordered"
              className="w-full sm:w-auto font-semibold cursor-pointer px-8"
              style={{
                borderColor: 'var(--color-primary, #4654CD)',
                color: 'var(--color-primary, #4654CD)',
              }}
              startContent={<ArrowLeft className="w-5 h-5" />}
              onPress={() => router.back()}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary, #4654CD) 5%, transparent)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
            >
              Volver atrás
            </Button>
          </motion.div>

          {/* Retry suggestion */}
          <motion.div
            className="mt-10 pt-8 border-t border-neutral-200"
            variants={itemVariants}
          >
            <p className="text-sm text-neutral-400 mb-4">
              ¿El problema persiste?
            </p>
            <Button
              size="sm"
              variant="light"
              className="text-neutral-500 cursor-pointer"
              startContent={<RefreshCw className="w-4 h-4" />}
              onPress={() => window.location.reload()}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary, #4654CD)'}
              onMouseLeave={(e) => e.currentTarget.style.color = ''}
            >
              Recargar página
            </Button>
          </motion.div>

          {/* Decorative floating elements */}
          <motion.div
            className="absolute -top-10 -left-10 w-4 h-4 rounded-full opacity-20"
            style={{ backgroundColor: 'var(--color-primary, #4654CD)' }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut' as const,
            }}
          />
          <motion.div
            className="absolute -bottom-5 -right-5 w-6 h-6 bg-[#03DBD0] rounded-full opacity-30"
            animate={{
              y: [0, 15, 0],
              x: [0, -15, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut' as const,
            }}
          />
          <motion.div
            className="absolute top-20 -right-20 w-3 h-3 rounded-full opacity-15"
            style={{ backgroundColor: 'var(--color-primary, #4654CD)' }}
            animate={{
              y: [0, 25, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: 'easeInOut' as const,
            }}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundContent;
