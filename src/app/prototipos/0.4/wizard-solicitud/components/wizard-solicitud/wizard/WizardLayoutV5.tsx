'use client';

/**
 * WizardLayoutV5 - Layout floating card con blur
 * Card centrado con backdrop blur
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { X } from 'lucide-react';
import type { WizardSolicitudStep, SelectedProduct } from '../../../types/wizard-solicitud';

interface WizardLayoutV5Props {
  steps: WizardSolicitudStep[];
  currentStep: number;
  selectedProduct?: SelectedProduct;
  
  
  children: React.ReactNode;
  onClose?: () => void;
}

export const WizardLayoutV5: React.FC<WizardLayoutV5Props> = ({
  steps,
  currentStep,
  selectedProduct,
  
  
  children,
  onClose,
}) => {
  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      {/* Floating header */}
      <header className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
          <img
            src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
            alt="BaldeCash"
            className="h-5 object-contain"
          />
        </div>
        <Button
          isIconOnly
          size="sm"
          onPress={onClose}
          className="bg-white/90 backdrop-blur-sm shadow-sm rounded-full"
        >
          <X className="w-4 h-4" />
        </Button>
      </header>

      {/* Main content area */}
      <main className="flex-1 flex items-center justify-center px-4 py-20 overflow-hidden">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Product banner */}
          {selectedProduct && (
            <div className="bg-[#4654CD]/5 p-4 flex items-center gap-3 border-b border-neutral-100">
              <div className="w-14 h-14 bg-white rounded-xl overflow-hidden shadow-sm">
                <img
                  src={selectedProduct.thumbnail}
                  alt={selectedProduct.name}
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-800">{selectedProduct.name}</p>
                <p className="text-lg font-bold text-[#4654CD]">S/{selectedProduct.monthlyQuota}/mes</p>
              </div>
            </div>
          )}

          {/* Form content */}
          <div className="p-6">
            <div className="mb-6">
              <p className="text-xs text-[#4654CD] font-medium mb-1">
                Paso {currentStep + 1} de {steps.length}
              </p>
              <h1 className="text-xl font-bold text-neutral-900">
                {currentStepData?.name}
              </h1>
              {currentStepData?.description && (
                <p className="text-sm text-neutral-500 mt-1">{currentStepData.description}</p>
              )}
            </div>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WizardLayoutV5;
