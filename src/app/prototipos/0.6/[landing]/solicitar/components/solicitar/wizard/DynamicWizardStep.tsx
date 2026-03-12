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

// Tailwind requires static class names - dynamic classes like `col-span-${n}` get purged
// Map grid_columns values to static Tailwind classes
const GRID_COL_CLASSES: Record<number, string> = {
  1: 'md:col-span-1',
  2: 'md:col-span-2',
  3: 'md:col-span-3',
  4: 'md:col-span-4',
  5: 'md:col-span-5',
  6: 'md:col-span-6',
  7: 'md:col-span-7',
  8: 'md:col-span-8',
  9: 'md:col-span-9',
  10: 'md:col-span-10',
  11: 'md:col-span-11',
  12: 'md:col-span-12',
};

const GRID_COL_MOBILE_CLASSES: Record<number, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
  7: 'col-span-7',
  8: 'col-span-8',
  9: 'col-span-9',
  10: 'col-span-10',
  11: 'col-span-11',
  12: 'col-span-12',
};

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

        // Get static Tailwind classes
        const colClass = GRID_COL_CLASSES[cols] || 'md:col-span-12';
        const colMobileClass = GRID_COL_MOBILE_CLASSES[colsMobile] || 'col-span-12';

        return (
          <div
            key={field.code}
            className={`${colMobileClass} ${colClass}`}
          >
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
