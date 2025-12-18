'use client';

/**
 * FileUploadV3 - Área drag & drop clickeable
 *
 * Toda el área es clickeable y acepta drag & drop.
 */

import React, { useState, useRef, useCallback } from 'react';
import { Upload, Camera, AlertCircle } from 'lucide-react';
import type { FileUploadProps, UploadedFile } from '../../../types/fields';

export const FileUploadV3: React.FC<FileUploadProps> = ({
  id,
  label,
  accept = 'image/*,.pdf',
  maxSize = 5 * 1024 * 1024,
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

      {/* Clickeable drop zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          w-full p-6 rounded-xl cursor-pointer
          transition-all duration-200 text-left
          border-2 border-dashed
          ${isDragging
            ? 'border-[#4654CD] bg-[#4654CD]/5'
            : error
              ? 'border-[#ef4444] bg-[#ef4444]/5'
              : 'border-neutral-300 hover:border-[#4654CD] hover:bg-[#4654CD]/5 bg-white'
          }
        `}
      >
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
            ${isDragging ? 'bg-[#4654CD]/10' : 'bg-neutral-100'}
          `}>
            <Upload className={`w-6 h-6 ${isDragging ? 'text-[#4654CD]' : 'text-neutral-400'}`} />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-neutral-700">
              {isDragging ? 'Suelta aquí' : 'Haz clic o arrastra tu archivo'}
            </p>
            <p className="text-sm text-neutral-400 truncate">
              {helpText || `PDF o imagen, máx ${Math.round(maxSize / 1024 / 1024)}MB`}
            </p>
          </div>

          {/* Camera option on mobile */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (inputRef.current) {
                inputRef.current.setAttribute('capture', 'environment');
                inputRef.current.click();
                inputRef.current.removeAttribute('capture');
              }
            }}
            className="sm:hidden w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 hover:bg-neutral-200 transition-colors"
          >
            <Camera className="w-5 h-5 text-neutral-500" />
          </div>
        </div>
      </button>

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

export default FileUploadV3;
