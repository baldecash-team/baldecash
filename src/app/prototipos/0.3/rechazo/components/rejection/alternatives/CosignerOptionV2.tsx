'use client';

/**
 * CosignerOptionV2 - Opción de aval sutil
 *
 * G.13 V2: Sutil, como una opción secundaria
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Link } from '@nextui-org/react';
import { Users, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

interface CosignerOptionV2Props {
  onSelectCosigner?: () => void;
}

export const CosignerOptionV2: React.FC<CosignerOptionV2Props> = ({
  onSelectCosigner,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-6"
    >
      <div className="border border-neutral-200 rounded-xl p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-neutral-400" />
            <span className="text-sm text-neutral-600">
              ¿Conoces a alguien que pueda ser tu aval?
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-neutral-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          )}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-neutral-200">
                <p className="text-sm text-neutral-500 mb-3">
                  Un aval puede ayudarte a acceder al financiamiento. Solo
                  necesitas que tenga buen historial crediticio.
                </p>

                <div className="flex items-center justify-between">
                  <Link
                    href="#"
                    className="text-xs text-[#4654CD] underline"
                  >
                    ¿Qué es un aval?
                  </Link>

                  <Button
                    size="sm"
                    variant="bordered"
                    className="border-[#4654CD] text-[#4654CD]"
                    endContent={<ArrowRight className="w-3 h-3" />}
                    onPress={onSelectCosigner}
                  >
                    Agregar aval
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CosignerOptionV2;
