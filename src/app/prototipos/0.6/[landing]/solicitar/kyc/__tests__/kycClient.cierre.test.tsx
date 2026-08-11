/// <reference types="jest" />
/**
 * Cerrar el KYC tiene que avisarle a la confirmación de dónde viene.
 *
 * La pantalla de confirmación es la misma para el submit y para el cierre del
 * KYC, y dice cosas opuestas en cada caso ("en revisión" vs "todo terminado").
 * Lo único que las separa es el `?kyc=1` que pone este cliente: si se pierde,
 * quien acaba de firmar ve que su solicitud sigue evaluándose.
 *
 * El gate de "landing sin KYC" navega a la MISMA pantalla sin haber cerrado
 * nada, así que ahí el flag no debe ir.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

jest.mock('@/app/prototipos/0.6/services/kycApi', () => {
  const actual = jest.requireActual('@/app/prototipos/0.6/services/kycApi');
  return {
    ...actual,
    getKycProgress: jest.fn(),
    completeKycStep: jest.fn(),
    completarKyc: jest.fn(),
    // Sin documento emitido: el paso no exige aceptar nada y el boton queda
    // habilitado. Lo que se prueba aca es la navegacion del cierre, no el
    // contrato (que tiene sus propios tests).
    getContrato: jest.fn().mockResolvedValue({ disponible: false, html: null }),
  };
});

import KycClient from '../kycClient';
import { getKycProgress, completeKycStep } from '@/app/prototipos/0.6/services/kycApi';

const mockGetKycProgress = getKycProgress as jest.MockedFunction<typeof getKycProgress>;
const mockCompleteKycStep = completeKycStep as jest.MockedFunction<typeof completeKycStep>;

const mockUseSearchParams = jest.fn(() => new URLSearchParams('code=APP-1'));
const mockKycFlow = jest.fn(() => ({ kycEnabled: true, kycSteps: [{ type: 'contract' }], isLoading: false }));
const mockRouterReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockRouterReplace, push: jest.fn() }),
  useParams: () => ({ landing: 'family-farms-baldecash-b' }),
  useSearchParams: () => mockUseSearchParams(),
}));

jest.mock('@/app/prototipos/0.6/hooks/useSolicitarFlow', () => ({
  useSolicitarFlow: () => mockKycFlow(),
}));

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: jest.fn(), flush: jest.fn() }),
}));

jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({
    navbarProps: { logo: '/logo.png' },
    footerData: {},
    agreementData: null,
    isLoading: false,
    hasError: false,
  }),
}));

jest.mock('@/app/prototipos/_shared', () => ({
  CubeGridSpinner: () => <div data-testid="spinner">Loading...</div>,
}));

jest.mock('@/app/prototipos/0.6/components/NotFoundContent', () => ({
  NotFoundContent: () => <div>Not Found</div>,
}));

jest.mock('@/app/prototipos/0.6/components/hero/Navbar', () => ({
  Navbar: () => <nav>Navbar</nav>,
}));

jest.mock('@/app/prototipos/0.6/components/product-landing/nvidia/NvidiaNavbar', () => ({
  NvidiaNavbar: () => <nav>NvidiaNavbar</nav>,
}));

jest.mock('@/app/prototipos/0.6/components/hero/Footer', () => ({
  Footer: () => <footer>Footer</footer>,
}));

const estadoUnPaso = {
  application_code: 'APP-1',
  landing_slug: 'family-farms-baldecash-b',
  steps: [{ type: 'contract', status: 'pending', completed_at: null }],
  next_step: 'contract',
  next_step_index: 0,
  is_complete: false,
  kyc_enabled: true,
  resume: { enabled: false, ttl_hours: 72 },
};

beforeEach(() => {
  window.localStorage.clear();
  jest.clearAllMocks();
  mockUseSearchParams.mockReturnValue(new URLSearchParams('code=APP-1'));
  mockKycFlow.mockReturnValue({ kycEnabled: true, kycSteps: [{ type: 'contract' }], isLoading: false });
  mockCompleteKycStep.mockResolvedValue({ ...estadoUnPaso, is_complete: true } as never);
});

afterEach(() => jest.restoreAllMocks());

it('al terminar el ultimo sub-paso navega a la confirmacion con el flag de KYC cerrado', async () => {
  mockGetKycProgress.mockResolvedValue(estadoUnPaso as never);

  render(<KycClient />);

  const continuar = await screen.findByRole('button', { name: /continuar/i });
  await userEvent.click(continuar);

  await waitFor(() => expect(mockRouterReplace).toHaveBeenCalled());

  const destino = mockRouterReplace.mock.calls[0][0] as string;
  expect(destino).toContain('/solicitar/confirmacion');
  expect(destino).toContain('code=APP-1');
  // Sin esto la confirmacion le diria "estamos revisando tu informacion" a
  // alguien que acaba de firmar.
  expect(destino).toContain('kyc=1');
});

it('el gate de landing sin KYC va a la misma pantalla SIN el flag', async () => {
  // No se cerro nada: la solicitud sigue su curso normal y la confirmacion
  // tiene que seguir hablando de evaluacion.
  mockKycFlow.mockReturnValue({ kycEnabled: false, kycSteps: [], isLoading: false });
  mockGetKycProgress.mockResolvedValue(null);

  render(<KycClient />);

  await waitFor(() => expect(mockRouterReplace).toHaveBeenCalled());

  const destino = mockRouterReplace.mock.calls[0][0] as string;
  expect(destino).toContain('/solicitar/confirmacion');
  expect(destino).not.toContain('kyc=1');
});
