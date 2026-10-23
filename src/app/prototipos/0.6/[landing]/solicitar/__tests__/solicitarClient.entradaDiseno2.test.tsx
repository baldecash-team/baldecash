/**
 * BAL-4969 (casuísticas): en Diseño 2, `/solicitar` no muestra la intro de
 * Diseño 1. Abre el modal "Lo quiero" y, al cerrarlo, vuelve a la puerta por
 * la que se entró (comparador, "Retomar", calculadora, copia-home, quiz).
 * Todas las puertas usan `irALaSolicitud`.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { irALaSolicitud } from '@/app/prototipos/0.6/utils/entradaSolicitud';

const mockReplace = jest.fn();
const mockLayout = { loQuieroModal: true, disenoResuelto: true };
const mockProducto = { selectedProduct: { id: '1', name: 'Laptop' } as { id: string; name: string } | null };
let mockLanding = 'pago-diferido';

jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: mockLanding }),
  useRouter: () => ({ push: jest.fn(), replace: mockReplace }),
  usePathname: () => `/prototipos/0.6/${mockLanding}/solicitar`,
}));
jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({
    navbarProps: {},
    footerData: {},
    agreementData: null,
    isLoading: false,
    hasError: false,
    loQuieroModal: mockLayout.loQuieroModal,
    disenoResuelto: mockLayout.disenoResuelto,
  }),
}));
jest.mock('../context/ProductContext', () => ({
  useProduct: () => ({ selectedProduct: mockProducto.selectedProduct, cartProducts: [], isHydrated: true }),
}));
jest.mock('@/app/prototipos/0.6/components/hero/Navbar', () => ({ Navbar: () => <nav /> }));
jest.mock('@/app/prototipos/0.6/components/lo-quiero/LoQuieroModal', () => ({
  LoQuieroModal: ({ isOpen, onClose, origen }: { isOpen: boolean; onClose: () => void; origen: string }) =>
    isOpen ? (
      <div data-testid="lo-quiero" data-origen={origen}>
        <button type="button" onClick={onClose}>cerrar</button>
      </div>
    ) : null,
}));

import WizardPreviewPage from '../solicitarClient';

beforeEach(() => {
  mockReplace.mockClear();
  sessionStorage.clear();
  mockLayout.loQuieroModal = true;
  mockLayout.disenoResuelto = true;
  mockProducto.selectedProduct = { id: '1', name: 'Laptop' };
  mockLanding = 'pago-diferido';
});

describe('irALaSolicitud (la única entrada de las puertas laterales)', () => {
  it('guarda la página de origen y va a /solicitar', () => {
    window.history.pushState({}, '', '/prototipos/0.6/pago-diferido/catalogo?compare=1');
    const push = jest.fn();
    irALaSolicitud({ push }, 'pago-diferido');
    expect(push).toHaveBeenCalledWith('/prototipos/0.6/pago-diferido/solicitar/');
    expect(sessionStorage.getItem('baldecash-pago-diferido-diseno2-entrada')).toBe('/prototipos/0.6/pago-diferido/catalogo?compare=1');
  });
});

describe('/solicitar en Diseño 2', () => {
  it('abre el modal "Lo quiero" en vez de la intro de Diseño 1', () => {
    render(<WizardPreviewPage />);
    expect(screen.getByTestId('lo-quiero')).toHaveAttribute('data-origen', 'entrada');
    expect(screen.queryByText('Solicitud de Financiamiento')).not.toBeInTheDocument();
  });

  it('cerrar el modal vuelve a la puerta de entrada', () => {
    sessionStorage.setItem('baldecash-pago-diferido-diseno2-entrada', '/prototipos/0.6/pago-diferido/calculadora');
    render(<WizardPreviewPage />);
    fireEvent.click(screen.getByText('cerrar'));
    expect(mockReplace).toHaveBeenCalledWith('/prototipos/0.6/pago-diferido/calculadora');
  });

  it('sin puerta guardada, cerrar va al catálogo (nunca de vuelta a /solicitar)', () => {
    sessionStorage.setItem('baldecash-pago-diferido-diseno2-entrada', '/prototipos/0.6/pago-diferido/solicitar/');
    render(<WizardPreviewPage />);
    fireEvent.click(screen.getByText('cerrar'));
    expect(mockReplace).toHaveBeenCalledWith('/prototipos/0.6/pago-diferido/catalogo');
  });

  it('sin equipo elegido no abre el modal: va al catálogo', () => {
    mockProducto.selectedProduct = null;
    render(<WizardPreviewPage />);
    expect(screen.queryByTestId('lo-quiero')).not.toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith('/prototipos/0.6/pago-diferido/catalogo');
  });

  it('mientras el diseño no se resolvió no pinta ni la intro ni el modal', () => {
    mockLayout.disenoResuelto = false;
    render(<WizardPreviewPage />);
    expect(screen.queryByTestId('lo-quiero')).not.toBeInTheDocument();
    expect(screen.queryByText('Solicitud de Financiamiento')).not.toBeInTheDocument();
  });
});
