/**
 * BAL-4959 · `ProgresoV2`: "paso X de N" con N real (nunca 4 fijo) y la regla
 * de volver de `WizardProgress` (un paso hecho se puede clicar, uno futuro no).
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgresoV2, pasoEsClicable } from '../ProgresoV2';

const pasos = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ slug: `paso-${i + 1}`, nombre: `Paso número ${i + 1}` }));

describe('ProgresoV2', () => {
  it('con 3 pasos dice "paso 2 de 3" y pinta 3 etiquetas', () => {
    render(<ProgresoV2 pasos={pasos(3)} indiceActual={1} completados={new Set(['paso-1'])} onIrAPaso={jest.fn()} />);
    expect(screen.getByText(/paso 2 de 3/)).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('con 5 pasos dice "paso 4 de 5"', () => {
    render(<ProgresoV2 pasos={pasos(5)} indiceActual={3} completados={new Set()} onIrAPaso={jest.fn()} />);
    expect(screen.getByText(/paso 4 de 5/)).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
  });

  it('las etiquetas son los nombres de los pasos', () => {
    render(<ProgresoV2 pasos={pasos(3)} indiceActual={0} completados={new Set()} />);
    expect(screen.getByText('Paso número 3')).toBeInTheDocument();
  });

  it('un paso hecho es clicable y navega a su slug', async () => {
    const onIrAPaso = jest.fn();
    render(<ProgresoV2 pasos={pasos(4)} indiceActual={2} completados={new Set(['paso-1'])} onIrAPaso={onIrAPaso} />);
    await userEvent.click(screen.getByRole('button', { name: /Volver a Paso número 1/ }));
    expect(onIrAPaso).toHaveBeenCalledWith('paso-1');
  });

  it('un paso futuro sin completar no es clicable', () => {
    render(<ProgresoV2 pasos={pasos(4)} indiceActual={1} completados={new Set(['paso-1'])} onIrAPaso={jest.fn()} />);
    expect(screen.queryByRole('button', { name: /Paso número 3/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Paso número 2/ })).not.toBeInTheDocument(); // el actual
  });

  it('sin onIrAPaso (contrato firmado) ningún paso es clicable', () => {
    render(<ProgresoV2 pasos={pasos(4)} indiceActual={3} completados={new Set(['paso-1', 'paso-2'])} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('pasoEsClicable sigue la regla de WizardProgress', () => {
    const hechos = new Set(['paso-4']);
    expect(pasoEsClicable(0, 'paso-1', 2, hechos, true)).toBe(true); // anterior
    expect(pasoEsClicable(3, 'paso-4', 2, hechos, true)).toBe(true); // futuro pero completo
    expect(pasoEsClicable(4, 'paso-5', 2, hechos, true)).toBe(false); // futuro
    expect(pasoEsClicable(2, 'paso-3', 2, hechos, true)).toBe(false); // el actual
    expect(pasoEsClicable(0, 'paso-1', 2, hechos, false)).toBe(false); // sin navegación
  });
});
