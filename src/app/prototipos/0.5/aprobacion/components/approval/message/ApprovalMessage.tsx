'use client';

/**
 * ApprovalMessage - Mensaje de felicitación
 * Versión fija para v0.5
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ApprovalData } from '../../../types/approval';

interface ApprovalMessageProps {
  data: ApprovalData;
}

export const ApprovalMessage: React.FC<ApprovalMessageProps> = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="text-center"
    >
      <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-2">
        ¡Felicidades {data.userName}!
      </h1>
      <p className="text-xl text-[#4654CD] font-semibold mb-3">
        Tu solicitud ha sido aprobada
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 rounded-full">
        <span className="text-sm text-neutral-500">Solicitud</span>
        <span className="text-sm font-mono font-semibold text-neutral-700">
          #{data.applicationId}
        </span>
      </div>
    </motion.div>
  );
};

export default ApprovalMessage;
