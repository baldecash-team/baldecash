'use client';

/**
 * DynamicWizardStep - Renders all fields for a wizard step from API config
 * Uses grid layout based on field.grid_columns
 */

import React from 'react';
import { WizardStep } from '../../../../../services/wizardApi';
import { DynamicField } from '../fields/DynamicField';

interface DynamicWizardStepProps {
  step: WizardStep;
  showErrors?: boolean;
}

export const DynamicWizardStep: React.FC<DynamicWizardStepProps> = ({
  step,
  showErrors = false,
}) => {
  // Fields come already ordered by display_order from the API
  return (
    <div className="grid grid-cols-12 gap-4">
      {step.fields.map((field) => {
        // Use grid_columns from API (default to 12 = full width)
        const cols = field.grid_columns || 12;
        const colsMobile = field.grid_columns_mobile || 12;

        return (
          <div
            key={field.code}
            className={`
              col-span-${colsMobile}
              md:col-span-${cols}
            `}
            style={{
              // Fallback inline styles since Tailwind doesn't support dynamic col-span-N
              gridColumn: `span ${colsMobile} / span ${colsMobile}`,
            }}
          >
            <style jsx>{`
              @media (min-width: 768px) {
                div {
                  grid-column: span ${cols} / span ${cols};
                }
              }
            `}</style>
            <DynamicField
              field={field}
              showError={showErrors}
            />
          </div>
        );
      })}
    </div>
  );
};

export default DynamicWizardStep;
