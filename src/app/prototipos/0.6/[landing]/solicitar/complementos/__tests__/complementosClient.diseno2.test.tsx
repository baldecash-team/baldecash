/**
 * BAL-5237 · `/solicitar/complementos` elige la página según el diseño:
 * Diseño 2 monta «Protege tu laptop» (el mismo paso resumen de `StepClient`
 * en modo `pantalla="seguros"`); Diseño 1 sigue con su página de siempre.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';

const mockLayout: { disenoSolicitud: 1 | 2; disenoResuelto: boolean } = { disenoSolicitud: 2, disenoResuelto: true };
const mockParams: { landing: string } = { landing: 'pago-diferido' };

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useParams: () => mockParams,
}));
jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => mockLayout,
}));
const mockConfig: { steps: { is_summary_step: boolean }[]; isLoading: boolean } = { steps: [], isLoading: false };
jest.mock('../../context/WizardConfigContext', () => ({
  useWizardConfig: () => mockConfig,
}));
jest.mock('../../[stepSlug]/StepClient', () => ({
  __esModule: true,
  default: ({ pantalla }: { pantalla?: string }) => <div data-testid="paso-d2" data-pantalla={pantalla} />,
}));

import { ComplementosSegunDiseno } from '../complementosClient';

const PaginaD1 = () => <div data-testid="pagina-d1" />;

beforeEach(() => {
  mockLayout.disenoSolicitud = 2;
  mockLayout.disenoResuelto = true;
  mockParams.landing = 'pago-diferido';
  mockConfig.steps = [{ is_summary_step: false }, { is_summary_step: true }];
  mockConfig.isLoading = false;
});

it('Diseño 2: monta la página de seguros (el paso resumen en modo «seguros»)', () => {
  render(<ComplementosSegunDiseno PaginaDiseno1={PaginaD1} />);
  expect(screen.getByTestId('paso-d2')).toHaveAttribute('data-pantalla', 'seguros');
  expect(screen.queryByTestId('pagina-d1')).not.toBeInTheDocument();
});

it('Diseño 1: la página de siempre', () => {
  mockLayout.disenoSolicitud = 1;
  render(<ComplementosSegunDiseno PaginaDiseno1={PaginaD1} />);
  expect(screen.getByTestId('pagina-d1')).toBeInTheDocument();
  expect(screen.queryByTestId('paso-d2')).not.toBeInTheDocument();
});

it('mientras no se sabe el diseño no monta ninguna (ni redirige con la de Diseño 1)', () => {
  mockLayout.disenoResuelto = false;
  render(<ComplementosSegunDiseno PaginaDiseno1={PaginaD1} />);
  expect(screen.queryByTestId('pagina-d1')).not.toBeInTheDocument();
  expect(screen.queryByTestId('paso-d2')).not.toBeInTheDocument();
});

it('una landing que no admite Diseño 2 (zona gamer) sigue con la de Diseño 1', () => {
  mockParams.landing = 'zona-gamer';
  render(<ComplementosSegunDiseno PaginaDiseno1={PaginaD1} />);
  expect(screen.getByTestId('pagina-d1')).toBeInTheDocument();
});

it('Diseño 2 sin paso resumen (no hay Paso 4): la de Diseño 1, que ahí sí ofrece los seguros', () => {
  mockConfig.steps = [{ is_summary_step: false }];
  render(<ComplementosSegunDiseno PaginaDiseno1={PaginaD1} />);
  expect(screen.getByTestId('pagina-d1')).toBeInTheDocument();
});

it('Diseño 2 con los pasos todavía cargando: no monta ninguna', () => {
  mockConfig.isLoading = true;
  mockConfig.steps = [];
  render(<ComplementosSegunDiseno PaginaDiseno1={PaginaD1} />);
  expect(screen.queryByTestId('pagina-d1')).not.toBeInTheDocument();
  expect(screen.queryByTestId('paso-d2')).not.toBeInTheDocument();
});
