/**
 * BAL-4959 (hallazgo de la revisión de accesibilidad) — el desplegable de la
 * cabecera de celular (`CabeceraSolicitudV2`):
 *  - al abrir, el foco entra al panel;
 *  - el scroll de fondo se bloquea mientras está abierto;
 *  - `aria-controls` nunca apunta a un id que no existe (cerrado, el panel
 *    no está en el DOM).
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CabeceraSolicitudV2 } from '../PanelSolicitudV2';

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

afterEach(() => {
  document.body.style.overflow = '';
});

describe('CabeceraSolicitudV2 — el desplegable', () => {
  it('cerrado: sin aria-controls (nada que apunte a un id que no existe)', () => {
    render(<CabeceraSolicitudV2 datos={datos()} indiceActual={0} totalPasos={3} landing="pago-diferido" />);
    const boton = screen.getByRole('button', { expanded: false } as never) ?? screen.getAllByRole('button')[0];
    expect(boton).not.toHaveAttribute('aria-controls');
  });

  it('al abrir: aria-controls apunta a un id que SÍ existe, el foco entra al panel y se bloquea el scroll de fondo', async () => {
    render(<CabeceraSolicitudV2 datos={datos()} indiceActual={0} totalPasos={3} landing="pago-diferido" />);
    const [boton] = screen.getAllByRole('button');
    expect(document.body.style.overflow).not.toBe('hidden');

    await userEvent.click(boton);

    const idDestino = boton.getAttribute('aria-controls');
    expect(idDestino).toBeTruthy();
    const panel = document.getElementById(idDestino as string);
    expect(panel).not.toBeNull();
    expect(document.body.style.overflow).toBe('hidden');
    // El foco entra al panel: el primer enfocable de adentro (el link
    // "Cambiar equipo"), o el panel mismo si no hubiera ninguno.
    expect(panel?.contains(document.activeElement)).toBe(true);
  });

  it('al cerrar (Escape): se libera el scroll de fondo', () => {
    render(<CabeceraSolicitudV2 datos={datos()} indiceActual={0} totalPasos={3} landing="pago-diferido" />);
    const [boton] = screen.getAllByRole('button');
    fireEvent.click(boton);
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(document.body.style.overflow).not.toBe('hidden');
  });
});
