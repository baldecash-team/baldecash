'use client';

/**
 * Sub-paso KYC: documentos adicionales.
 *
 * Fase 2 (UI only): el usuario adjunta hasta 3 documentos solicitados. Solo
 * se guarda en estado local — NO se sube a S3 ni se valida (eso llega en una
 * fase posterior).
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

export interface DocumentosStepProps {
  onDone: () => void;
  onBack?: () => void;
}

export function DocumentosStep({ onDone, onBack }: DocumentosStepProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  return (
    <div className="w-full space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#1f2937]">Documentos</h2>
        <p className="text-[#6b7280] text-sm mt-1">
          Sube los documentos solicitados para completar tu verificación.
        </p>
      </div>

      <FileUpload
        id="kyc-documents"
        label="Documentos"
        value={files}
        onChange={setFiles}
        accept=".pdf,.jpg,.jpeg,.png"
        maxFiles={3}
        helpText="Sube los documentos solicitados (máx. 3)"
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

export default DocumentosStep;
