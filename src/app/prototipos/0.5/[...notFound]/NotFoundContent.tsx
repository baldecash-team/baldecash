'use client';

/**
 * NotFoundContent - Componente cliente con UI del 404
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@nextui-org/react';
import { Home, ArrowLeft, Search, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const NotFoundContent: React.FC = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-[#4654CD]/5 flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-[#4654CD]/10 rounded-full blur-3xl"
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
          className="absolute bottom-20 right-10 w-96 h-96 bg-[#03DBD0]/10 rounded-full blur-3xl"
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
              className="text-8xl md:text-[160px] font-black text-[#4654CD] leading-none"
              whileHover={{ scale: 1.1, rotate: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              4
            </motion.span>
            <motion.div
              className="relative"
              animate={pulseAnimation}
            >
              <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-[#4654CD]/10 flex items-center justify-center">
                <Search className="w-10 h-10 md:w-16 md:h-16 text-[#4654CD]" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-[#4654CD]/30"
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
              className="text-8xl md:text-[160px] font-black text-[#4654CD] leading-none"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              4
            </motion.span>
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-2xl md:text-3xl font-bold text-neutral-800 mb-3"
          variants={itemVariants}
        >
          Ups, página no encontrada
        </motion.h1>

        {/* Description */}
        <motion.p
          className="text-neutral-500 text-base md:text-lg mb-8 max-w-md mx-auto"
          variants={itemVariants}
        >
          La página que buscas no existe o fue movida.
          No te preocupes, te ayudamos a volver.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
          variants={itemVariants}
        >
          <Button
            size="lg"
            className="w-full sm:w-auto bg-[#4654CD] text-white font-semibold cursor-pointer hover:bg-[#3a47b3] px-8"
            startContent={<Home className="w-5 h-5" />}
            onPress={() => router.push('/prototipos/0.5/hero/hero-preview')}
          >
            Ir al inicio
          </Button>
          <Button
            size="lg"
            variant="bordered"
            className="w-full sm:w-auto border-[#4654CD] text-[#4654CD] font-semibold cursor-pointer hover:bg-[#4654CD]/5 px-8"
            startContent={<ArrowLeft className="w-5 h-5" />}
            onPress={() => router.back()}
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
            className="text-neutral-500 cursor-pointer hover:text-[#4654CD]"
            startContent={<RefreshCw className="w-4 h-4" />}
            onPress={() => window.location.reload()}
          >
            Recargar página
          </Button>
        </motion.div>

        {/* Decorative floating elements */}
        <motion.div
          className="absolute -top-10 -left-10 w-4 h-4 bg-[#4654CD] rounded-full opacity-20"
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
          className="absolute top-20 -right-20 w-3 h-3 bg-[#4654CD] rounded-full opacity-15"
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
  );
};

export default NotFoundContent;
