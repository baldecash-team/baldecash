'use client';

/**
 * ContactInfo - Información de contacto
 * Adapted from v0.5 for v0.6
 */

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, HelpCircle, Home, ArrowRight } from 'lucide-react';

interface ContactInfoProps {
  onGoToHome?: () => void;
}

export const ContactInfo: React.FC<ContactInfoProps> = ({ onGoToHome }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="space-y-4"
    >
      {/* Help section */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[rgba(var(--color-primary-rgb),0.1)] rounded-xl flex items-center justify-center flex-shrink-0">
          <HelpCircle className="w-5 h-5 text-[var(--color-primary)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-neutral-800 mb-0.5 text-sm sm:text-base">¿Tienes alguna duda?</p>
          <p className="text-xs sm:text-sm text-neutral-500 mb-3 break-words">
            Nuestro equipo está disponible para ayudarte con cualquier consulta sobre tu solicitud.
          </p>
          <a
            href="https://wa.link/osgxjf"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-semibold rounded-xl cursor-pointer transition-colors no-underline"
          >
            <MessageCircle className="w-4 h-4 flex-shrink-0" />
            <span className="break-words">Escríbenos por WhatsApp</span>
            <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
          </a>
        </div>
      </div>

      {/* Home CTA */}
      <button
        onClick={onGoToHome}
        className="w-full flex items-center justify-center gap-2 py-3 min-h-[44px] text-sm text-neutral-400 hover:text-neutral-600 cursor-pointer transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Volver al inicio</span>
      </button>
    </motion.div>
  );
};

export default ContactInfo;
