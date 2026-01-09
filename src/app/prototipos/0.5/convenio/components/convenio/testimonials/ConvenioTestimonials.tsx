'use client';

/**
 * ConvenioTestimonials - Cards Grid 3 columnas (basado en V1)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { ConvenioData } from '../../../types/convenio';
import { getTestimoniosByConvenio } from '../../../data/mockConvenioData';

interface ConvenioTestimonialsProps {
  convenio: ConvenioData;
}

export const ConvenioTestimonials: React.FC<ConvenioTestimonialsProps> = ({ convenio }) => {
  const testimonios = getTestimoniosByConvenio(convenio.slug);

  // If no testimonials for this convenio, show generic ones
  const displayTestimonios = testimonios.length > 0 ? testimonios.slice(0, 3) : [
    {
      id: 'generic-1',
      nombre: 'Estudiante',
      carrera: convenio.tipo === 'universidad' ? 'Ingeniería' : 'Carrera Técnica',
      universidad: convenio.slug,
      testimonio: `Excelente experiencia con el convenio ${convenio.nombreCorto}. El proceso fue rápido y el descuento me ayudó mucho.`,
      foto: 'https://randomuser.me/api/portraits/men/1.jpg',
      rating: 5,
    },
  ];

  return (
    <section id="testimonios" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4 font-['Baloo_2']"
            style={{ color: convenio.colorPrimario }}
          >
            Lo que dicen nuestros estudiantes
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Más de 500 estudiantes de {convenio.nombreCorto} ya financiaron su equipo con nosotros.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayTestimonios.map((testimonio, index) => (
            <motion.div
              key={testimonio.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-neutral-50 rounded-2xl p-6 relative"
            >
              {/* Quote icon */}
              <Quote
                className="absolute top-4 right-4 w-8 h-8 opacity-10"
                style={{ color: convenio.colorPrimario }}
              />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonio.rating || 5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Testimonial text */}
              <p className="text-neutral-700 mb-6 leading-relaxed">
                &ldquo;{testimonio.testimonio}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={testimonio.foto || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                  alt={testimonio.nombre}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-neutral-800">{testimonio.nombre}</p>
                  <p className="text-sm text-neutral-500">{testimonio.carrera}</p>
                </div>
              </div>

              {/* Equipment purchased */}
              {testimonio.equipoComprado && (
                <div
                  className="mt-4 pt-4 border-t border-neutral-200 text-sm"
                  style={{ color: convenio.colorPrimario }}
                >
                  Compró: {testimonio.equipoComprado}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ConvenioTestimonials;
