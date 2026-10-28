/**
 * F8 (BAL-4967): la píldora usa el `reference` real, y con reduced-motion no
 * hay confeti.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
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

describe('CabeceraConfirmacionV2', () => {
  afterEach(() => {
    mockMatchMedia(false);
  });

  it('la píldora muestra el N.° de solicitud (reference), no un BC- inventado', () => {
    mockMatchMedia(false);
    render(
      <CabeceraConfirmacionV2
        titulo="¡Recibimos tu solicitud, Brenda!"
        subtitulo="Ya la estamos revisando."
        numeroDeSolicitud="APP-2026-00123"
      />,
    );
    expect(screen.getByText(/Solicitud N\.° APP-2026-00123/)).toBeInTheDocument();
  });

  it('sin reduced-motion: pinta las 26 piezas de confeti', () => {
    mockMatchMedia(false);
    const { container } = render(
      <CabeceraConfirmacionV2 titulo="t" subtitulo="s" numeroDeSolicitud="APP-1" />,
    );
    expect(container.querySelectorAll('[data-confeti-pieza]')).toHaveLength(26);
  });

  it('sin Baldecito (BAL-5203): la píldora es lo primero de la cabecera', () => {
    mockMatchMedia(false);
    const { container } = render(
      <CabeceraConfirmacionV2 titulo="t" subtitulo="s" numeroDeSolicitud="APP-1" />,
    );
    expect(container.querySelector('[data-baldecito-v2]')).toBeNull();
    expect(container.querySelector('[data-anillo-baldecito]')).toBeNull();
    expect(screen.queryByLabelText('Baldecito celebrando')).toBeNull();
    const cabecera = container.querySelector('[data-cabecera-confirmacion-v2]')!;
    // Hijos visibles: decorado, <style>, confeti y después la píldora.
    const contenido = Array.from(cabecera.children).filter(
      (n) => n.tagName !== 'STYLE' && n.getAttribute('aria-hidden') === null,
    );
    expect(contenido[0].textContent).toContain('Solicitud N.° APP-1');
  });

  it('con reduced-motion: no hay confeti', () => {
    mockMatchMedia(true);
    const { container } = render(
      <CabeceraConfirmacionV2 titulo="t" subtitulo="s" numeroDeSolicitud="APP-1" />,
    );
    expect(container.querySelectorAll('[data-confeti-pieza]')).toHaveLength(0);
  });

  it('pinta título y subtítulo tal como llegan', () => {
    mockMatchMedia(false);
    render(
      <CabeceraConfirmacionV2
        titulo="¡Recibimos tu solicitud!"
        subtitulo="Te avisamos el resultado por WhatsApp en máximo 24 horas."
        numeroDeSolicitud="APP-1"
      />,
    );
    expect(screen.getByRole('heading', { name: '¡Recibimos tu solicitud!' })).toBeInTheDocument();
    expect(screen.getByText(/en máximo 24 horas/)).toBeInTheDocument();
  });
});
