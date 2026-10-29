'use client';

/**
 * InsuranceSection - Reusable insurance selection section
 * Can be used in Preview page (before wizard) or Complementos page (after wizard)
 * Uses ProductContext for state management
 * Supports multi-select (both insurances can be selected)
 *
 * La carga de planes y la selección viven en `usePlanesDeSeguro`, que también
 * usa el Paso 4 de Diseño 2 (BAL-4966). Acá solo se dibujan.
 *
 * S3/R7: lo que trae el combo va arriba, fijo y a S/0; abajo, lo que se compra.
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import { InsuranceCards } from '../../upsell';
import { SegurosIncluidosEnCombo } from '../../upsell/SegurosIncluidosEnCombo';
import { useWizardConfig } from '../../../context/WizardConfigContext';
import { usePlanesDeSeguro } from './usePlanesDeSeguro';

interface InsuranceSectionProps {
  showIntro?: boolean;
  className?: string;
}

export function InsuranceSection({
  showIntro = true,
  className = '',
}: InsuranceSectionProps) {
  const { badgeText } = useWizardConfig();
  const { planes: insurancePlans, incluidos, cargando: isLoading, elegidos, alternar } = usePlanesDeSeguro();

  if (!isLoading && insurancePlans.length === 0 && incluidos.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
        </div>
      ) : (
        <>
          <SegurosIncluidosEnCombo seguros={incluidos} className={insurancePlans.length > 0 ? 'mb-6' : ''} />
          {insurancePlans.length > 0 && (
            <InsuranceCards
              plans={insurancePlans}
              selectedPlanIds={elegidos}
              onToggle={alternar}
              showIntro={showIntro}
              badgeText={badgeText}
            />
          )}
        </>
      )}
    </div>
  );
}
