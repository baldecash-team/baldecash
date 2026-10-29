/// <reference types="jest" />
/**
 * F8 (BAL-4967): con `disenoSolicitud === 2` la confirmación se pinta con
 * `ConfirmacionV2` (cargando, limitada y la completa); con 1 (o sin la
 * clave, el default de `useLayout`) sigue exactamente igual que hoy —
 * `ReceivedScreen`, el marco de Diseño 1 — porque ninguno de estos tests
 * pisa el mock de `useLayout` del archivo hermano
 * (`confirmacionClient.test.tsx`), que no manda `disenoSolicitud`.
 *
 * Mismo patrón de mocks que `StepClient.diseno2.test.tsx`: `ConfirmacionV2`
 * y sus vecinos no se mockean (se prueba la elección del marco, no
 * necesitamos ocultar su contenido), pero sí el resto de dependencias
 * externas (API, navbar, footer) como en `confirmacionClient.test.tsx`.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

declare global {
  var mockSearchParamsGet: jest.Mock;
}

let disenoSolicitud: 1 | 2 = 2;

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

describe('confirmacionClient — F8, Diseño 2 (BAL-4967)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    disenoSolicitud = 2;
    global.mockSearchParamsGet.mockImplementation((p: string) => (p === 'code' ? 'APP-2026-00123' : null));
  });

  it('cargando: pinta el estado de cargando de Diseño 2', () => {
    mockGetApplicationStatus.mockImplementation(() => new Promise(() => {}));
    render(<ConfirmacionPage />);
    expect(document.querySelector('[data-confirmacion-v2-cargando]')).toBeInTheDocument();
  });

  it('solicitud completa: pinta `ConfirmacionV2`, no `ReceivedScreen`', async () => {
    mockGetApplicationStatus.mockResolvedValue({
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
    } as never);

    render(<ConfirmacionPage />);

    await waitFor(() => {
      expect(document.querySelector('[data-confirmacion-v2]')).toBeInTheDocument();
    });
    expect(screen.getByText(/Solicitud N\.° APP-2026-00123/)).toBeInTheDocument();
    // BAL-5274: botón a Zona Estudiantes e «Ir al inicio»; sin el bloque de WhatsApp de antes.
    expect(screen.getByRole('link', { name: /Sigue tu solicitud en Zona Estudiantes/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ir al inicio' })).toBeInTheDocument();
    expect(screen.queryByText('¿Tienes alguna duda?')).not.toBeInTheDocument();
  });

  it('con el celular enmascarado de /status, «Paso 2 de 4: … al +51 9XX XXX 321» (BAL-4969, BAL-5274)', async () => {
    mockGetApplicationStatus.mockResolvedValue({
      code: 'APP-2026-00123',
      reference: 'APP-2026-00123',
      status: 'received',
      submitted_at: '2026-10-22T08:38:00-05:00',
      applicant_name: 'Brenda',
      applicant_phone_masked: '9XX XXX 321',
      products: [{ name: 'Laptop Lenovo V15', image: null, quantity: 1, unit_price: 1, final_price: 1, monthly_quota: 159 }],
      term: 24,
      term_months: 24,
      payment_frequency: 'mensual',
      total_monthly_payment: 159,
      status_history: [],
    } as never);
    render(<ConfirmacionPage />);
    await waitFor(() => {
      expect(document.querySelector('[data-linea-del-paso]')?.textContent).toBe(
        'Paso 2 de 4: una asesora te escribirá por WhatsApp al +51 9XX XXX 321.',
      );
    });
  });

  it('día de pago y entrega: los que dejó el envío de ESTA solicitud (por su `code`, aunque la URL traiga el token)', async () => {
    global.mockSearchParamsGet.mockImplementation((p: string) => (p === 'code' ? 'token-publico-123' : null));
    sessionStorage.setItem(
      'baldecash-test-landing-datos-del-envio-v2',
      JSON.stringify({ code: 'APP-2026-00123', paymentDay: 18, distrito: 'Victor Larco Herrera' }),
    );
    mockGetApplicationStatus.mockResolvedValue({
      code: 'APP-2026-00123',
      reference: 'APP-2026-00123',
      status: 'received',
      submitted_at: '2026-10-22T08:38:00-05:00',
      applicant_name: 'Brenda',
      products: [{ name: 'Laptop Lenovo V15', image: null, quantity: 1, unit_price: 1, final_price: 1, monthly_quota: 159 }],
      term: 24,
      term_months: 24,
      payment_frequency: 'mensual',
      initial_payment: 280,
      total_monthly_payment: 179,
      status_history: [],
    } as never);
    render(<ConfirmacionPage />);
    expect(await screen.findByText('Día 18 de cada mes')).toBeInTheDocument();
    expect(screen.getByText('En tu casa · Victor Larco Herrera')).toBeInTheDocument();
    expect(screen.getByText(/Paso 2 de 5:/)).toBeInTheDocument();
    expect(screen.getByText('S/179/mes')).toBeInTheDocument();
    sessionStorage.clear();
  });

  it('respuesta limitada (sin token, BAL-4188): pinta la vista limitada de Diseño 2', async () => {
    mockGetApplicationStatus.mockResolvedValue({
      code: 'APP-2026-00123',
      reference: 'APP-2026-00123',
      status: 'received',
      submitted_at: null,
      products: [],
      term_months: 0,
      total_monthly_payment: 0,
      status_history: [],
      limited: true,
    } as never);

    render(<ConfirmacionPage />);

    await waitFor(() => {
      expect(document.querySelector('[data-confirmacion-v2-limitada]')).toBeInTheDocument();
    });
  });

  it('error al obtener el estado (API devuelve null): no rompe, pinta el mismo estado de respaldo que hoy — con el estilo nuevo', async () => {
    mockGetApplicationStatus.mockResolvedValue(null);

    render(<ConfirmacionPage />);

    await waitFor(() => {
      expect(document.querySelector('[data-confirmacion-v2]')).toBeInTheDocument();
    });
  });

  it('solicitud no encontrada (API responde 404 → null, mismo contrato que "error")', async () => {
    mockGetApplicationStatus.mockResolvedValue(null);

    render(<ConfirmacionPage />);

    await waitFor(() => {
      expect(document.querySelector('[data-confirmacion-v2]')).toBeInTheDocument();
    });
    // Sin romper: sigue ofreciendo Zona Estudiantes y volver al inicio.
    expect(screen.getByRole('link', { name: /Sigue tu solicitud en Zona Estudiantes/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ir al inicio' })).toBeInTheDocument();
  });

  it('Diseño 1 (disenoSolicitud=1): NO usa `ConfirmacionV2`', async () => {
    disenoSolicitud = 1;
    mockGetApplicationStatus.mockResolvedValue({
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
    } as never);

    render(<ConfirmacionPage />);

    await waitFor(() => {
      expect(screen.getByText('APP-2026-00123')).toBeInTheDocument();
    });
    expect(document.querySelector('[data-confirmacion-v2]')).not.toBeInTheDocument();
    // Diseño 1 saluda distinto ("Hemos recibido", no "Recibimos").
    expect(screen.getByText(/Hemos recibido tu solicitud, Brenda!/)).toBeInTheDocument();
    // BAL-5274 es solo Diseño 2: D1 conserva su contacto y no trae el botón nuevo.
    expect(screen.getByText('¿Tienes alguna duda?')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Sigue tu solicitud en Zona Estudiantes/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Pasos de tu solicitud' })).not.toBeInTheDocument();
  });
});
