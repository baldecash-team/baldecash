'use client';

import React from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { MessageCircle, Phone, Mail, Clock } from 'lucide-react';

interface ContactOptionsProps {
  className?: string;
}

/**
 * ContactOptions - Opciones de Contacto
 * DEFINIDO: WhatsApp primario, otras opciones secundarias
 */
export const ContactOptions: React.FC<ContactOptionsProps> = ({ className = '' }) => {
  const options = [
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      value: '+51 999 888 777',
      description: 'Respuesta inmediata',
      primary: true,
      color: '#25D366',
    },
    {
      icon: Phone,
      label: 'Llamar',
      value: '(01) 700-1234',
      description: 'Lun-Vie 9am-6pm',
      primary: false,
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'ayuda@baldecash.com',
      description: 'Respuesta en 24h',
      primary: false,
    },
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      <p className="text-sm font-medium text-neutral-700 mb-2">Contáctanos por:</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {options.map((option, index) => {
          const Icon = option.icon;
          return (
            <Card
              key={index}
              isPressable
              className={`cursor-pointer transition-all ${
                option.primary
                  ? 'border-2 border-[#25D366] bg-[#25D366]/5 hover:bg-[#25D366]/10'
                  : 'border border-neutral-200 hover:border-[#4654CD]/50'
              }`}
            >
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: option.primary ? '#25D366' : '#f5f5f5',
                    }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: option.primary ? 'white' : '#666' }}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800">{option.label}</p>
                    <p className="text-xs text-neutral-500">{option.description}</p>
                  </div>
                </div>
                {option.primary && (
                  <div className="mt-2 pt-2 border-t border-[#25D366]/20">
                    <p className="text-sm font-semibold" style={{ color: '#25D366' }}>
                      {option.value}
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-neutral-500 mt-4">
        <Clock className="w-3 h-3" />
        <span>Horario de atención: Lun-Vie 9:00 - 18:00, Sáb 9:00 - 13:00</span>
      </div>
    </div>
  );
};
