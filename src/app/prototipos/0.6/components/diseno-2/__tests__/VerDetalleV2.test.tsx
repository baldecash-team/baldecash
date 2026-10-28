/**
 * BAL-4966 → BAL-5237 · "Ver detalle" (el repaso de los datos con «Editar»)
 * ya no está en el panel "Tu solicitud" de Diseño 2: ni en escritorio ni en
 * la cabecera desplegable de celular (Emilio, 28-oct). Y la barra fija de
 * celular acepta el texto del Paso 4 ("Enviar con N protecciones").
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PanelSolicitudV2, CabeceraSolicitudV2, textoDelDiaDePago } from '../PanelSolicitudV2';
import { BarraInferiorV2 } from '../BarraInferiorV2';

// El cupón del panel (BAL-5203) vive en su propio módulo; acá no hay ProductProvider.
jest.mock('@/app/prototipos/0.6/[landing]/solicitar/components/solicitar/coupon', () => ({
  CouponInput: () => null,
  useCuponVisible: () => false,
  useQuitarCupon: () => jest.fn(),
}));

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
    textoPlazo: '24 meses',
    textoInicial: 'Sin inicial',
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

describe('Sin «Ver detalle» (BAL-5237)', () => {
  it('escritorio: el panel no tiene «Ver detalle» ni región de repaso', () => {
    render(<PanelSolicitudV2 datos={datos()} />);
    expect(screen.getByRole('complementary', { name: 'Tu solicitud' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Ver detalle/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Detalle de tu solicitud' })).not.toBeInTheDocument();
  });

  it('celular: el desplegable de la cabecera abre sin «Ver detalle»', () => {
    render(<CabeceraSolicitudV2 datos={datos()} indiceActual={3} totalPasos={4} landing="pago-diferido" />);
    const cabecera = screen.getAllByRole('button')[0];
    fireEvent.click(cabecera);
    expect(cabecera).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByText('Ver detalle')).not.toBeInTheDocument();
  });

  it('sin producto principal no hay panel ni cabecera desplegable (ya no hay repaso que mostrar)', () => {
    render(<PanelSolicitudV2 datos={datos({ principal: null, productos: [] })} />);
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    render(<CabeceraSolicitudV2 datos={datos({ principal: null, productos: [] })} indiceActual={3} totalPasos={4} landing="pago-diferido" />);
    expect(screen.queryByRole('button', { name: /Tu solicitud/ })).not.toBeInTheDocument();
  });
});

describe('BarraInferiorV2 — texto del Paso 4', () => {
  it('usa el texto que le pasan y muestra el total', () => {
    render(<BarraInferiorV2 onPrimary={jest.fn()} isLastStep total="S/179/mes" texto="Enviar con 1 protección" />);
    expect(screen.getByRole('button')).toHaveTextContent('Enviar con 1 protección');
    expect(document.querySelector('[data-total-barra] p:last-child')).toHaveTextContent('S/179/mes');
  });
  it('sin texto propio, lo de siempre', () => {
    render(<BarraInferiorV2 onPrimary={jest.fn()} isLastStep />);
    expect(screen.getByRole('button')).toHaveTextContent('Enviar solicitud');
  });
});

describe('Panel del paso que envía (prototipo de Brenda, Paso 4)', () => {
  it('muestra "Cuota mensual total", el día de pago, su propio "Enviar solicitud" y "Cambiar plazo o inicial" (Emilio, 27-oct)', () => {
    const onEnviar = jest.fn();
    const { rerender } = render(
      <PanelSolicitudV2
        datos={datos({ hayQueElegir: true })}
        envio={{ texto: 'Enviar solicitud', onEnviar, deshabilitado: false, ocupado: false, diaDePago: null }}
      />,
    );
    expect(screen.getByText(/Cuota mensual total/)).toBeInTheDocument();
    expect(screen.getByText('Por elegir')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cambiar plazo o inicial/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Enviar solicitud' }));
    expect(onEnviar).toHaveBeenCalledTimes(1);

    rerender(
      <PanelSolicitudV2
        datos={datos({ hayQueElegir: true })}
        envio={{ texto: 'Enviar solicitud', onEnviar, deshabilitado: true, ocupado: false, diaDePago: 'Día 3 de cada mes' }}
      />,
    );
    expect(screen.getByText('Día 3 de cada mes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar solicitud' })).toBeDisabled();
  });

  it('textoDelDiaDePago: "Día N de cada mes" o null', () => {
    expect(textoDelDiaDePago('3')).toBe('Día 3 de cada mes');
    expect(textoDelDiaDePago(['15'])).toBe('Día 15 de cada mes');
    expect(textoDelDiaDePago('')).toBeNull();
    expect(textoDelDiaDePago(undefined)).toBeNull();
  });
});
