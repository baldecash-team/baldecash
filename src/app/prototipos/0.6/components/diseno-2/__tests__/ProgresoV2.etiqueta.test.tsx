/**
 * Revisión final I3 (BAL-4969): la barra de Diseño 2 usa la misma etiqueta
 * que la de Diseño 1 (`main` ffaf8652): `progress_label` y, sin ella, el título.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgresoV2, etiquetaDelPaso } from '../ProgresoV2';
import { pasosDelProgreso } from '../ShellV2';
import type { WizardStep } from '@/app/prototipos/0.6/services/wizardApi';

function paso(over: Partial<WizardStep>): WizardStep {
  return {
    id: 1,
    code: 'p',
    url_slug: 'p',
    name: 'Nombre interno del paso',
    title: 'Título del paso',
    description: '',
    icon: '',
    order: 1,
    required: true,
    skippable: false,
    estimated_time_minutes: 1,
    is_summary_step: false,
    motivational: null,
    fields: [],
    ...over,
  } as WizardStep;
}

describe('etiquetaDelPaso', () => {
  it('con progress_label usa ese texto, recortado', () => {
    expect(etiquetaDelPaso(paso({ progress_label: '  Tus datos  ' }))).toBe('Tus datos');
  });

  it.each([undefined, null, '', '   '])('con progress_label %p cae al título (no al name)', (v) => {
    expect(etiquetaDelPaso(paso({ progress_label: v as string | null | undefined }))).toBe('Título del paso');
  });

  it.each([undefined, null, '  '])('el paso de resumen con progress_label %p se llama "Resumen", como en Diseño 1 (M-3)', (v) => {
    expect(etiquetaDelPaso(paso({ is_summary_step: true, title: 'Preferencias', progress_label: v as string | null | undefined }))).toBe('Resumen');
  });

  it('el paso de resumen con progress_label usa ese texto', () => {
    expect(etiquetaDelPaso(paso({ is_summary_step: true, title: 'Preferencias', progress_label: 'Envío' }))).toBe('Envío');
  });
});

describe('pasosDelProgreso + ProgresoV2', () => {
  it('la barra y "paso X de N" muestran la progress_label configurada', () => {
    const steps = [
      paso({ id: 1, url_slug: 'datos-personales', order: 1, progress_label: 'Tú' }),
      paso({ id: 2, url_slug: 'datos-academicos', order: 2, title: 'Datos académicos', progress_label: null }),
      paso({ id: 3, url_slug: 'preferencias', order: 3, is_summary_step: true, progress_label: 'Envío' }),
    ];
    const pasos = pasosDelProgreso(steps);
    expect(pasos.map((p) => p.nombre)).toEqual(['Tú', 'Datos académicos', 'Envío']);

    render(<ProgresoV2 pasos={pasos} indiceActual={1} completados={new Set(['datos-personales'])} />);
    expect(screen.getByText(/paso 2 de 3/)).toBeInTheDocument();
    expect(screen.getByText('Tú')).toBeInTheDocument();
    expect(screen.getByText('Envío')).toBeInTheDocument();
    expect(screen.queryByText('Nombre interno del paso')).not.toBeInTheDocument();
  });
});
