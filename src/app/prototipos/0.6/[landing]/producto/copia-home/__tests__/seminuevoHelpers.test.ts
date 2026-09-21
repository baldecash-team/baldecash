/**
 * BAL-4032: la nota de envío diferido salía de un literal con la fecha escrita
 * a mano ("miércoles 15/07") y se seguía mostrando meses después. Estos casos
 * fijan que la fecha venga del backend y que, sin fecha, no se diga nada.
 */

import { deferredShippingNote, factoryWarranty } from '../seminuevoHelpers';
import {
  NO_DEFERRED_DELIVERY,
  type DeferredDelivery,
} from '@/app/prototipos/0.6/utils/deferredDelivery';

const diferido = (over: Partial<DeferredDelivery> = {}): DeferredDelivery => ({
  ...NO_DEFERRED_DELIVERY,
  isDeferred: true,
  estimatedFrom: '2026-10-07',
  estimatedTo: '2026-10-17',
  ...over,
});

describe('deferredShippingNote', () => {
  it('usa la fecha del backend, no un literal', () => {
    expect(deferredShippingNote(diferido())).toBe(
      'Lo prepararemos con mucho cuidado para ti. El envío o recojo será a partir del miércoles 07/10.',
    );
  });

  it('no dice nada si el producto no es diferido', () => {
    expect(deferredShippingNote(NO_DEFERRED_DELIVERY)).toBe('');
  });

  it('no dice nada si el backend no mandó la fecha', () => {
    expect(deferredShippingNote(diferido({ estimatedFrom: null }))).toBe('');
  });

  it('no dice nada si no llega el bloque de entrega', () => {
    expect(deferredShippingNote(undefined)).toBe('');
    expect(deferredShippingNote(null)).toBe('');
  });
});

describe('factoryWarranty', () => {
  it('da 12 meses de iPhone 15 en adelante y 6 en el 13', () => {
    expect(factoryWarranty('iPhone 15 Pro')).toBe('12 meses');
    expect(factoryWarranty('iPhone 13 Pro Max')).toBe('6 meses');
  });

  it('cae al warranty del producto y si no a 1 año', () => {
    expect(factoryWarranty('MacBook Air', '2 años')).toBe('2 años');
    expect(factoryWarranty('MacBook Air')).toBe('1 año');
  });
});
