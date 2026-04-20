'use client';

/**
 * ConvenioTestimonials - Cards Grid 3 columnas para convenio
 * Diseño basado en v0.5 convenio-preview
 * - Fondo gris, cards blancas con borde sutil
 * - Título serif itálica azul oscuro
 * - Quote icon dorado visible
 * - Título y subtítulo 100% desde admin (sin fallback)
 */

import React from 'react';
import { Star, Quote } from 'lucide-react';
import type { Testimonial, AgreementData } from '../../../types/hero';

interface ConvenioTestimonialsProps {
  testimonials: Testimonial[];
  title?: string;
  subtitle?: string;
  agreementData: AgreementData;
}

export const ConvenioTestimonials: React.FC<ConvenioTestimonialsProps> = ({
  testimonials,
  title,
  subtitle,
  agreementData,
}) => {
  const visibleTestimonials = testimonials
    .filter((t) => t.is_visible !== false)
    .slice(0, 3);

  if (visibleTestimonials.length === 0) return null;

  const convenioName = agreementData.institution_short_name || agreementData.institution_name || '';
  const resolvedSubtitle = subtitle
    ?.replace('{convenioName}', convenioName)
    ?.replace('{institutionName}', convenioName);

  return (
    <section className="py-16 sm:py-20 md:py-24 lg:py-28 bg-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {(title || resolvedSubtitle) && (
          <div className="text-center mb-10 sm:mb-14">
            {title && (
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 leading-tight text-[#1B2A4A] font-['Baloo_2',_sans-serif]">
                {title}
              </h2>
            )}
            {resolvedSubtitle && (
              <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto">
                {resolvedSubtitle}
              </p>
            )}
          </div>
        )}

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {visibleTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-xl p-6 sm:p-7 relative border border-neutral-200 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Quote icon */}
              <Quote
                className="absolute top-5 right-5 w-7 h-7 sm:w-8 sm:h-8 text-amber-400 opacity-60"
              />

              {/* Rating */}
              {testimonial.rating && testimonial.rating > 0 && (
                <div className="flex gap-0.5 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
              )}

              {/* Testimonial text */}
              <p className="text-sm sm:text-base text-neutral-700 mb-6 leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=4654CD&color=fff`}
                  alt={testimonial.name}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=4654CD&color=fff`;
                  }}
                />
                <div className="min-w-0">
                  <p className="font-semibold text-neutral-800 text-sm sm:text-base truncate">{testimonial.name}</p>
                  <p className="text-xs sm:text-sm text-neutral-500 truncate">{testimonial.institution}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ConvenioTestimonials;
