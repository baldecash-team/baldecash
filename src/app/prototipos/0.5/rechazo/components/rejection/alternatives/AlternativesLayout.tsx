'use client';

/**
 * AlternativesLayout - Layout de alternativas
 * Versión fija para v0.5 - Estilo lista elegante
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Laptop, Wallet, Users, Calendar, ChevronRight } from 'lucide-react';
import { RejectionAlternative } from '../../../types/rejection';

interface AlternativesLayoutProps {
  alternatives: RejectionAlternative[];
  onSelect?: (alternative: RejectionAlternative) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Laptop: <Laptop className="w-4 h-4" />,
  Wallet: <Wallet className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
  Calendar: <Calendar className="w-4 h-4" />,
};

export const AlternativesLayout: React.FC<AlternativesLayoutProps> = ({
  alternatives,
  onSelect,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mb-8"
    >
      <h2 className="font-semibold text-lg text-neutral-800 mb-4">Opciones disponibles</h2>

      <ul className="space-y-3">
        {alternatives.map((alt, index) => (
          <motion.li
            key={alt.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
          >
            <button
              onClick={() => onSelect?.(alt)}
              className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors text-left cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 flex-shrink-0 group-hover:bg-[#4654CD]/10 group-hover:text-[#4654CD] transition-colors">
                {iconMap[alt.icon]}
              </div>
              <div className="flex-1">
                <p className="font-medium text-neutral-800 group-hover:text-[#4654CD] transition-colors">
                  {alt.title}
                </p>
                <p className="text-sm text-neutral-500">{alt.description}</p>
              </div>
              {alt.action && (
                <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-[#4654CD] transition-colors mt-1" />
              )}
            </button>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

export default AlternativesLayout;
