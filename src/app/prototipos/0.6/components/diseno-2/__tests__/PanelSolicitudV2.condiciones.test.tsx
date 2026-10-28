/**
 * BAL-5203 (Brenda, 27-oct): el panel "Tu solicitud" de escritorio muestra el
 * plazo, la inicial y el cupón, y el cupón se puede poner o quitar en todos
 * los pasos con la misma lógica del modal "Lo quiero" (`CouponInput` y
 * `useQuitarCupon`, que acá se reemplazan por dobles).
 */
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { PanelSolicitudV2, CabeceraSolicitudV2 } from '../PanelSolicitudV2';

const quitar = jest.fn();
let visible = true;
jest.mock('@/app/prototipos/0.6/[landing]/solicitar/components/solicitar/coupon', () => ({
  CouponInput: ({ isRequired }: { isRequired?: boolean }) => (
    <input aria-label="Código de cupón" data-obligatorio={isRequired ? 'si' : 'no'} />
  ),
  useCuponVisible: (_landing: string, obligatorio: boolean) => visible || obligatorio,
  useQuitarCupon: () => quitar,
}));

const datos = (overrides: Record<string, unknown> = {}) =>
  ({
    principal: { id: '1', name: 'Laptop Test', shortName: 'Laptop Test', image: null, paymentPlans: [], initialPercent: 10 },
    productos: [{ id: '1', name: 'Laptop Test' }],
    landingSlug: 'pago-diferido',
    mostrarImagen: false,
    nombre: 'Laptop Test',
    precio: (n: number) => `S/${n}`,
    total: 267,
    frecuencia: 'mensual',
    leyenda: '24 meses · Inicial S/300',
    textoPlazo: '24 meses',
    textoInicial: 'S/300',
    regalos: [],
    mesPrimeraCuota: null,
    hayQueElegir: false,
    opcionesInicial: [],
    termOptions: [],
    termLabels: new Map(),
    isOverQuotaLimit: false,
    appliedCoupon: null,
    cuotaEquipo: 267,
    extras: [],
    ...overrides,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;

const fila = (container: HTMLElement, nombre: string) => {
  const dt = Array.from(container.querySelectorAll('[data-condiciones-panel-v2] dt')).find((d) => d.textContent === nombre);
  return dt?.parentElement as HTMLElement | undefined;
};

beforeEach(() => {
  quitar.mockClear();
  visible = true;
});

describe('Panel "Tu solicitud": plazo, inicial y cupón (BAL-5203)', () => {
  it('muestra el plazo y la inicial, cada uno en su fila', () => {
    const { container } = render(<PanelSolicitudV2 datos={datos()} />);
    expect(within(fila(container, 'Plazo')!).getByText('24 meses')).toBeInTheDocument();
    expect(within(fila(container, 'Inicial')!).getByText('S/300')).toBeInTheDocument();
  });

  it('sin inicial lo dice', () => {
    const { container } = render(<PanelSolicitudV2 datos={datos({ textoInicial: 'Sin inicial' })} />);
    expect(within(fila(container, 'Inicial')!).getByText('Sin inicial')).toBeInTheDocument();
  });

  it('sin cupón: "¿Tienes un cupón?" despliega la caja de siempre', () => {
    const { container } = render(<PanelSolicitudV2 datos={datos()} />);
    const boton = screen.getByRole('button', { name: /¿Tienes un cupón\?/ });
    expect(boton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByLabelText('Código de cupón')).toBeNull();
    fireEvent.click(boton);
    expect(boton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByLabelText('Código de cupón')).toBeInTheDocument();
    expect(container.querySelector('[data-cupon-panel-v2="vacio"]')).not.toBeNull();
  });

  it('cupón obligatorio: el botón lo dice y la caja lo sabe', () => {
    visible = false;
    render(<PanelSolicitudV2 datos={datos()} cuponObligatorio />);
    fireEvent.click(screen.getByRole('button', { name: /¿Tienes un cupón\? \(obligatorio\)/ }));
    expect(screen.getByLabelText('Código de cupón')).toHaveAttribute('data-obligatorio', 'si');
  });

  it('aplicado: el código y "Quitar", que usa el quitar de siempre', () => {
    const { container } = render(
      <PanelSolicitudV2 datos={datos({ appliedCoupon: { code: 'BALDE50', label: 'S/50 de descuento' } })} />,
    );
    const cupon = fila(container, 'Cupón')!;
    expect(within(cupon).getByText('BALDE50')).toBeInTheDocument();
    expect(within(cupon).getByText('S/50 de descuento')).toBeInTheDocument();
    fireEvent.click(within(cupon).getByRole('button', { name: 'Quitar cupón BALDE50' }));
    expect(quitar).toHaveBeenCalledTimes(1);
  });

  it('cupón de campaña (del link): con candado y sin "Quitar"', () => {
    const { container } = render(
      <PanelSolicitudV2 datos={datos({ appliedCoupon: { code: 'UCV2026', label: 'Campaña', lockedFromUrl: true } })} />,
    );
    const cupon = fila(container, 'Cupón')!;
    expect(within(cupon).getByLabelText('Cupón de campaña: no se puede quitar')).toBeInTheDocument();
    expect(within(cupon).queryByRole('button', { name: /Quitar/ })).toBeNull();
  });

  it('la landing no ofrece cupón y no hay uno aplicado: no hay fila de cupón', () => {
    visible = false;
    const { container } = render(<PanelSolicitudV2 datos={datos()} />);
    expect(fila(container, 'Cupón')).toBeUndefined();
    expect(screen.queryByRole('button', { name: /cupón/ })).toBeNull();
  });

  it('la landing no ofrece cupón pero llegó uno por el link: se muestra igual', () => {
    visible = false;
    const { container } = render(
      <PanelSolicitudV2 datos={datos({ appliedCoupon: { code: 'UCV2026', label: 'Campaña', lockedFromUrl: true } })} />,
    );
    expect(within(fila(container, 'Cupón')!).getByText('UCV2026')).toBeInTheDocument();
  });

  it('celular: la cabecera no ofrece cupón (solo escritorio)', () => {
    render(<CabeceraSolicitudV2 datos={datos()} indiceActual={0} totalPasos={4} landing="pago-diferido" />);
    expect(screen.queryByRole('button', { name: /¿Tienes un cupón\?/ })).toBeNull();
  });
});
