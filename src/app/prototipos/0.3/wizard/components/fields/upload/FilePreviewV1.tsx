'use client';

/**
 * FilePreviewV1 - Thumbnail de imagen/PDF
 *
 * Muestra preview visual del archivo subido.
 */

import React from 'react';
import { X, FileText, Loader2, Check, AlertCircle } from 'lucide-react';
import type { UploadedFile } from '../../../types/fields';

interface FilePreviewV1Props {
  file: UploadedFile;
  onRemove: (id: string) => void;
}

export const FilePreviewV1: React.FC<FilePreviewV1Props> = ({
  file,
  onRemove,
}) => {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className={`
      relative flex gap-3 p-3 rounded-lg border
      ${file.status === 'error'
        ? 'border-[#ef4444] bg-[#ef4444]/5'
        : file.status === 'success'
          ? 'border-[#22c55e] bg-[#22c55e]/5'
          : 'border-neutral-200 bg-white'
      }
    `}>
      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0 flex items-center justify-center">
        {file.preview ? (
          <img
            src={file.preview}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <FileText className="w-8 h-8 text-neutral-400" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-neutral-800 truncate">
          {file.name}
        </p>
        <p className="text-xs text-neutral-500">
          {formatSize(file.size)}
        </p>

        {/* Progress bar */}
        {file.status === 'uploading' && (
          <div className="mt-2">
            <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4654CD] transition-all duration-300"
                style={{ width: `${file.uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              {file.uploadProgress}% subido
            </p>
          </div>
        )}

        {/* Error message */}
        {file.status === 'error' && file.errorMessage && (
          <p className="text-xs text-[#ef4444] mt-1">
            {file.errorMessage}
          </p>
        )}
      </div>

      {/* Status icon */}
      <div className="flex-shrink-0 flex items-start gap-2">
        {file.status === 'uploading' && (
          <Loader2 className="w-5 h-5 text-[#4654CD] animate-spin" />
        )}
        {file.status === 'success' && (
          <Check className="w-5 h-5 text-[#22c55e]" />
        )}
        {file.status === 'error' && (
          <AlertCircle className="w-5 h-5 text-[#ef4444]" />
        )}

        {/* Remove button */}
        <button
          type="button"
          onClick={() => onRemove(file.id)}
          className="w-6 h-6 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 text-neutral-500" />
        </button>
      </div>
    </div>
  );
};

export default FilePreviewV1;
