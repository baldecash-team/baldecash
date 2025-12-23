'use client';

/**
 * UploadFieldV1 - Drag & drop prominente + boton
 * Area grande de drag con boton separado
 */

import React, { useState, useRef } from 'react';
import { Button } from '@nextui-org/react';
import { Upload, X, FileText, Image as ImageIcon, HelpCircle } from 'lucide-react';
import type { FieldConfig } from '../../../types/wizard-solicitud';

interface UploadFieldV1Props {
  field: FieldConfig;
  value: unknown;
  error?: string;
  onChange: (value: File | null) => void;
  labelVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  helpVersion?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const UploadFieldV1: React.FC<UploadFieldV1Props> = ({
  field,
  value,
  error,
  onChange,
  labelVersion = 1,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const file = value as File | null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) onChange(droppedFile);
  };

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

      {file ? (
        <div className="flex items-center gap-3 p-4 bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-xl">
          {file.type.startsWith('image/') ? (
            <ImageIcon className="w-8 h-8 text-[#22c55e]" />
          ) : (
            <FileText className="w-8 h-8 text-[#22c55e]" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-neutral-800 truncate">{file.name}</p>
            <p className="text-xs text-neutral-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <Button isIconOnly size="sm" variant="light" color="danger" onPress={handleRemove}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center transition-all
            ${isDragging ? 'border-[#4654CD] bg-[#4654CD]/5' : error ? 'border-red-300' : 'border-neutral-300'}
          `}
        >
          <Upload className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-600 mb-4">Arrastra tu archivo aqui</p>
          <Button
            color="primary"
            variant="flat"
            startContent={<Upload className="w-4 h-4" />}
            onPress={() => inputRef.current?.click()}
            className="bg-[#4654CD]/10 text-[#4654CD]"
          >
            Seleccionar archivo
          </Button>
          <p className="text-xs text-neutral-400 mt-3">PDF o imagen, maximo 5MB</p>
        </div>
      )}

      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

export default UploadFieldV1;
