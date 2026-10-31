import React from 'react';
import { render, screen } from '@testing-library/react';
import { SelectedProductBar } from './SelectedProductBar';

/**
 * BAL-5407: la card del catálogo dice «Laptop PM1503CDA R5 16GB 512GB» (el
 * `displayName` que arma el backend, que las entradas guardan en `name`) y la
 * barra plegada del celular mostraba «PM1503CDA» (`shortName`, el
 * `product.name` interno). Los tres bloques de la barra tienen que decir lo
 * mismo que la card.
 */

const mockProductos: { current: Array<Record<string, unknown>> } = { current: [] };

const PM1503 = {
  id: '1501',
  name: 'Laptop PM1503CDA R5 16GB 512GB',
  shortName: 'PM1503CDA',
  brand: 'ASUS',
  image: '',
  price: 2999,
  monthlyPayment: 199,
  months: 24,
  term: 24,
  initialPercent: 0,
  initialAmount: 0,
  paymentFrequency: 'mensual',
};

jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: 'prueba-formulario' }),
}));

jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({ landingId: 1, puedeCambiarPlazo: false, mostrarImagenProducto: false }),
}));

jest.mock('@/app/prototipos/0.6/analytics/useAnalytics', () => ({
  useAnalytics: () => ({ trackPricingTermChange: jest.fn(), trackPricingInitialChange: jest.fn() }),
}));

jest.mock('../../../context/ProductContext', () => ({
  useProduct: () => ({
    selectedAccessories: [],
    selectedInsurances: [],
    getTotalMonthlyPayment: () => 199,
    appliedCoupon: null,
    isProductBarExpanded: true,
    setIsProductBarExpanded: jest.fn(),
    getAllProducts: () => mockProductos.current,
    isOverQuotaLimit: false,
    maxMonthlyQuota: null,
    updateProductInitial: jest.fn(),
    getInitialOptionsForProduct: () => [],
    getAvailableTerms: () => [24],
    updateAllProductsToTerm: jest.fn(),
  }),
}));

describe('SelectedProductBar — nombre de la card (BAL-5407)', () => {
  it('muestra el nombre de la card en todos los bloques y nunca el nombre corto', () => {
    mockProductos.current = [PM1503];

    render(<SelectedProductBar />);

    // Barra plegada + barra desplegada + vista de escritorio.
    expect(screen.getAllByText('Laptop PM1503CDA R5 16GB 512GB').length).toBe(3);
    expect(screen.queryByText('PM1503CDA')).toBeNull();
  });

  it('un producto guardado sin `name` (sesión vieja) cae al nombre corto en vez de quedar en blanco', () => {
    mockProductos.current = [{ ...PM1503, name: '' }];

    render(<SelectedProductBar />);

    expect(screen.getAllByText('PM1503CDA').length).toBe(3);
  });
});
