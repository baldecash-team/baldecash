'use client';

/**
 * UploadFieldV5 - Upload minimalista
 * Linea simple con upload
 */

import React, { useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, HelpCircle, Check } from 'lucide-react';
import type { FieldConfig } from '../../../types/wizard-solicitud';

interface UploadFieldV5Props {
  labelVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  helpVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  field: FieldConfig;
  value: unknown;
  error?: string;
  onChange: (value: File | null) => void;
}

export const UploadFieldV5: React.FC<UploadFieldV5Props> = ({
  field,
  value,
  error,
  onChange,
  labelVersion = 1,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const file = value as File | null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) onChange(selectedFile);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-1">
      <label className="flex items-center gap-1 text-xs font-medium text-neutral-500 uppercase tracking-wide">
        <span>{field.label}</span>
        {field.required && <span className="text-red-400">*</span>}
        {field.helpText && (
          <button type="button" className="text-neutral-300 hover:text-neutral-500" title={field.helpText}>
            <HelpCircle className="w-3 h-3" />
          </button>
        )}
      </label>

      <input ref={inputRef} type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`
          w-full flex items-center gap-3 py-3 border-b transition-all text-left
          ${file ? 'border-[#22c55e]' : error ? 'border-red-500' : 'border-neutral-200 hover:border-[#4654CD]'}
        `}
      >
        {file ? (
          <>
            <div className="w-8 h-8 rounded-lg bg-[#22c55e]/10 flex items-center justify-center">
              {file.type.startsWith('image/') ? (
                <ImageIcon className="w-4 h-4 text-[#22c55e]" />
              ) : (
                <FileText className="w-4 h-4 text-[#22c55e]" />
              )}
            </div>
            <span className="flex-1 text-neutral-800 truncate">{file.name}</span>
            <Check className="w-4 h-4 text-[#22c55e]" />
            <button onClick={handleRemove} className="text-neutral-400 hover:text-red-500">
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
              <Upload className="w-4 h-4 text-neutral-400" />
            </div>
            <span className="flex-1 text-neutral-400">Seleccionar archivo...</span>
          </>
        )}
      </button>

      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

export default UploadFieldV5;
