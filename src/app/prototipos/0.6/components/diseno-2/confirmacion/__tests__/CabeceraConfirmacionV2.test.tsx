/**
 * F8 (BAL-4967): la píldora usa el `reference` real, y con reduced-motion no
 * hay confeti. BAL-5274: barra de pasos de Zona Estudiantes (4 o 5 pasos),
 * «Paso 2 de N…» y el botón que abre Zona Estudiantes en otra pestaña.
 */
import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CabeceraConfirmacionV2 } from '../CabeceraConfirmacionV2';

function mockMatchMedia(matches: boolean) {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
}

function lineaDelPaso(): string {
  return document.querySelector('[data-linea-del-paso]')?.textContent ?? '';
}

describe('CabeceraConfirmacionV2', () => {
  beforeEach(() => mockMatchMedia(false));
  afterEach(() => mockMatchMedia(false));

  it('la píldora muestra el N.° de solicitud (reference), no un BC- inventado', () => {
    render(<CabeceraConfirmacionV2 titulo="¡Recibimos tu solicitud, Brenda!" numeroDeSolicitud="APP-2026-00123" />);
    expect(screen.getByText(/Solicitud N\.° APP-2026-00123/)).toBeInTheDocument();
  });

  it('sin reduced-motion: pinta las 26 piezas de confeti', () => {
    const { container } = render(<CabeceraConfirmacionV2 titulo="t" numeroDeSolicitud="APP-1" />);
    expect(container.querySelectorAll('[data-confeti-pieza]')).toHaveLength(26);
  });

  it('sin Baldecito (BAL-5203): la píldora es lo primero de la cabecera', () => {
    const { container } = render(<CabeceraConfirmacionV2 titulo="t" numeroDeSolicitud="APP-1" />);
    expect(container.querySelector('[data-baldecito-v2]')).toBeNull();
    expect(screen.queryByLabelText('Baldecito celebrando')).toBeNull();
    const cabecera = container.querySelector('[data-cabecera-confirmacion-v2]')!;
    const contenido = Array.from(cabecera.children).filter(
      (n) => n.tagName !== 'STYLE' && n.getAttribute('aria-hidden') === null,
    );
    expect(contenido[0].textContent).toContain('Solicitud N.° APP-1');
  });

  it('con reduced-motion: no hay confeti', () => {
    mockMatchMedia(true);
    const { container } = render(<CabeceraConfirmacionV2 titulo="t" numeroDeSolicitud="APP-1" />);
    expect(container.querySelectorAll('[data-confeti-pieza]')).toHaveLength(0);
  });

  it('cierres (firmada, aprobada…): título y subtítulo tal como llegan, sin barra de pasos', () => {
    render(
      <CabeceraConfirmacionV2 titulo="¡Solicitud firmada!" subtitulo="Tu contrato quedó firmado." numeroDeSolicitud="APP-1" />,
    );
    expect(screen.getByRole('heading', { name: '¡Solicitud firmada!' })).toBeInTheDocument();
    expect(screen.getByText('Tu contrato quedó firmado.')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Pasos de tu solicitud' })).not.toBeInTheDocument();
  });

  describe('barra de pasos de Zona Estudiantes (BAL-5274)', () => {
    function pasos() {
      const lista = screen.getByRole('list', { name: 'Pasos de tu solicitud' });
      return within(lista).getAllByRole('listitem');
    }

    it('sin inicial: 4 pasos, «Evaluación» es el actual y «Paso 2 de 4»', () => {
      render(
        <CabeceraConfirmacionV2 titulo="t" numeroDeSolicitud="APP-1" pasos={{ conInicial: false, telefono: '9XX XXX 321' }} />,
      );
      const items = pasos();
      expect(items.map((li) => li.textContent)).toEqual(['Recibida', 'Evaluación', '3Firma', '4Entrega']);
      expect(items[1]).toHaveAttribute('aria-current', 'step');
      expect(items.filter((li) => li.getAttribute('aria-current') === 'step')).toHaveLength(1);
      expect(lineaDelPaso()).toBe('Paso 2 de 4: una asesora te escribirá por WhatsApp al +51 9XX XXX 321.');
    });

    it('con inicial: 5 pasos con «Cuota inicial» antes de «Entrega» y «Paso 2 de 5»', () => {
      render(
        <CabeceraConfirmacionV2 titulo="t" numeroDeSolicitud="APP-1" pasos={{ conInicial: true, telefono: '9XX XXX 321' }} />,
      );
      expect(pasos().map((li) => li.textContent)).toEqual(['Recibida', 'Evaluación', '3Firma', '4Cuota inicial', '5Entrega']);
      expect(lineaDelPaso()).toBe('Paso 2 de 5: una asesora te escribirá por WhatsApp al +51 9XX XXX 321.');
    });

    it('sin celular: la frase termina en «por WhatsApp.»', () => {
      render(<CabeceraConfirmacionV2 titulo="t" numeroDeSolicitud="APP-1" pasos={{ conInicial: false }} />);
      expect(lineaDelPaso()).toBe('Paso 2 de 4: una asesora te escribirá por WhatsApp.');
    });

    it('no muestra horas ni «en este momento» (la página no sabe en qué va)', () => {
      const { container } = render(
        <CabeceraConfirmacionV2 titulo="t" numeroDeSolicitud="APP-1" pasos={{ conInicial: true, telefono: '9XX XXX 321' }} />,
      );
      expect(container.textContent).not.toMatch(/horas|en este momento|Hoy/);
    });
  });

  describe('botón «Sigue tu solicitud en Zona Estudiantes» (BAL-5274)', () => {
    it('abre https://zonaclientes.baldecash.com en otra pestaña, con su texto de apoyo', () => {
      render(<CabeceraConfirmacionV2 titulo="t" numeroDeSolicitud="APP-1" pasos={{ conInicial: false }} />);
      const enlace = screen.getByRole('link', { name: /Sigue tu solicitud en Zona Estudiantes/ });
      expect(enlace).toHaveAttribute('href', 'https://zonaclientes.baldecash.com');
      expect(enlace).toHaveAttribute('target', '_blank');
      expect(enlace.getAttribute('rel')).toContain('noopener');
      expect(screen.getByText('Ahí verás cada avance, sin volver a solicitar.')).toBeInTheDocument();
    });

    it('también va en los cierres (sin barra de pasos)', () => {
      render(<CabeceraConfirmacionV2 titulo="t" subtitulo="s" numeroDeSolicitud="APP-1" />);
      expect(screen.getByRole('link', { name: /Sigue tu solicitud en Zona Estudiantes/ })).toBeInTheDocument();
    });

    it('avisa el clic (para el evento)', () => {
      const onZonaEstudiantes = jest.fn();
      render(<CabeceraConfirmacionV2 titulo="t" numeroDeSolicitud="APP-1" onZonaEstudiantes={onZonaEstudiantes} />);
      fireEvent.click(screen.getByRole('link', { name: /Sigue tu solicitud en Zona Estudiantes/ }));
      expect(onZonaEstudiantes).toHaveBeenCalledTimes(1);
    });
  });
});
