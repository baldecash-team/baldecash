// AccessoryLimitV6 - Alert Grande: Warning prominente si sube mucho
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Info } from 'lucide-react';

interface AccessoryLimitProps {
  selected: number;
  max?: number;
  monthlyIncrease?: number;
  className?: string;
}

export const AccessoryLimitV6: React.FC<AccessoryLimitProps> = ({
  selected,
  max = 3,
  monthlyIncrease = 0,
  className = '',
}) => {
  const isAtLimit = selected >= max;
  const isHighIncrease = monthlyIncrease > 15;

  return (
    <AnimatePresence>
      {(isAtLimit || isHighIncrease) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`p-4 rounded-xl ${
            isAtLimit
              ? 'bg-amber-50 border border-amber-200'
              : 'bg-[#4654CD]/5 border border-[#4654CD]/20'
          } ${className}`}
        >
          <div className="flex items-start gap-3">
            {isAtLimit ? (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-[#4654CD] shrink-0" />
            )}
            <div>
              <p className={`font-medium ${isAtLimit ? 'text-amber-800' : 'text-[#4654CD]'}`}>
                {isAtLimit
                  ? 'Has alcanzado el límite de accesorios'
                  : `Tu cuota aumentará S/${monthlyIncrease}/mes`}
              </p>
              <p className={`text-sm ${isAtLimit ? 'text-amber-600' : 'text-neutral-500'}`}>
                {isAtLimit
                  ? `Puedes agregar máximo ${max} accesorios a tu compra`
                  : 'Considera si realmente necesitas todos estos accesorios'}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AccessoryLimitV6;
