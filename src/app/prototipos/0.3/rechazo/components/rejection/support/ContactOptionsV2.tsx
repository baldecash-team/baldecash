'use client';

/**
 * ContactOptionsV2 - Un solo canal de contacto principal
 *
 * G.17 V2: Un solo canal principal (WhatsApp)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@nextui-org/react';
import { MessageCircle, ExternalLink } from 'lucide-react';

interface ContactOptionsV2Props {
  onContactWhatsApp?: () => void;
}

export const ContactOptionsV2: React.FC<ContactOptionsV2Props> = ({
  onContactWhatsApp,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-6"
    >
      <div className="bg-neutral-50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-800">
                ¿Necesitas ayuda?
              </p>
              <p className="text-xs text-neutral-500">
                Escríbenos por WhatsApp
              </p>
            </div>
          </div>

          <Button
            size="sm"
            className="bg-green-500 text-white"
            endContent={<ExternalLink className="w-3 h-3" />}
            onPress={onContactWhatsApp}
          >
            Abrir chat
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ContactOptionsV2;
