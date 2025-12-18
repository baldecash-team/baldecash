'use client';

/**
 * DocumentExample - Ejemplos visuales de documentos aceptados
 *
 * Muestra ejemplos de formatos aceptados para uploads.
 * 3 versiones: tooltip, modal, inline.
 */

import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, Button } from '@nextui-org/react';
import { FileText, Image as ImageIcon, HelpCircle, ChevronRight, X, Check } from 'lucide-react';

export interface DocumentExampleItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  isValid: boolean;
}

interface DocumentExampleProps {
  title: string;
  examples: DocumentExampleItem[];
  version?: 1 | 2 | 3;
}

/**
 * V1 - Imagen de ejemplo en tooltip
 */
const DocumentExampleV1: React.FC<DocumentExampleProps> = ({ title, examples }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const validExample = examples.find((e) => e.isValid);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className="text-neutral-400 hover:text-[#4654CD] transition-colors cursor-pointer"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {showTooltip && validExample && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white rounded-lg shadow-lg border border-neutral-200">
          <p className="text-xs font-medium text-neutral-700 mb-2">{title}</p>
          {validExample.imageUrl ? (
            <img
              src={validExample.imageUrl}
              alt={validExample.title}
              className="w-full h-32 object-contain rounded border border-neutral-100 bg-neutral-50"
            />
          ) : (
            <div className="w-full h-32 flex items-center justify-center bg-neutral-50 rounded border border-neutral-100">
              <FileText className="w-12 h-12 text-neutral-300" />
            </div>
          )}
          <p className="text-xs text-neutral-500 mt-2">{validExample.description}</p>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white" />
        </div>
      )}
    </div>
  );
};

/**
 * V2 - Gallery de ejemplos en modal
 */
const DocumentExampleV2: React.FC<DocumentExampleProps> = ({ title, examples }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-sm text-[#4654CD] hover:underline flex items-center gap-1 cursor-pointer"
      >
        Ver ejemplos
        <ChevronRight className="w-4 h-4" />
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        backdrop="blur"
        scrollBehavior="outside"
        placement="center"
        classNames={{
          base: 'bg-white my-8',
          wrapper: 'items-center justify-center py-8 min-h-full',
          backdrop: 'bg-black/50',
          closeButton: 'cursor-pointer',
        }}
      >
        <ModalContent className="bg-white max-w-lg">
          <ModalHeader className="flex items-center justify-between border-b border-neutral-100">
            <span className="font-semibold text-neutral-800">{title}</span>
          </ModalHeader>
          <ModalBody className="py-4">
            <div className="grid grid-cols-2 gap-4">
              {examples.map((example) => (
                <div
                  key={example.id}
                  className={`
                    p-3 rounded-lg border-2 transition-colors
                    ${example.isValid
                      ? 'border-[#22c55e] bg-[#22c55e]/5'
                      : 'border-[#ef4444] bg-[#ef4444]/5'
                    }
                  `}
                >
                  {example.imageUrl ? (
                    <img
                      src={example.imageUrl}
                      alt={example.title}
                      className="w-full h-24 object-contain rounded bg-white"
                    />
                  ) : (
                    <div className="w-full h-24 flex items-center justify-center bg-white rounded">
                      <ImageIcon className="w-10 h-10 text-neutral-300" />
                    </div>
                  )}
                  <div className="mt-2 flex items-start gap-2">
                    {example.isValid ? (
                      <Check className="w-4 h-4 text-[#22c55e] flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-4 h-4 text-[#ef4444] flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-neutral-800">
                        {example.title}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {example.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-100">
              <Button
                className="w-full bg-[#4654CD] text-white font-medium cursor-pointer"
                onPress={() => setIsOpen(false)}
              >
                Entendido
              </Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

/**
 * V3 - Inline pequeño al lado del upload
 */
const DocumentExampleV3: React.FC<DocumentExampleProps> = ({ title, examples }) => {
  const validExample = examples.find((e) => e.isValid);

  if (!validExample) return null;

  return (
    <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
      {validExample.imageUrl ? (
        <img
          src={validExample.imageUrl}
          alt={validExample.title}
          className="w-16 h-16 object-contain rounded border border-neutral-200 bg-white flex-shrink-0"
        />
      ) : (
        <div className="w-16 h-16 flex items-center justify-center bg-white rounded border border-neutral-200 flex-shrink-0">
          <FileText className="w-8 h-8 text-neutral-300" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-neutral-700">{title}</p>
        <p className="text-xs text-neutral-500 mt-0.5">{validExample.description}</p>
      </div>
    </div>
  );
};

/**
 * DocumentExample - Wrapper que selecciona la versión correcta
 */
export const DocumentExample: React.FC<DocumentExampleProps> = ({
  version = 1,
  ...props
}) => {
  switch (version) {
    case 1:
      return <DocumentExampleV1 {...props} />;
    case 2:
      return <DocumentExampleV2 {...props} />;
    case 3:
      return <DocumentExampleV3 {...props} />;
    default:
      return <DocumentExampleV1 {...props} />;
  }
};

export default DocumentExample;
