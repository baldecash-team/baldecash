'use client';

/**
 * UploadFieldV6 - Upload con animacion
 * Area interactiva con feedback visual animado
 */

import React, { useState, useRef } from 'react';
import { Button, Progress } from '@nextui-org/react';
import { Upload, X, FileText, Image as ImageIcon, HelpCircle, Check, Loader2 } from 'lucide-react';
import type { FieldConfig } from '../../../types/wizard-solicitud';

interface UploadFieldV6Props {
  labelVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  helpVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  field: FieldConfig;
  value: unknown;
  error?: string;
  onChange: (value: File | null) => void;
}

export const UploadFieldV6: React.FC<UploadFieldV6Props> = ({
  field,
  value,
  error,
  onChange,
  labelVersion = 1,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const file = value as File | null;

  const simulateUpload = (selectedFile: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          onChange(selectedFile);
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) simulateUpload(droppedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) simulateUpload(selectedFile);
  };

  const handleRemove = () => {
    onChange(null);
    setUploadProgress(0);
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

      <div
        onClick={() => !isUploading && !file && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 rounded-2xl p-6 transition-all duration-300 overflow-hidden
          ${file ? 'border-[#22c55e] bg-[#22c55e]/5' : ''}
          ${isDragging ? 'border-[#4654CD] bg-[#4654CD]/10 scale-[1.02]' : ''}
          ${!file && !isDragging ? `border-dashed ${error ? 'border-red-300' : 'border-neutral-300'} cursor-pointer hover:border-[#4654CD]` : ''}
          ${isUploading ? 'border-[#4654CD] bg-[#4654CD]/5' : ''}
        `}
      >
        {/* Animated background */}
        {isDragging && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#4654CD]/10 via-[#03DBD0]/10 to-[#4654CD]/10 animate-pulse" />
        )}

        <div className="relative flex flex-col items-center gap-3 text-center">
          {isUploading ? (
            <>
              <Loader2 className="w-10 h-10 text-[#4654CD] animate-spin" />
              <p className="font-medium text-neutral-800">Subiendo archivo...</p>
              <Progress
                value={uploadProgress}
                className="max-w-xs"
                classNames={{
                  indicator: 'bg-[#4654CD]',
                }}
              />
            </>
          ) : file ? (
            <>
              <div className="w-14 h-14 rounded-full bg-[#22c55e] flex items-center justify-center animate-[scale-in_0.3s_ease-out]">
                <Check className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="font-medium text-neutral-800">{file.name}</p>
                <p className="text-xs text-neutral-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <Button size="sm" variant="flat" color="danger" startContent={<X className="w-3 h-3" />} onPress={handleRemove}>
                Eliminar
              </Button>
            </>
          ) : (
            <>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isDragging ? 'bg-[#4654CD] scale-110' : 'bg-neutral-100'}`}>
                <Upload className={`w-7 h-7 transition-colors ${isDragging ? 'text-white' : 'text-neutral-400'}`} />
              </div>
              <div>
                <p className="font-medium text-neutral-700">
                  {isDragging ? 'Suelta para subir' : 'Arrastra o haz clic'}
                </p>
                <p className="text-xs text-neutral-500">PDF o imagen, maximo 5MB</p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

export default UploadFieldV6;
