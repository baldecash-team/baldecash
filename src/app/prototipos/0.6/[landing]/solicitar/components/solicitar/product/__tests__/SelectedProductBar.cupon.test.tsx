import React from 'react';
import { render, screen } from '@testing-library/react';
import { SelectedProductBar } from '../SelectedProductBar';

/**
 * En computadora el cupón aplicado se ve en cada paso del formulario. En
 * celular solo salía DENTRO de la barra inferior desplegada: plegada —que es
 * como está mientras se llena el formulario— traía producto y cuota, nada más.
 */

const mockEstado: { cupon: Record<string, unknown> | null; desplegada: boolean } = {
  cupon: null,
  desplegada: false,
};

const mockProducto = {
  id: '1528',
  name: 'Laptop HP 15',
  shortName: 'Laptop HP 15',
  brand: 'HP',
  image: 'https://ejemplo.test/producto.png',
  price: 3200,
  monthlyPayment: 239,
  months: 24,
  term: 24,
  initialPercent: 0,
  initialAmount: 0,
  paymentFrequency: 'mensual',
};

jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: 'home' }),
}));

jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({ landingId: 1, puedeCambiarPlazo: false, mostrarImagenProducto: true }),
}));

jest.mock('@/app/prototipos/0.6/analytics/useAnalytics', () => ({
  useAnalytics: () => ({
    trackPricingTermChange: jest.fn(),
    trackPricingInitialChange: jest.fn(),
  }),
}));

jest.mock('../../../../context/ProductContext', () => ({
  useProduct: () => ({
    selectedAccessories: [],
    selectedInsurances: [],
    getTotalMonthlyPayment: () => 239,
    appliedCoupon: mockEstado.cupon,
    isProductBarExpanded: mockEstado.desplegada,
    setIsProductBarExpanded: jest.fn(),
    getAllProducts: () => [mockProducto],
    isOverQuotaLimit: false,
    maxMonthlyQuota: null,
    updateProductInitial: jest.fn(),
    getInitialOptionsForProduct: () => [],
    getAvailableTerms: () => [24],
    updateAllProductsToTerm: jest.fn(),
  }),
}));

const CUPON = {
  code: 'CAMPA10',
  discount: 10,
  couponType: 'percent_quotas',
  quotasAffected: 1,
  label: '10% de descuento en 1 cuotas',
  lockedFromUrl: true,
};

describe('SelectedProductBar — cupón aplicado', () => {
  it('la barra inferior plegada (celular) muestra el cupón, además de la vista de computadora', () => {
    mockEstado.cupon = CUPON;
    mockEstado.desplegada = false;

    render(<SelectedProductBar />);

    // Una vez en la barra plegada de celular y otra en la vista de computadora.
    expect(screen.getAllByText('CAMPA10')).toHaveLength(2);
    // El de celular está dentro del botón de la barra plegada.
    const botonDeLaBarra = screen.getByRole('button', { name: /Laptop HP 15/ });
    expect(botonDeLaBarra).toHaveTextContent('CAMPA10');
  });

  it('con mobileOnly (solo la barra inferior) el cupón sigue saliendo', () => {
    mockEstado.cupon = CUPON;
    mockEstado.desplegada = false;

    render(<SelectedProductBar mobileOnly />);

    expect(screen.getAllByText('CAMPA10')).toHaveLength(1);
  });

  it('sin cupón no se pinta nada de cupón', () => {
    mockEstado.cupon = null;
    mockEstado.desplegada = false;

    render(<SelectedProductBar />);

    expect(screen.queryByText('CAMPA10')).not.toBeInTheDocument();
  });

  it('cupón de lista cerrada sin confirmar: la barra avisa que es solo para invitados', () => {
    mockEstado.cupon = { ...CUPON, restrictedToDocumentList: true, requiresDocument: true };
    mockEstado.desplegada = false;

    render(<SelectedProductBar />);

    // Celular (una línea): el aviso corto en lugar del texto del cupón.
    const botonDeLaBarra = screen.getByRole('button', { name: /Laptop HP 15/ });
    expect(botonDeLaBarra).toHaveTextContent('Solo para documentos invitados');
    // Computadora: el aviso completo debajo del cupón.
    expect(
      screen.getByText('Solo para documentos invitados. Lo confirmaremos cuando ingreses tu documento.')
    ).toBeInTheDocument();
  });

  it('cupón de lista cerrada ya confirmado: la barra queda como con cualquier cupón', () => {
    mockEstado.cupon = { ...CUPON, restrictedToDocumentList: true };
    mockEstado.desplegada = false;

    render(<SelectedProductBar />);

    expect(screen.queryByText(/Solo para documentos invitados/)).not.toBeInTheDocument();
    expect(screen.getAllByText('10% de descuento en 1 cuotas')).toHaveLength(2);
  });
});
