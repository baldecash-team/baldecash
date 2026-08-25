import { render, screen } from '@testing-library/react';
import { StandardOfertaAccion } from '../StandardOfertaAccion';
import type { OfferView } from '@/services/oferta';

/**
 * La pantalla de "¡Felicidades!" muestra el equipo, no un recuadro gris.
 *
 * El objeto que alimenta la confirmación se armaba SIN `imageUrl`, así que
 * justo después de aceptar --el peor momento para que el equipo no se vea-- el
 * cliente leía "Sin imagen" arriba del nombre.
 *
 * El backend sí manda la imagen (`product_image_url`) y la card de la oferta ya
 * la estaba usando: sólo no se pasaba a la confirmación.
 */

const IMAGEN = 'https://cdn.baldecash.com/equipos/tmp214.png';

const ofertaAceptada = {
  offerCode: 'APP-2026-99826442-OF03',
  maxMonthlyQuota: 0,
  expiresAt: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
  landingSlug: 'home',
  requestedProduct: null,
  recommended: null,
  applicationCode: 'APP-2026-99826442',
  clientName: 'MARIA ALVERCA CRUZ',
  offerCase: 'standard' as const,
  terms: [],
  initials: [],
  standardOffer: {
    status: 'accepted',
    productName: 'Laptop V15 G4 IRU',
    productBrand: 'Lenovo',
    productImageUrl: IMAGEN,
    productSpecs: {},
    productSlug: 'lenovo-v15-g4-iru',
    totalPrice: 2099,
    initialPayment: 683,
    initialPaymentPercent: 32,
    termMonths: 6,
    monthlyPayment: 461,
    tea: 75,
    tcea: 86.34,
    totalAmount: 3449,
    hoursRemaining: 6,
    term: 6,
    paymentFrequency: 'mensual',
  },
} as unknown as OfferView;

test('la confirmación muestra la imagen del equipo', () => {
  render(<StandardOfertaAccion token="tok-123" offer={ofertaAceptada} />);

  const img = screen.getByAltText('Laptop V15 G4 IRU') as HTMLImageElement;
  expect(img).toBeInTheDocument();
  expect(img.src).toBe(IMAGEN);
});

test('y ya no dice "Sin imagen"', () => {
  render(<StandardOfertaAccion token="tok-123" offer={ofertaAceptada} />);

  expect(screen.queryByText('Sin imagen')).not.toBeInTheDocument();
});
