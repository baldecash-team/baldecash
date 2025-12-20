'use client';

/**
 * SocialProofV4 - Carrusel Manual
 *
 * Concepto: Flechas para navegar, 4 logos visibles a la vez
 * Estilo: Indicadores de pagina, transiciones suaves
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@nextui-org/react';
import { SocialProofProps } from '../../../types/hero';
import { conveniosLogos } from '@/app/prototipos/_shared/data/conveniosLogos';

export const SocialProofV4: React.FC<SocialProofProps> = ({ data }) => {
  const [page, setPage] = useState(0);
  const logosPerPage = 4;
  const totalPages = Math.ceil(conveniosLogos.length / logosPerPage);

  const visibleLogos = conveniosLogos.slice(
    page * logosPerPage,
    (page + 1) * logosPerPage
  );

  const nextPage = () => setPage((prev) => (prev + 1) % totalPages);
  const prevPage = () => setPage((prev) => (prev - 1 + totalPages) % totalPages);

  return (
    <section className="py-12 bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-neutral-600 font-medium">
            +{data.institutionCount} instituciones educativas confian en nosotros
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <Button
            isIconOnly
            radius="lg"
            variant="flat"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white shadow-md cursor-pointer hover:bg-neutral-50"
            onPress={prevPage}
          >
            <ChevronLeft className="w-5 h-5 text-neutral-600" />
          </Button>

          <Button
            isIconOnly
            radius="lg"
            variant="flat"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white shadow-md cursor-pointer hover:bg-neutral-50"
            onPress={nextPage}
          >
            <ChevronRight className="w-5 h-5 text-neutral-600" />
          </Button>

          {/* Logos */}
          <div className="overflow-hidden px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                className="grid grid-cols-4 gap-6"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {visibleLogos.map((logo) => (
                  <div
                    key={logo.id}
                    className="bg-white rounded-xl p-6 border border-neutral-100 hover:border-[#4654CD]/30 transition-colors"
                  >
                    <div className="h-16 flex items-center justify-center">
                      <img
                        src={logo.url}
                        alt={logo.name}
                        className="max-h-12 max-w-full object-contain"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                    <p className="text-center text-neutral-500 text-xs mt-2 truncate">
                      {logo.shortName}
                    </p>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Page Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setPage(index)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  page === index
                    ? 'bg-[#4654CD] w-6'
                    : 'bg-neutral-300 hover:bg-neutral-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProofV4;
