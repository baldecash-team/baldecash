'use client';

/**
 * ColorSelectorSection
 *
 * Interactive color picker for the MacBook Neo landing page.
 * Displays a crossfading product image alongside 4 color dot selectors.
 *
 * Usage:
 *   <ColorSelectorSection />
 *   <ColorSelectorSection defaultColor="indigo" />
 */

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { colorOptions } from '../../../data/mockMacbookNeoData';
import { MacbookNeoColor } from '../../../types/macbook-neo';

export interface ColorSelectorSectionProps {
  defaultColor?: MacbookNeoColor;
}

export function ColorSelectorSection({
  defaultColor = 'citrus',
}: ColorSelectorSectionProps) {
  const [selectedColor, setSelectedColor] =
    useState<MacbookNeoColor>(defaultColor);

  const selectedOption =
    colorOptions.find((o) => o.id === selectedColor) ?? colorOptions[0];

  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-3"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            Cuatro colores. Un estilo único.
          </h2>
          <p className="text-base md:text-lg text-neutral-500">
            Diseño de aluminio resistente.
          </p>
        </div>

        {/* Image area */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="aspect-[3/2] relative overflow-hidden rounded-xl">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedColor}
                src={selectedOption.imagePath}
                alt={`MacBook Neo ${selectedOption.label}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full object-contain"
              />
            </AnimatePresence>
          </div>
        </div>

        {/* Color dots */}
        <div className="flex items-start justify-center gap-4">
          {colorOptions.map((option) => {
            const isSelected = option.id === selectedColor;
            return (
              <button
                key={option.id}
                onClick={() => setSelectedColor(option.id)}
                aria-label={`Seleccionar color ${option.label}`}
                aria-pressed={isSelected}
                className="flex flex-col items-center gap-2 bg-transparent border-0 p-0 cursor-pointer"
              >
                <span
                  className={[
                    'w-8 h-8 rounded-full transition-all duration-200 block',
                    isSelected
                      ? 'ring-2 ring-offset-2 ring-[#4654CD] scale-110'
                      : 'hover:scale-105',
                  ].join(' ')}
                  style={{ backgroundColor: option.hex }}
                />
                <span
                  className={[
                    'text-xs transition-colors duration-200',
                    isSelected
                      ? 'text-[#4654CD] font-medium'
                      : 'text-neutral-500',
                  ].join(' ')}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
