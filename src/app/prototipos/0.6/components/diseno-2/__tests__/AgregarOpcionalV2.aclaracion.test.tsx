/**
 * Verificación final (BAL-4969): en «Agregar celular para llamadas (si es otro
 * número)» la aclaración va en gris y sin negrita, como en el prototipo.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { AgregarOpcionalV2, partirAclaracion } from '../campos/AgregarOpcionalV2';

describe('AgregarOpcionalV2 — aclaración entre paréntesis', () => {
  it('parte el texto y deja la aclaración aparte', () => {
    expect(partirAclaracion('Agregar celular para llamadas (si es otro número)')).toEqual([
      'Agregar celular para llamadas',
      '(si es otro número)',
    ]);
    expect(partirAclaracion('Agregar código de estudiante')).toEqual(['Agregar código de estudiante', null]);
  });

  it('la aclaración no va en negrita y va en gris', () => {
    render(<AgregarOpcionalV2 label="Celular para llamadas (si es otro número)" onAbrir={jest.fn()} />);
    const boton = screen.getByRole('button', { name: 'Agregar celular para llamadas (si es otro número)' });
    const aclaracion = boton.querySelector('[data-aclaracion]')!;
    expect(aclaracion).toHaveTextContent('(si es otro número)');
    expect(aclaracion).toHaveClass('font-normal', 'text-[var(--d2-texto-suave)]');
  });
});
