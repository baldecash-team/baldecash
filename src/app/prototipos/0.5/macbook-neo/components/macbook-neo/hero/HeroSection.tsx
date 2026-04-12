'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button, Chip } from '@nextui-org/react';
import { heroData } from '../../../data/mockMacbookNeoData';
import { formatMoney } from '../../../../utils/formatMoney';

export function HeroSection() {
  return (
    <section className="relative min-h-screen bg-white flex flex-col md:flex-row overflow-hidden">
      {/* Mobile: image on top / Desktop: image right */}
      <div className="order-first md:order-last md:w-[60%] relative h-64 md:h-screen">
        <Image
          src={heroData.heroImage}
          alt="MacBook Neo hero"
          fill
          priority
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 60vw"
        />
      </div>

      {/* Text content */}
      <div className="order-last md:order-first md:w-[40%] flex flex-col justify-center px-6 py-12 md:px-12 md:py-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0 }}
        >
          <Chip
            className="mb-4 bg-[#4654CD]/10 text-[#4654CD] font-medium"
            size="sm"
            radius="sm"
          >
            {heroData.badge}
          </Chip>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="font-['Baloo_2'] text-5xl md:text-7xl font-extrabold text-neutral-900 leading-tight mb-4"
        >
          {heroData.headline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-xl text-neutral-500 mb-6 max-w-sm"
        >
          {heroData.subheadline}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-2xl font-bold text-[#4654CD] mb-8"
        >
          Desde S/{formatMoney(heroData.cuotaDesde)}/mes
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Button
            as="a"
            href="#financiamiento"
            className="bg-[#4654CD] text-white font-semibold cursor-pointer w-fit"
            size="lg"
            radius="sm"
          >
            Ver planes de financiamiento
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
