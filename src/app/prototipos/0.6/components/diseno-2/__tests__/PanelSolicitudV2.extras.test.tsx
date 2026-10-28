/**
 * E2E BAL-4969 (bug 5): el panel "Tu solicitud" sumaba el accesorio y el
 * seguro al total pero no los listaba. Como el prototipo de Brenda (Paso 4):
 * "Cuota de tu equipo" y debajo cada extra con su "+S/x/mes".
 */
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { PanelSolicitudV2, extrasDeLaCuota } from '../PanelSolicitudV2';

// El cupón del panel (BAL-5203) vive en su propio módulo; acá no hay ProductProvider.
jest.mock('@/app/prototipos/0.6/[landing]/solicitar/components/solicitar/coupon', () => ({
  CouponInput: () => null,
  useCuponVisible: () => false,
  useQuitarCupon: () => jest.fn(),
}));

const datos = (overrides: Record<string, unknown> = {}) =>
  ({
    principal: { id: '1', name: 'Laptop Test', shortName: 'Laptop Test', image: null, paymentPlans: [], initialPercent: 0 },
    productos: [{ id: '1', name: 'Laptop Test' }],
    mostrarImagen: false,
    nombre: 'Laptop Test',
    precio: (n: number) => `S/${n}`,
    total: 267,
    frecuencia: 'mensual',
    leyenda: '24 meses · Sin inicial',
    textoPlazo: '24 meses',
    textoInicial: 'Sin inicial',
    regalos: [],
    mesPrimeraCuota: null,
    hayQueElegir: false,
    opcionesInicial: [],
    termOptions: [],
    termLabels: new Map(),
    isOverQuotaLimit: false,
    appliedCoupon: null,
    cuotaEquipo: 239,
    extras: [],
    ...overrides,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;

it('extrasDeLaCuota junta accesorios pagados y seguros, sin los de cuota 0', () => {
  expect(extrasDeLaCuota(
    [{ id: '1876', name: 'Travel Backpack', monthlyQuota: 12 }, { id: '9', name: 'Regalo', monthlyQuota: 0 }],
    [{ id: '16', name: 'Seguro contra robo', monthlyPrice: 16 }],
  )).toEqual([
    { clave: 'acc-1876', nombre: 'Travel Backpack', cuota: 12 },
    { clave: 'seg-16', nombre: 'Seguro contra robo', cuota: 16 },
  ]);
});

it('con extras, el panel lista la cuota del equipo y cada extra', () => {
  const { container } = render(<PanelSolicitudV2 datos={datos({
    extras: [
      { clave: 'acc-1876', nombre: 'Travel Backpack', cuota: 12 },
      { clave: 'seg-16', nombre: 'Seguro contra robo', cuota: 16 },
    ],
  })} />);
  const desglose = container.querySelector('[data-desglose-v2]') as HTMLElement;
  expect(desglose).not.toBeNull();
  expect(within(desglose).getByText('Cuota de tu equipo')).toBeInTheDocument();
  expect(within(desglose).getByText('S/239/mes')).toBeInTheDocument();
  expect(within(desglose).getByText('Travel Backpack')).toBeInTheDocument();
  expect(within(desglose).getByText('+S/12/mes')).toBeInTheDocument();
  expect(within(desglose).getByText('Seguro contra robo')).toBeInTheDocument();
  expect(within(desglose).getByText('+S/16/mes')).toBeInTheDocument();
});

it('sin extras no hay desglose (el total basta)', () => {
  const { container } = render(<PanelSolicitudV2 datos={datos()} />);
  expect(container.querySelector('[data-desglose-v2]')).toBeNull();
  expect(screen.getByText(/S\/267/)).toBeInTheDocument();
});
