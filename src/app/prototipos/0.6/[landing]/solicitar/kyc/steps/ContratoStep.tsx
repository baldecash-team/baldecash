'use client';

/**
 * Sub-paso KYC: contrato.
 *
 * Fase 2 (UI only): muestra el contrato en un panel scrolleable (no hay
 * lib de visor de PDF en el proyecto todavía; texto placeholder en español)
 * y exige aceptación explícita antes de continuar. NO se firma ni se envía
 * nada al backend en esta fase.
 */

import { useState } from 'react';
import { CheckboxField } from '../../components/solicitar/fields/CheckboxField';

export interface ContratoStepProps {
  onDone: () => void;
  onBack?: () => void;
}

const CONTRACT_PARAGRAPHS = [
  'El presente contrato de arrendamiento financiero se celebra entre BaldeCash S.A.C. ("el Arrendador") y el solicitante ("el Arrendatario"), sujeto a los términos y condiciones que se detallan a continuación.',
  'PRIMERO. Objeto del contrato. El Arrendador entrega en arrendamiento al Arrendatario el bien descrito en su solicitud, para uso exclusivo del Arrendatario durante el plazo pactado, comprometiéndose este último a pagar las cuotas periódicas acordadas en las fechas establecidas.',
  'SEGUNDO. Plazo y renta. El plazo del contrato inicia en la fecha de entrega del bien y se mantiene vigente hasta la cancelación total de las cuotas pactadas. El incumplimiento de pago genera intereses moratorios conforme a la tasa vigente informada al Arrendatario.',
  'TERCERO. Obligaciones del Arrendatario. El Arrendatario se obliga a dar buen uso al bien, mantenerlo en condiciones adecuadas, no cederlo a terceros sin autorización previa y facilitar las inspecciones que el Arrendador considere necesarias.',
  'CUARTO. Resolución. El incumplimiento de dos o más cuotas consecutivas faculta al Arrendador a resolver el presente contrato y solicitar la devolución inmediata del bien, sin perjuicio de las acciones legales correspondientes.',
  'QUINTO. Protección de datos. El Arrendatario autoriza el tratamiento de sus datos personales conforme a la Ley de Protección de Datos Personales, para fines de evaluación crediticia, gestión de cobranza y comunicaciones relacionadas al presente contrato.',
  'Al aceptar, el Arrendatario declara haber leído, entendido y aceptado la totalidad de las cláusulas del presente contrato.',
];

export function ContratoStep({ onDone, onBack }: ContratoStepProps) {
  const [accepted, setAccepted] = useState<'true' | 'false'>('false');

  return (
    <div className="w-full space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#1f2937]">Contrato</h2>
        <p className="text-[#6b7280] text-sm mt-1">
          Revisa y acepta los términos de tu contrato antes de continuar.
        </p>
      </div>

      <div className="max-h-72 overflow-y-auto border border-[#e5e7eb] rounded-xl p-4 text-sm text-[#374151] space-y-2">
        {CONTRACT_PARAGRAPHS.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <CheckboxField
        id="accept-contract"
        label="He leído y acepto el contrato"
        value={accepted}
        onChange={(value: string | string[]) => setAccepted(value as 'true' | 'false')}
        required
      />

      <div className="flex gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex-1 border border-[#4654CD] text-[#4654CD] font-semibold py-2 rounded-xl hover:bg-[#ECECFB] transition-colors cursor-pointer"
          >
            Atrás
          </button>
        )}
        <button
          type="button"
          disabled={accepted !== 'true'}
          onClick={onDone}
          className="flex-1 bg-[#4654CD] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

export default ContratoStep;
