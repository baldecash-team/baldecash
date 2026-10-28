/**
 * BAL-4959: el puente entre pasos sigue el prototipo de Brenda — títulos por
 * paso, etiquetas bajo cada nodo y, con menos movimiento, todo quieto en su
 * posición final. BAL-5203: sin Baldecito, solo el progreso.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { TransicionPaso, tituloDelPuente } from '../TransicionPaso';

const PASOS = ['Personales', 'Académicos', 'Económicos', 'Resumen'];
const original = window.matchMedia;

function simular(reducido: boolean) {
  window.matchMedia = jest.fn((q: string) => ({
    matches: q.includes('prefers-reduced-motion') && reducido,
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  window.matchMedia = original;
});

describe('TransicionPaso — puente del prototipo', () => {
  it('títulos de Brenda por paso; el último conserva el de siempre', () => {
    expect(tituloDelPuente(1, 4)).toBe('¡Buen comienzo!');
    expect(tituloDelPuente(2, 4)).toBe('¡Vas muy bien!');
    expect(tituloDelPuente(3, 4)).toBe('¡Un paso más!');
    expect(tituloDelPuente(4, 5)).toBe('¡Un paso más!');
    expect(tituloDelPuente(4, 4)).toBe('¡Información completa!');
  });

  it('sin Baldecito (BAL-5203): solo el progreso, con etiquetas bajo los nodos', () => {
    simular(false);
    render(<TransicionPaso pasos={PASOS} pasoCompletado={1} onComplete={jest.fn()} />);
    expect(screen.getByRole('heading', { name: '¡Buen comienzo!' })).toBeInTheDocument();
    expect(document.querySelector('[data-viajero]')).toBeNull();
    expect(document.querySelector('[data-baldecito-v2]')).toBeNull();
    expect(document.querySelectorAll('[data-chispa]')).toHaveLength(0);
    expect(document.querySelector('[data-progreso-puente]')).not.toBeNull();
    for (const n of PASOS) expect(screen.getByText(n)).toBeInTheDocument();
    // La barra del paso que se acaba de completar se llena (88 px con 4 pasos).
    const lleno = document.querySelector<HTMLElement>('[data-camino-lleno]')!;
    expect(lleno.style.width).toBe('88px');
    expect(lleno.style.animation).toContain('d2Llenado');
    expect(screen.getByText('Sigue: Académicos')).toBeInTheDocument();
  });

  it('con menos movimiento: el camino ya lleno, sin animaciones', () => {
    simular(true);
    render(<TransicionPaso pasos={PASOS} pasoCompletado={2} onComplete={jest.fn()} />);
    const lleno = document.querySelector<HTMLElement>('[data-camino-lleno]')!;
    expect(lleno.style.animation).toBe('');
    expect(document.querySelector('[data-viajero]')).toBeNull();
  });

  it('etiquetas cortas bajo los nodos, separadas, y «Sigue:» con el nombre del paso', () => {
    simular(true);
    render(
      <TransicionPaso
        pasos={['Datos Personales', 'Datos Académicos', 'Datos Económicos', 'Resumen']}
        etiquetas={PASOS}
        pasoCompletado={1}
        onComplete={jest.fn()}
      />,
    );
    const etiquetas = Array.from(document.querySelectorAll('[data-etiqueta-puente]'));
    expect(etiquetas.map((e) => e.textContent)).toEqual(PASOS);
    expect(etiquetas.every((e) => e.classList.contains('px-1'))).toBe(true);
    expect(screen.getByText('Sigue: Datos Académicos')).toBeInTheDocument();
  });
});
