import { modoDetalle } from './ofertaDetalleModo';
import type { OfferView } from '../../../../services/offerApi';

const estandar = {
  offerCase: 'standard',
  requestedProduct: null,
  standardOffer: {
    productSlug: 'acer-tmp214',
    term: 16,
    termMonths: 4,
    initialPaymentPercent: 10,
    paymentFrequency: 'semanal',
  },
} as unknown as OfferView;

const caso4 = {
  offerCase: 'downgrade',
  requestedProduct: {
    slug: 'hp-15',
    term: 24,
    initial_percent: 20,
    payment_frequency: 'quincenal',
  },
} as unknown as OfferView;

describe('modoDetalle', () => {
  it('la oferta estándar solo se mira: la decisión vive en la pantalla de la oferta', () => {
    // Sin esto la ficha pinta "Elegir este equipo" y ese botón llama a
    // /select, que en una estándar responde variant_not_eligible.
    expect(modoDetalle(estandar, 'acer-tmp214')).toEqual({
      readOnly: true,
      frequency: 'semanal',
      term: 16,
      initial: 10,
    });
  });

  it('la estándar abre en su celda aunque se llegue por otro slug', () => {
    expect(modoDetalle(estandar, 'cualquier-otro').readOnly).toBe(true);
  });

  it('el equipo que el cliente pidió se mira en SU frecuencia', () => {
    expect(modoDetalle(caso4, 'hp-15')).toEqual({
      readOnly: true,
      frequency: 'quincenal',
      term: 24,
      initial: 20,
    });
  });

  it('un equipo del catálogo de la oferta sí se puede elegir', () => {
    expect(modoDetalle(caso4, 'lenovo-ideapad')).toEqual({
      readOnly: false,
      frequency: null,
      term: null,
      initial: null,
    });
  });
});
