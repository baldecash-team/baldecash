/// <reference types="jest" />
/**
 * BAL-4188 Task 7 — vista limitada + landing final.
 *
 * Cuando el link de confirmación se abre con un `APP-…` (sin token), ws2
 * responde el endpoint limitado: `{code, reference, legacy_id, status,
 * submitted_at, approved_at, cierre, limited: true}`, sin nombre ni detalle
 * del equipo/cuota (esos datos requieren el token). La pantalla tiene que
 * mostrar solo lo que llegó: el estado y el N° de solicitud.
 *
 * Cuando la respuesta trae `landing_slug` distinto de la landing de la ruta
 * (el link funciona con cualquier landing, D3 del brief), la web redirige a
 * la landing final conservando el query — sin pintar la landing equivocada.
 *
 * Mocks locales de `next/navigation` (y no los globales de jest.setup.js):
 * el global no expone el `replace` que arma internamente — cada llamada a
 * `useRouter()` ahí crea un `jest.fn()` nuevo, imposible de espiar — y este
 * archivo necesita afirmar sobre `router.replace` y controlar `landing` por
 * test. Mismo patrón que otros archivos de este repo (ver nota en
 * `ResumeClient.test.tsx`).
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockSearchParamsGet = jest.fn();
let mockLanding = 'home';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  useParams: () => ({ landing: mockLanding }),
  useSearchParams: () => ({ get: mockSearchParamsGet }),
}));

jest.mock('../../../../services/applicationApi', () => ({
  getApplicationStatus: jest.fn(),
}));

jest.mock('../../../context/LayoutContext', () => ({
  useLayout: () => ({
    navbarProps: { logo: '/logo.png' },
    footerData: {},
    agreementData: null,
    landingId: 1,
    isLoading: false,
    hasError: false,
    overlayVariant: null,
    newsletterData: null,
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

const mockGetApplicationStatus = getApplicationStatus as jest.MockedFunction<
  typeof getApplicationStatus
>;

describe('confirmación — vista limitada (BAL-4188)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLanding = 'home';
    mockSearchParamsGet.mockImplementation((param: string) =>
      param === 'code' ? 'db8aedd5-a9b5-4ecf-98ce-c376baf955e1' : null
    );
  });

  it('con limited:true muestra el estado y el N° de solicitud, sin nombre, equipo ni cuota', async () => {
    mockGetApplicationStatus.mockResolvedValue({
      code: 'APP-2026-00029',
      reference: '132361',
      status: 'approved',
      submitted_at: '2026-09-01T10:00:00Z',
      approved_at: '2026-09-02T10:00:00Z',
      cierre: {
        firmada: true,
        metodo: null,
        firmada_at: null,
        pendiente: { pago_inicial: false, formulario: false },
      },
      limited: true,
      status_history: [],
    } as never);

    render(<ConfirmacionPage />);

    await waitFor(() => {
      expect(screen.getByText(/Hemos recibido tu solicitud!/i)).toBeInTheDocument();
    });
    expect(screen.getByText('132361')).toBeInTheDocument();
    // Sin token no se revela el estado (firmada, aprobada, no aprobada...).
    expect(screen.queryByText(/firmada|aprobada|cancelada/i)).not.toBeInTheDocument();

    // Sin nombre (fallback "Usuario" del resumen completo), sin equipo, sin cuota.
    expect(screen.queryByText(/Usuario/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Tu financiamiento/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/mensual/i)).not.toBeInTheDocument();
  });

  it('con landing_slug distinto redirige a la landing final, con el mismo query', async () => {
    mockLanding = 'home';
    window.history.pushState(
      {},
      '',
      '/home/solicitar/confirmacion/?code=db8aedd5-a9b5-4ecf-98ce-c376baf955e1'
    );

    mockGetApplicationStatus.mockResolvedValue({
      code: 'APP-2026-00029',
      status: 'submitted',
      submitted_at: '2026-09-01T10:00:00Z',
      landing_slug: 'renueva-tu-equipo-2',
      status_history: [],
    } as never);

    render(<ConfirmacionPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        '/renueva-tu-equipo-2/solicitar/confirmacion/?code=db8aedd5-a9b5-4ecf-98ce-c376baf955e1'
      );
    });
  });

  it('con landing_slug IGUAL a la de la ruta no redirige', async () => {
    mockLanding = 'renueva-tu-equipo-2';
    window.history.pushState(
      {},
      '',
      '/renueva-tu-equipo-2/solicitar/confirmacion/?code=db8aedd5-a9b5-4ecf-98ce-c376baf955e1'
    );

    mockGetApplicationStatus.mockResolvedValue({
      code: 'APP-2026-00029',
      status: 'submitted',
      submitted_at: '2026-09-01T10:00:00Z',
      landing_slug: 'renueva-tu-equipo-2',
      status_history: [],
    } as never);

    render(<ConfirmacionPage />);

    await waitFor(() => {
      expect(mockGetApplicationStatus).toHaveBeenCalled();
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
