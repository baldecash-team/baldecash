import React from 'react';
import { render, screen } from '@testing-library/react';
import { SelectedProductBar } from './SelectedProductBar';

/**
 * La barra de producto seleccionado acompana TODOS los pasos del formulario y
 * la pantalla de complementos, y dibuja la imagen del producto en tres bloques
 * distintos: la miniatura de la barra plegada, la lista de la barra desplegada
 * y la lista de la vista de escritorio.
 *
 * Cubrir uno solo no alcanza: es la misma trampa del selector de plazo, que
 * quedaba apagado en una pantalla y reaparecia en las otras dos.
 */

// El prefijo `mock` es lo unico que jest permite referenciar desde el factory,
// que se iza por encima de las constantes del modulo.
const mockFlag = { mostrarImagen: true };

const mockProducto = {
  id: '1585',
  name: 'Financiamiento de Matricula',
  shortName: 'Financiamiento de Matricula',
  brand: 'BaldeCash',
  image: 'https://ejemplo.test/producto.png',
  price: 950,
  monthlyPayment: 373.98,
  months: 3,
  term: 3,
  initialPercent: 0,
  initialAmount: 0,
  paymentFrequency: 'mensual',
};

jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: 'prestamo-matricula' }),
}));

jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({
    landingId: 221,
    puedeCambiarPlazo: false,
    mostrarImagenProducto: mockFlag.mostrarImagen,
  }),
}));

jest.mock('@/app/prototipos/0.6/analytics/useAnalytics', () => ({
  useAnalytics: () => ({
    trackPricingTermChange: jest.fn(),
    trackPricingInitialChange: jest.fn(),
  }),
}));

jest.mock('../../../context/ProductContext', () => ({
  useProduct: () => ({
    selectedAccessories: [],
    selectedInsurances: [],
    getTotalMonthlyPayment: () => 373.98,
    appliedCoupon: null,
    isProductBarExpanded: true,
    setIsProductBarExpanded: jest.fn(),
    getAllProducts: () => [mockProducto],
    isOverQuotaLimit: false,
    maxMonthlyQuota: null,
    updateProductInitial: jest.fn(),
    getInitialOptionsForProduct: () => [],
    getAvailableTerms: () => [3],
    updateAllProductsToTerm: jest.fn(),
  }),
}));

describe('SelectedProductBar — imagen del producto', () => {
  it('dibuja la imagen cuando el preset no la apaga', () => {
    mockFlag.mostrarImagen = true;

    render(<SelectedProductBar />);

    expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
  });

  it('no dibuja ninguna imagen en ninguno de los tres bloques cuando el preset la apaga', () => {
    mockFlag.mostrarImagen = false;

    render(<SelectedProductBar />);

    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('conserva la informacion del producto con la imagen apagada', () => {
    mockFlag.mostrarImagen = false;

    render(<SelectedProductBar />);

    expect(screen.getAllByText(/Financiamiento de Matricula/i).length).toBeGreaterThan(0);
  });
});
