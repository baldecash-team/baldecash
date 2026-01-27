'use client';

/**
 * HomeTestimonials v0.6 - Testimonios genéricos
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

interface HomeTestimonialsProps {
  primaryColor?: string;
}

const testimonios = [
  {
    id: '1',
    nombre: 'María García',
    carrera: 'Ing. de Sistemas - UPC',
    testimonio: 'El proceso fue súper rápido. En menos de 24 horas ya tenía mi laptop nueva. Las cuotas se ajustan perfecto a mi presupuesto de estudiante.',
    foto: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 5,
    equipoComprado: 'Lenovo IdeaPad 3',
  },
  {
    id: '2',
    nombre: 'Carlos Mendoza',
    carrera: 'Arquitectura - PUCP',
    testimonio: 'Necesitaba una laptop potente para mis renders y no tenía cómo pagarla de contado. BaldeCash me dio la solución perfecta sin pedirme aval.',
    foto: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 5,
    equipoComprado: 'ASUS VivoBook Pro',
  },
  {
    id: '3',
    nombre: 'Ana Flores',
    carrera: 'Medicina - USMP',
    testimonio: 'Estaba preocupada por no tener historial crediticio, pero igual me aprobaron. El equipo de atención fue muy amable y me explicaron todo.',
    foto: 'https://randomuser.me/api/portraits/women/68.jpg',
    rating: 5,
    equipoComprado: 'HP Pavilion 15',
  },
];

export const HomeTestimonials: React.FC<HomeTestimonialsProps> = ({ primaryColor = '#4654CD' }) => {
  return (
    <section id="testimonios" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4 font-['Baloo_2']"
            style={{ color: primaryColor }}
          >
            Lo que dicen nuestros estudiantes
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Más de 2,000 estudiantes ya financiaron su equipo con nosotros.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonios.map((testimonio, index) => (
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
                style={{ color: primaryColor }}
              />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonio.rating)].map((_, i) => (
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
                  src={testimonio.foto}
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
                  style={{ color: primaryColor }}
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

export default HomeTestimonials;
