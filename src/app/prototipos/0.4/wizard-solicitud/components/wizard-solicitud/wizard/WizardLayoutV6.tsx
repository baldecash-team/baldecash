'use client';

/**
 * WizardLayoutV6 - Layout fullscreen branded
 * Header prominente con branding completo
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { X, Clock, Shield } from 'lucide-react';
import type { WizardSolicitudStep, SelectedProduct } from '../../../types/wizard-solicitud';

interface WizardLayoutV6Props {
  steps: WizardSolicitudStep[];
  currentStep: number;
  selectedProduct?: SelectedProduct;
  
  
  children: React.ReactNode;
  onClose?: () => void;
}

export const WizardLayoutV6: React.FC<WizardLayoutV6Props> = ({
  steps,
  currentStep,
  selectedProduct,
  
  
  children,
  onClose,
}) => {
  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header prominente */}
      <header className="bg-[#4654CD] text-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-[#4654CD] font-black text-lg">B</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-lg">BaldeCash</p>
              <p className="text-white/70 text-xs">Financia tu futuro</p>
            </div>
          </div>
          <Button
            isIconOnly
            size="sm"
            onPress={onClose}
            className="bg-white/10 hover:bg-white/20 text-white rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Sub-header con producto */}
        {selectedProduct && (
          <div className="bg-white/10 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-lg overflow-hidden">
                <img
                  src={selectedProduct.thumbnail}
                  alt={selectedProduct.name}
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{selectedProduct.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black">S/{selectedProduct.monthlyQuota}</p>
                <p className="text-xs text-white/70">por mes</p>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Progress bar global */}
      <div className="h-1 bg-neutral-100">
        <div
          className="h-full bg-[#4654CD] transition-all duration-500"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 py-8 px-4 overflow-hidden">
        <div className="max-w-lg mx-auto">
          <div className="mb-6 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">
              {currentStepData?.name}
            </h1>
            {currentStepData?.description && (
              <p className="text-neutral-500 mt-2">{currentStepData.description}</p>
            )}
          </div>
          {children}
        </div>
      </main>

      {/* Footer trust badges */}
      <footer className="border-t border-neutral-100 py-3">
        <div className="max-w-lg mx-auto px-4 flex items-center justify-center gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>Datos protegidos</span>
          </div>
          <div className="w-px h-4 bg-neutral-200" />
          <span>Paso {currentStep + 1} de {steps.length}</span>
        </div>
      </footer>
    </div>
  );
};

export default WizardLayoutV6;
