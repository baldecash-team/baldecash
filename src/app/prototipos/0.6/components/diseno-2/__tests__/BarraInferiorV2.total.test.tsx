/**
 * Verificación final (BAL-4969): en la barra fija del Paso 4 a 390 el monto
 * salía cortado («S/159/m…»). Ahora el monto no se corta nunca (el sufijo va
 * más chico) y, si falta espacio, cede el texto del botón.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BarraInferiorV2, partirTotal } from '../BarraInferiorV2';

describe('BarraInferiorV2 · total entero', () => {
  it('parte el monto y el sufijo de la frecuencia', () => {
    expect(partirTotal('S/159/mes')).toEqual(['S/159', '/mes']);
    expect(partirTotal('S/1,159.50/quincena')).toEqual(['S/1,159.50', '/quincena']);
    expect(partirTotal('S/159')).toEqual(['S/159', '']);
  });

  it('el monto va sin truncar y en una línea; el botón es el que puede ceder', () => {
    render(<BarraInferiorV2 onPrimary={jest.fn()} isLastStep total="S/1,159/mes" />);
    const total = document.querySelector('[data-total-barra]')!;
    expect(total).not.toHaveClass('min-w-0');
    const monto = total.querySelector('p:last-child')!;
    expect(monto).toHaveTextContent('S/1,159/mes');
    expect(monto).not.toHaveClass('truncate');
    expect(monto).toHaveClass('whitespace-nowrap');
    expect(screen.getByRole('button', { name: 'Enviar solicitud' })).toHaveClass('min-w-0');
  });

  it('«Enviar solicitud» va sin flecha (prototipo); «Continuar» la conserva', () => {
    const { rerender } = render(<BarraInferiorV2 onPrimary={jest.fn()} isLastStep total="S/159/mes" />);
    expect(screen.getByRole('button', { name: 'Enviar solicitud' }).querySelector('svg')).toBeNull();
    rerender(<BarraInferiorV2 onPrimary={jest.fn()} total="S/159/mes" />);
    expect(screen.getByRole('button', { name: 'Continuar' }).querySelector('svg')).not.toBeNull();
  });
});
