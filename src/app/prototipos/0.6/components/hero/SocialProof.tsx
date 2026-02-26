'use client';

/**
 * SocialProof - Convenios + Testimonios Combinado (basado en V1 de 0.4)
 * Logos en marquee + Carrusel de testimonios
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chip, Button } from '@nextui-org/react';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Star,
  Quote,
} from 'lucide-react';
import { SocialProofProps, Testimonial } from '../../types/hero';
import { UnderlinedText } from './common/UnderlinedText';

interface ExtendedSocialProofProps extends SocialProofProps {
  testimonials?: Testimonial[];
  testimonialsTitle?: string;
}

export const SocialProof: React.FC<ExtendedSocialProofProps> = ({ data, testimonials = [], testimonialsTitle, underlineStyle = 4 }) => {
  // Filtrar instituciones activas y testimonios visibles
  const activeInstitutions = data.institutions.filter((inst) => inst.is_active !== false);
  const visibleTestimonials = testimonials.filter((t) => t.is_visible !== false);

  // Usar instituciones desde API (data.institutions tiene logo_url)
  // Filtrar instituciones sin logo para evitar src=""
  const logos = activeInstitutions
    .filter((inst) => inst.logo)
    .map((inst, idx) => ({
      id: idx + 1,
      name: inst.name,
      url: inst.logo,
    }));

  // Renderizar título con palabra destacada
  const renderTitle = () => {
    const template = data.titleTemplate || '';
    const highlightWord = data.highlightWord || '';

    // Reemplazar {institutionCount} con el valor real
    const withCount = template.replace('{institutionCount}', data.institutionCount.toString());

    // Dividir por {highlightWord} para insertar el componente UnderlinedText
    const parts = withCount.split('{highlightWord}');

    if (parts.length === 2) {
      return (
        <>
          {parts[0]}
          <UnderlinedText style={underlineStyle} color="primary">
            {highlightWord}
          </UnderlinedText>
          {parts[1]}
        </>
      );
    }

    // Fallback si no hay placeholder
    return withCount;
  };

  const [page, setPage] = useState(0);
  const testimonialsPerPage = 2;
  const totalPages = Math.ceil(visibleTestimonials.length / testimonialsPerPage) || 1;

  const paginatedTestimonials = visibleTestimonials.slice(
    page * testimonialsPerPage,
    (page + 1) * testimonialsPerPage
  );

  const nextPage = () => setPage((prev) => (prev + 1) % totalPages);
  const prevPage = () => setPage((prev) => (prev - 1 + totalPages) % totalPages);

  const getInstitutionLogo = (institutionCode: string) => {
    const institution = data.institutions.find((inst) => inst.code === institutionCode);
    return institution?.logo || '';
  };

  return (
    <section className="py-12 bg-gradient-to-b from-neutral-50 to-white overflow-hidden">
      {/* Header Convenios */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Chip
              startContent={<Building2 className="w-3.5 h-3.5" />}
              classNames={{
                base: 'px-4 py-2 h-auto',
                content: 'text-sm font-medium',
              }}
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-primary, #4654CD) 10%, transparent)',
                color: 'var(--color-primary, #4654CD)',
              }}
            >
              {data.chipText || ''}
            </Chip>
          </div>

          <h3 className="text-2xl md:text-3xl font-bold text-neutral-800 font-['Baloo_2'] mb-3">
            {renderTitle()}
          </h3>

          <p className="text-neutral-500 max-w-xl mx-auto">
            {data.subtitle || ''}
          </p>
        </motion.div>
      </div>

      {/* Marquee Container */}
      <div className="relative w-full mb-12 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

        <div className="flex hover:[animation-play-state:paused] group">
          {/* Primer set de logos */}
          <div className="flex animate-marquee group-hover:[animation-play-state:paused]">
            {logos.map((logo, index) => (
              <div
                key={`a-${logo.id}-${index}`}
                className="flex-shrink-0 h-14 w-24 md:w-32 mx-3 md:mx-6 flex items-center justify-center grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300 cursor-pointer"
              >
                <img
                  src={logo.url}
                  alt={logo.name}
                  className="max-h-8 md:max-h-10 max-w-20 md:max-w-28 object-contain"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>
          {/* Segundo set de logos (duplicado para loop infinito) */}
          <div className="flex animate-marquee group-hover:[animation-play-state:paused]">
            {logos.map((logo, index) => (
              <div
                key={`b-${logo.id}-${index}`}
                className="flex-shrink-0 h-14 w-24 md:w-32 mx-3 md:mx-6 flex items-center justify-center grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300 cursor-pointer"
              >
                <img
                  src={logo.url}
                  alt={logo.name}
                  className="max-h-8 md:max-h-10 max-w-20 md:max-w-28 object-contain"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonios - Solo mostrar si hay testimonials visibles */}
      {visibleTestimonials.length > 0 && (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h3 className="text-xl md:text-2xl font-bold text-neutral-800 font-['Baloo_2'] mb-2">
            {testimonialsTitle || ''}
          </h3>
          <p className="text-neutral-500 text-sm">
            {(data.testimonialsSubtitle || '')
              .replace('{studentCount}', data.studentCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','))}
          </p>
        </div>

        <div className="relative">
          <Button
            isIconOnly
            radius="full"
            variant="flat"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 bg-white shadow-md border border-neutral-100 cursor-pointer hover:bg-neutral-50 hidden md:flex"
            onPress={prevPage}
          >
            <ChevronLeft className="w-4 h-4 text-neutral-600" />
          </Button>

          <Button
            isIconOnly
            radius="full"
            variant="flat"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 bg-white shadow-md border border-neutral-100 cursor-pointer hover:bg-neutral-50 hidden md:flex"
            onPress={nextPage}
          >
            <ChevronRight className="w-4 h-4 text-neutral-600" />
          </Button>

          <div className="overflow-hidden px-4 md:px-12 py-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 -mx-1"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25 }}
              >
                {paginatedTestimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="bg-white rounded-xl p-5 shadow-md border border-neutral-100 hover:shadow-lg transition-all"
                    style={{
                      ['--hover-border' as string]: 'color-mix(in srgb, var(--color-primary, #4654CD) 20%, transparent)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--color-primary, #4654CD) 20%, transparent)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = ''}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <Quote className="w-6 h-6" style={{ color: 'color-mix(in srgb, var(--color-primary, #4654CD) 20%, transparent)' }} />
                      {getInstitutionLogo(testimonial.institution) && (
                        <div
                          className="w-14 h-8 rounded-lg p-1.5 flex items-center justify-center"
                          style={{
                            backgroundColor: 'color-mix(in srgb, var(--color-primary, #4654CD) 5%, transparent)',
                            borderWidth: '1px',
                            borderColor: 'color-mix(in srgb, var(--color-primary, #4654CD) 10%, transparent)',
                          }}
                        >
                          <img
                            src={getInstitutionLogo(testimonial.institution)}
                            alt={testimonial.institution}
                            className="max-h-5 max-w-10 object-contain"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <p className="text-neutral-700 text-base leading-relaxed mb-4 line-clamp-3">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>

                    <div className="flex items-center gap-3">
                      <img
                        src={testimonial.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=4654CD&color=fff`}
                        alt={testimonial.name}
                        className="w-10 h-10 rounded-full object-cover ring-2"
                        style={{ ['--tw-ring-color' as string]: 'color-mix(in srgb, var(--color-primary, #4654CD) 10%, transparent)' }}
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=4654CD&color=fff`;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-neutral-800 text-sm truncate">
                          {testimonial.name}
                        </p>
                        <p className="text-xs font-medium truncate" style={{ color: 'var(--color-primary, #4654CD)' }}>
                          {testimonial.institution}
                        </p>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-[#f59e0b] text-[#f59e0b]" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center gap-1.5 mt-6">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setPage(index)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  page === index ? 'w-6' : 'bg-neutral-300 hover:bg-neutral-400 w-2'
                }`}
                style={page === index ? { backgroundColor: 'var(--color-primary, #4654CD)' } : undefined}
              />
            ))}
          </div>

          <div className="flex justify-center gap-3 mt-4 md:hidden">
            <Button
              isIconOnly
              size="sm"
              radius="full"
              variant="flat"
              className="bg-white shadow-sm border border-neutral-100 cursor-pointer"
              onPress={prevPage}
            >
              <ChevronLeft className="w-4 h-4 text-neutral-600" />
            </Button>
            <Button
              isIconOnly
              size="sm"
              radius="full"
              variant="flat"
              className="bg-white shadow-sm border border-neutral-100 cursor-pointer"
              onPress={nextPage}
            >
              <ChevronRight className="w-4 h-4 text-neutral-600" />
            </Button>
          </div>
        </div>
      </div>
      )}

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
        @media (max-width: 768px) {
          .animate-marquee {
            animation: marquee 45s linear infinite;
          }
        }
      `}</style>
    </section>
  );
};

export default SocialProof;
