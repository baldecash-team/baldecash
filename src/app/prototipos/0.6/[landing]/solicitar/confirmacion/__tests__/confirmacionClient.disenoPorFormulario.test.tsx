/// <reference types="jest" />
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

declare global {
  var mockSearchParamsGet: jest.Mock;
}

let disenoSolicitud: 1 | 2 = 1;
let disenoPorFormulario: boolean | undefined;

jest.mock('../../../../services/applicationApi', () => ({
  getApplicationStatus: jest.fn(),
}));

jest.mock('../../../context/LayoutContext', () => ({
  useLayout: () => ({
    navbarProps: { logo: '/logo.png' },
    footerData: {},
    isLoading: false,
    hasError: false,
    disenoSolicitud,
    disenoPorFormulario,
  }),
}));

jest.mock('@/app/prototipos/_shared', () => ({
  CubeGridSpinner: () => <div data-testid="spinner">Loading...</div>,
  useScrollToTop: () => {},
}));

jest.mock('@/app/prototipos/0.6/components/NotFoundContent', () => ({
  NotFoundContent: () => <div>Not Found</div>,
}));

jest.mock('@/app/prototipos/0.6/components/hero/Navbar', () => ({
  Navbar: () => <nav data-testid="navbar">Navbar</nav>,
}));

jest.mock('@/app/prototipos/0.6/components/hero/Footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

import ConfirmacionPage from '../confirmacionClient';
import { getApplicationStatus } from '../../../../services/applicationApi';

const mockGetApplicationStatus = getApplicationStatus as jest.MockedFunction<typeof getApplicationStatus>;

function statusCon(solicitudDesign?: 1 | 2) {
  return {
    code: 'APP-2026-00123',
    reference: 'APP-2026-00123',
    status: 'received',
    submitted_at: '2026-10-22T08:38:00-05:00',
    applicant_name: 'Brenda',
    products: [{ name: 'Laptop Lenovo V15', image: null, quantity: 1, unit_price: 1, final_price: 1, monthly_quota: 159 }],
    term: 24,
    term_months: 24,
    payment_frequency: 'mensual',
    total_monthly_payment: 159,
    status_history: [],
    ...(solicitudDesign ? { solicitud_design: solicitudDesign } : {}),
  } as never;
}

/**
 * BAL-5296: la confirmación pinta el diseño del formulario de la solicitud
 * (`solicitud_design` de `/status`) en landings con diseño por formulario.
 */
describe('confirmacionClient — diseño por formulario (BAL-5296)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    disenoSolicitud = 1;
    disenoPorFormulario = undefined;
    global.mockSearchParamsGet.mockImplementation((p: string) => (p === 'code' ? 'APP-2026-00123' : null));
  });

  it('/status con solicitud_design 2 y la landing en 1 → ConfirmacionV2', async () => {
    disenoPorFormulario = true;
    mockGetApplicationStatus.mockResolvedValue(statusCon(2));
    render(<ConfirmacionPage />);
    await waitFor(() => {
      expect(document.querySelector('[data-confirmacion-v2]')).toBeInTheDocument();
    });
  });

  it('/status con solicitud_design 1 y la landing en 2 → Diseño 1', async () => {
    disenoPorFormulario = true;
    disenoSolicitud = 2;
    mockGetApplicationStatus.mockResolvedValue(statusCon(1));
    render(<ConfirmacionPage />);
    expect(await screen.findByText(/Hemos recibido tu solicitud, Brenda!/)).toBeInTheDocument();
    expect(document.querySelector('[data-confirmacion-v2]')).not.toBeInTheDocument();
  });

  it('/status sin solicitud_design → el de la landing', async () => {
    disenoPorFormulario = true;
    mockGetApplicationStatus.mockResolvedValue(statusCon());
    render(<ConfirmacionPage />);
    expect(await screen.findByText(/Hemos recibido tu solicitud, Brenda!/)).toBeInTheDocument();
  });

  it('no-regresión: sin diseño por formulario, /status no cambia el diseño', async () => {
    mockGetApplicationStatus.mockResolvedValue(statusCon(2));
    render(<ConfirmacionPage />);
    expect(await screen.findByText(/Hemos recibido tu solicitud, Brenda!/)).toBeInTheDocument();
    expect(document.querySelector('[data-confirmacion-v2]')).not.toBeInTheDocument();
  });
});
