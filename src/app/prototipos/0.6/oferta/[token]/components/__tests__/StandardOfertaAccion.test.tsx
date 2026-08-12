/**
 * StandardOfertaAccion — vista de la oferta ESTÁNDAR con la card del Caso 5.
 *
 * Cubre el rediseño 2026-08-11 (card rica del Caso 5, "Ver detalle" a la ficha
 * en la landing) y el de 2026-08-12, que sacó el CTA del card y dejó las tres
 * acciones al mismo nivel, agregó la tira "Pediste → Te ofrecemos" y movió los
 * términos a una tarjeta con TEA/TCEA al pie.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
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
    term: 24,
    paymentFrequency: 'mensual',
  },
} as unknown as OfferView;

const renderView = (offer: OfferView = baseOffer) =>
  render(<StandardOfertaAccion token="tok-123" offer={offer} />);

/** Los términos viven en su propia región: la cuota también aparece en el card
 *  del equipo, y sin acotar la búsqueda ambas matchean. */
const terminos = () => within(screen.getByRole('region', { name: /Términos de tu oferta/i }));

/** El texto sale partido en varios nodos (`S/{x}{sufijo}`), así que se busca
 *  por el textContent del elemento más chico que lo contenga. */
const porTextoCompleto = (esperado: string) => (_: string, el: Element | null) =>
  el?.textContent?.replace(/\s+/g, ' ').trim() === esperado &&
  !Array.from(el.children).some((h) => h.textContent?.includes(esperado));

describe('StandardOfertaAccion', () => {
  beforeEach(() => {
    acceptOffer.mockReset().mockResolvedValue({});
    rejectOffer.mockReset().mockResolvedValue({});
  });

  it('anuncia una oferta generada, no una solicitud aprobada', () => {
    renderView();

    expect(screen.getByText(/Maria Roxana Alverca Cruz/)).toBeInTheDocument();
    expect(screen.getByText('oferta')).toBeInTheDocument();
    // La solicitud NO está aprobada: si el cliente rechaza, nunca lo estuvo.
    expect(screen.queryByText('aprobada')).not.toBeInTheDocument();
    expect(screen.getByText(/APP-2026-99826442/)).toBeInTheDocument();
  });

  it('lista los términos con la cuota, la inicial, el plazo y el total', () => {
    renderView();

    expect(screen.getByText('Laptop TMP214-55-78NU')).toBeInTheDocument();
    expect(terminos().getByText(porTextoCompleto('S/299/mes'))).toBeInTheDocument();
    expect(terminos().getByText('Sin inicial')).toBeInTheDocument();
    expect(terminos().getByText('24 meses')).toBeInTheDocument();
    expect(terminos().getByText(porTextoCompleto('S/7,176'))).toBeInTheDocument();
    // TEA y TCEA bajan al pie: informan, no encabezan.
    expect(terminos().getByText(porTextoCompleto('TEA 75% · TCEA 86.34%'))).toBeInTheDocument();
  });

  it('respeta la frecuencia real en la cuota y en el plazo', () => {
    const semanal = {
      ...baseOffer,
      standardOffer: {
        ...baseOffer.standardOffer,
        paymentFrequency: 'semanal',
        term: 16,
        termMonths: 4,
        monthlyPayment: 81,
      },
    } as unknown as OfferView;

    renderView(semanal);

    expect(terminos().getByText('16 semanas')).toBeInTheDocument();
    expect(terminos().getByText(porTextoCompleto('S/81/sem'))).toBeInTheDocument();
    // Y nunca el plazo normalizado a meses, que es lo que el cliente no reconocía.
    expect(screen.queryByText('4 meses')).not.toBeInTheDocument();
  });

  it('acepta desde el unico "Aceptar" de la pantalla', async () => {
    renderView();

    // El card ya no trae CTA propio: si hubiera dos, esto falla.
    expect(screen.getAllByRole('button', { name: /^Aceptar$/i })).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: /^Aceptar$/i }));
    await waitFor(() => expect(acceptOffer).toHaveBeenCalledWith('tok-123'));
  });

  it('rechaza desde un boton del mismo peso que el de aceptar', async () => {
    renderView();

    fireEvent.click(screen.getByRole('button', { name: /^Rechazar$/i }));
    await waitFor(() => expect(rejectOffer).toHaveBeenCalledWith('tok-123'));
  });

  it('ofrece consultar por WhatsApp sin tener que rechazar antes', () => {
    renderView();

    expect(screen.getByRole('link', { name: /Consultar/i })).toHaveAttribute(
      'href',
      expect.stringContaining('wa.link'),
    );
  });

  it('muestra de qué equipo se viene cuando la oferta lo cambia', () => {
    const conCambio = {
      ...baseOffer,
      requestedProduct: {
        id: 9,
        variant_id: null,
        name: 'Laptop HP 15-fd0026la',
        slug: 'hp-15-fd0026la',
        image_url: 'https://cdn.baldecash.com/equipos/hp15.png',
        monthly_price: 210,
      },
    } as unknown as OfferView;

    renderView(conCambio);

    expect(screen.getByText('Pediste')).toBeInTheDocument();
    expect(screen.getByText(/Laptop HP 15-fd0026la/)).toBeInTheDocument();
  });

  it('no compara nada cuando la oferta mantiene el equipo pedido', () => {
    renderView();

    expect(screen.queryByText('Pediste')).not.toBeInTheDocument();
  });

  it('ofrece "Ver detalle" cuando hay slug de producto y de landing', () => {
    renderView();

    expect(screen.getByRole('button', { name: /Ver detalle/i })).toBeInTheDocument();
  });

  it('no ofrece "Ver detalle" si falta el slug de la landing', () => {
    const sinLanding = { ...baseOffer, landingSlug: null } as unknown as OfferView;

    renderView(sinLanding);

    expect(screen.queryByRole('button', { name: /Ver detalle/i })).not.toBeInTheDocument();
  });

  it('con la oferta vencida bloquea la decisión pero deja escribir', () => {
    const vencida = {
      ...baseOffer,
      expiresAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    } as unknown as OfferView;

    renderView(vencida);

    expect(screen.getByText('Esta oferta venció')).toBeInTheDocument();
    // El subtítulo no puede seguir invitando a aceptar algo que ya no se acepta:
    // lo contradecía el propio botón de abajo.
    expect(screen.queryByText(/Queda en firme recién cuando la aceptas/)).not.toBeInTheDocument();
    expect(screen.getByText(/Escríbenos y la reactivamos/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Rechazar$/i })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /Oferta vencida/i }));
    expect(acceptOffer).not.toHaveBeenCalled();

    // Vencida es justo cuando más falta hace escribir: el enlace sigue vivo.
    expect(screen.getByRole('link', { name: /Consultar/i })).toBeInTheDocument();
  });
});
