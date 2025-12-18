'use client';

/**
 * AdvisorCTAV2 - Link sutil para contactar asesor
 *
 * G.16 V2: Sutil como enlace secundario
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@nextui-org/react';
import { HelpCircle, ArrowRight } from 'lucide-react';

interface AdvisorCTAV2Props {
  onContactAdvisor?: () => void;
}

export const AdvisorCTAV2: React.FC<AdvisorCTAV2Props> = ({
  onContactAdvisor,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-6"
    >
      <div className="flex items-center justify-center gap-2 py-3">
        <HelpCircle className="w-4 h-4 text-neutral-400" />
        <span className="text-sm text-neutral-500">¿Preguntas?</span>
        <Link
          href="#"
          className="text-sm text-[#4654CD] flex items-center gap-1"
          onPress={() => {
            onContactAdvisor?.();
          }}
        >
          Habla con un asesor
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  );
};

export default AdvisorCTAV2;
