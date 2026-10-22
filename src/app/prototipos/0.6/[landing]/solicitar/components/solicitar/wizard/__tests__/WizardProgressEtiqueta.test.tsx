/// <reference types="jest" />
/**
 * El texto de cada paso en la barra de progreso.
 *
 * Cada paso puede traer `progress_label` desde el admin. Si viene, la barra
 * muestra ese texto; si no viene (o viene vacío / solo espacios), la barra
 * sigue como siempre: el título del paso, y "Resumen" en el último.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

type PasoDePrueba = {
  code: string;
  title: string;
  url_slug: string;
  fields: never[];
  is_summary_step?: boolean;
  progress_label?: string | null;
};

let pasos: PasoDePrueba[] = [];

jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: 'ucv' }),
}));

jest.mock('../../../../context/WizardConfigContext', () => ({
  useWizardConfig: () => ({ isLoading: false, steps: pasos }),
}));

jest.mock('../../../../context/WizardContext', () => ({
  useWizard: () => ({ formData: {} }),
}));

import { WizardProgress } from '../WizardProgress';

const armarPasos = (
  etiquetas: { p1?: string | null; p2?: string | null; resumen?: string | null } = {},
): PasoDePrueba[] => {
  const conEtiqueta = (paso: PasoDePrueba, etiqueta: string | null | undefined) =>
    etiqueta === undefined ? paso : { ...paso, progress_label: etiqueta };
  return [
    conEtiqueta({ code: 'p1', title: 'Datos personales', url_slug: 'datos-personales', fields: [] }, etiquetas.p1),
    conEtiqueta({ code: 'p2', title: 'Datos académicos', url_slug: 'datos-academicos', fields: [] }, etiquetas.p2),
    conEtiqueta(
      { code: 'res', title: 'Revisa tu solicitud', url_slug: 'resumen', fields: [], is_summary_step: true },
      etiquetas.resumen,
    ),
  ];
};

const pintar = () => render(<WizardProgress currentStep={'datos-personales' as never} />);

it('con progress_label la barra muestra ese texto', () => {
  pasos = armarPasos({ p1: 'Tus datos', p2: 'Estudios', resumen: 'Confirmar' });
  pintar();

  expect(screen.getAllByText('Tus datos').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Estudios').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Confirmar').length).toBeGreaterThan(0);
  expect(screen.queryByText('Datos personales')).not.toBeInTheDocument();
  expect(screen.queryByText('Datos académicos')).not.toBeInTheDocument();
  expect(screen.queryByText('Resumen')).not.toBeInTheDocument();
});

it('sin progress_label usa el título y "Resumen" en el último paso', () => {
  pasos = armarPasos();
  pintar();

  expect(screen.getAllByText('Datos personales').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Datos académicos').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Resumen').length).toBeGreaterThan(0);
  // El título del paso de resumen no se usa en la barra.
  expect(screen.queryByText('Revisa tu solicitud')).not.toBeInTheDocument();
});

it('con progress_label null cae al de por defecto', () => {
  pasos = armarPasos({ p1: null, p2: null, resumen: null });
  pintar();

  expect(screen.getAllByText('Datos personales').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Datos académicos').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Resumen').length).toBeGreaterThan(0);
});

it('con progress_label vacío o con espacios cae al de por defecto', () => {
  pasos = armarPasos({ p1: '', p2: '   ', resumen: '  ' });
  pintar();

  expect(screen.getAllByText('Datos personales').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Datos académicos').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Resumen').length).toBeGreaterThan(0);
});

it('recorta los espacios alrededor de progress_label', () => {
  pasos = armarPasos({ p1: '  Tus datos  ' });
  pintar();

  expect(screen.getAllByText('Tus datos').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Datos académicos').length).toBeGreaterThan(0);
});
