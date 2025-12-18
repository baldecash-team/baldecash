'use client';

/**
 * ContactFields - Campos de contacto (celular, email, WhatsApp)
 */

import React, { useState } from 'react';
import { Input, Checkbox } from '@nextui-org/react';
import { Phone, Mail, MessageCircle, Check, AlertCircle } from 'lucide-react';

interface ContactFieldsProps {
  celular: string;
  onCelularChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  whatsappDiferente: boolean;
  onWhatsappDiferenteChange: (value: boolean) => void;
  whatsapp: string;
  onWhatsappChange: (value: string) => void;
  errors?: {
    celular?: string;
    email?: string;
    whatsapp?: string;
  };
  touched?: {
    celular?: boolean;
    email?: boolean;
    whatsapp?: boolean;
  };
  onBlur?: (field: string) => void;
}

export const ContactFields: React.FC<ContactFieldsProps> = ({
  celular,
  onCelularChange,
  email,
  onEmailChange,
  whatsappDiferente,
  onWhatsappDiferenteChange,
  whatsapp,
  onWhatsappChange,
  errors = {},
  touched = {},
  onBlur,
}) => {
  const formatPhone = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 9);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  };

  const handleCelularChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 9);
    onCelularChange(raw);
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 9);
    onWhatsappChange(raw);
  };

  const isCelularValid = celular.length === 9 && celular.startsWith('9');
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isWhatsappValid = !whatsappDiferente || (whatsapp.length === 9 && whatsapp.startsWith('9'));

  return (
    <div className="space-y-4">
      {/* Celular */}
      <Input
        id="celular"
        name="celular"
        label="Celular"
        placeholder="Ej: 999 999 999"
        value={formatPhone(celular)}
        onChange={handleCelularChange}
        onBlur={() => onBlur?.('celular')}
        inputMode="tel"
        autoComplete="tel"
        startContent={<Phone className="w-4 h-4 text-neutral-400" />}
        endContent={
          <>
            {touched.celular && isCelularValid && <Check className="w-5 h-5 text-[#22c55e]" />}
            {touched.celular && errors.celular && <AlertCircle className="w-5 h-5 text-[#ef4444]" />}
          </>
        }
        classNames={{
          base: 'w-full',
          input: 'text-base',
          inputWrapper: `
            border-2 rounded-lg transition-all duration-200 bg-white
            ${errors.celular && touched.celular ? 'border-[#ef4444] bg-[#ef4444]/5' : ''}
            ${isCelularValid && touched.celular && !errors.celular ? 'border-[#22c55e]' : ''}
            ${!errors.celular && !isCelularValid ? 'border-neutral-300 hover:border-neutral-400 data-[focus=true]:border-[#4654CD]' : ''}
          `,
        }}
        errorMessage={touched.celular ? errors.celular : undefined}
        isInvalid={!!errors.celular && touched.celular}
        description="Te enviaremos un SMS para verificar tu numero"
      />

      {/* Email */}
      <Input
        id="email"
        name="email"
        type="email"
        label="Correo electronico"
        placeholder="Ej: tucorreo@email.com"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        onBlur={() => onBlur?.('email')}
        autoComplete="email"
        startContent={<Mail className="w-4 h-4 text-neutral-400" />}
        endContent={
          <>
            {touched.email && isEmailValid && <Check className="w-5 h-5 text-[#22c55e]" />}
            {touched.email && errors.email && <AlertCircle className="w-5 h-5 text-[#ef4444]" />}
          </>
        }
        classNames={{
          base: 'w-full',
          input: 'text-base',
          inputWrapper: `
            border-2 rounded-lg transition-all duration-200 bg-white
            ${errors.email && touched.email ? 'border-[#ef4444] bg-[#ef4444]/5' : ''}
            ${isEmailValid && touched.email && !errors.email ? 'border-[#22c55e]' : ''}
            ${!errors.email && !isEmailValid ? 'border-neutral-300 hover:border-neutral-400 data-[focus=true]:border-[#4654CD]' : ''}
          `,
        }}
        errorMessage={touched.email ? errors.email : undefined}
        isInvalid={!!errors.email && touched.email}
        description="Aqui te enviaremos tu contrato y notificaciones"
      />

      {/* WhatsApp diferente */}
      <div className="pt-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            isSelected={whatsappDiferente}
            onValueChange={onWhatsappDiferenteChange}
            classNames={{
              base: 'cursor-pointer',
              wrapper: 'before:border-2 before:border-neutral-300 after:bg-[#4654CD] group-data-[selected=true]:after:bg-[#4654CD] before:transition-colors after:transition-all',
              icon: 'text-white transition-opacity',
            }}
          />
          <div>
            <span className="text-sm font-medium text-neutral-700">
              Mi WhatsApp es otro numero
            </span>
            <p className="text-xs text-neutral-500 mt-0.5">
              Usaremos WhatsApp para enviarte recordatorios de pago
            </p>
          </div>
        </label>
      </div>

      {/* WhatsApp (conditional) */}
      {whatsappDiferente && (
        <Input
          id="whatsapp"
          name="whatsapp"
          label="Numero de WhatsApp"
          placeholder="Ej: 999 999 999"
          value={formatPhone(whatsapp)}
          onChange={handleWhatsappChange}
          onBlur={() => onBlur?.('whatsapp')}
          inputMode="tel"
          startContent={<MessageCircle className="w-4 h-4 text-neutral-400" />}
          endContent={
            <>
              {touched.whatsapp && isWhatsappValid && whatsapp && <Check className="w-5 h-5 text-[#22c55e]" />}
              {touched.whatsapp && errors.whatsapp && <AlertCircle className="w-5 h-5 text-[#ef4444]" />}
            </>
          }
          classNames={{
            base: 'w-full',
            input: 'text-base',
            inputWrapper: `
              border-2 rounded-lg transition-all duration-200 bg-white
              ${errors.whatsapp && touched.whatsapp ? 'border-[#ef4444] bg-[#ef4444]/5' : ''}
              ${isWhatsappValid && touched.whatsapp && !errors.whatsapp && whatsapp ? 'border-[#22c55e]' : ''}
              ${!errors.whatsapp && !isWhatsappValid ? 'border-neutral-300 hover:border-neutral-400 data-[focus=true]:border-[#4654CD]' : ''}
            `,
          }}
          errorMessage={touched.whatsapp ? errors.whatsapp : undefined}
          isInvalid={!!errors.whatsapp && touched.whatsapp}
        />
      )}
    </div>
  );
};

export default ContactFields;
