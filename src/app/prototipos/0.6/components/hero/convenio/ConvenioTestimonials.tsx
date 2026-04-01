'use client';

/**
 * ConvenioTestimonials - Cards Grid 3 columnas para convenio
 * Adaptado de v0.5 al sistema API-driven de v0.6
 * - Sin Framer Motion (opcional, usa CSS transitions)
 * - Colores via CSS variables
 * - Datos desde API (testimonials)
 */

import React from 'react';
import { Star, Quote } from 'lucide-react';
import type { Testimonial, AgreementData } from '../../../types/hero';

interface ConvenioTestimonialsProps {
  testimonials: Testimonial[];
  title?: string;
  agreementData: AgreementData;
}

export const ConvenioTestimonials: React.FC<ConvenioTestimonialsProps> = ({
  testimonials,
  title,
  agreementData,
}) => {
  const institutionShortName = agreementData.institution_short_name || agreementData.institution_name || '';
  const visibleTestimonials = testimonials
    .filter((t) => t.is_visible !== false)
    .slice(0, 3);

  if (visibleTestimonials.length === 0) return null;

  return (
    <section id="testimonios" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4 font-['Baloo_2']"
            style={{ color: 'var(--color-primary, #4654CD)' }}
          >
            {title || 'Lo que dicen nuestros estudiantes'}
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Estudiantes de {institutionShortName} ya financiaron su equipo con nosotros.
          </p>
        </div>

        {/* Testimonials Grid - 3 columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleTestimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="bg-neutral-50 rounded-2xl p-6 relative hover:shadow-md transition-shadow"
            >
              {/* Quote icon */}
              <Quote
                className="absolute top-4 right-4 w-8 h-8 opacity-10"
                style={{ color: 'var(--color-primary, #4654CD)' }}
              />

              {/* Rating */}
              {testimonial.rating && testimonial.rating > 0 && (
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
              )}

              {/* Testimonial text */}
              <p className="text-neutral-700 mb-6 leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=4654CD&color=fff`}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=4654CD&color=fff`;
                  }}
                />
                <div>
                  <p className="font-semibold text-neutral-800">{testimonial.name}</p>
                  <p className="text-sm text-neutral-500">{testimonial.institution}</p>
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
