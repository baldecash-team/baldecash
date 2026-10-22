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

  it('sin accesorios de regalo: regalo es null', () => {
    const r = resumenDeTarjetaV2(baseData(), 'pago-diferido');
    expect(r!.regalo).toBeNull();
  });

  it('con un accesorio regalo: lo muestra', () => {
    const data = baseData({ accessories: [{ name: 'Mochila', monthlyQuota: 0, isGift: true }] });
    expect(resumenDeTarjetaV2(data, 'pago-diferido')!.regalo).toBe('Mochila');
  });

  it('accesorio sin isGift no cuenta como regalo', () => {
    const data = baseData({ accessories: [{ name: 'Mouse', monthlyQuota: 20, isGift: false }] });
    expect(resumenDeTarjetaV2(data, 'pago-diferido')!.regalo).toBeNull();
  });

  it('plan no mensual: usa el periodo real y el sufijo de frecuencia', () => {
    const data = baseData({ term: 12, termMonths: 3, paymentFrequency: 'semanal', totalMonthlyQuota: 40 });
    const r = resumenDeTarjetaV2(data, 'pago-diferido');
    expect(r!.sufijoCuota).toBe('/sem');
    expect(r!.rotuloCuota).toBe('Cuota semanal total');
    expect(r!.leyenda).toContain('12 semanas');
    expect(r!.leyenda).toContain('3 meses');
  });
});
