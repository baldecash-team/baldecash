'use client';

/**
 * FilePreviewV2 - Solo nombre + tamaño + X
 *
 * Vista minimalista sin thumbnail.
 */

import React from 'react';
import { X, FileText, Loader2, Check, AlertCircle } from 'lucide-react';
import type { UploadedFile } from '../../../types/fields';

interface FilePreviewV2Props {
  file: UploadedFile;
  onRemove: (id: string) => void;
}

export const FilePreviewV2: React.FC<FilePreviewV2Props> = ({
  file,
  onRemove,
}) => {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const getStatusColor = () => {
    switch (file.status) {
      case 'error':
        return 'text-[#ef4444]';
      case 'success':
        return 'text-[#22c55e]';
      default:
        return 'text-neutral-500';
    }
  };

  return (
    <div className={`
      flex items-center gap-3 py-2 px-3 rounded-lg
      ${file.status === 'error' ? 'bg-[#ef4444]/5' : 'bg-neutral-50'}
    `}>
      {/* Icon */}
      <div className="flex-shrink-0">
        {file.status === 'uploading' && (
          <Loader2 className="w-5 h-5 text-[#4654CD] animate-spin" />
        )}
        {file.status === 'success' && (
          <Check className="w-5 h-5 text-[#22c55e]" />
        )}
        {file.status === 'error' && (
          <AlertCircle className="w-5 h-5 text-[#ef4444]" />
        )}
        {file.status === 'pending' && (
          <FileText className="w-5 h-5 text-neutral-400" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-700 truncate">
          {file.name}
        </p>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-400">{formatSize(file.size)}</span>
          {file.status === 'uploading' && (
            <span className="text-[#4654CD]">{file.uploadProgress}%</span>
          )}
          {file.status === 'error' && file.errorMessage && (
            <span className={getStatusColor()}>{file.errorMessage}</span>
          )}
        </div>
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(file.id)}
        className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-neutral-200 flex items-center justify-center transition-colors cursor-pointer"
      >
        <X className="w-4 h-4 text-neutral-500" />
      </button>
    </div>
  );
};

export default FilePreviewV2;
