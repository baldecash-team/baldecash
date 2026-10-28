/**
 * Modo oscuro (landing `nvidia`): el primario es verde lima (#76B900) y el
 * texto que va encima es oscuro (`--color-on-primary` = #1E2230). Los botones
 * llenos del modal de dirección tenían `text-white` fijo: blanco sobre lima no
 * se lee (contraste 2,4:1). Deben usar el token, como el resto del kit.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LocationModal } from '../LocationModal';

const TEXTO_SOBRE_PRIMARIO = 'text-[var(--color-on-primary)]';

function claseDelBoton(nombre: RegExp): string {
  return screen.getByRole('button', { name: nombre }).className;
}

describe('LocationModal — texto de los botones primarios', () => {
  const geolocationOriginal = navigator.geolocation;

  afterEach(() => {
    Object.defineProperty(navigator, 'geolocation', { value: geolocationOriginal, configurable: true });
  });

  it('«Permitir ubicación» usa el texto sobre primario, no blanco fijo', () => {
    render(<LocationModal isOpen onClose={() => {}} onConfirm={() => {}} />);
    const clase = claseDelBoton(/Permitir ubicación/);
    expect(clase).toContain(TEXTO_SOBRE_PRIMARIO);
    expect(clase).not.toMatch(/\btext-white\b/);
  });

  it('«Intentar de nuevo» usa el texto sobre primario, no blanco fijo', () => {
    Object.defineProperty(navigator, 'geolocation', { value: undefined, configurable: true });
    render(<LocationModal isOpen onClose={() => {}} onConfirm={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Permitir ubicación/ }));
    const clase = claseDelBoton(/Intentar de nuevo/);
    expect(clase).toContain(TEXTO_SOBRE_PRIMARIO);
    expect(clase).not.toMatch(/\btext-white\b/);
  });

  it('«Confirmar ubicación» usa el texto sobre primario, no blanco fijo', () => {
    render(
      <LocationModal
        isOpen
        onClose={() => {}}
        onConfirm={() => {}}
        initialCoords={{ latitude: -12.12, longitude: -77.03 }}
      />,
    );
    const clase = claseDelBoton(/Confirmar ubicación/);
    expect(clase).toContain(TEXTO_SOBRE_PRIMARIO);
    expect(clase).not.toMatch(/\btext-white\b/);
  });
});
