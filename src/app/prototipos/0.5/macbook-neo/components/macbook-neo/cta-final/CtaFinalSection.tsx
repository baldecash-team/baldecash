'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@nextui-org/react';
import { ArrowRight, MessageCircle } from 'lucide-react';

export function CtaFinalSection() {
  return (
    <section className="py-20 md:py-32 bg-neutral-50">
      <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
        {/* Fan image of 4 MacBooks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0 }}
          className="relative w-full max-w-3xl mx-auto mb-12"
        >
          <Image
            src="/images/macbook-neo/design_endframe_2x.png"
            alt="MacBook Neo en cuatro colores"
            width={1200}
            height={600}
            className="w-full h-auto object-contain"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="font-['Baloo_2'] text-3xl md:text-4xl font-bold text-neutral-900 mb-4"
        >
          Empieza tu camino con MacBook Neo
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-lg text-neutral-500 mb-10 max-w-md"
        >
          Financia tu equipo ideal con las mejores condiciones para estudiantes.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 items-center"
        >
          <Button
            className="bg-[#4654CD] text-white font-semibold cursor-pointer"
            size="lg"
            radius="sm"
            endContent={<ArrowRight className="w-4 h-4" />}
          >
            Ver catálogo
          </Button>

          <Button
            className="border border-[#4654CD] text-[#4654CD] bg-white font-semibold cursor-pointer"
            size="lg"
            radius="sm"
            variant="bordered"
            endContent={<MessageCircle className="w-4 h-4" />}
          >
            Hablar con un asesor
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
