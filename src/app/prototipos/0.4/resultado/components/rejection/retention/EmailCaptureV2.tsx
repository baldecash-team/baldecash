'use client';

import React, { useState } from 'react';
import { Checkbox } from '@nextui-org/react';
import { Check } from 'lucide-react';

interface EmailCaptureV2Props {
  onSubmit?: (subscribed: boolean) => void;
  userEmail?: string;
}

/**
 * EmailCaptureV2 - Checkbox Discreto
 * "Quiero recibir novedades" - simple checkbox
 */
export const EmailCaptureV2: React.FC<EmailCaptureV2Props> = ({
  onSubmit,
  userEmail = 'tu correo registrado',
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (checked: boolean) => {
    setIsChecked(checked);
    if (checked) {
      setIsSubmitted(true);
      onSubmit?.(true);
    }
  };

  return (
    <div className="py-4 border-t border-neutral-100">
      <label className="flex items-start gap-3 cursor-pointer">
        <Checkbox
          isSelected={isChecked}
          onValueChange={handleChange}
          classNames={{
            base: 'cursor-pointer',
            wrapper: 'before:border-2 before:border-neutral-300 after:bg-[#4654CD] group-data-[selected=true]:after:bg-[#4654CD]',
            icon: 'text-white',
          }}
        />
        <div>
          <p className="text-sm text-neutral-700">
            Quiero recibir novedades y oportunidades de financiamiento
          </p>
          {isSubmitted && (
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <Check className="w-3 h-3" />
              Te enviaremos actualizaciones a {userEmail}
            </p>
          )}
        </div>
      </label>
    </div>
  );
};
