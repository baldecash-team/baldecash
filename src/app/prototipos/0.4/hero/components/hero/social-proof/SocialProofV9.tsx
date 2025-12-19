'use client';

/**
 * SocialProofV9 - Video Testimonial
 *
 * Concepto: Thumbnail de video con play button overlay
 * Estilo: Quote debajo, estilo YouTube/Vimeo
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, X, Quote } from 'lucide-react';
import { Button, Modal, ModalContent, ModalBody } from '@nextui-org/react';
import { SocialProofProps } from '../../../types/hero';

export const SocialProofV9: React.FC<SocialProofProps> = ({ data }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="py-16 bg-neutral-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Video Thumbnail */}
          <motion.div
            className="relative rounded-2xl overflow-hidden cursor-pointer group"
            onClick={() => setIsModalOpen(true)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Thumbnail */}
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
              alt="Video testimonial"
              className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />

            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-8 h-8 text-[#4654CD] ml-1" />
              </motion.div>
            </div>

            {/* Duration badge */}
            <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/70 rounded text-white text-sm">
              2:45
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Quote className="w-12 h-12 text-[#4654CD] mb-6" />
            <p className="text-2xl text-white leading-relaxed mb-8">
              "Antes de BaldeCash, tenia que usar la computadora de la biblioteca.
              Ahora puedo estudiar desde cualquier lugar. Es increible."
            </p>

            {/* Author */}
            <div className="flex items-center gap-4 mb-8">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                alt="Estudiante"
                className="w-14 h-14 rounded-full object-cover"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div>
                <p className="text-white font-semibold">Maria Garcia</p>
                <p className="text-neutral-400 text-sm">Estudiante de Ingenieria - UPN</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-8">
              <div>
                <p className="text-3xl font-bold text-[#4654CD]">{data.studentCount.toLocaleString()}+</p>
                <p className="text-neutral-400 text-sm">Historias como esta</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#03DBD0]">98%</p>
                <p className="text-neutral-400 text-sm">Satisfaccion</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Video Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="4xl"
        backdrop="blur"
        classNames={{
          base: 'bg-transparent shadow-none',
          backdrop: 'bg-black/80',
          closeButton: 'text-white hover:bg-white/20',
        }}
      >
        <ModalContent>
          <ModalBody className="p-0">
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
              <p className="text-white/50">Video placeholder</p>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </section>
  );
};

export default SocialProofV9;
