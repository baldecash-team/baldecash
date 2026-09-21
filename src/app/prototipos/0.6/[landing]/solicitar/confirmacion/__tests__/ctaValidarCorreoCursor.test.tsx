/// <reference types="jest" />
/**
 * BAL-4024 — El CTA "Validar mi correo" de la confirmación parecía texto, no un
 * botón: al pasar el mouse no aparecía la manito.
 *
 * Tailwind v4 quitó del preflight el `cursor: pointer` que la v3 daba a los
 * <button>, así que cada botón tiene que declarar la utilidad `cursor-pointer`
 * — que es justo lo que hacen sus hermanos de esta pantalla (ContactInfo,
 * ProductSummary, las tarjetas de resultado del demo). Este CTA no la tenía.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

declare global {
  var mockSearchParamsGet: jest.Mock;
}

jest.mock('../../../../services/applicationApi', () => ({
  getApplicationStatus: jest.fn(),
}));

jest.mock('../../../context/LayoutContext', () => ({
  useLayout: () => ({
    navbarProps: { logo: '/logo.png' },
    footerData: {},
    isLoading: false,
    hasError: false,
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

// El CTA solo se pinta si hay un handoff de OTP sin verificar en sessionStorage.
jest.mock('../../utils/otpHandoff', () => ({
  readOtpHandoff: jest.fn(() => ({
    applicationId: 123,
    code: 'BC-2025-ABC12345',
    verified: false,
  })),
  saveOtpHandoff: jest.fn(),
  markOtpVerified: jest.fn(),
  clearOtpHandoff: jest.fn(),
}));

import ConfirmacionPage from '../confirmacionClient';
import { getApplicationStatus } from '../../../../services/applicationApi';

const mockGetApplicationStatus = getApplicationStatus as jest.MockedFunction<
  typeof getApplicationStatus
>;

const mockCode = 'BC-2025-ABC12345';

describe('BAL-4024 — CTA "Validar mi correo"', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.mockSearchParamsGet.mockImplementation((param: string) =>
      param === 'code' ? mockCode : null
    );
    mockGetApplicationStatus.mockResolvedValue({
      code: mockCode,
      status: 'submitted',
      submitted_at: '2025-03-03T10:00:00Z',
      evaluated_at: null,
      products: [],
      term_months: 12,
      total_monthly_payment: 100,
      status_history: [],
    } as never);
  });

  it('se ve y se comporta como botón: muestra la manito al pasar el mouse', async () => {
    render(<ConfirmacionPage />);

    const cta = await waitFor(() =>
      screen.getByRole('button', { name: /validar mi correo/i })
    );

    expect(cta.className).toContain('cursor-pointer');
  });

  it('el cursor no se fuerza con un `!important` que pisaría un estado deshabilitado', async () => {
    render(<ConfirmacionPage />);

    const cta = await waitFor(() =>
      screen.getByRole('button', { name: /validar mi correo/i })
    );

    expect(cta.className).not.toContain('!cursor-pointer');
    expect(cta.getAttribute('style') ?? '').not.toMatch(/cursor/i);
  });
});
