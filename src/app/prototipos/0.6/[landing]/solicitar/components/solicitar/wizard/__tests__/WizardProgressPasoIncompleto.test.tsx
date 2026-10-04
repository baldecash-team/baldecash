/// <reference types="jest" />
/**
 * BAL-4357: el check (✓) se pintaba por posicion (`isPast = index < currentIndex`)
 * aunque el componente ya calcula `completedSteps` con los campos obligatorios
 * de verdad. Entrando directo al Resumen con un paso anterior incompleto, ese
 * paso salia con check igual que los demas: el cliente creia que ya habia
 * terminado algo que todavia le faltaba.
 *
 * Estos tests fijan la regla: el check solo va en pasos realmente completos.
 * Un paso anterior incompleto se ve distinto (mantiene su numero) y lo avisa
 * con texto accesible para lector de pantalla, no solo con color.
 */
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: 'prueba-formulario' }),
}));

jest.mock('../../../../context/WizardConfigContext', () => ({
  useWizardConfig: () => ({
    isLoading: false,
    steps: [
      {
        code: 'p1',
        title: 'Datos personales',
        url_slug: 'datos-personales',
        is_summary_step: false,
        fields: [{ code: 'dni', required: true }],
      },
      {
        code: 'p2',
        title: 'Datos académicos',
        url_slug: 'datos-academicos',
        is_summary_step: false,
        fields: [{ code: 'universidad', required: true }],
      },
      {
        code: 'p3',
        title: 'Datos económicos',
        url_slug: 'datos-economicos',
        is_summary_step: false,
        fields: [{ code: 'ingreso', required: true }],
      },
    ],
  }),
}));

jest.mock('../../../../context/WizardContext', () => ({
  useWizard: () => ({
    formData: {
      dni: { value: '12345678' },
      universidad: { value: 'UCV' },
      // "ingreso" queda vacio a proposito: Datos economicos NO esta completo
      // aunque es un paso anterior al actual (Resumen).
    },
  }),
}));

import { WizardProgress } from '../WizardProgress';

describe('WizardProgress - el check solo va en pasos completos (BAL-4357)', () => {
  it('escritorio: el paso anterior incompleto no sale con check, mantiene su numero y avisa al lector de pantalla', () => {
    render(<WizardProgress currentStep={'resumen' as never} />);

    const desktop = within(screen.getByTestId('wizard-progress-desktop'));
    const completo1 = desktop.getByText('Datos personales').closest('button')!;
    const completo2 = desktop.getByText('Datos académicos').closest('button')!;
    const incompleto = desktop.getByText('Datos económicos').closest('button')!;

    // Los pasos realmente completos muestran el check, no el numero de respaldo.
    expect(within(completo1).queryByText('1')).not.toBeInTheDocument();
    expect(within(completo2).queryByText('2')).not.toBeInTheDocument();

    // El paso anterior incompleto mantiene su numero (no el check).
    expect(within(incompleto).getByText('3')).toBeInTheDocument();

    // Y lo avisa con texto accesible, no solo con un color distinto.
    expect(within(incompleto).getByText(/incompleto/i)).toBeInTheDocument();
    expect(within(completo1).queryByText(/incompleto/i)).not.toBeInTheDocument();
    expect(within(completo2).queryByText(/incompleto/i)).not.toBeInTheDocument();
  });

  it('celular: el punto del paso incompleto tambien avisa por su nombre accesible', () => {
    render(<WizardProgress currentStep={'resumen' as never} />);

    const mobile = within(screen.getByTestId('wizard-progress-mobile'));

    expect(
      mobile.getByRole('button', { name: /Datos económicos.*incompleto/i })
    ).toBeInTheDocument();
    expect(
      mobile.queryByRole('button', { name: /Datos personales.*incompleto/i })
    ).not.toBeInTheDocument();
    expect(
      mobile.queryByRole('button', { name: /Datos académicos.*incompleto/i })
    ).not.toBeInTheDocument();
  });
});
