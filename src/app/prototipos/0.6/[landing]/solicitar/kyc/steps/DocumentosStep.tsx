'use client';

/**
 * Sub-paso KYC: documentos adicionales.
 *
 * Al dar "Continuar" cada archivo se sube a S3 (presigned URL de
 * `/public/kyc/upload-url`, kind='document') y luego se registra en
 * `application_document` vía `POST /public/kyc/documents`, con la misma
 * prueba de titularidad que step-complete (DNI o resume_token). Solo si TODO
 * eso sale bien se avanza (`onDone`): avanzar con archivos perdidos dejaría
 * al postulante creyendo que entregó documentos que nadie recibió.
 */

import { useState } from 'react';
import {
  getKycUploadUrl,
  registerKycDocuments,
  uploadToS3,
  type KycDocumentFile,
} from '../../../../services/kycApi';
import { FileUpload } from '../../components/solicitar/fields/FileUpload';
import { useKycTracker, type KycTrack } from '../useKycTracker';

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
  /** application_code, para que los eventos de este sub-paso sean rastreables. */
  applicationCode?: string;
  /** Prueba de titularidad en la sesión original del wizard. */
  documentNumber?: string;
  /** Prueba de titularidad en la página tokenizada /kyc/[token]. */
  resumeToken?: string;
  /** Emisor de eventos alternativo (ruta tokenizada /kyc/[token]); ver useKycTracker. */
  onTrack?: KycTrack;
}

/** Content type del File, con fallback por extensión (algunos Android mandan ''). */
function contentTypeOf(file: File): string {
  if (file.type) return file.type;
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'application/pdf';
  if (ext === 'png') return 'image/png';
  return 'image/jpeg';
}

export function DocumentosStep({
  onDone,
  onBack,
  applicationCode,
  documentNumber,
  resumeToken,
  onTrack,
}: DocumentosStepProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const track = useKycTracker(onTrack);

  const handleChange = (next: UploadedFile[]) => {
    setFiles(next);
    setError(null);
    if (next.length > 0) {
      track('kyc_documents_uploaded', { count: next.length, application_code: applicationCode });
    }
  };

  const handleContinue = async () => {
    if (files.length === 0 || uploading) return;

    // Sin application_code no hay a qué solicitud asociar los archivos: se
    // avanza sin subir (comportamiento previo, UI-only) en vez de bloquear.
    if (!applicationCode) {
      onDone();
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const registered: KycDocumentFile[] = [];
      for (const f of files) {
        const contentType = contentTypeOf(f.file);
        const presigned = await getKycUploadUrl(applicationCode, 'document', contentType);
        if (!presigned) throw new Error('upload_url_failed');
        const ok = await uploadToS3(presigned.upload_url, f.file, contentType);
        if (!ok) throw new Error('s3_put_failed');
        registered.push({
          key: presigned.key,
          file_name: f.name,
          mime_type: contentType,
          size_kb: Math.ceil(f.size / 1024),
        });
      }

      const result = await registerKycDocuments(
        applicationCode,
        registered,
        documentNumber,
        resumeToken,
      );
      if (!result?.success) throw new Error('register_failed');

      track('kyc_documents_saved', {
        count: registered.length,
        application_code: applicationCode,
      });
      onDone();
    } catch (e) {
      track('kyc_document_upload_error', {
        reason: e instanceof Error ? e.message : 'unknown',
        application_code: applicationCode,
      });
      setError('No pudimos subir tus documentos. Revisa tu conexión e intenta nuevamente.');
    } finally {
      setUploading(false);
    }
  };

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
        onChange={handleChange}
        accept=".pdf,.jpg,.jpeg,.png"
        maxFiles={3}
        maxSize={15 * 1024 * 1024}
        helpText="Sube los documentos solicitados (máx. 3, hasta 15MB c/u)"
        required
      />

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={uploading}
            className="flex-1 border border-[#4654CD] text-[#4654CD] font-semibold py-2 rounded-xl hover:bg-[#ECECFB] transition-colors disabled:opacity-50 cursor-pointer"
          >
            Atrás
          </button>
        )}
        <button
          type="button"
          disabled={files.length === 0 || uploading}
          onClick={handleContinue}
          className="flex-1 bg-[#4654CD] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
        >
          {uploading ? 'Subiendo…' : 'Continuar'}
        </button>
      </div>
    </div>
  );
}

export default DocumentosStep;
