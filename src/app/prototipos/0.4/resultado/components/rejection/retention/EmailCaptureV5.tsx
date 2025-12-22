'use client';

import React, { useState } from 'react';
import { Input, Button } from '@nextui-org/react';
import { Mail, Bell, Gift, Check } from 'lucide-react';

interface EmailCaptureV5Props {
  onSubmit?: (email: string) => void;
}

/**
 * EmailCaptureV5 - Split Layout
 * Beneficio a la izquierda + input a la derecha
 */
export const EmailCaptureV5: React.FC<EmailCaptureV5Props> = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
    setIsSubmitted(true);
    onSubmit?.(email);
  };

  if (isSubmitted) {
    return (
      <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-green-600" />
        </div>
        <p className="text-sm text-green-700">¡Registrado! Te avisaremos cuando tengas nuevas oportunidades.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Lado izquierdo - Beneficios */}
        <div className="bg-[#4654CD]/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-5 h-5 text-[#4654CD]" />
            <h3 className="font-semibold text-neutral-800">Beneficios de suscribirte</h3>
          </div>
          <ul className="space-y-2 text-sm text-neutral-600">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#4654CD] flex-shrink-0" />
              <span>Aviso cuando puedas volver a aplicar</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#4654CD] flex-shrink-0" />
              <span>Ofertas exclusivas en equipos</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#4654CD] flex-shrink-0" />
              <span>Tips para mejorar tu perfil</span>
            </li>
          </ul>
        </div>

        {/* Lado derecho - Formulario */}
        <div className="p-5 flex flex-col justify-center">
          <p className="text-sm text-neutral-600 mb-3">Ingresa tu email para recibir novedades:</p>
          <div className="space-y-3">
            <Input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              startContent={<Mail className="w-4 h-4 text-neutral-400" />}
              classNames={{
                inputWrapper: 'border border-neutral-200 data-[focus=true]:border-[#4654CD]',
              }}
            />
            <Button
              className="w-full bg-[#4654CD] text-white font-semibold cursor-pointer hover:bg-[#3a47b3]"
              startContent={<Bell className="w-4 h-4" />}
              isLoading={isLoading}
              onPress={handleSubmit}
              isDisabled={!email}
            >
              Avisarme
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
