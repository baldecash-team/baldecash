'use client';

/**
 * RegaloBaldecash — bloque «BaldeCash te regala …» de la confirmación.
 *
 * Aparece solo cuando la solicitud trae un accesorio con
 * `gift_source = "regalo_dinet"` (ver `regaloBaldecash.ts`). Ese accesorio ya
 * no figura en el acordeón «Accesorios» del resumen: se anuncia acá.
 */

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { REGALO_BALDECASH_TEXTOS, type RegaloBaldecash as Regalo } from '../../../regaloBaldecash';

interface RegaloBaldecashProps {
  regalo: Regalo;
}

export const RegaloBaldecash: React.FC<RegaloBaldecashProps> = ({ regalo }) => {
  return (
    <motion.div
      role="region"
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.4, type: 'spring', stiffness: 220, damping: 22 }}
      aria-label={`${REGALO_BALDECASH_TEXTOS.titulo} ${regalo.name}`}
      data-testid="regalo-baldecash"
      className="mb-6 sm:mb-8 rounded-2xl border-2 border-[var(--color-primary)] bg-white shadow-md overflow-hidden"
    >
      <div className="bg-[var(--color-primary)]/5 p-4 sm:p-5 flex items-center gap-4">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white border border-[var(--color-primary)]/10 flex items-center justify-center overflow-hidden flex-shrink-0">
          {regalo.image ? (
            <Image
              src={regalo.image}
              alt={regalo.name}
              width={96}
              height={96}
              className="object-contain w-full h-full p-1"
            />
          ) : (
            <Gift className="w-10 h-10 text-[var(--color-primary)]" aria-hidden />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm sm:text-base font-bold text-[var(--color-primary)] font-['Baloo_2',_sans-serif] leading-tight">
            {REGALO_BALDECASH_TEXTOS.titulo}
          </p>
          <p className="text-base sm:text-lg font-semibold text-neutral-800 break-words line-clamp-2 leading-snug mt-0.5">
            {regalo.name}
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs sm:text-sm font-bold">
              {REGALO_BALDECASH_TEXTOS.etiquetaPrecio}
            </span>
            <span className="text-xs text-neutral-500 break-words">
              {REGALO_BALDECASH_TEXTOS.detalle}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RegaloBaldecash;
