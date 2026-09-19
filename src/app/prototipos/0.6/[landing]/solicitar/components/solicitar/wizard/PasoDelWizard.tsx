'use client';

/**
 * El cuerpo de un paso regular del formulario, sin nada de la página.
 *
 * Existe para que el mismo paso se pueda montar en dos lugares: la página
 * `/solicitar/[stepSlug]`, dentro de `WizardLayout`, y —en las landings de
 * segundo financiamiento, que tienen un solo paso— embebido en la intro debajo
 * de accesorios.
 *
 * El chrome NO entra acá a propósito: `WizardLayout` es una página entera
 * (`min-h-screen`, navbar, progreso, columna motivacional) y no se puede
 * embeber. Cada host pone el suyo.
 */

import React from 'react';
import { DynamicWizardStep } from './DynamicWizardStep';
import type { PasoDelWizardControles } from './usePasoDelWizard';

export function PasoDelWizard({ paso }: { paso: PasoDelWizardControles }) {
  if (!paso.step) return null;
  return (
    <DynamicWizardStep
      step={paso.step}
      showErrors={paso.showErrors}
      stepOrder={paso.step.order}
    />
  );
}

export default PasoDelWizard;
