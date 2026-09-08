/// <reference types="jest" />
/**
 * Con la solicitud ya creada, las condiciones no se tocan.
 *
 * El contrato que la persona está por leer se emitió con ESTE plazo y ESTA
 * inicial, y el hash sella ese PDF. Dejar mover el plazo dejaría la pantalla
 * diciendo una cuota y el documento otra — que es justo lo que la firma por
 * aceptación viene a impedir.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';

const producto = {
  id: 'p1', name: 'Laptop', term: 12, months: 12, initialPercent: 0,
  monthlyPayment: 300, price: 3000, paymentFrequency: 'mensual',
};

jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: 'renueva-tu-equipo-1' }),
}));

jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({ landingId: 178, puedeCambiarPlazo: true, mostrarImagenProducto: true }),
}));

jest.mock('@/app/prototipos/0.6/analytics/useAnalytics', () => ({
  useAnalytics: () => ({ trackPricingTermChange: jest.fn(), trackPricingInitialChange: jest.fn() }),
}));

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext', () => ({
  useProduct: () => ({
    selectedAccessories: [], selectedInsurances: [], appliedCoupon: null,
    getTotalMonthlyPayment: () => 300, getAllProducts: () => [producto],
    isProductBarExpanded: true, setIsProductBarExpanded: jest.fn(),
    isOverQuotaLimit: false, maxMonthlyQuota: null,
    updateProductInitial: jest.fn(),
    getInitialOptionsForProduct: () => [
      { percent: 0, label: '0%' }, { percent: 10, label: '10%' },
    ],
    getAvailableTerms: () => [6, 12, 18],
    updateAllProductsToTerm: jest.fn(),
  }),
}));

jest.mock('@/app/prototipos/0.6/hooks/useSolicitarFlow', () => ({
  useSolicitarFlow: () => ({ isKycStepEnabled: (t: string) => contratoHabilitado && t === 'contract' }),
}));

let contratoHabilitado = true;

import { SelectedProductBar } from '../SelectedProductBar';

beforeEach(() => {
  sessionStorage.clear();
  contratoHabilitado = true;
});

function conSolicitudCreada() {
  sessionStorage.setItem(
    'baldecash-renueva-tu-equipo-1-envio-anticipado',
    JSON.stringify({ applicationCode: 'APP-2026-00023' }),
  );
}

it('sin solicitud creada se pueden elegir plazo e inicial', () => {
  render(<SelectedProductBar />);

  expect(screen.queryAllByText('Inicial:').length).toBeGreaterThan(0);
  expect(screen.queryAllByText('Plazo:').length).toBeGreaterThan(0);
});

it('con la solicitud ya creada desaparecen los dos', () => {
  conSolicitudCreada();

  render(<SelectedProductBar />);

  expect(screen.queryByText('Inicial:')).not.toBeInTheDocument();
  expect(screen.queryByText('Plazo:')).not.toBeInTheDocument();
});

it('sin el modulo del contrato no se congela nada', () => {
  // Sin contrato emitido no hay documento que pueda quedar desfasado: congelar
  // las condiciones seria quitarle al postulante una opcion por nada.
  contratoHabilitado = false;
  conSolicitudCreada();

  render(<SelectedProductBar />);

  expect(screen.queryAllByText('Plazo:').length).toBeGreaterThan(0);
});
