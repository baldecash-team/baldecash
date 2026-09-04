/// <reference types="jest" />
/**
 * El orquestador frente a un contrato que quedó viejo.
 *
 * Dos caminos llevan al mismo lugar —volver al paso del contrato—: el 409 al
 * marcar el sub-paso, y el `contrato_vencido` al cerrar el KYC. Sin esto, el
 * primero avanzaría igual (el avance era fire-and-forget) y el segundo mandaría
 * a confirmación una solicitud que no se aprobó.
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
    getContrato: jest.fn(),
  };
});

const mockRouterReplace = jest.fn();
const mockUseSearchParams = jest.fn(() => new URLSearchParams('code=APP-1'));
const mockKycFlow = jest.fn(() => ({
  kycEnabled: true, kycSteps: [{ type: 'contract' }], isLoading: false,
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockRouterReplace, push: jest.fn() }),
  useParams: () => ({ landing: 'copia-home' }),
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

import KycClient from '../kycClient';
import {
  completeKycStep, completarKyc, getContrato, getKycProgress,
} from '@/app/prototipos/0.6/services/kycApi';

const mockComplete = completeKycStep as jest.MockedFunction<typeof completeKycStep>;
const mockCompletar = completarKyc as jest.MockedFunction<typeof completarKyc>;
const mockContrato = getContrato as jest.MockedFunction<typeof getContrato>;
const mockProgress = getKycProgress as jest.MockedFunction<typeof getKycProgress>;

const LISTO = {
  modo: 'aceptacion' as const, estado: 'listo' as const, disponible: true,
  url: 'https://s3/c.pdf', hash: 'a'.repeat(64), external_id: 'kyc-1',
};

const ESTADO = {
  application_code: 'APP-1', landing_slug: 'copia-home',
  steps: [{ type: 'contract', status: 'pending', completed_at: null }],
  next_step: 'contract', next_step_index: 0, is_complete: false,
  kyc_enabled: true, resume: { enabled: false, ttl_hours: 72 },
};

beforeEach(() => {
  window.localStorage.clear();
  jest.clearAllMocks();
  mockUseSearchParams.mockReturnValue(new URLSearchParams('code=APP-1'));
  mockKycFlow.mockReturnValue({ kycEnabled: true, kycSteps: [{ type: 'contract' }], isLoading: false });
  mockProgress.mockResolvedValue(ESTADO as never);
  mockContrato.mockResolvedValue(LISTO);
  // El DNI de la sesión: sin prueba de titularidad el avance ni se intenta.
  window.localStorage.setItem('baldecash-copia-home-wizard-field-document_number', '70020010');
});

async function aceptarYContinuar() {
  render(<KycClient />);
  await waitFor(() => expect(screen.getByTestId('contrato-documento')).toBeInTheDocument());
  await userEvent.click(screen.getByText('He leído y acepto el contrato'));
  await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
}

it('manda el hash del contrato aceptado', async () => {
  mockComplete.mockResolvedValue({ state: { ...ESTADO, is_complete: true } as never, outdated: false });
  mockCompletar.mockResolvedValue({ aprobado: true, tiene_cuota_inicial: false, link_pago: null });

  await aceptarYContinuar();

  await waitFor(() => expect(mockComplete).toHaveBeenCalledWith(
    expect.objectContaining({ stepType: 'contract', contractHash: 'a'.repeat(64) })));
});

it('un 409 no avanza: vuelve a mostrar el contrato', async () => {
  mockComplete.mockResolvedValue({ state: null, outdated: true });

  await aceptarYContinuar();

  await waitFor(() => expect(screen.getByTestId('contrato-esperando')).toBeInTheDocument());
  expect(mockCompletar).not.toHaveBeenCalled();
});

it('contrato_vencido al cerrar vuelve al paso del contrato', async () => {
  mockComplete.mockResolvedValue({ state: { ...ESTADO, is_complete: true } as never, outdated: false });
  mockCompletar.mockResolvedValue({
    aprobado: false, tiene_cuota_inicial: false, link_pago: null, motivo: 'contrato_vencido',
  });
  // Con el paso de pago configurado, el último Continuar cierra el KYC.
  mockKycFlow.mockReturnValue({
    kycEnabled: true,
    kycSteps: [{ type: 'contract' }, { type: 'payment' }],
    isLoading: false,
  } as never);

  await aceptarYContinuar();

  await waitFor(() => expect(mockCompletar).toHaveBeenCalled());
  // No se fue a confirmación: sigue en el KYC, esperando el contrato nuevo.
  expect(mockRouterReplace).not.toHaveBeenCalled();
});
