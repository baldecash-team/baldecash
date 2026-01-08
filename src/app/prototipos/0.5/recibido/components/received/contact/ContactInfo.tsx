'use client';

/**
 * ContactInfo - Información de contacto
 * Versión fija para v0.5
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { MessageCircle, HelpCircle, Home } from 'lucide-react';

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
      <div className="bg-neutral-50 rounded-xl p-4 flex items-start gap-3">
        <div className="w-10 h-10 bg-neutral-200 rounded-lg flex items-center justify-center flex-shrink-0">
          <HelpCircle className="w-5 h-5 text-neutral-600" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-neutral-800 mb-1">¿Tienes alguna duda?</p>
          <p className="text-sm text-neutral-600 mb-3">
            Nuestro equipo está disponible para ayudarte con cualquier consulta sobre tu solicitud.
          </p>
          <Button
            size="sm"
            className="bg-[#25D366] text-white font-semibold cursor-pointer"
            startContent={<MessageCircle className="w-4 h-4" />}
          >
            Escríbenos por WhatsApp
          </Button>
        </div>
      </div>

      {/* Home CTA */}
      <button
        onClick={onGoToHome}
        className="w-full flex items-center justify-center gap-2 py-3 text-sm text-neutral-500 hover:text-neutral-700 cursor-pointer transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Volver al inicio</span>
      </button>
    </motion.div>
  );
};

export default ContactInfo;
