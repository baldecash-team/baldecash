'use client';

/**
 * WizardLayoutV4 - Layout limpio con colores BaldeCash (sin gradientes)
 * Estilo fintech minimalista siguiendo el brandbook
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { X } from 'lucide-react';
import type { WizardSolicitudStep, SelectedProduct } from '../../../types/wizard-solicitud';

interface WizardLayoutV4Props {
  steps: WizardSolicitudStep[];
  currentStep: number;
  selectedProduct?: SelectedProduct;
  
  
  children: React.ReactNode;
  onClose?: () => void;
}

export const WizardLayoutV4: React.FC<WizardLayoutV4Props> = ({
  steps,
  currentStep,
  selectedProduct,
  
  
  children,
  onClose,
}) => {
  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-[#151744] text-white relative overflow-hidden">
      {/* Fondo con shapes solidos (sin gradientes) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Circulo azul solido */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#4654CD]/20" />
        {/* Circulo aqua solido */}
        <div className="absolute top-1/2 -left-24 w-64 h-64 rounded-full bg-[#03DBD0]/10" />
        {/* Circulo pequeno */}
        <div className="absolute bottom-20 right-1/4 w-32 h-32 rounded-full bg-[#4654CD]/15" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
              alt="BaldeCash"
              className="h-8 object-contain brightness-0 invert"
            />
            {selectedProduct && (
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white/90">{selectedProduct.name}</p>
                <p className="text-xs text-[#03DBD0]">S/{selectedProduct.monthlyQuota}/mes</p>
              </div>
            )}
          </div>
          <Button
            isIconOnly
            size="sm"
            onPress={onClose}
            className="bg-white/10 hover:bg-white/20 text-white rounded-full min-w-8 w-8 h-8 border border-white/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Progress bar solida */}
      <div className="relative z-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#03DBD0] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-white/40">
            <span>Paso {currentStep + 1} de {steps.length}</span>
            <span>{Math.round(progress)}% completado</span>
          </div>
        </div>
      </div>

      {/* Main content - wrapper con overrides dark mode para todos los hijos */}
      <main className="relative z-10 py-8 px-4 overflow-hidden wizard-dark-mode
        [&_.text-neutral-900]:text-white [&_.text-neutral-800]:text-white [&_.text-neutral-700]:text-white/80
        [&_.text-neutral-600]:text-white/70 [&_.text-neutral-500]:text-white/60 [&_.text-neutral-400]:text-white/50
        [&_.bg-neutral-50]:bg-white/10 [&_.bg-neutral-100]:bg-white/10 [&_.bg-neutral-200]:bg-white/30
        [&_.border-neutral-200]:border-white/20 [&_.border-neutral-300]:border-white/20
        [&_input]:bg-white/10 [&_input]:border-white/20 [&_input]:text-white [&_input]:placeholder-white/40
        [&_label]:text-white/80
        [&_button.bg-neutral-200]:bg-white/30 [&_button.text-neutral-500]:text-white/60
      ">
        <div className="max-w-lg mx-auto">
          {/* Card limpia */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10">
            {/* Titulo */}
            <div className="mb-6 text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {currentStepData?.name}
              </h1>
              {currentStepData?.description && (
                <p className="text-white/60 mt-2">{currentStepData.description}</p>
              )}
            </div>

            {/* Form content */}
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WizardLayoutV4;
