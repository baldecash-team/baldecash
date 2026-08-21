import { monthsAheadForPaymentDay } from '../DynamicWizardStep';

/**
 * Los números esperados salen de `generar_fechas_mensuales_fijo` del legacy
 * (webservice, `SolicitudController.php`), que es quien arma el cronograma real.
 */
describe('monthsAheadForPaymentDay', () => {
  describe('día 3 — corte en el 14', () => {
    it('corre dos meses desde el 14 en adelante', () => {
      expect(monthsAheadForPaymentDay(3, 14)).toBe(2);
      expect(monthsAheadForPaymentDay(3, 21)).toBe(2);
      expect(monthsAheadForPaymentDay(3, 31)).toBe(2);
    });

    it('corre un mes hasta el 13', () => {
      expect(monthsAheadForPaymentDay(3, 1)).toBe(1);
      expect(monthsAheadForPaymentDay(3, 13)).toBe(1);
    });
  });

  describe('día 10 — corte en el 21', () => {
    it('corre dos meses desde el 21 en adelante', () => {
      expect(monthsAheadForPaymentDay(10, 21)).toBe(2);
      expect(monthsAheadForPaymentDay(10, 28)).toBe(2);
    });

    it('corre un mes hasta el 20', () => {
      expect(monthsAheadForPaymentDay(10, 20)).toBe(1);
      expect(monthsAheadForPaymentDay(10, 5)).toBe(1);
    });
  });

  it('día 18 corre siempre un mes', () => {
    expect(monthsAheadForPaymentDay(18, 1)).toBe(1);
    expect(monthsAheadForPaymentDay(18, 30)).toBe(1);
  });

  describe('día 25 — corte en el 6', () => {
    it('se queda en el mes en curso hasta el 5', () => {
      expect(monthsAheadForPaymentDay(25, 1)).toBe(0);
      expect(monthsAheadForPaymentDay(25, 5)).toBe(0);
    });

    it('corre un mes desde el 6 en adelante', () => {
      expect(monthsAheadForPaymentDay(25, 6)).toBe(1);
      expect(monthsAheadForPaymentDay(25, 25)).toBe(1);
    });
  });

  it('día 30 corre siempre un mes', () => {
    expect(monthsAheadForPaymentDay(30, 1)).toBe(1);
    expect(monthsAheadForPaymentDay(30, 29)).toBe(1);
  });

  describe('días sin regla propia en el legacy', () => {
    it('se queda en el mes en curso si el día todavía no pasó', () => {
      expect(monthsAheadForPaymentDay(15, 10)).toBe(0);
    });

    it('salta al mes siguiente si el día ya pasó o es hoy', () => {
      expect(monthsAheadForPaymentDay(15, 15)).toBe(1);
      expect(monthsAheadForPaymentDay(15, 20)).toBe(1);
    });
  });
});
