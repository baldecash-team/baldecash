import React from 'react';
import { render, screen } from '@testing-library/react';
import { PanelSolicitudV2 } from '../PanelSolicitudV2';

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/components/solicitar/coupon', () => ({
  CouponInput: () => null,
  useCuponVisible: () => false,
  useQuitarCupon: () => jest.fn(),
}));

const datos = (overrides: Record<string, unknown> = {}) =>
  ({
    principal: { id: '1', name: 'Laptop Test', shortName: 'Laptop Test', image: null, paymentPlans: [], initialPercent: 0 },
    productos: [{ id: '1', name: 'Laptop Test' }],
    mostrarImagen: false, nombre: 'Laptop Test', precio: (n: number) => `S/${n}`,
    total: 239, frecuencia: 'mensual', leyenda: '24 meses · Sin inicial', textoPlazo: '24 meses',
    textoInicial: 'Sin inicial', regalos: [], mesPrimeraCuota: null, hayQueElegir: false,
    opcionesInicial: [], termOptions: [], termLabels: new Map(), isOverQuotaLimit: false,
    appliedCoupon: null, cuotaEquipo: 239, extras: [],
    ...overrides,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;

it('lista los seguros del combo como «incluido en tu combo» y no los suma', () => {
  render(<PanelSolicitudV2 datos={datos({ segurosIncluidos: [{ id: '16', name: 'Seguro contra Robo 24M' }] })} />);
  expect(screen.getByText('Seguro contra Robo 24M incluido en tu combo')).toBeInTheDocument();
  expect(screen.getByText(/S\/239/)).toBeInTheDocument();
});

it('sin la clave (datos viejos) no rompe', () => {
  render(<PanelSolicitudV2 datos={datos()} />);
  expect(screen.queryByText(/incluido en tu combo/)).toBeNull();
});
