'use client';

/**
 * UploadFieldV2 - Solo boton (simple)
 * Upload minimo con solo un boton
 */

import React, { useRef } from 'react';
import { Button } from '@nextui-org/react';
import { Upload, X, FileText, Image as ImageIcon, HelpCircle } from 'lucide-react';
import type { FieldConfig } from '../../../types/wizard-solicitud';

interface UploadFieldV2Props {
  labelVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  helpVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  field: FieldConfig;
  value: unknown;
  error?: string;
  onChange: (value: File | null) => void;
}

export const UploadFieldV2: React.FC<UploadFieldV2Props> = ({
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

  const handleRemove = () => {
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
        <span>{field.label}</span>
        {field.required && <span className="text-red-500">*</span>}
        {field.helpText && (
          <button type="button" className="text-neutral-400 hover:text-neutral-600" title={field.helpText}>
            <HelpCircle className="w-4 h-4" />
          </button>
        )}
      </label>

      <input ref={inputRef} type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />

      <div className="flex items-center gap-3">
        <Button
          variant="bordered"
          startContent={<Upload className="w-4 h-4" />}
          onPress={() => inputRef.current?.click()}
          className={`border-neutral-300 ${error ? 'border-red-500' : ''}`}
        >
          {file ? 'Cambiar archivo' : 'Subir archivo'}
        </Button>

        {file && (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {file.type.startsWith('image/') ? (
              <ImageIcon className="w-5 h-5 text-[#4654CD] flex-shrink-0" />
            ) : (
              <FileText className="w-5 h-5 text-[#4654CD] flex-shrink-0" />
            )}
            <span className="text-sm text-neutral-700 truncate">{file.name}</span>
            <button type="button" onClick={handleRemove} className="text-neutral-400 hover:text-red-500 flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

export default UploadFieldV2;
