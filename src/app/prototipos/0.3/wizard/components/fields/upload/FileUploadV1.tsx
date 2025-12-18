'use client';

/**
 * FileUploadV1 - Drag & drop prominente + botón
 *
 * Área grande de drag & drop con botón secundario.
 */

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@nextui-org/react';
import { Upload, Camera, AlertCircle } from 'lucide-react';
import type { FileUploadProps, UploadedFile } from '../../../types/fields';

export const FileUploadV1: React.FC<FileUploadProps> = ({
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
  const [isDragging, setIsDragging] = useState(false);
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

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

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8
          transition-all duration-200 text-center
          ${isDragging
            ? 'border-[#4654CD] bg-[#4654CD]/5'
            : error
              ? 'border-[#ef4444] bg-[#ef4444]/5'
              : 'border-neutral-300 hover:border-[#4654CD]/50 bg-neutral-50'
          }
        `}
      >
        {/* Icon */}
        <div className={`
          w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center
          ${isDragging ? 'bg-[#4654CD]/10' : 'bg-neutral-100'}
        `}>
          <Upload className={`w-7 h-7 ${isDragging ? 'text-[#4654CD]' : 'text-neutral-400'}`} />
        </div>

        {/* Text */}
        <p className="text-neutral-600 font-medium mb-1">
          {isDragging ? 'Suelta tu archivo aquí' : 'Arrastra tu archivo aquí'}
        </p>
        <p className="text-sm text-neutral-400 mb-4">
          {helpText || `PDF o imagen, máximo ${Math.round(maxSize / 1024 / 1024)}MB`}
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button
            type="button"
            className="bg-[#4654CD] text-white cursor-pointer"
            onPress={() => inputRef.current?.click()}
            startContent={<Upload className="w-4 h-4" />}
          >
            Elegir archivo
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
      </div>

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

export default FileUploadV1;
