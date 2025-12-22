'use client';

/**
 * UploadFieldV3 - Area drag & drop que es boton (C1.15 = V3)
 * Combina drag & drop y click en una sola area interactiva
 */

import React, { useState, useRef } from 'react';
import { Button, Modal, ModalContent, ModalHeader, ModalBody } from '@nextui-org/react';
import { Upload, X, FileText, Image as ImageIcon, HelpCircle, Eye } from 'lucide-react';
import type { FieldConfig } from '../../../types/wizard-solicitud';
import { DOCUMENT_EXAMPLES } from '../../../data/wizardSolicitudSteps';

interface UploadFieldV3Props {
  labelVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  helpVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  field: FieldConfig;
  value: unknown;
  error?: string;
  onChange: (value: File | null) => void;
}

export const UploadFieldV3: React.FC<UploadFieldV3Props> = ({
  field,
  value,
  error,
  onChange,
  labelVersion = 1,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const file = value as File | null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      onChange(droppedFile);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onChange(selectedFile);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="w-8 h-8 text-neutral-400" />;
    if (file.type.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-[#4654CD]" />;
    return <FileText className="w-8 h-8 text-[#4654CD]" />;
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
        <span>{field.label}</span>
        {field.required && <span className="text-red-500">*</span>}
        {field.helpText && (
          <button
            type="button"
            className="text-neutral-400 hover:text-neutral-600"
            title={field.helpText}
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}
      </label>

      {/* Upload area */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
          transition-all duration-200
          ${isDragging
            ? 'border-[#4654CD] bg-[#4654CD]/5'
            : file
              ? 'border-[#22c55e] bg-[#22c55e]/5'
              : error
                ? 'border-red-300 bg-red-50'
                : 'border-neutral-300 hover:border-[#4654CD] hover:bg-[#4654CD]/5'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2">
          {getFileIcon()}

          {file ? (
            <>
              <p className="font-medium text-neutral-800">{file.name}</p>
              <p className="text-xs text-neutral-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <Button
                size="sm"
                variant="flat"
                color="danger"
                startContent={<X className="w-3 h-3" />}
                onPress={handleRemove as () => void}
                className="mt-2"
              >
                Eliminar
              </Button>
            </>
          ) : (
            <>
              <p className="text-neutral-600">
                <span className="font-medium text-[#4654CD]">Haz clic</span>
                {' '}o arrastra tu archivo aqui
              </p>
              <p className="text-xs text-neutral-500">
                PDF o imagen, maximo 5MB
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-500 text-xs">{error}</p>
      )}

      {/* Ver ejemplos (C1.29 = V2: gallery modal) */}
      {field.showDocExamples && (
        <Button
          size="sm"
          variant="light"
          startContent={<Eye className="w-4 h-4" />}
          onPress={() => setShowExamples(true)}
          className="text-[#4654CD]"
        >
          Ver ejemplos de documentos
        </Button>
      )}

      {/* Modal de ejemplos */}
      <Modal
        isOpen={showExamples}
        onClose={() => setShowExamples(false)}
        size="lg"
        backdrop="blur"
        placement="center"
        classNames={{
          base: 'bg-white',
          wrapper: 'items-center justify-center',
          backdrop: 'bg-black/50',
          header: 'border-b border-neutral-200 bg-white',
          body: 'bg-white',
          closeButton: 'hover:bg-neutral-100 rounded-lg cursor-pointer',
        }}
      >
        <ModalContent>
          <ModalHeader className="text-neutral-800">Ejemplos de documentos validos</ModalHeader>
          <ModalBody className="pb-6 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {DOCUMENT_EXAMPLES.map((example) => (
                <div key={example.id} className="text-center">
                  <div className="aspect-[4/3] bg-neutral-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                    <img
                      src={example.image}
                      alt={example.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.innerHTML =
                          '<div class="text-neutral-400"><FileText class="w-8 h-8" /></div>';
                      }}
                    />
                  </div>
                  <p className="font-medium text-sm text-neutral-800">{example.title}</p>
                  <p className="text-xs text-neutral-500">{example.description}</p>
                </div>
              ))}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default UploadFieldV3;
