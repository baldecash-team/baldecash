/**
 * StandardOfertaAccion — vista de la oferta ESTÁNDAR con la card del Caso 5.
 *
 * Cubre el rediseño 2026-08-11 (card rica del Caso 5), el de 2026-08-12 (sin
 * CTA en el card, tira "Pediste → Te ofrecemos", términos en tarjeta) y el
 * lote WEB de 2026-08-25:
 *
 *   WEB-01  el chip muestra el ID legacy, no el code interno de ws2
 *   WEB-02  se va "Consultar"; aceptar en verde y rechazar en rojo
 *   WEB-03  la tarjeta de términos pasa a "Tu nueva cuota"
 *   WEB-04  título según el tipo de oferta, sin subtítulo
 *   WEB-05  "Ver detalle" va a la ficha completa DENTRO de la oferta
 *   WEB-06  barra fija abajo con la cuota y las dos decisiones
 *   WEB-07  modal de detalle del accesorio, con buscador
 *   WEB-08  la combinación que ya tiene se rechaza (mensaje del backend)
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import { StandardOfertaAccion } from '../StandardOfertaAccion';
import type { OfferView } from '../../../../services/offerApi';

const acceptOffer = jest.fn();
const rejectOffer = jest.fn();
const quoteOffer = jest.fn();

jest.mock('../../../../services/offerApi', () => ({
  __esModule: true,
  acceptOffer: (...args: unknown[]) => acceptOffer(...args),
  rejectOffer: (...args: unknown[]) => rejectOffer(...args),
  quoteOffer: (...args: unknown[]) => quoteOffer(...args),
  OfferApiError: class extends Error {
    reason: string;
    constructor(reason: string, message: string) {
      super(message);
      this.reason = reason;
    }
  },
}));

/** El componente distingue el error del backend con `instanceof`, así que hay
 *  que lanzar la clase MOCKEADA y no una propia. */
const { OfferApiError: MockOfferApiError } = jest.requireMock(
  '../../../../services/offerApi',
) as { OfferApiError: new (reason: string, message: string) => Error };

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
  legacyId: 108610,
  clientName: 'Maria Roxana Alverca Cruz',
  offerCase: 'standard' as const,
  terms: [],
  initials: [],
  standardOffer: {
    status: 'sent',
    offerType: 'initial',
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
    accessories: [],
    insurances: [],
    addonsMonthlyPayment: 0,
    options: [],
  },
} as unknown as OfferView;

/** Oferta de accesorios (modalidad upsell de admin2). */
const conAccesorios = (extra: Record<string, unknown>[] = []) =>
  ({
    ...baseOffer,
    standardOffer: {
      ...baseOffer.standardOffer,
      offerType: 'upsell',
      monthlyPayment: 340,
      addonsMonthlyPayment: 41,
      accessories: [
        {
          id: 1,
          productId: 71,
          name: 'Mochila Lenovo',
          description: 'Mochila acolchada para laptops de hasta 15.6 pulgadas.',
          imageUrl: 'https://cdn.baldecash.com/acc/mochila.png',
          price: 300,
          monthly: 12,
          monthlyDelta: 20,
          includedFree: false,
        },
        {
          id: 2,
          productId: 72,
          name: 'Mouse inalambrico',
          description: null,
          imageUrl: null,
          price: 80,
          monthly: 4,
          monthlyDelta: 21,
          includedFree: false,
        },
        ...extra,
      ],
      insurances: [],
    },
  }) as unknown as OfferView;

const renderView = (offer: OfferView = baseOffer) =>
  render(<StandardOfertaAccion token="tok-123" offer={offer} />);

/** Los términos viven en su propia región: la cuota también aparece en el card
 *  del equipo y en la barra fija, y sin acotar la búsqueda las tres matchean. */
const terminos = () => within(screen.getByRole('region', { name: /Tu nueva cuota/i }));
/** La barra fija de decisión (WEB-06). */
const barra = () => within(screen.getByRole('region', { name: /Tu decisión/i }));

/** El texto sale partido en varios nodos (`S/{x}{sufijo}`), así que se busca
 *  por el textContent del elemento más chico que lo contenga. */
const porTextoCompleto = (esperado: string) => (_: string, el: Element | null) =>
  el?.textContent?.replace(/\s+/g, ' ').trim() === esperado &&
  !Array.from(el.children).some((h) => h.textContent?.includes(esperado));

