'use client';

/**
 * WizardLayoutV3 - Layout estilo modal/card centrado
 * Formulario en card flotante con fondo mejorado
 */

import React from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { X, Clock } from 'lucide-react';
import type { WizardSolicitudStep, SelectedProduct } from '../../../types/wizard-solicitud';

interface WizardLayoutV3Props {
  steps: WizardSolicitudStep[];
  currentStep: number;
  selectedProduct?: SelectedProduct;
  showTimeEstimate?: boolean;
  estimatedMinutesRemaining?: number;
  children: React.ReactNode;
  onClose?: () => void;
}

export const WizardLayoutV3: React.FC<WizardLayoutV3Props> = ({
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo con forma definida en la parte superior */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#4654CD]/10 via-[#4654CD]/5 to-white" />
      <div className="absolute top-0 left-0 right-0 h-64 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[150%] aspect-[2/1] rounded-[100%] bg-[#4654CD]/8 border-b border-[#4654CD]/10" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 flex flex-col items-center justify-start py-8 px-4">
        {/* Header flotante */}
        <div className="w-full max-w-2xl flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img
              src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
              alt="BaldeCash"
              className="h-8 object-contain"
            />
            {selectedProduct && (
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-neutral-800">{selectedProduct.name}</p>
                <p className="text-xs text-neutral-500">S/{selectedProduct.monthlyQuota}/mes</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {showTimeEstimate && (
              <span className="text-sm text-neutral-500 flex items-center gap-1 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-neutral-200/50">
                <Clock className="w-4 h-4" />
                ~{estimatedMinutesRemaining} min
              </span>
            )}
            <Button isIconOnly variant="light" size="sm" onPress={onClose} className="rounded-full bg-white/80 backdrop-blur-sm border border-neutral-200/50">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Card principal */}
        <Card className="w-full max-w-2xl shadow-xl border border-neutral-200/50">
          <CardBody className="p-6 md:p-8">
            {/* Titulo */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-neutral-900">
                {currentStepData?.name}
              </h1>
              {currentStepData?.description && (
                <p className="text-neutral-500 mt-2">{currentStepData.description}</p>
              )}
            </div>

            {/* Contenido */}
            {children}
          </CardBody>
        </Card>

        {/* Footer info */}
        <div className="mt-4 text-center text-xs text-neutral-400 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-neutral-200/30">
          Paso {currentStep + 1} de {steps.length}
        </div>
      </div>
    </div>
  );
};

export default WizardLayoutV3;
