import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CampoMonto } from './CampoMonto';

/**
 * El campo de importe de la calculadora.
 *
 * Es de texto y no numerico a proposito: un campo numerico responde a la rueda
 * del raton mientras tiene el foco, asi que desplazar la pagina con el puntero
 * encima sube o baja el importe sin que la persona lo advierta. Como la cuota
 * se vuelve a simular con el monto nuevo, la pantalla queda coherente consigo
 * misma y no queda ningun rastro de que el numero cambio.
 */

function montar(alCambiar = jest.fn(), valor = 0) {
  render(
    <CampoMonto
      etiqueta="Monto de matrícula"
      valor={valor}
      placeholder="Ej. 350.50"
      onCambio={alCambiar}
    />
  );
  return { alCambiar, campo: screen.getByLabelText(/Monto de matrícula/i) };
}

describe('CampoMonto', () => {
  /**
   * La garantia estructural contra la rueda: un campo de texto sencillamente no
   * tiene el comportamiento de incremento y decremento que la provoca.
   */
  it('es un campo de texto, no numerico', () => {
    const { campo } = montar();

    expect(campo).toHaveAttribute('type', 'text');
  });

  it('conserva el teclado numerico en dispositivos moviles', () => {
    const { campo } = montar();

    expect(campo).toHaveAttribute('inputMode', 'decimal');
  });

  it('descarta lo que no sea digito ni separador decimal', () => {
    const { campo, alCambiar } = montar();

    fireEvent.change(campo, { target: { value: 'S/ 3a5b0' } });

    expect(campo).toHaveValue('350');
    expect(alCambiar).toHaveBeenLastCalledWith(350);
  });

  it('acepta la coma como separador decimal y la muestra como punto', () => {
    const { campo, alCambiar } = montar();

    fireEvent.change(campo, { target: { value: '350,50' } });

    expect(campo).toHaveValue('350.50');
    expect(alCambiar).toHaveBeenLastCalledWith(350.5);
  });

  it('limita a dos decimales', () => {
    const { campo, alCambiar } = montar();

    fireEvent.change(campo, { target: { value: '350.505' } });

    expect(campo).toHaveValue('350.50');
    expect(alCambiar).toHaveBeenLastCalledWith(350.5);
  });

  /**
   * Escribir 350.50 pasa por 350. antes de llegar. Reescribirle el campo a la
   * persona en ese punto es peor que dejarlo: el texto se conserva y el importe
   * se informa como el numero que ya se puede leer.
   */
  it('conserva el punto final mientras se esta escribiendo', () => {
    const { campo, alCambiar } = montar();

    fireEvent.change(campo, { target: { value: '350.' } });

    expect(campo).toHaveValue('350.');
    expect(alCambiar).toHaveBeenLastCalledWith(350);
  });

  it('un campo vaciado informa cero', () => {
    const { campo, alCambiar } = montar();

    fireEvent.change(campo, { target: { value: '800' } });
    fireEvent.change(campo, { target: { value: '' } });

    expect(campo).toHaveValue('');
    expect(alCambiar).toHaveBeenLastCalledWith(0);
  });

  it('un texto sin nada aprovechable informa cero y deja el campo vacio', () => {
    const { campo, alCambiar } = montar();

    fireEvent.change(campo, { target: { value: 'abc' } });

    expect(campo).toHaveValue('');
    expect(alCambiar).toHaveBeenLastCalledWith(0);
  });

  it('arranca con el importe que recibe', () => {
    const { campo } = montar(jest.fn(), 950.5);

    expect(campo).toHaveValue('950.5');
  });
});
