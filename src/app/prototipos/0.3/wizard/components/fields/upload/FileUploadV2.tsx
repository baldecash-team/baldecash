'use client';

/**
 * FileUploadV2 - Solo botón (más simple)
 *
 * Interfaz minimalista con solo botones.
 */

import React, { useRef, useCallback } from 'react';
import { Button } from '@nextui-org/react';
import { Upload, Camera, AlertCircle } from 'lucide-react';
import type { FileUploadProps, UploadedFile } from '../../../types/fields';

export const FileUploadV2: React.FC<FileUploadProps> = ({
  id,
  label,
  accept = 'image/*,.pdf',
  maxSize = 5 * 1024 * 1024, // 5MB
  files,
  onFilesChange,
  error,
  helpText,
  multiple = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: UploadedFile[] = Array.from(fileList).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      uploadProgress: 0,
      status: file.size > maxSize ? 'error' : 'pending',
      errorMessage: file.size > maxSize ? `Archivo muy grande (máx ${Math.round(maxSize / 1024 / 1024)}MB)` : undefined,
    }));

    if (multiple) {
      onFilesChange([...files, ...newFiles]);
    } else {
      onFilesChange(newFiles.slice(0, 1));
    }
  }, [files, maxSize, multiple, onFilesChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="block text-sm font-medium text-neutral-700">
        {label}
      </label>

      {/* Help text */}
      {helpText && (
        <p className="text-sm text-neutral-500">
          {helpText}
        </p>
      )}

      {/* Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          className="bg-[#4654CD] text-white cursor-pointer"
          onPress={() => inputRef.current?.click()}
          startContent={<Upload className="w-4 h-4" />}
        >
          Subir archivo
        </Button>
        <Button
          type="button"
          variant="bordered"
          className="border-neutral-300 cursor-pointer"
          onPress={() => {
            if (inputRef.current) {
              inputRef.current.setAttribute('capture', 'environment');
              inputRef.current.click();
              inputRef.current.removeAttribute('capture');
            }
          }}
          startContent={<Camera className="w-4 h-4" />}
        >
          Tomar foto
        </Button>
      </div>

      {/* File format hint */}
      <p className="text-xs text-neutral-400">
        PDF o imagen, máximo {Math.round(maxSize / 1024 / 1024)}MB
      </p>

      {/* Hidden input */}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="sr-only"
      />

      {/* Error message */}
      {error && (
        <p className="text-sm text-[#ef4444] flex items-center gap-1">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

export default FileUploadV2;
