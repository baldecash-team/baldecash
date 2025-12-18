'use client';

/**
 * FilePreviewV3 - Preview en modal al click
 *
 * Vista compacta con modal para ver detalle.
 */

import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react';
import { X, FileText, Loader2, Check, AlertCircle, Eye } from 'lucide-react';
import type { UploadedFile } from '../../../types/fields';

interface FilePreviewV3Props {
  file: UploadedFile;
  onRemove: (id: string) => void;
}

export const FilePreviewV3: React.FC<FilePreviewV3Props> = ({
  file,
  onRemove,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const getStatusIcon = () => {
    switch (file.status) {
      case 'uploading':
        return <Loader2 className="w-4 h-4 text-[#4654CD] animate-spin" />;
      case 'success':
        return <Check className="w-4 h-4 text-[#22c55e]" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-[#ef4444]" />;
      default:
        return <FileText className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <>
      <div className={`
        flex items-center gap-2 py-1.5 px-2 rounded-lg
        ${file.status === 'error' ? 'bg-[#ef4444]/5' : 'bg-neutral-50'}
      `}>
        {/* Status icon */}
        <div className="flex-shrink-0">
          {getStatusIcon()}
        </div>

        {/* Name - clickable for preview */}
        <button
          type="button"
          onClick={() => file.preview && setIsModalOpen(true)}
          className={`
            flex-1 text-left text-sm truncate
            ${file.preview ? 'text-[#4654CD] hover:underline cursor-pointer' : 'text-neutral-700'}
          `}
        >
          {file.name}
        </button>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {file.preview && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-6 h-6 rounded hover:bg-neutral-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-neutral-500" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onRemove(file.id)}
            className="w-6 h-6 rounded hover:bg-neutral-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="2xl"
        scrollBehavior="outside"
        backdrop="blur"
        placement="center"
        classNames={{
          base: 'bg-white my-8',
          wrapper: 'items-center justify-center py-8 min-h-full',
          backdrop: 'bg-black/50',
          header: 'border-b border-neutral-200 bg-white py-4 pr-12',
          body: 'bg-white p-4',
          footer: 'border-t border-neutral-200 bg-white',
          closeButton: 'top-4 right-4 hover:bg-neutral-100 rounded-lg cursor-pointer',
        }}
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-[#4654CD]" />
            <span className="text-lg font-semibold text-neutral-800 truncate">
              {file.name}
            </span>
          </ModalHeader>

          <ModalBody>
            {file.preview ? (
              <div className="flex items-center justify-center bg-neutral-100 rounded-lg p-4 min-h-[300px]">
                <img
                  src={file.preview}
                  alt={file.name}
                  className="max-w-full max-h-[400px] object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
                <FileText className="w-16 h-16 mb-4" />
                <p>Vista previa no disponible</p>
              </div>
            )}

            <div className="mt-4 text-sm text-neutral-500">
              <p>Tamaño: {formatSize(file.size)}</p>
              <p>Tipo: {file.type}</p>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="light"
              onPress={() => setIsModalOpen(false)}
              className="cursor-pointer"
            >
              Cerrar
            </Button>
            <Button
              color="danger"
              variant="flat"
              onPress={() => {
                onRemove(file.id);
                setIsModalOpen(false);
              }}
              startContent={<X className="w-4 h-4" />}
              className="cursor-pointer"
            >
              Eliminar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FilePreviewV3;
