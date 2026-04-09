'use client';

import { motion } from 'framer-motion';
import {
  Cpu,
  CircuitBoard,
  HardDrive,
  Monitor,
  Battery,
  Cable,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { specItems } from '../../../data/mockMacbookNeoData';
import type { SpecItem } from '../../../types/macbook-neo';

const iconMap: Record<string, LucideIcon> = {
  Cpu,
  MemoryStick: CircuitBoard,
  HardDrive,
  Monitor,
  BatteryFull: Battery,
  Usb: Cable,
};

export function SpecsSection() {
  return (
    <section className="py-20 md:py-32 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0 }}
          className="font-['Baloo_2'] text-3xl md:text-4xl font-bold text-neutral-900 text-center mb-12"
        >
          Especificaciones técnicas
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {specItems.map((spec: SpecItem, index: number) => {
            const Icon = iconMap[spec.icon] ?? Cpu;
            return (
              <motion.div
                key={spec.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white border border-neutral-200 shadow-sm rounded-xl p-5 flex flex-col gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-[#4654CD]/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#4654CD]" />
                </div>

                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
                    {spec.label}
                  </p>
                  <p className="text-lg font-bold text-neutral-900 leading-tight">
                    {spec.value}
                  </p>
                  {spec.description && (
                    <p className="text-xs text-neutral-400 mt-1">
                      {spec.description}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
