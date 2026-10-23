/**
 * BAL-4959: el puente entre pasos sigue el prototipo de Brenda — títulos por
 * paso, Baldecito en SVG que salta al paso que sigue, etiquetas bajo cada
 * nodo y, con menos movimiento, todo quieto en su posición final.
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

  it('Baldecito en SVG salta 88 px (4 pasos) con bcHop y hay etiquetas bajo los nodos', () => {
    simular(false);
    render(<TransicionPaso pasos={PASOS} pasoCompletado={1} onComplete={jest.fn()} />);
    expect(screen.getByRole('heading', { name: '¡Buen comienzo!' })).toBeInTheDocument();
    const viajero = document.querySelector<HTMLElement>('[data-viajero]')!;
    expect(viajero.querySelector('[data-baldecito-v2]')).not.toBeNull();
    expect(viajero.style.animation).toContain('d2Salto 0.9s cubic-bezier(0.45, 0, 0.3, 1) 0.35s');
    expect(viajero.style.getPropertyValue('--d2-salto')).toBe('88px');
    for (const n of PASOS) expect(screen.getByText(n)).toBeInTheDocument();
    expect(document.querySelectorAll('[data-chispa]')).toHaveLength(8);
    expect(screen.getByText('Sigue: Académicos')).toBeInTheDocument();
  });

  it('con menos movimiento: Baldecito ya en el paso que sigue, sin animaciones ni chispas', () => {
    simular(true);
    render(<TransicionPaso pasos={PASOS} pasoCompletado={2} onComplete={jest.fn()} />);
    const viajero = document.querySelector<HTMLElement>('[data-viajero]')!;
    expect(viajero.style.animation).toBe('');
    expect(viajero.style.transform).toBe('translate(88px, 0)');
    expect(document.querySelectorAll('[data-chispa]')).toHaveLength(0);
    const partes = Array.from(document.querySelectorAll<SVGGElement>('[data-baldecito-v2] g'));
    expect(partes.every((g) => !g.style.animation)).toBe(true);
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
