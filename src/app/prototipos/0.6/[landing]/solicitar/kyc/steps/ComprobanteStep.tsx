'use client';

/**
 * Sub-paso KYC: comprobante de pago.
 *
 * Fase 2 (UI only): el usuario adjunta la captura de su Yape/Plin o el
 * voucher de pago. Solo se guarda en estado local — NO se sube a S3 ni se
 * valida (eso llega en una fase posterior).
 */

import { useState } from 'react';
import { FileUpload } from '../../components/solicitar/fields/FileUpload';

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
}

export interface ComprobanteStepProps {
  onDone: () => void;
  onBack?: () => void;
}

export function ComprobanteStep({ onDone, onBack }: ComprobanteStepProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  return (
    <div className="w-full space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#1f2937]">Comprobante de pago</h2>
        <p className="text-[#6b7280] text-sm mt-1">
          Sube la captura de tu Yape/Plin o el voucher de pago.
        </p>
      </div>

      <FileUpload
        id="payment-receipt"
        label="Comprobante de pago"
        value={files}
        onChange={setFiles}
        accept=".pdf,.jpg,.jpeg,.png"
        maxFiles={1}
        helpText="Sube la captura de tu Yape/Plin o el voucher"
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
          disabled={files.length === 0}
          onClick={onDone}
          className="flex-1 bg-[#4654CD] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

export default ComprobanteStep;
