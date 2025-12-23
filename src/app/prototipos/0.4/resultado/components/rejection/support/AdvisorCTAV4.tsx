'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';

interface AdvisorCTAV4Props {
  onContact?: () => void;
}

/**
 * AdvisorCTAV4 - Chat Flotante / WhatsApp Animado
 */
export const AdvisorCTAV4: React.FC<AdvisorCTAV4Props> = ({ onContact }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-16 right-0 w-72 bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden"
          >
            <div className="bg-[#25D366] p-4 text-white">
              <p className="font-semibold">¿Necesitas ayuda?</p>
              <p className="text-sm text-white/80">Responderemos en minutos</p>
            </div>
            <div className="p-4">
              <p className="text-sm text-neutral-600 mb-3">
                Un asesor puede ayudarte a explorar opciones adicionales para tu caso.
              </p>
              <button
                onClick={() => {
                  onContact?.();
                  setIsExpanded(false);
                }}
                className="w-full bg-[#25D366] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-[#1fba59] transition-colors"
              >
                <Send className="w-4 h-4" />
                Iniciar conversación
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg cursor-pointer"
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};
