/// <reference types="jest" />
/**
 * El progreso del wizard en segundo financiamiento.
 *
 * El recorrido de una landing `renueva-*` es corto y no se navega: la persona
 * ya es cliente y viene a confirmar. Los cuatro pasos con su círculo y su
 * título ocupaban el ancho entero prometiendo una navegación que ahí no lleva a
 * ninguna parte, y en móvil repetían el título que la pantalla ya muestra
 * arriba. Queda "Paso X de Y".
 *
 * La regla que fija este archivo tiene dos mitades: en `renueva-*` no hay
 * pasos clickeables, y en cualquier otra landing el recorrido completo sigue
 * igual que siempre.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

let landingActual = 'renueva-tu-equipo-1-a';

jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: landingActual }),
}));

jest.mock('../../../../context/WizardConfigContext', () => ({
  useWizardConfig: () => ({
    isLoading: false,
    steps: [
      { code: 'p1', title: 'Datos personales', url_slug: 'datos-personales', fields: [] },
      { code: 'p2', title: 'Datos académicos', url_slug: 'datos-academicos', fields: [] },
      { code: 'p3', title: 'Datos económicos', url_slug: 'datos-economicos', fields: [] },
    ],
  }),
}));

jest.mock('../../../../context/WizardContext', () => ({
  useWizard: () => ({ formData: {} }),
}));

import { WizardProgress } from '../WizardProgress';

it('en renueva-* solo se ve el contador', () => {
  landingActual = 'renueva-tu-equipo-1-a';

  render(<WizardProgress currentStep={'datos-personales' as never} />);

  // El contador aparece en las dos versiones: la de móvil y la de escritorio.
  expect(screen.getAllByText('Paso 1 de 4').length).toBeGreaterThan(0);
  // Nada que clickear: no hay recorrido que recorrer.
  expect(screen.queryAllByRole('button')).toHaveLength(0);
  expect(screen.queryByText('Datos académicos')).not.toBeInTheDocument();
});

it('en el resto de landings el recorrido sigue completo', () => {
  landingActual = 'ucv';

  render(<WizardProgress currentStep={'datos-personales' as never} />);

  expect(screen.getAllByText('Datos académicos').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Resumen').length).toBeGreaterThan(0);
  expect(screen.queryAllByRole('button').length).toBeGreaterThan(0);
});
