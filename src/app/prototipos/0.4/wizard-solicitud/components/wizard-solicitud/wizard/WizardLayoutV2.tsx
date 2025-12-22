'use client';

/**
 * WizardLayoutV2 - Layout con sidebar izquierdo
 * Muestra lista de pasos en sidebar desktop
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { X, Clock, Check } from 'lucide-react';
import type { WizardSolicitudStep, SelectedProduct } from '../../../types/wizard-solicitud';

interface WizardLayoutV2Props {
  steps: WizardSolicitudStep[];
  currentStep: number;
  selectedProduct?: SelectedProduct;
  showTimeEstimate?: boolean;
  estimatedMinutesRemaining?: number;
  children: React.ReactNode;
  onClose?: () => void;
}

export const WizardLayoutV2: React.FC<WizardLayoutV2Props> = ({
  steps,
  currentStep,
  selectedProduct,
  showTimeEstimate = true,
  estimatedMinutesRemaining = 5,
  children,
  onClose,
}) => {
  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar - solo desktop */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-neutral-200 flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-neutral-200">
          <img
            src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
            alt="BaldeCash"
            className="h-7 object-contain"
          />
        </div>

        {/* Steps list */}
        <nav className="flex-1 p-4 space-y-2">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isCurrent ? 'bg-[#4654CD]/10 text-[#4654CD]' :
                  isCompleted ? 'text-neutral-600' : 'text-neutral-400'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  isCompleted ? 'bg-[#22c55e] text-white' :
                  isCurrent ? 'bg-[#4654CD] text-white' : 'bg-neutral-200 text-neutral-500'
                }`}>
                  {isCompleted ? <Check className="w-3 h-3" /> : index + 1}
                </div>
                <span className="text-sm font-medium">{step.shortName}</span>
              </div>
            );
          })}
        </nav>

        {/* Product info */}
        {selectedProduct && (
          <div className="p-4 border-t border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-neutral-100 rounded overflow-hidden">
                <img
                  src={selectedProduct.thumbnail}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-800 truncate">{selectedProduct.name}</p>
                <p className="text-lg font-bold text-[#4654CD]">S/{selectedProduct.monthlyQuota}/mes</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header mobile/tablet */}
        <header className="lg:hidden bg-white border-b border-neutral-200 sticky top-0 z-40">
          <div className="px-4 py-3 flex items-center justify-between">
            <img
              src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
              alt="BaldeCash"
              className="h-7 object-contain"
            />
            <div className="flex items-center gap-3">
              {showTimeEstimate && (
                <div className="flex items-center gap-1.5 text-neutral-500 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>~{estimatedMinutesRemaining} min</span>
                </div>
              )}
              <Button isIconOnly variant="light" size="sm" onPress={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 py-6 px-4 lg:px-8">
          <div className="max-w-lg mx-auto lg:max-w-xl">
            <div className="mb-6">
              <h1 className="text-xl md:text-2xl font-bold text-neutral-900">
                {currentStepData?.name}
              </h1>
              {currentStepData?.description && (
                <p className="text-sm text-neutral-500 mt-1">{currentStepData.description}</p>
              )}
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default WizardLayoutV2;