describe('StandardOfertaAccion', () => {
  beforeEach(() => {
    acceptOffer.mockReset().mockResolvedValue({});
    rejectOffer.mockReset().mockResolvedValue({});
    quoteOffer.mockReset().mockResolvedValue({
      termMonths: 24,
      initialPercent: 0,
      initialPayment: 0,
      monthlyPayment: 319,
      tea: 75,
      tcea: 86.34,
      totalAmount: 7656,
    });
  });

  // ------------------------------------------------------------------ WEB-04

  it('titula según el tipo de oferta: cambio de equipo', () => {
    const conCambio = {
      ...baseOffer,
      requestedProduct: {
        id: 9,
        name: 'Laptop HP 15-fd0026la',
        image_url: 'https://cdn.baldecash.com/equipos/hp15.png',
        monthly_price: 210,
      },
    } as unknown as OfferView;

    renderView(conCambio);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Hola Maria Roxana Alverca Cruz, tu asesor te ha ofrecido un cambio de equipo',
    );
  });

  it('titula según el tipo de oferta: cambio de plazo', () => {
    renderView();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Hola Maria Roxana Alverca Cruz, tu asesor te ha ofrecido un cambio de plazo',
    );
  });

  it('titula según el tipo de oferta: accesorios', () => {
    renderView(conAccesorios());

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Hola Maria Roxana Alverca Cruz, complementa tu solicitud con el accesorio que necesitas!',
    );
  });

  it('sin nombre del cliente el título arranca sin saludo', () => {
    const anonima = { ...baseOffer, clientName: null } as unknown as OfferView;

    renderView(anonima);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Tu asesor te ha ofrecido un cambio de plazo',
    );
  });

  it('ya no lleva subtítulo', () => {
    renderView();

    expect(screen.queryByText(/Queda en firme recién cuando la aceptas/)).not.toBeInTheDocument();
  });

  // ------------------------------------------------------------------ WEB-01

  it('muestra el ID legacy, que es el que el cliente conoce', () => {
    renderView();

    expect(screen.getByText(/Solicitud: 108610/)).toBeInTheDocument();
    expect(screen.queryByText(/APP-2026-99826442$/)).not.toBeInTheDocument();
  });

  it('sin ID legacy cae al código de ws2', () => {
    const sinLegacy = { ...baseOffer, legacyId: null } as unknown as OfferView;

    renderView(sinLegacy);

    expect(screen.getByText(/Solicitud: APP-2026-99826442/)).toBeInTheDocument();
  });

  // ------------------------------------------------------------------ WEB-03

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

  // ------------------------------------------------------------------ WEB-02 / WEB-06

  it('decide desde la barra fija: aceptar en verde, rechazar en rojo', async () => {
    renderView();

    const aceptar = barra().getByRole('button', { name: /^Aceptar$/i });
    const rechazar = barra().getByRole('button', { name: /^Rechazar$/i });
    expect(aceptar).toHaveStyle({ backgroundColor: '#16A34A' });
    expect(rechazar).toHaveStyle({ backgroundColor: '#DC2626' });

    // Una sola vez cada acción: los botones inline se fueron con la barra.
    expect(screen.getAllByRole('button', { name: /^Aceptar$/i })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: /^Rechazar$/i })).toHaveLength(1);

    fireEvent.click(aceptar);
    await waitFor(() => expect(acceptOffer).toHaveBeenCalled());
    expect(acceptOffer.mock.calls[0][0]).toBe('tok-123');
  });

  it('rechaza desde la barra fija', async () => {
    renderView();

    fireEvent.click(barra().getByRole('button', { name: /^Rechazar$/i }));
    await waitFor(() => expect(rejectOffer).toHaveBeenCalledWith('tok-123'));
  });

  it('la barra fija repite la cuota vigente', () => {
    renderView();

    expect(barra().getByText(porTextoCompleto('S/299/mes'))).toBeInTheDocument();
  });

  it('ya no ofrece el botón "Consultar"', () => {
    renderView();

    expect(screen.queryByRole('link', { name: /^Consultar$/i })).not.toBeInTheDocument();
  });

  // ------------------------------------------------------------------ WEB-05

  it('"Ver detalle" abre la ficha completa dentro de la oferta', () => {
    renderView();

    expect(screen.getByRole('link', { name: /Ver detalle/i })).toHaveAttribute(
      'href',
      '/oferta/tok-123/producto/acer-tmp214-55-78nu',
    );
  });

  it('sin slug del producto no hay ficha que abrir', () => {
    const sinSlug = {
      ...baseOffer,
      standardOffer: { ...baseOffer.standardOffer, productSlug: null },
    } as unknown as OfferView;

    renderView(sinSlug);

    expect(screen.queryByRole('link', { name: /Ver detalle/i })).not.toBeInTheDocument();
  });

  // ------------------------------------------------------------------ WEB-07

  it('abre el detalle del accesorio con su descripción', () => {
    renderView(conAccesorios());

    fireEvent.click(screen.getByRole('button', { name: /Ver detalle de Mochila Lenovo/i }));

    const modal = within(screen.getByRole('dialog'));
    expect(modal.getByRole('heading', { name: 'Mochila Lenovo' })).toBeInTheDocument();
    expect(
      modal.getByText('Mochila acolchada para laptops de hasta 15.6 pulgadas.'),
    ).toBeInTheDocument();
  });

  it('el accesorio sin descripción no inventa una', () => {
    renderView(conAccesorios());

    fireEvent.click(screen.getByRole('button', { name: /Ver detalle de Mouse inalambrico/i }));

    const modal = within(screen.getByRole('dialog'));
    expect(modal.getByRole('heading', { name: 'Mouse inalambrico' })).toBeInTheDocument();
    expect(modal.getByText(/Sin descripción/i)).toBeInTheDocument();
  });

  it('desde el modal se agrega el accesorio a la cuota', async () => {
    renderView(conAccesorios());

    fireEvent.click(screen.getByRole('button', { name: /Ver detalle de Mochila Lenovo/i }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /Agregar/i }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('checkbox', { name: /Incluir Mochila Lenovo/i })).toBeChecked();
  });

  it('el buscador filtra los accesorios cuando la lista es larga', () => {
    const largos = Array.from({ length: 6 }, (_, i) => ({
      id: 10 + i,
      productId: 100 + i,
      name: `Accesorio ${i}`,
      description: null,
      imageUrl: null,
      price: 50,
      monthly: 3,
      monthlyDelta: 3,
      includedFree: false,
    }));

    renderView(conAccesorios(largos));

    const buscador = screen.getByRole('searchbox', { name: /Buscar accesorio/i });
    fireEvent.change(buscador, { target: { value: 'mochila' } });

    expect(screen.getByText('Mochila Lenovo')).toBeInTheDocument();
    expect(screen.queryByText('Mouse inalambrico')).not.toBeInTheDocument();
    expect(screen.queryByText('Accesorio 3')).not.toBeInTheDocument();
  });

  it('con pocos accesorios no hay buscador que estorbe', () => {
    renderView(conAccesorios());

    expect(screen.queryByRole('searchbox', { name: /Buscar accesorio/i })).not.toBeInTheDocument();
  });

  // ------------------------------------------------------------------ WEB-08

  it('si el backend rechaza la combinación que ya tiene, lo dice en pantalla', async () => {
    acceptOffer.mockRejectedValue(
      new MockOfferApiError(
        'same_combination',
        'Esa es la combinación que ya tienes: elige una distinta.',
      ),
    );

    renderView();
    fireEvent.click(barra().getByRole('button', { name: /^Aceptar$/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        /Esa es la combinación que ya tienes/,
      ),
    );
  });

  // ------------------------------------------------------------------ varios

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

  it('con la oferta vencida bloquea la decisión pero deja escribir', () => {
    const vencida = {
      ...baseOffer,
      expiresAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    } as unknown as OfferView;

    renderView(vencida);

    expect(screen.getByText('Esta oferta venció')).toBeInTheDocument();
    expect(barra().getByRole('button', { name: /^Rechazar$/i })).toBeDisabled();

    fireEvent.click(barra().getByRole('button', { name: /Oferta vencida/i }));
    expect(acceptOffer).not.toHaveBeenCalled();

    // Vencida es justo cuando más falta hace escribir: se fue el botón
    // "Consultar" (WEB-02), no la salida por WhatsApp.
    expect(screen.getByRole('link', { name: /Escríbenos/i })).toHaveAttribute(
      'href',
      expect.stringContaining('wa.link'),
    );
  });
});
