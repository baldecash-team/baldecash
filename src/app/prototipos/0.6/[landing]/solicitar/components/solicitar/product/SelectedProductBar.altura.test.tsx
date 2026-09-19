import React from 'react';
import { render } from '@testing-library/react';
import { SelectedProductBar, SelectedProductSpacer } from './SelectedProductBar';

/**
 * Dónde se pega la barra y qué alto publica.
 *
 * El `72px` con el que se calculaba la posición de lo que se apila encima
 * estaba hardcodeado en dos archivos y era una suposición: la barra mide 72px
 * solo con la imagen del producto puesta (48px de miniatura + 24px de padding).
 * Con la imagen apagada mide menos y quedaba un hueco. Ahora la barra publica
 * su alto real en `--product-bar-height` y los demás lo leen.
 */

const mockEstado = { hayProductos: true };

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
  useParams: () => ({ landing: 'renueva-tu-equipo-1' }),
}));

jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({
    landingId: 221,
    puedeCambiarPlazo: false,
    mostrarImagenProducto: true,
  }),
}));

jest.mock('@/app/prototipos/0.6/analytics/useAnalytics', () => ({
  useAnalytics: () => ({
    trackPricingTermChange: jest.fn(),
    trackPricingInitialChange: jest.fn(),
  }),
}));

const mockSetExpanded = jest.fn();
const mockContexto = { expandida: false };

jest.mock('../../../context/ProductContext', () => ({
  useProduct: () => ({
    selectedAccessories: [],
    selectedInsurances: [],
    getTotalMonthlyPayment: () => 373.98,
    appliedCoupon: null,
    isProductBarExpanded: mockContexto.expandida,
    setIsProductBarExpanded: mockSetExpanded,
    getAllProducts: () => (mockEstado.hayProductos ? [mockProducto] : []),
    isOverQuotaLimit: false,
    maxMonthlyQuota: null,
    updateProductInitial: jest.fn(),
    getInitialOptionsForProduct: () => [],
    getAvailableTerms: () => [3],
    updateAllProductsToTerm: jest.fn(),
  }),
}));

/** La barra fija de móvil es lo único con `z-40` de la pantalla. */
const barraFija = () => document.querySelector('[class*="z-40"]') as HTMLElement | null;
const altoPublicado = () => document.documentElement.style.getPropertyValue('--product-bar-height');

beforeEach(() => {
  mockEstado.hayProductos = true;
  mockContexto.expandida = false;
  document.documentElement.style.removeProperty('--product-bar-height');
});

describe('SelectedProductBar — dónde se pega', () => {
  it('por defecto queda pegada al borde inferior', () => {
    render(<SelectedProductBar mobileOnly />);
    expect(barraFija()!.style.bottom).toBe('0px');
  });

  it('con `offsetInferior` se levanta, para dejar sitio a lo de abajo', () => {
    render(<SelectedProductBar mobileOnly offsetInferior="var(--sticky-cta-height, 0px)" />);
    // jsdom descarta `var()`, así que del DOM solo se puede leer que ya NO es
    // el borde. El valor exacto se fija donde se monta (solicitarClient).
    expect(barraFija()!.style.bottom).not.toBe('0px');
  });

  it('con el drawer abierto el offset se anula: el panel crece desde el borde', () => {
    mockContexto.expandida = true;
    render(<SelectedProductBar mobileOnly offsetInferior="var(--sticky-cta-height, 0px)" />);
    expect(barraFija()!.style.bottom).toBe('0px');
  });

  it('conserva la clase `bottom-0`, que es de donde la agarra el CSS gamer', () => {
    // `.gamer-wizard-dark .fixed.bottom-0 .bg-white` (StepClient.tsx:1232) y sus
    // hermanas en complementosClient pintan la barra por esa clase. Sin ella,
    // zona-gamer perdería su tema aunque la posición fuera la misma.
    render(<SelectedProductBar mobileOnly offsetInferior="var(--sticky-cta-height, 0px)" />);
    expect(barraFija()!.classList.contains('bottom-0')).toBe(true);
  });
});

describe('SelectedProductBar — el alto que publica', () => {
  it('publica `--product-bar-height` mientras está montada', () => {
    render(<SelectedProductBar mobileOnly />);
    // En jsdom `offsetHeight` es siempre 0; lo que importa es que la publique.
    expect(altoPublicado()).toBe('0px');
  });

  it('la borra al desmontarse', () => {
    const { unmount } = render(<SelectedProductBar mobileOnly />);
    unmount();
    expect(altoPublicado()).toBe('');
  });

  it('sin productos no hay barra ni variable', () => {
    mockEstado.hayProductos = false;
    render(<SelectedProductBar mobileOnly />);
    expect(barraFija()).toBeNull();
    expect(altoPublicado()).toBe('');
  });

  it('el hueco del flujo ya no reserva un alto fijo', () => {
    const { container } = render(<SelectedProductSpacer />);
    expect(container.firstElementChild).not.toBeNull();
    // Antes el hueco medía `calc(72px + env(...))` y jsdom conservaba esos 72px;
    // ahora el alto sale de `calc(var(--product-bar-height, 72px) + env(...))` y
    // jsdom descarta la declaración entera por el `var()` + `env()`. O sea: si
    // esto volviera a leerse, alguien reintrodujo el literal.
    expect((container.firstElementChild as HTMLElement).style.height).toBe('');
  });

  it('sin productos el hueco no se pinta', () => {
    mockEstado.hayProductos = false;
    const { container } = render(<SelectedProductSpacer />);
    expect(container).toBeEmptyDOMElement();
  });
});
