'use client';

/**
 * SocialProofV5 - Testimonios con Logo
 *
 * Concepto: Testimonio de estudiante + logo de su universidad
 * Estilo: Rotacion automatica, quote + avatar + institucion
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { SocialProofProps } from '../../../types/hero';
import { UnderlinedText } from '../common/UnderlinedText';

const testimonials = [
  {
    id: 1,
    quote: 'Gracias a BaldeCash pude terminar mi tesis a tiempo. El proceso fue súper rápido.',
    name: 'Maria Garcia',
    institution: 'UPN',
    institutionLogo: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c972324b38a6a21133bad_2%20UPN%202.png',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    rating: 5,
  },
  {
    id: 2,
    quote: 'Nunca pensé que podría tener mi propia laptop. BaldeCash lo hizo posible.',
    name: 'Carlos Rodriguez',
    institution: 'UPC',
    institutionLogo: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c97232b703bfd964ee870_universidad-peruana-de-ciencias-aplicadas-upc-logo-B98C3A365C-seeklogo%201.png',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    rating: 5,
  },
  {
    id: 3,
    quote: 'El financiamiento me permitió concentrarme en mis estudios sin preocuparme.',
    name: 'Ana Torres',
    institution: 'SENATI',
    institutionLogo: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c97241f715c1e9ac6dfcb_4%20Senati%201.png',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    rating: 5,
  },
];

export const SocialProofV5: React.FC<SocialProofProps> = ({ data }) => {
  const [current, setCurrent] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const testimonial = testimonials[current];

  return (
    <section className="py-16 bg-[#4654CD]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Quote Icon */}
            <Quote className="w-12 h-12 text-white/30 mx-auto mb-6" />

            {/* Quote Text */}
            <p className="text-2xl md:text-3xl text-white font-medium leading-relaxed mb-8 max-w-2xl mx-auto">
              "{testimonial.quote}"
            </p>

            {/* Rating */}
            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>

            {/* Author */}
            <div className="flex items-center justify-center gap-4">
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-white/30"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div className="text-left">
                <p className="text-white font-semibold">{testimonial.name}</p>
                <div className="flex items-center gap-2">
                  <img
                    src={testimonial.institutionLogo}
                    alt={testimonial.institution}
                    className="h-4 object-contain"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <span className="text-white/70 text-sm">{testimonial.institution}</span>
                </div>
              </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    current === index
                      ? 'bg-white w-6'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default SocialProofV5;
