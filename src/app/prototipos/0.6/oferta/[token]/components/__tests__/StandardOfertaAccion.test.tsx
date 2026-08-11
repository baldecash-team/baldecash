/**
 * StandardOfertaAccion — vista de la oferta ESTÁNDAR con la card del Caso 5.
 *
 * Cubre lo que introdujo el rediseño (spec 2026-08-11-oferta-estandar-look-upsell):
 * el saludo con "aprobada", la card rica del equipo, el link "Ver detalle" a la
 * ficha en la landing (y su ausencia cuando falta un slug), aceptar y rechazar.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { StandardOfertaAccion } from '../StandardOfertaAccion';
import type { OfferView } from '../../../../services/offerApi';

const acceptOffer = jest.fn();
const rejectOffer = jest.fn();

jest.mock('../../../../services/offerApi', () => ({
  __esModule: true,
  acceptOffer: (...args: unknown[]) => acceptOffer(...args),
  rejectOffer: (...args: unknown[]) => rejectOffer(...args),
  OfferApiError: class extends Error {},
}));

jest.mock('../../../../analytics/useAnalytics', () => ({
  useAnalytics: () => ({ track: jest.fn() }),
}));

const baseOffer = {
  offerCode: 'APP-2026-99826442-OF03',
  maxMonthlyQuota: 0,
  expiresAt: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
  landingSlug: 'home',
  requestedProduct: null,
  recommended: null,
  applicationCode: 'APP-2026-99826442',
  clientName: 'Maria Roxana Alverca Cruz',
  offerCase: 'standard' as const,
  terms: [],
  initials: [],
  standardOffer: {
    status: 'sent',
    productName: 'Laptop TMP214-55-78NU',
    productBrand: 'Acer',
    productImageUrl: 'https://cdn.baldecash.com/equipos/tmp214.png',
    productSpecs: { processor: 'Core i7', ram: 16 },
    productSlug: 'acer-tmp214-55-78nu',
    totalPrice: 3999,
    initialPayment: 0,
    initialPaymentPercent: 0,
    termMonths: 24,
    monthlyPayment: 299,
    tea: 75,
    tcea: 86.34,
    totalAmount: 7176,
    hoursRemaining: 6,
  },
} as unknown as OfferView;

const renderView = (offer: OfferView = baseOffer) =>
  render(<StandardOfertaAccion token="tok-123" offer={offer} />);

describe('StandardOfertaAccion', () => {
  beforeEach(() => {
    acceptOffer.mockReset().mockResolvedValue({});
    rejectOffer.mockReset().mockResolvedValue({});
  });

  it('saluda con el nombre completo y anuncia la oferta', () => {
    renderView();

    expect(screen.getByText(/Maria Roxana Alverca Cruz/)).toBeInTheDocument();
    expect(screen.getByText('aprobada')).toBeInTheDocument();
    expect(screen.getByText('Tu oferta ha sido generada')).toBeInTheDocument();
    expect(screen.getByText(/APP-2026-99826442/)).toBeInTheDocument();
  });

  it('muestra el equipo con sus datos contractuales', () => {
    renderView();

    expect(screen.getByText('Laptop TMP214-55-78NU')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('S/7,176')).toBeInTheDocument();
  });

  it('acepta la oferta desde el CTA de la card', async () => {
    renderView();

    fireEvent.click(screen.getByRole('button', { name: /Aceptar oferta/i }));

    await waitFor(() => expect(acceptOffer).toHaveBeenCalledWith('tok-123'));
  });

  it('rechaza la oferta desde el botón secundario', async () => {
    renderView();

    fireEvent.click(screen.getByRole('button', { name: /Rechazar oferta/i }));

    await waitFor(() => expect(rejectOffer).toHaveBeenCalledWith('tok-123'));
  });

  it('ofrece "Ver detalle" cuando hay slug de producto y de landing', () => {
    renderView();

    expect(screen.getByRole('button', { name: /Ver detalle/i })).toBeInTheDocument();
  });

  it('no ofrece "Ver detalle" si falta el slug de la landing', () => {
    const sinLanding = {
      ...baseOffer,
      landingSlug: null,
    } as unknown as OfferView;

    renderView(sinLanding);

    expect(screen.queryByRole('button', { name: /Ver detalle/i })).not.toBeInTheDocument();
  });

  it('con la oferta vencida no deja aceptar ni rechazar', () => {
    const vencida = {
      ...baseOffer,
      expiresAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    } as unknown as OfferView;

    renderView(vencida);

    expect(screen.getByText('Esta oferta venció')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Rechazar oferta/i })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /Oferta vencida/i }));
    expect(acceptOffer).not.toHaveBeenCalled();
  });
});
