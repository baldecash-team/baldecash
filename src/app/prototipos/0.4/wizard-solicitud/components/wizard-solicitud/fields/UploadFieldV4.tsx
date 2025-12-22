'use client';

/**
 * UploadFieldV4 - Upload con preview inline
 * Muestra preview de imagen directamente
 */

import React, { useState, useRef } from 'react';
import { Button } from '@nextui-org/react';
import { Upload, X, FileText, HelpCircle, ZoomIn } from 'lucide-react';
import type { FieldConfig } from '../../../types/wizard-solicitud';

interface UploadFieldV4Props {
  labelVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  helpVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  field: FieldConfig;
  value: unknown;
  error?: string;
  onChange: (value: File | null) => void;
}

export const UploadFieldV4: React.FC<UploadFieldV4Props> = ({
  field,
  value,
  error,
  onChange,
  labelVersion = 1,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const file = value as File | null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onChange(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleRemove = () => {
    onChange(null);
    setPreview(null);
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

      {file ? (
        <div className="border-2 border-[#22c55e] rounded-xl overflow-hidden bg-neutral-50">
          {preview ? (
            <div className="relative aspect-video">
              <img src={preview} alt="Preview" className="w-full h-full object-contain bg-white" />
              <div className="absolute top-2 right-2 flex gap-1">
                <Button isIconOnly size="sm" className="bg-white/90 shadow-sm">
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button isIconOnly size="sm" color="danger" className="bg-white/90 shadow-sm" onPress={handleRemove}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 flex items-center gap-3">
              <FileText className="w-10 h-10 text-[#4654CD]" />
              <div className="flex-1">
                <p className="font-medium text-neutral-800">{file.name}</p>
                <p className="text-xs text-neutral-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <Button isIconOnly size="sm" variant="light" color="danger" onPress={handleRemove}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`
            w-full aspect-video border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2
            transition-all hover:border-[#4654CD] hover:bg-[#4654CD]/5
            ${error ? 'border-red-300 bg-red-50' : 'border-neutral-300'}
          `}
        >
          <Upload className="w-10 h-10 text-neutral-300" />
          <span className="text-neutral-600">Subir imagen o PDF</span>
          <span className="text-xs text-neutral-400">Maximo 5MB</span>
        </button>
      )}

      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

export default UploadFieldV4;
