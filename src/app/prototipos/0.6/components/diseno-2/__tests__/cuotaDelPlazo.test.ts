/**
 * BAL-4959 (hallazgo de la revisión): si el plazo elegido en el panel no
 * tiene una opción para la inicial que ya está elegida, `cuotaDelPlazo` no
 * debe mostrar la cuota de OTRA inicial (antes caía a `options[0]`) — eso le
 * mentía el número a la persona. Sin esa opción, no hay cuota: `null`.
 */
import { cuotaDelPlazo } from '../PanelSolicitudV2';
import type { SelectedProduct } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';

const producto = (overrides: Partial<SelectedProduct> = {}): SelectedProduct =>
  ({
    id: '1',
    initialPercent: 20,
    paymentPlans: [
      {
        term: 24,
        options: [
          { initialPercent: 0, monthlyQuota: 300 },
          { initialPercent: 20, monthlyQuota: 240 },
        ],
      },
      {
        // 12 cuotas solo viene con 0% de inicial: no tiene la opción de 20%.
        term: 12,
        options: [{ initialPercent: 0, monthlyQuota: 600 }],
      },
    ],
    ...overrides,
  } as unknown as SelectedProduct);

describe('cuotaDelPlazo', () => {
  it('la cuota del plazo con la inicial ya elegida', () => {
    expect(cuotaDelPlazo(producto(), 24)).toBe(240);
  });

  it('el plazo SIN esa inicial: null, no la cuota de otra inicial', () => {
    expect(cuotaDelPlazo(producto(), 12)).toBeNull();
  });

  it('un plazo que no existe: null', () => {
    expect(cuotaDelPlazo(producto(), 36)).toBeNull();
  });

  it('sin paymentPlans: null', () => {
    expect(cuotaDelPlazo(producto({ paymentPlans: undefined }), 24)).toBeNull();
  });
});
