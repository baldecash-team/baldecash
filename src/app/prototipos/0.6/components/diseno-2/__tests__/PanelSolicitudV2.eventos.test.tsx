/**
 * BAL-5207: el panel «Tu solicitud» de Diseño 2 emite sus eventos.
 * - `plan_change_panel_toggle` al abrir o cerrar «Cambiar plazo o inicial»
 *   (escritorio, resumen —con «Enviar»— y la cabecera de celular).
 * - `plan_term_change_panel` / `plan_initial_change_panel` al elegir ahí.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PanelSolicitudV2, CabeceraSolicitudV2 } from '../PanelSolicitudV2';

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/components/solicitar/coupon', () => ({
  CouponInput: () => <input aria-label="Código de cupón" />,
  useCuponVisible: () => false,
  useQuitarCupon: () => jest.fn(),
}));

const track = jest.fn();
jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track, flush: jest.fn() }),
}));

const handleTermChange = jest.fn();
const handleInitialChange = jest.fn();

const datos = (overrides: Record<string, unknown> = {}) =>
  ({
    principal: { id: '1', name: 'Laptop Test', shortName: 'Laptop Test', image: null, paymentPlans: [], initialPercent: 10 },
    productos: [{ id: '1', name: 'Laptop Test' }],
    landingSlug: 'pago-diferido',
    mostrarImagen: false,
    nombre: 'Laptop Test',
    precio: (n: number) => `S/${n}`,
    total: 267,
    plazo: 24,
    frecuencia: 'mensual',
    leyenda: '24 meses · Inicial S/300',
    textoPlazo: '24 meses',
    textoInicial: 'S/300',
    regalos: [],
    mesPrimeraCuota: null,
    hayQueElegir: true,
    puedePlazo: true,
    puedeInicial: true,
    opcionesInicial: [
      { percent: 0, label: 'Sin inicial' },
      { percent: 10, label: '10%' },
    ],
    termOptions: [12, 24],
    termLabels: new Map(),
    handleTermChange,
    handleInitialChange,
    isOverQuotaLimit: false,
    appliedCoupon: null,
    cuotaEquipo: 267,
    extras: [],
    ...overrides,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;

const llamadas = (evento: string) => track.mock.calls.filter((c) => c[0] === evento).map((c) => c[1]);

beforeEach(() => {
  track.mockClear();
  handleTermChange.mockClear();
  handleInitialChange.mockClear();
});

function elegirPlazoEInicial() {
  fireEvent.click(screen.getByRole('button', { name: /^12/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Sin inicial' }));
}

describe('Panel de escritorio (BAL-5207)', () => {
  it('«Cambiar plazo o inicial» emite plan_change_panel_toggle al abrir y al cerrar, con step_code', () => {
    render(<PanelSolicitudV2 datos={datos()} codigoDelPaso="datos_personales" />);
    const boton = screen.getByRole('button', { name: /Cambiar plazo o inicial/ });
    fireEvent.click(boton);
    fireEvent.click(boton);
    expect(llamadas('plan_change_panel_toggle')).toEqual([
      { step_code: 'datos_personales', abierto: true },
      { step_code: 'datos_personales', abierto: false },
    ]);
  });

  it('elegir plazo e inicial emite plan_term_change_panel y plan_initial_change_panel, y cambia como siempre', () => {
    render(<PanelSolicitudV2 datos={datos()} codigoDelPaso="datos_personales" />);
    fireEvent.click(screen.getByRole('button', { name: /Cambiar plazo o inicial/ }));
    elegirPlazoEInicial();
    expect(llamadas('plan_term_change_panel')).toEqual([{ term: 12, step_code: 'datos_personales' }]);
    expect(llamadas('plan_initial_change_panel')).toEqual([{ initial_percent: 0, step_code: 'datos_personales' }]);
    expect(handleTermChange).toHaveBeenCalledWith(12);
    expect(handleInitialChange).toHaveBeenCalledWith('1', 10, 0);
  });

  it('volver a tocar lo que ya está elegido no emite', () => {
    render(<PanelSolicitudV2 datos={datos()} codigoDelPaso="datos_personales" />);
    fireEvent.click(screen.getByRole('button', { name: /Cambiar plazo o inicial/ }));
    fireEvent.click(screen.getByRole('button', { name: /^24/ }));
    fireEvent.click(screen.getByRole('button', { name: '10%' }));
    expect(llamadas('plan_term_change_panel')).toEqual([]);
    expect(llamadas('plan_initial_change_panel')).toEqual([]);
  });

  it('variante del resumen (con «Enviar»): también emite', () => {
    render(
      <PanelSolicitudV2
        datos={datos()}
        codigoDelPaso="resumen"
        envio={{ texto: 'Enviar solicitud', onEnviar: jest.fn(), deshabilitado: false, ocupado: false, diaDePago: null }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Cambiar plazo o inicial/ }));
    elegirPlazoEInicial();
    expect(llamadas('plan_change_panel_toggle')).toEqual([{ step_code: 'resumen', abierto: true }]);
    expect(llamadas('plan_term_change_panel')).toEqual([{ term: 12, step_code: 'resumen' }]);
    expect(llamadas('plan_initial_change_panel')).toEqual([{ initial_percent: 0, step_code: 'resumen' }]);
  });

});

describe('Cabecera de celular (BAL-5207)', () => {
  it('abrir y cerrar el desplegable emite plan_change_panel_toggle; elegir ahí emite plazo e inicial', () => {
    render(<CabeceraSolicitudV2 datos={datos()} indiceActual={0} totalPasos={4} landing="pago-diferido" codigoDelPaso="datos_personales" />);
    const cabecera = screen.getByRole('button', { name: /Laptop Test/ });
    fireEvent.click(cabecera);
    elegirPlazoEInicial();
    fireEvent.click(cabecera);
    expect(llamadas('plan_change_panel_toggle')).toEqual([
      { step_code: 'datos_personales', abierto: true },
      { step_code: 'datos_personales', abierto: false },
    ]);
    expect(llamadas('plan_term_change_panel')).toEqual([{ term: 12, step_code: 'datos_personales' }]);
    expect(llamadas('plan_initial_change_panel')).toEqual([{ initial_percent: 0, step_code: 'datos_personales' }]);
  });

  it('Escape y el fondo también cierran y cuentan como cierre', () => {
    const { container } = render(<CabeceraSolicitudV2 datos={datos()} indiceActual={0} totalPasos={4} landing="pago-diferido" codigoDelPaso="datos_personales" />);
    const cabecera = screen.getByRole('button', { name: /Laptop Test/ });
    fireEvent.click(cabecera);
    fireEvent.keyDown(window, { key: 'Escape' });
    fireEvent.click(cabecera);
    fireEvent.click(container.querySelector('.d2-fundido') as HTMLElement);
    expect(llamadas('plan_change_panel_toggle')).toEqual([
      { step_code: 'datos_personales', abierto: true },
      { step_code: 'datos_personales', abierto: false },
      { step_code: 'datos_personales', abierto: true },
      { step_code: 'datos_personales', abierto: false },
    ]);
  });
});
