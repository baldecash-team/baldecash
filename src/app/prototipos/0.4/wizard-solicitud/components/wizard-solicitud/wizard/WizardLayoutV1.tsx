'use client';

/**
 * WizardLayoutV1 - Layout fullscreen sin distracciones
 * Estilo clasico enfocado en el formulario
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { X } from 'lucide-react';
import type { WizardSolicitudStep, SelectedProduct } from '../../../types/wizard-solicitud';

interface WizardLayoutV1Props {
  steps: WizardSolicitudStep[];
  currentStep: number;
  selectedProduct?: SelectedProduct;
  children: React.ReactNode;
  onClose?: () => void;
}

export const WizardLayoutV1: React.FC<WizardLayoutV1Props> = ({
  steps,
  currentStep,
  selectedProduct,
  children,
  onClose,
}) => {
  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header minimalista */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo + Producto */}
          <div className="flex items-center gap-3">
            <img
              src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
              alt="BaldeCash"
              className="h-7 object-contain"
            />
            {selectedProduct && (
              <>
                <div className="w-px h-6 bg-neutral-200" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-neutral-100 rounded overflow-hidden">
                    <img
                      src={selectedProduct.thumbnail}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/placeholder-laptop.jpg';
                      }}
                    />
                  </div>
                  <span className="text-sm text-neutral-600 hidden sm:block">
                    {selectedProduct.name}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Cerrar */}
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={onClose}
            className="text-neutral-400 hover:text-neutral-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 py-6 px-4">
        <div className="max-w-lg mx-auto">
          {/* Titulo del paso */}
          <div className="mb-6 text-center">
            <h1 className="text-xl md:text-2xl font-bold text-neutral-900">
              {currentStepData?.name}
            </h1>
            {currentStepData?.description && (
              <p className="text-sm text-neutral-500 mt-1">
                {currentStepData.description}
              </p>
            )}
          </div>

          {/* Contenido (progress, form, navigation) */}
          {children}
        </div>
      </main>
    </div>
  );
};

export default WizardLayoutV1;
