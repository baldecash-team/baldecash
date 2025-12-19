'use client';

/**
 * SocialProofV10 - Filtrable por Tipo
 *
 * Concepto: Tabs para filtrar Universidades | Institutos | Todos
 * Estilo: Grid que filtra en tiempo real
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, Tab } from '@nextui-org/react';
import { SocialProofProps } from '../../../types/hero';
import { conveniosLogos, getUniversidades, getInstitutos } from '@/app/prototipos/_shared/data/conveniosLogos';

type FilterType = 'all' | 'universidad' | 'instituto';

export const SocialProofV10: React.FC<SocialProofProps> = ({ data }) => {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredLogos = useMemo(() => {
    switch (filter) {
      case 'universidad':
        return getUniversidades();
      case 'instituto':
        return getInstitutos();
      default:
        return conveniosLogos;
    }
  }, [filter]);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Instituciones con convenio
          </h2>
          <p className="text-neutral-600">
            +{data.institutionCount} aliados en todo el Peru
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <Tabs
            selectedKey={filter}
            onSelectionChange={(key) => setFilter(key as FilterType)}
            classNames={{
              tabList: 'bg-neutral-100 p-1 rounded-xl',
              tab: 'px-6 py-2 text-sm font-medium',
              cursor: 'bg-white shadow-sm rounded-lg',
              tabContent: 'group-data-[selected=true]:text-[#4654CD]',
            }}
          >
            <Tab key="all" title={`Todos (${conveniosLogos.length})`} />
            <Tab key="universidad" title={`Universidades (${getUniversidades().length})`} />
            <Tab key="instituto" title={`Institutos (${getInstitutos().length})`} />
          </Tabs>
        </div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4"
          layout
        >
          <AnimatePresence mode="popLayout">
            {filteredLogos.map((logo) => (
              <motion.div
                key={logo.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="bg-neutral-50 rounded-xl p-4 hover:bg-neutral-100 transition-colors group"
              >
                <div className="h-12 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all">
                  <img
                    src={logo.url}
                    alt={logo.name}
                    className="max-h-10 max-w-full object-contain"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
                <p className="text-center text-neutral-500 text-xs mt-2 truncate">
                  {logo.shortName}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Count */}
        <p className="text-center text-neutral-500 text-sm mt-8">
          Mostrando {filteredLogos.length} de {conveniosLogos.length} instituciones
        </p>
      </div>
    </section>
  );
};

export default SocialProofV10;
