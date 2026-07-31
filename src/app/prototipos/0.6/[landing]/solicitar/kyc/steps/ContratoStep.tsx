'use client';

/**
 * Sub-paso KYC: contrato.
 *
 * Muestra el contrato embebido desde un PDF estático (S3) en un iframe
 * y exige aceptación explícita antes de continuar. NO se firma ni se envía
 * nada al backend en esta fase.
 */

import { useEffect, useState } from 'react';
import { CheckboxField } from '../../components/solicitar/fields/CheckboxField';
import { useKycTracker, type KycTrack } from '../useKycTracker';

export interface ContratoStepProps {
  onDone: () => void;
  onBack?: () => void;
  /** application_code, para que los eventos de este sub-paso sean rastreables. */
  applicationCode?: string;
  /** Emisor de eventos alternativo (ruta tokenizada /kyc/[token]); ver useKycTracker. */
  onTrack?: KycTrack;
}

const CONTRACT_PDF_URL = 'https://ws.baldecash.com/storage/contrato-v3-6a5ee61f7aa51.pdf';

export function ContratoStep({ onDone, onBack, applicationCode, onTrack }: ContratoStepProps) {
  const [accepted, setAccepted] = useState<'true' | 'false'>('false');
  const track = useKycTracker(onTrack);

  useEffect(() => {
    track('kyc_contract_view', { application_code: applicationCode });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAcceptChange = (value: string | string[]) => {
    const next = value as 'true' | 'false';
    setAccepted(next);
    if (next === 'true') {
      track('kyc_contract_accepted', { application_code: applicationCode });
    }
  };

  return (
    <div className="w-full space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#1f2937]">Contrato</h2>
        <p className="text-[#6b7280] text-sm mt-1">
          Revisa y acepta los términos de tu contrato antes de continuar.
        </p>
      </div>

      <div className="space-y-2">
        <iframe
          src={CONTRACT_PDF_URL}
          title="Contrato"
          className="w-full h-80 rounded-xl border border-[#e5e7eb]"
        />
        <a
          href={CONTRACT_PDF_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-xs font-semibold text-[#4654CD] hover:underline"
        >
          Abrir en pestaña nueva
        </a>
      </div>

      <CheckboxField
        id="accept-contract"
        label="He leído y acepto el contrato"
        value={accepted}
        onChange={handleAcceptChange}
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
