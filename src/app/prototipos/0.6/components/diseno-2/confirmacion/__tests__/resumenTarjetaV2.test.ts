/**
 * F8 (BAL-4967): la tarjeta "Tu solicitud" omite lo que no esté disponible,
 * sin dejar una línea vacía — y nunca recalcula la cuota/inicial del backend.
 */
import { resumenDeTarjetaV2 } from '../resumenTarjetaV2';
import type { ReceivedData } from '@/app/prototipos/0.6/[landing]/solicitar/confirmacion/types/received';

function baseData(overrides: Partial<ReceivedData> = {}): ReceivedData {
  return {
    applicationId: 'APP-2026-00123',
    userName: 'Brenda',
    submittedAt: new Date('2026-10-22T08:38:00-05:00'),
    estimatedResponseHours: 24,
    products: [
      {
        name: 'Laptop Lenovo V15',
        image: '',
        quantity: 1,
        unitPrice: 2500,
        finalPrice: 2500,
        monthlyQuota: 159,
      },
    ],
    term: 24,
    termMonths: 24,
    paymentFrequency: 'mensual',
    initialPayment: 0,
    totalMonthlyQuota: 159,
    notificationChannels: ['whatsapp'],
    ...overrides,
  };
}

describe('resumenDeTarjetaV2', () => {
  it('sin productos: no hay tarjeta que armar', () => {
    expect(resumenDeTarjetaV2(baseData({ products: [] }), 'pago-diferido')).toBeNull();
  });

  it('arma el equipo, plazo, inicial y cuota — sin recalcular, usa `totalMonthlyQuota` tal cual', () => {
    const r = resumenDeTarjetaV2(baseData(), 'pago-diferido');
    expect(r).not.toBeNull();
    expect(r!.nombreEquipo).toBe('Laptop Lenovo V15');
    expect(r!.leyenda).toBe('24 meses · Sin inicial');
    expect(r!.rotuloCuota).toBe('Cuota mensual total');
    expect(r!.cuota).toBe('S/159');
    expect(r!.sufijoCuota).toBe('/mes');
  });

  it('con inicial > 0, la leyenda la muestra', () => {
    const r = resumenDeTarjetaV2(baseData({ initialPayment: 100 }), 'pago-diferido');
    expect(r!.leyenda).toContain('Inicial S/100');
  });

  it('más de un producto: "{n} equipos"', () => {
    const data = baseData({
      products: [
        { name: 'Laptop A', image: '', quantity: 1, unitPrice: 1, finalPrice: 1, monthlyQuota: 1 },
        { name: 'Laptop B', image: '', quantity: 1, unitPrice: 1, finalPrice: 1, monthlyQuota: 1 },
      ],
    });
    expect(resumenDeTarjetaV2(data, 'pago-diferido')!.nombreEquipo).toBe('2 equipos');
  });

  it('sin día de pago ni entrega (no vienen de /status hoy): se omiten, no null-string', () => {
    const r = resumenDeTarjetaV2(baseData(), 'pago-diferido');
    expect(r!.diaDePago).toBeNull();
    expect(r!.entrega).toBeNull();
  });

  it('con día de pago: "Día {d} de cada mes"', () => {
    const r = resumenDeTarjetaV2(baseData(), 'pago-diferido', { paymentDay: 18 });
    expect(r!.diaDePago).toBe('Día 18 de cada mes');
  });

  it('con entrega ya armada: se pasa tal cual', () => {
    const r = resumenDeTarjetaV2(baseData(), 'pago-diferido', { entrega: 'En tu casa · Miraflores' });
    expect(r!.entrega).toBe('En tu casa · Miraflores');
  });

  it('sin accesorios de regalo: no hay regalos', () => {
    expect(resumenDeTarjetaV2(baseData(), 'pago-diferido')!.regalos).toEqual([]);
  });

  it('con un accesorio regalo: lo muestra', () => {
    const data = baseData({ accessories: [{ name: 'Mochila', monthlyQuota: 0, isGift: true }] });
    expect(resumenDeTarjetaV2(data, 'pago-diferido')!.regalos).toEqual(['Mochila']);
  });

  it('accesorio sin isGift no cuenta como regalo', () => {
    const data = baseData({ accessories: [{ name: 'Mouse', monthlyQuota: 20, isGift: false }] });
    expect(resumenDeTarjetaV2(data, 'pago-diferido')!.regalos).toEqual([]);
  });

  it('plan no mensual: usa el periodo real y el sufijo de frecuencia', () => {
    const data = baseData({ term: 12, termMonths: 3, paymentFrequency: 'semanal', totalMonthlyQuota: 40 });
    const r = resumenDeTarjetaV2(data, 'pago-diferido');
    expect(r!.sufijoCuota).toBe('/sem');
    expect(r!.rotuloCuota).toBe('Cuota semanal total');
    expect(r!.leyenda).toContain('12 semanas');
    expect(r!.leyenda).toContain('3 meses');
  });

  // Revisión final I2 (BAL-4969): en main el regalo Dinet sale de `accessories`
  // y viaja aparte en `regaloBaldecash`; Diseño 2 no lo puede perder. Desde
  // BAL-5274 va con los demás regalos, en la fila «Regalo».
  it('regalo Dinet (`regaloBaldecash`): entra en los regalos', () => {
    const data = baseData({
      accessories: [{ name: 'Mochila', monthlyQuota: 0, isGift: true }],
      regaloBaldecash: { name: 'Mouse Logitech M170', image: '' },
    });
    expect(resumenDeTarjetaV2(data, 'pago-diferido')!.regalos).toEqual(['Mochila', 'Mouse Logitech M170']);
  });

  describe('foto del equipo (Emilio, 28-oct)', () => {
    it('trae la foto del equipo cuando es uno solo', () => {
      const r = resumenDeTarjetaV2(baseData({ products: [{ ...baseData().products[0], image: 'https://x/laptop.png' }] }), 'pago-diferido');
      expect(r?.imagen).toBe('https://x/laptop.png');
    });

    it('sin foto, o con varios equipos, no hay imagen', () => {
      expect(resumenDeTarjetaV2(baseData(), 'pago-diferido')?.imagen).toBeNull();
      const dos = baseData().products[0];
      expect(resumenDeTarjetaV2(baseData({ products: [{ ...dos, image: 'a' }, { ...dos, image: 'b' }] }), 'pago-diferido')?.imagen).toBeNull();
    });

    it('BAL-5274: el prototipo ya no lista accesorios ni seguros (la cuota total los incluye)', () => {
      const r = resumenDeTarjetaV2(baseData({
        accessories: [{ name: 'Mochila Nova', monthlyQuota: 6 }],
        insurances: [{ name: 'Seguro Contra Robo', monthlyPrice: 25 }],
        totalMonthlyQuota: 190,
      }), 'pago-diferido')!;
      expect(r).not.toHaveProperty('accesorios');
      expect(r).not.toHaveProperty('seguros');
      expect(r.regalos).toEqual([]);
      expect(r.cuota).toBe('S/190');
    });
  });
});
