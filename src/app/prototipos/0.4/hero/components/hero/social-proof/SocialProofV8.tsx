'use client';

/**
 * SocialProofV8 - Stats Cards
 *
 * Concepto: 3 cards grandes con metricas
 * Estilo: Iconos animados, numeros prominentes
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Laptop, Building, Clock, Users, Shield, Award } from 'lucide-react';
import { SocialProofProps } from '../../../types/hero';

const stats = [
  {
    icon: Laptop,
    value: '10,000+',
    label: 'Laptops financiadas',
    description: 'Equipos entregados a estudiantes en todo el Peru',
    color: 'bg-[#4654CD]',
    iconColor: 'text-white',
  },
  {
    icon: Building,
    value: '32+',
    label: 'Convenios activos',
    description: 'Instituciones educativas como aliados',
    color: 'bg-[#03DBD0]',
    iconColor: 'text-neutral-900',
  },
  {
    icon: Clock,
    value: '24h',
    label: 'Tiempo de aprobacion',
    description: 'Respuesta garantizada en un dia habil',
    color: 'bg-[#22c55e]',
    iconColor: 'text-white',
  },
];

const secondaryStats = [
  { icon: Users, value: '98%', label: 'Satisfaccion' },
  { icon: Shield, value: 'SBS', label: 'Regulados' },
  { icon: Award, value: '5', label: 'Anos' },
];

export const SocialProofV8: React.FC<SocialProofProps> = ({ data }) => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="relative overflow-hidden rounded-3xl p-8"
              style={{ backgroundColor: stat.color.replace('bg-', '') }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Background icon */}
              <div className="absolute -right-6 -bottom-6 opacity-10">
                <stat.icon className="w-40 h-40" />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl ${stat.color === 'bg-[#03DBD0]' ? 'bg-neutral-900/10' : 'bg-white/20'} flex items-center justify-center mb-6`}>
                  <stat.icon className={`w-7 h-7 ${stat.iconColor}`} />
                </div>
                <p className={`text-5xl font-bold ${stat.color === 'bg-[#03DBD0]' ? 'text-neutral-900' : 'text-white'}`}>
                  {stat.value}
                </p>
                <p className={`text-lg font-semibold mt-2 ${stat.color === 'bg-[#03DBD0]' ? 'text-neutral-900' : 'text-white'}`}>
                  {stat.label}
                </p>
                <p className={`text-sm mt-2 ${stat.color === 'bg-[#03DBD0]' ? 'text-neutral-700' : 'text-white/80'}`}>
                  {stat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Secondary Stats */}
        <div className="flex flex-wrap justify-center gap-8">
          {secondaryStats.map((stat, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            >
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-neutral-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-neutral-900">{stat.value}</p>
                <p className="text-sm text-neutral-500">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofV8;
