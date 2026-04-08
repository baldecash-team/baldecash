'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { highlightCards } from '../../../data/mockMacbookNeoData';
import type { HighlightCard } from '../../../types/macbook-neo';

export function HighlightsGallery() {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0 }}
          className="font-['Baloo_2'] text-3xl md:text-4xl font-bold text-neutral-900 text-center mb-12"
        >
          Lo que hace especial a MacBook Neo
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {highlightCards.map((card: HighlightCard, index: number) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="border border-neutral-200 shadow-sm rounded-xl overflow-hidden bg-white"
            >
              {/* Card image */}
              <div className="relative aspect-video w-full">
                <Image
                  src={card.imagePath}
                  alt={card.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              {/* Card content */}
              <div className="p-5">
                {card.badge && (
                  <span className="inline-block bg-[#4654CD]/10 text-[#4654CD] text-xs font-medium rounded-lg px-2 py-1 mb-3">
                    {card.badge}
                  </span>
                )}
                <h3 className="font-['Baloo_2'] text-lg font-bold text-neutral-900 mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
