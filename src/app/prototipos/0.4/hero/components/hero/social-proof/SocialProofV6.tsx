'use client';

/**
 * SocialProofV6 - Mapa de Perú
 *
 * Concepto: Visual geográfico con puntos por región
 * Estilo: Mapa SVG simplificado, hover muestra instituciones
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Building, Users, Award } from 'lucide-react';
import { SocialProofProps } from '../../../types/hero';

const regions = [
  { id: 'lima', name: 'Lima', x: 28, y: 52, count: 18, institutions: ['UPN', 'UPC', 'UCAL', 'ISIL'] },
  { id: 'arequipa', name: 'Arequipa', x: 35, y: 80, count: 4, institutions: ['UNSA', 'UCSP'] },
  { id: 'trujillo', name: 'La Libertad', x: 24, y: 32, count: 3, institutions: ['UPN Trujillo', 'UCV'] },
  { id: 'cusco', name: 'Cusco', x: 52, y: 68, count: 2, institutions: ['UNSAAC'] },
  { id: 'piura', name: 'Piura', x: 18, y: 22, count: 2, institutions: ['UNP', 'UDEP'] },
  { id: 'junin', name: 'Junín', x: 40, y: 50, count: 2, institutions: ['UNCP'] },
];

export const SocialProofV6: React.FC<SocialProofProps> = ({ data }) => {
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  return (
    <section className="py-16 bg-gradient-to-b from-neutral-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2 font-['Baloo_2']">
            Presencia a nivel nacional
          </h2>
          <p className="text-neutral-600">
            +{data.institutionCount} convenios educativos en todo el Perú
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Peru Map */}
          <div className="relative">
            <div className="relative w-full aspect-[3/4]">
              {/* Peru SVG Map */}
              <svg
                viewBox="0 0 100 130"
                className="w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Peru simplified shape */}
                <path
                  d="M15 5 L30 3 L40 8 L50 5 L55 10 L58 20 L55 30 L60 35 L65 40 L70 45 L75 55 L80 60 L82 70 L78 80 L75 90 L70 100 L60 105 L50 110 L45 115 L35 118 L25 115 L20 105 L18 95 L15 85 L12 75 L10 65 L8 55 L10 45 L12 35 L15 25 L18 15 L15 5 Z"
                  fill="#E8EDFF"
                  stroke="#4654CD"
                  strokeWidth="0.5"
                  className="drop-shadow-sm"
                />
                {/* Department borders */}
                <path
                  d="M25 35 L35 30 L45 35 L50 45 M30 50 L40 55 L50 50 M25 70 L35 75 L45 70 L55 75"
                  fill="none"
                  stroke="#4654CD"
                  strokeWidth="0.3"
                  strokeDasharray="2,2"
                  opacity="0.3"
                />
              </svg>

              {/* Region markers */}
              {regions.map((region) => (
                <motion.div
                  key={region.id}
                  className="absolute cursor-pointer z-10"
                  style={{ left: `${region.x}%`, top: `${region.y}%` }}
                  onHoverStart={() => setActiveRegion(region.id)}
                  onHoverEnd={() => setActiveRegion(null)}
                  whileHover={{ scale: 1.3 }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * regions.indexOf(region) }}
                >
                  <div
                    className={`relative w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center transition-all shadow-lg ${
                      activeRegion === region.id
                        ? 'bg-[#4654CD] text-white shadow-[#4654CD]/40'
                        : 'bg-white text-[#4654CD] border-2 border-[#4654CD]/20'
                    }`}
                  >
                    <MapPin className="w-5 h-5" />
                    {/* Count badge */}
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#03DBD0] text-neutral-900 text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                      {region.count}
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Tooltip */}
              {activeRegion && (
                <motion.div
                  className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl shadow-xl p-5 border border-neutral-100 z-20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {regions.filter((r) => r.id === activeRegion).map((region) => (
                    <div key={region.id}>
                      <p className="font-bold text-neutral-900 text-lg">{region.name}</p>
                      <p className="text-sm text-[#4654CD] font-medium mb-2">
                        {region.count} instituciones
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {region.institutions.map((inst) => (
                          <span
                            key={inst}
                            className="px-2 py-1 bg-[#4654CD]/10 text-[#4654CD] text-xs rounded-full font-medium"
                          >
                            {inst}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-6">
            <motion.div
              className="p-6 bg-white rounded-2xl shadow-lg border border-neutral-100"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
                  <Building className="w-7 h-7 text-[#4654CD]" />
                </div>
                <div>
                  <p className="text-4xl font-bold text-[#4654CD]">{data.institutionCount}+</p>
                  <p className="text-neutral-600">Instituciones con convenio</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="p-6 bg-white rounded-2xl shadow-lg border border-neutral-100"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-[#03DBD0]/10 flex items-center justify-center">
                  <Users className="w-7 h-7 text-[#03DBD0]" />
                </div>
                <div>
                  <p className="text-4xl font-bold text-[#03DBD0]">{data.studentCount.toLocaleString()}+</p>
                  <p className="text-neutral-600">Estudiantes financiados</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="p-6 bg-white rounded-2xl shadow-lg border border-neutral-100"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-[#22c55e]/10 flex items-center justify-center">
                  <Award className="w-7 h-7 text-[#22c55e]" />
                </div>
                <div>
                  <p className="text-4xl font-bold text-[#22c55e]">24</p>
                  <p className="text-neutral-600">Departamentos con presencia</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProofV6;
