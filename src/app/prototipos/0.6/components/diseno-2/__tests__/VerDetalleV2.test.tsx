/**
 * BAL-4966 · "Ver detalle" del Paso 4: el repaso de datos va en el panel
 * "Tu solicitud" (escritorio) y en la cabecera desplegable (celular). Sin
 * `detalle` (otro paso, o `summary-off`) no hay botón. Y la barra fija de
 * celular acepta el texto del Paso 4 ("Enviar con N protecciones").
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PanelSolicitudV2, CabeceraSolicitudV2 } from '../PanelSolicitudV2';
import { BarraInferiorV2 } from '../BarraInferiorV2';

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/hooks/useTecladoVirtualAbierto', () => ({
  useTecladoVirtualAbierto: () => false,
}));

const datos = (overrides: Record<string, unknown> = {}) =>
  ({
    principal: {
      id: '1',
      name: 'Laptop Test',
      shortName: 'Laptop Test',
      image: null,
      specs: { processor: 'i5', ram: '8GB', storage: '256GB' },
      paymentPlans: [],
      initialPercent: 0,
    },
    productos: [{ id: '1', name: 'Laptop Test' }],
    mostrarImagen: false,
    nombre: 'Laptop Test',
    precio: (n: number) => `S/${n}`,
    total: 159,
    frecuencia: 'mensual',
    leyenda: '24 meses · Sin inicial',
    regalos: [],
    mesPrimeraCuota: null,
    hayQueElegir: false,
    puedePlazo: false,
    puedeInicial: false,
    opcionesInicial: [],
    termOptions: [],
    termLabels: new Map(),
    plazo: 24,
    handleTermChange: jest.fn(),
    handleInitialChange: jest.fn(),
    isOverQuotaLimit: false,
    maxMonthlyQuota: 0,
    appliedCoupon: null,
    cuotaEquipo: 159,
    cuotaAccesorios: 0,
    ...overrides,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;

const REPASO = <div>Datos personales · Editar</div>;

describe('Ver detalle — escritorio', () => {
  it('con detalle: el botón despliega el repaso', () => {
    render(<PanelSolicitudV2 datos={datos()} detalle={REPASO} />);
    const boton = screen.getByRole('button', { name: /Ver detalle/ });
    expect(boton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Datos personales · Editar')).not.toBeInTheDocument();
    fireEvent.click(boton);
    expect(boton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('region', { name: 'Detalle de tu solicitud' })).toHaveTextContent('Datos personales · Editar');
  });

  it('sin detalle (summary-off u otro paso): no hay botón', () => {
    render(<PanelSolicitudV2 datos={datos()} />);
    expect(screen.queryByRole('button', { name: /Ver detalle/ })).not.toBeInTheDocument();
  });
});

describe('Ver detalle — celular', () => {
  it('dentro del desplegable de la cabecera', () => {
    render(<CabeceraSolicitudV2 datos={datos()} indiceActual={3} totalPasos={4} landing="pago-diferido" detalle={REPASO} />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    fireEvent.click(screen.getByRole('button', { name: /Ver detalle/ }));
    expect(screen.getByText('Datos personales · Editar')).toBeInTheDocument();
  });

  it('la cabecera se puede abrir aunque solo haya detalle que mostrar', () => {
    const sinNada = datos({ principal: { id: '1', name: 'X', shortName: 'X', image: null, specs: null, paymentPlans: [], initialPercent: 0 } });
    const { rerender } = render(<CabeceraSolicitudV2 datos={sinNada} indiceActual={3} totalPasos={4} landing="pago-diferido" />);
    expect(screen.getAllByRole('button')[0]).toBeDisabled();
    rerender(<CabeceraSolicitudV2 datos={sinNada} indiceActual={3} totalPasos={4} landing="pago-diferido" detalle={REPASO} />);
    expect(screen.getAllByRole('button')[0]).not.toBeDisabled();
  });
});

describe('BarraInferiorV2 — texto del Paso 4', () => {
  it('usa el texto que le pasan y muestra el total', () => {
    render(<BarraInferiorV2 onPrimary={jest.fn()} isLastStep total="S/179/mes" texto="Enviar con 1 protección" />);
    expect(screen.getByRole('button')).toHaveTextContent('Enviar con 1 protección');
    expect(screen.getByText('S/179/mes')).toBeInTheDocument();
  });
  it('sin texto propio, lo de siempre', () => {
    render(<BarraInferiorV2 onPrimary={jest.fn()} isLastStep />);
    expect(screen.getByRole('button')).toHaveTextContent('Enviar solicitud');
  });
});
