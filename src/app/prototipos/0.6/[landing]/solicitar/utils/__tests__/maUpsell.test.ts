import { shouldOfferMaUpsell } from '../maUpsell';

const ma = { id: '1', insuranceType: 'multiasistencia' };

test('muestra el popup si hay MA disponible, NO elegido y NO rechazado', () => {
  expect(shouldOfferMaUpsell({ availableMultiasistencia: ma, maSelected: false, declined: false })).toBe(true);
});

test('NO muestra si el usuario ya agregó la MA', () => {
  expect(shouldOfferMaUpsell({ availableMultiasistencia: ma, maSelected: true, declined: false })).toBe(false);
});

test('NO muestra si el usuario ya rechazó el upsell', () => {
  expect(shouldOfferMaUpsell({ availableMultiasistencia: ma, maSelected: false, declined: true })).toBe(false);
});

test('NO muestra si no hay MA disponible (otra landing / no elegible)', () => {
  expect(shouldOfferMaUpsell({ availableMultiasistencia: null, maSelected: false, declined: false })).toBe(false);
});

test('NO muestra si se pide saltar el upsell (reintento de submit tras aceptar/declinar)', () => {
  expect(shouldOfferMaUpsell({ availableMultiasistencia: ma, maSelected: false, declined: false, skipUpsell: true })).toBe(false);
});
