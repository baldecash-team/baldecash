'use client';

/**
 * FileUpload - Clickable drag & drop area
 * Based on v0.3 FileUploadV3
 */

import React, { useCallback, useState, useRef } from 'react';
import { Tooltip } from '@nextui-org/react';
import { Upload, X, FileText, AlertCircle, CheckCircle2, Info } from 'lucide-react';

export interface FieldTooltipInfo {
  title: string;
  description: string;
  recommendation?: string;
}

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
}

interface FileUploadProps {
  id: string;
  label: string;
  value: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // in bytes
  error?: string;
  helpText?: string;
  tooltip?: FieldTooltipInfo;
  disabled?: boolean;
  required?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  id,
  label,
  value = [],
  onChange,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024, // 5MB default
  error,
  helpText,
  tooltip,
  disabled = false,
  required = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const showError = !!error || !!sizeError;
  const hasFiles = value.length > 0;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || disabled) return;

      setSizeError(null);
      const newFiles: UploadedFile[] = [];
      const rejectedFiles: string[] = [];

      for (let i = 0; i < fileList.length && newFiles.length < maxFiles; i++) {
        const file = fileList[i];

        // Check size
        if (file.size > maxSize) {
          rejectedFiles.push(file.name);
          continue;
        }

        const uploadedFile: UploadedFile = {
          id: `${Date.now()}-${i}`,
          file,
          name: file.name,
          size: file.size,
          type: file.type,
        };

        newFiles.push(uploadedFile);
      }

      if (rejectedFiles.length > 0) {
        setSizeError(`El archivo excede el tamaño máximo de ${formatSize(maxSize)}`);
      }

      if (newFiles.length > 0) {
        setSizeError(null);
        // When maxFiles is 1, replace existing file; otherwise append
        if (maxFiles === 1) {
          onChange(newFiles);
        } else {
          // For multiple files, append up to maxFiles limit
          const combined = [...value, ...newFiles].slice(0, maxFiles);
          onChange(combined);
        }
      }
    },
    [value, onChange, maxFiles, maxSize, disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleRemove = (fileId: string) => {
    onChange(value.filter((f) => f.id !== fileId));
    setSizeError(null);
  };

  const getFileIcon = () => {
    return FileText;
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
        {label}
        {!required && <span className="text-neutral-400 text-xs">(Opcional)</span>}
        {tooltip && (
          <Tooltip
            content={
              <div className="max-w-xs p-2">
                <p className="font-semibold text-neutral-800">{tooltip.title}</p>
                <p className="text-xs text-neutral-500 mt-1">{tooltip.description}</p>
                {tooltip.recommendation && (
                  <p className="text-xs text-[#4654CD] mt-2 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {tooltip.recommendation}
                  </p>
                )}
              </div>
            }
            classNames={{
              content: 'bg-white shadow-lg border border-neutral-200',
            }}
          >
            <span className="inline-flex">
              <Info className="w-4 h-4 text-neutral-400 hover:text-[#4654CD] cursor-help transition-colors" />
            </span>
          </Tooltip>
        )}
      </label>

      {/* Drop Zone */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
          ${isDragging
            ? 'border-[#4654CD] bg-[#4654CD]/5'
            : showError
            ? 'border-red-300 bg-red-50 hover:border-red-400'
            : hasFiles
            ? 'border-green-300 bg-green-50 hover:border-green-400'
            : 'border-neutral-300 bg-neutral-50 hover:border-neutral-400 hover:bg-neutral-100'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          id={id}
          accept={accept}
          multiple={maxFiles > 1}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center gap-2">
          {showError ? (
            <AlertCircle className="w-8 h-8 text-red-400" />
          ) : hasFiles ? (
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          ) : (
            <Upload className="w-8 h-8 text-neutral-400" />
          )}
          <p className="text-sm text-neutral-600">
            {isDragging
              ? 'Suelta el archivo aquí'
              : hasFiles
              ? 'Arrastra más archivos o haz clic para agregar'
              : 'Arrastra y suelta o haz clic para seleccionar'}
          </p>
          <p className="text-xs text-neutral-400">
            {accept.replace(/\./g, '').toUpperCase().replace(/,/g, ', ')} • Máx {formatSize(maxSize)}
          </p>
        </div>
      </div>

      {/* Uploaded Files */}
      {hasFiles && (
        <div className="space-y-2">
          {value.map((file) => {
            const FileIcon = getFileIcon();
            return (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-neutral-200"
              >
                <div className="w-10 h-10 bg-neutral-100 rounded flex items-center justify-center">
                <FileIcon className="w-5 h-5 text-neutral-500" />
              </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800 truncate">{file.name}</p>
                  <p className="text-xs text-neutral-500">{formatSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(file.id);
                  }}
                  className="p-1 hover:bg-neutral-100 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-neutral-400" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Help Text or Error */}
      {(helpText || error || sizeError) && (
        <p
          className={`text-xs ${
            showError ? 'text-red-500' : 'text-neutral-500'
          }`}
        >
          {error || sizeError || helpText}
        </p>
      )}
    </div>
  );
};

export default FileUpload;
