/// <reference types="jest" />
/**
 * El progreso KYC pasa a leerse del API (BD como fuente de verdad).
 *
 * `localStorage` deja de ser la fuente de verdad — solo cruza de dispositivo
 * si el API responde. Si el API falla, se cae al valor guardado localmente
 * para no dejar al cliente sin flujo.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Next.js (SWC) compila los exports del módulo como propiedades no
// configurables → `jest.spyOn(namespace, 'fn')` revienta con "Cannot redefine
// property". Se mockea el módulo completo (parcial, sobre el real) en su
// lugar — mismo patrón que confirmacionClient.test.tsx.
jest.mock('@/app/prototipos/0.6/services/kycApi', () => {
  const actual = jest.requireActual('@/app/prototipos/0.6/services/kycApi');
  return {
    ...actual,
    getKycProgress: jest.fn(),
    completeKycStep: jest.fn(),
  };
});

import KycClient from '../kycClient';
import { getKycProgress } from '@/app/prototipos/0.6/services/kycApi';

const mockGetKycProgress = getKycProgress as jest.MockedFunction<typeof getKycProgress>;

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  useParams: () => ({ landing: 'copia-home' }),
  useSearchParams: () => new URLSearchParams('code=APP-1'),
}));

jest.mock('@/app/prototipos/0.6/hooks/useSolicitarFlow', () => ({
  useSolicitarFlow: () => ({
    kycEnabled: true,
    kycSteps: [{ type: 'dni_selfie' }, { type: 'contract' }],
    isLoading: false,
  }),
}));

// Mock LayoutContext (KycChrome depende de él para navbar/footer).
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
  Navbar: () => <nav data-testid="navbar">Navbar</nav>,
}));

jest.mock('@/app/prototipos/0.6/components/product-landing/nvidia/NvidiaNavbar', () => ({
  NvidiaNavbar: () => <nav data-testid="nvidia-navbar">NvidiaNavbar</nav>,
}));

jest.mock('@/app/prototipos/0.6/components/hero/Footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

const state = (next: string, idx: number) => ({
  application_code: 'APP-1', landing_slug: 'copia-home',
  steps: [
    { type: 'dni_selfie', status: idx > 0 ? 'completed' : 'pending', completed_at: null },
    { type: 'contract', status: 'pending', completed_at: null },
  ],
  next_step: next, next_step_index: idx, is_complete: false,
  kyc_enabled: true, resume: { enabled: true, ttl_hours: 72 },
});

afterEach(() => jest.restoreAllMocks());

it('arranca en el sub-paso que dice el API, no en el de localStorage', async () => {
  window.localStorage.setItem('baldecash-copia-home-kyc-step-APP-1', '0');
  mockGetKycProgress.mockResolvedValue(state('contract', 1) as never);

  render(<KycClient />);

  await waitFor(() => expect(screen.getByText(/Paso 2 de 2/)).toBeInTheDocument());
});

it('cae al localStorage si el API falla', async () => {
  window.localStorage.setItem('baldecash-copia-home-kyc-step-APP-1', '1');
  mockGetKycProgress.mockResolvedValue(null);

  render(<KycClient />);

  await waitFor(() => expect(screen.getByText(/Paso 2 de 2/)).toBeInTheDocument());
});
