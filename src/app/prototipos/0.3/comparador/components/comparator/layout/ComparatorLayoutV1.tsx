'use client';

/**
 * ComparatorLayoutV1 - Modal Fullscreen
 *
 * Comparador como modal fullscreen con overlay oscuro
 * No pierde la pagina de origen
 * Ideal para: acceso rapido desde catalogo
 */

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Switch,
} from '@nextui-org/react';
import { X, Trash2, GitCompareArrows, Eye, EyeOff } from 'lucide-react';
import { ComparatorLayoutProps } from '../../../types/comparator';

interface ComparatorLayoutV1Props extends ComparatorLayoutProps {
  showOnlyDifferences: boolean;
  onToggleDifferences: (value: boolean) => void;
  highlightWinners: boolean;
  onToggleHighlight: (value: boolean) => void;
}

export const ComparatorLayoutV1: React.FC<ComparatorLayoutV1Props> = ({
  config,
  products,
  onRemoveProduct,
  onClearAll,
  isOpen = false,
  onClose,
  children,
  showOnlyDifferences,
  onToggleDifferences,
  highlightWinners,
  onToggleHighlight,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      scrollBehavior="outside"
      backdrop="blur"
      classNames={{
        base: 'bg-white m-0 sm:m-4 rounded-none sm:rounded-xl max-h-screen',
        wrapper: 'items-start sm:items-center justify-center',
        backdrop: 'bg-black/60',
        header: 'border-b border-neutral-200 bg-white py-4',
        body: 'bg-white p-0 overflow-auto',
        footer: 'border-t border-neutral-200 bg-white',
        closeButton: 'top-4 right-4 hover:bg-neutral-100 rounded-lg cursor-pointer',
      }}
    >
      <ModalContent>
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
                  <GitCompareArrows className="w-5 h-5 text-[#4654CD]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-800">
                    Comparar Productos
                  </h2>
                  <p className="text-sm text-neutral-500">
                    {products.length} de {config.maxProducts} productos seleccionados
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="hidden md:flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch
                    size="sm"
                    isSelected={showOnlyDifferences}
                    onValueChange={onToggleDifferences}
                    classNames={{
                      wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
                      thumb: 'bg-white shadow-md',
                    }}
                  />
                  <span className="text-sm text-neutral-600">
                    Solo diferencias
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch
                    size="sm"
                    isSelected={highlightWinners}
                    onValueChange={onToggleHighlight}
                    classNames={{
                      wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
                      thumb: 'bg-white shadow-md',
                    }}
                  />
                  <span className="text-sm text-neutral-600">
                    Resaltar mejor/peor
                  </span>
                </label>
              </div>
            </ModalHeader>

            <ModalBody className="p-4 md:p-6">
              {/* Mobile Controls */}
              <div className="md:hidden flex flex-wrap gap-4 mb-4 p-3 bg-neutral-50 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch
                    size="sm"
                    isSelected={showOnlyDifferences}
                    onValueChange={onToggleDifferences}
                    classNames={{
                      wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
                      thumb: 'bg-white shadow-md',
                    }}
                  />
                  <span className="text-xs text-neutral-600">
                    Solo diferencias
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch
                    size="sm"
                    isSelected={highlightWinners}
                    onValueChange={onToggleHighlight}
                    classNames={{
                      wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
                      thumb: 'bg-white shadow-md',
                    }}
                  />
                  <span className="text-xs text-neutral-600">
                    Resaltar mejor/peor
                  </span>
                </label>
              </div>

              {/* Comparison Content */}
              {children}
            </ModalBody>

            <ModalFooter className="flex justify-between">
              <Button
                variant="light"
                color="danger"
                startContent={<Trash2 className="w-4 h-4" />}
                onPress={onClearAll}
                className="cursor-pointer"
              >
                Limpiar todo
              </Button>
              <Button
                className="bg-[#4654CD] text-white cursor-pointer"
                onPress={onCloseModal}
              >
                Cerrar comparador
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ComparatorLayoutV1;
