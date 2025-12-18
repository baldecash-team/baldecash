'use client';

/**
 * ContactOptionsV1 - Múltiples canales de contacto
 *
 * G.17 V1: Múltiples opciones (WhatsApp, email, teléfono)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody, Button } from '@nextui-org/react';
import { MessageCircle, Mail, Phone, ExternalLink } from 'lucide-react';

interface ContactOptionsV1Props {
  onContactWhatsApp?: () => void;
  onContactEmail?: () => void;
  onContactPhone?: () => void;
}

export const ContactOptionsV1: React.FC<ContactOptionsV1Props> = ({
  onContactWhatsApp,
  onContactEmail,
  onContactPhone,
}) => {
  const contactOptions = [
    {
      icon: <MessageCircle className="w-5 h-5" />,
      label: 'WhatsApp',
      description: 'Respuesta inmediata',
      color: 'bg-green-500',
      action: onContactWhatsApp,
    },
    {
      icon: <Mail className="w-5 h-5" />,
      label: 'Email',
      description: 'soporte@baldecash.com',
      color: 'bg-blue-500',
      action: onContactEmail,
    },
    {
      icon: <Phone className="w-5 h-5" />,
      label: 'Teléfono',
      description: 'Lun-Vie 9am-6pm',
      color: 'bg-amber-500',
      action: onContactPhone,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <h3 className="text-sm font-medium text-neutral-700 mb-3 text-center">
        ¿Necesitas ayuda? Contáctanos
      </h3>

      <div className="grid grid-cols-3 gap-3">
        {contactOptions.map((option, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * index }}
          >
            <Card
              isPressable
              className="border border-neutral-200 hover:border-neutral-300 transition-colors"
              onPress={() => option.action?.()}
            >
              <CardBody className="p-3 items-center text-center">
                <div
                  className={`w-10 h-10 rounded-full ${option.color} text-white flex items-center justify-center mb-2`}
                >
                  {option.icon}
                </div>
                <p className="text-sm font-medium text-neutral-800">
                  {option.label}
                </p>
                <p className="text-xs text-neutral-500">{option.description}</p>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ContactOptionsV1;
