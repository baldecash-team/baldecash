'use client';

/**
 * ApprovalMessageV2 - Mensaje celebratorio con mas enfasis
 *
 * F.4: Mensaje celebratorio
 * F.5: Personalizado con nombre
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { ApprovalData } from '../../../types/approval';

interface ApprovalMessageV2Props {
  data: ApprovalData;
}

export const ApprovalMessageV2: React.FC<ApprovalMessageV2Props> = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="text-center"
    >
      {/* Celebratory header with sparkles */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4, type: 'spring' }}
        className="flex items-center justify-center gap-2 mb-4"
      >
        <Sparkles className="w-6 h-6 text-amber-400" />
        <span className="text-lg font-medium text-amber-600 uppercase tracking-wider">
          Lo lograste
        </span>
        <Sparkles className="w-6 h-6 text-amber-400" />
      </motion.div>

      <h1 className="text-4xl md:text-5xl font-bold mb-3">
        <span className="bg-gradient-to-r from-[#4654CD] to-purple-600 bg-clip-text text-transparent">
          Felicidades {data.userName}!
        </span>
      </h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-2"
      >
        <p className="text-xl text-neutral-700">
          Tu solicitud de financiamiento fue{' '}
          <span className="font-bold text-green-600">APROBADA</span>
        </p>
        <p className="text-sm text-neutral-500">
          Estas a un paso de tener tu nueva laptop
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#4654CD]/10 to-purple-100 rounded-full border border-[#4654CD]/20"
      >
        <span className="text-sm text-neutral-600">N de solicitud:</span>
        <span className="text-sm font-mono font-bold text-[#4654CD]">
          {data.applicationId}
        </span>
      </motion.div>
    </motion.div>
  );
};

export default ApprovalMessageV2;
