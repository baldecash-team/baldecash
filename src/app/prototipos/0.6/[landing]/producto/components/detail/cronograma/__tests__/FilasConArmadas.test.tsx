/// <reference types="jest" />
/**
 * Lo que la persona ve antes de firmar.
 *
 * La armada tiene que leerse como parte de la inicial y no como una cuota más:
 * si se confunden, parece que la inicial desapareció y que el plan tiene cuatro
 * cuotas de más.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { FilasConArmadas, type FilaCronogramaApi } from '../FilasConArmadas';

const armada = (n: number, fecha: string): FilaCronogramaApi => ({
  numero: n, fecha, monto: '33.50', es_armada: true, etiqueta: `Armada ${n} de 4`,
});

const cuota = (n: number, fecha: string): FilaCronogramaApi => ({
  numero: n, fecha, monto: '32.20', es_armada: false, etiqueta: `Cuota ${n} de 13`,
});

describe('FilasConArmadas', () => {
  it('distingue las armadas de las cuotas', () => {
    render(<FilasConArmadas filas={[
      armada(1, '2026-08-21'), armada(2, '2026-08-28'),
      cuota(1, '2026-09-04'),
    ]} />);

    expect(screen.getAllByTestId('fila-armada')).toHaveLength(2);
    expect(screen.getAllByTestId('fila-cuota')).toHaveLength(1);
    expect(screen.getByText('Armada 1 de 4')).toBeInTheDocument();
    expect(screen.getByText('Cuota 1 de 13')).toBeInTheDocument();
  });

  it('la fecha no se corre un día por el huso', () => {
    // `new Date('2026-08-21')` es UTC y en Lima (-5) cae el 20.
    render(<FilasConArmadas filas={[armada(1, '2026-08-21')]} />);

    expect(screen.getByText(/21 de agosto de 2026/)).toBeInTheDocument();
  });

  it('los centavos no se pierden', () => {
    render(<FilasConArmadas filas={[
      { numero: 1, fecha: '2026-08-21', monto: '33.38', es_armada: true, etiqueta: 'Armada 1 de 4' },
    ]} />);

    expect(screen.getByText('S/33.38')).toBeInTheDocument();
  });

  it('sin armadas no anuncia una inicial fraccionada', () => {
    render(<FilasConArmadas filas={[cuota(1, '2026-09-04'), cuota(2, '2026-09-11')]} />);

    expect(screen.queryByText(/armadas/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId('fila-armada')).not.toBeInTheDocument();
  });

  it('muestra el total cuando el backend lo manda', () => {
    render(<FilasConArmadas filas={[cuota(1, '2026-09-04')]} total="553.10" />);

    expect(screen.getByText('S/553.10')).toBeInTheDocument();
  });

  it('sin filas no dibuja una tabla vacía', () => {
    const { container } = render(<FilasConArmadas filas={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
