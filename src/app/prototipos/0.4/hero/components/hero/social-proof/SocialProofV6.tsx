'use client';

/**
 * SocialProofV6 - Mapa de Peru
 *
 * Concepto: Visual geografico con puntos por region
 * Estilo: Mapa simplificado, hover muestra instituciones
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { SocialProofProps } from '../../../types/hero';

const regions = [
  { id: 'lima', name: 'Lima', x: 25, y: 55, count: 18, institutions: ['UPN', 'UPC', 'UCAL', 'ISIL'] },
  { id: 'arequipa', name: 'Arequipa', x: 30, y: 75, count: 4, institutions: ['UNSA', 'UCSP'] },
  { id: 'trujillo', name: 'La Libertad', x: 22, y: 35, count: 3, institutions: ['UPN Trujillo', 'UCV'] },
  { id: 'cusco', name: 'Cusco', x: 45, y: 70, count: 2, institutions: ['UNSAAC'] },
  { id: 'piura', name: 'Piura', x: 15, y: 25, count: 2, institutions: ['UNP', 'UDEP'] },
  { id: 'junin', name: 'Junin', x: 38, y: 55, count: 2, institutions: ['UNCP'] },
];

export const SocialProofV6: React.FC<SocialProofProps> = ({ data }) => {
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Presencia a nivel nacional
          </h2>
          <p className="text-neutral-600">
            +{data.institutionCount} convenios en todo el Peru
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Map */}
          <div className="relative">
            {/* Peru shape simplified */}
            <div className="relative w-full aspect-[3/4] bg-neutral-100 rounded-3xl overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 bg-[#4654CD]/5" />

              {/* Region markers */}
              {regions.map((region) => (
                <motion.div
                  key={region.id}
                  className="absolute cursor-pointer"
                  style={{ left: `${region.x}%`, top: `${region.y}%` }}
                  onHoverStart={() => setActiveRegion(region.id)}
                  onHoverEnd={() => setActiveRegion(null)}
                  whileHover={{ scale: 1.2 }}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      activeRegion === region.id
                        ? 'bg-[#4654CD] text-white'
                        : 'bg-[#4654CD]/20 text-[#4654CD]'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                  </div>
                  {/* Count badge */}
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#03DBD0] text-neutral-900 text-xs font-bold rounded-full flex items-center justify-center">
                    {region.count}
                  </span>
                </motion.div>
              ))}

              {/* Tooltip */}
              {activeRegion && (
                <motion.div
                  className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-lg p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {regions.filter((r) => r.id === activeRegion).map((region) => (
                    <div key={region.id}>
                      <p className="font-semibold text-neutral-900">{region.name}</p>
                      <p className="text-sm text-neutral-500">
                        {region.institutions.join(', ')}
                      </p>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-6">
            <div className="p-6 bg-neutral-50 rounded-2xl">
              <p className="text-5xl font-bold text-[#4654CD]">{data.institutionCount}+</p>
              <p className="text-neutral-600 mt-1">Instituciones con convenio</p>
            </div>
            <div className="p-6 bg-neutral-50 rounded-2xl">
              <p className="text-5xl font-bold text-[#03DBD0]">{data.studentCount.toLocaleString()}+</p>
              <p className="text-neutral-600 mt-1">Estudiantes financiados</p>
            </div>
            <div className="p-6 bg-neutral-50 rounded-2xl">
              <p className="text-5xl font-bold text-[#22c55e]">24</p>
              <p className="text-neutral-600 mt-1">Departamentos con presencia</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProofV6;
