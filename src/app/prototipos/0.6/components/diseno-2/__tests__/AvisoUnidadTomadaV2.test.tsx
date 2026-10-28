/**
 * AvisoUnidadTomadaV2 (BAL-5203, punto 10): el aviso «Ese equipo ya no está
 * disponible» de Diseño 2, sobre `ModalV2`.
 *
 * Cubre justo lo que el punto 10 pedía verificar en `usePasoDelWizard`: el
 * componente SOLO se ve si hay `mensaje` (unidad tomada de verdad), no por
 * estar montado. `ModalV2` ya gatea `abierto={!!mensaje}` adentro, así que
 * con `mensaje=null` no debe haber ningún `role="dialog"` en pantalla.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { AvisoUnidadTomadaV2 } from '../AvisoUnidadTomadaV2';

describe('AvisoUnidadTomadaV2', () => {
  it('sin mensaje (unidadTomada null): no hay dialog en pantalla', () => {
    render(<AvisoUnidadTomadaV2 mensaje={null} onElegirOtro={jest.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('con mensaje: franja, título e ícono del aviso, con el texto del backend', () => {
    render(<AvisoUnidadTomadaV2 mensaje="Era la última unidad de ese modelo." onElegirOtro={jest.fn()} />);
    const dialogo = screen.getByRole('dialog');
    expect(dialogo).toHaveTextContent('Ese equipo ya no está disponible');
    expect(dialogo).toHaveTextContent('Elige otro equipo para continuar');
    expect(dialogo).toHaveTextContent('Era la última unidad de ese modelo.');
    expect(dialogo).toHaveAttribute('data-unidad-tomada-v2', 'true');
  });

  it('el botón "Elegir otro equipo" y cerrar (X) llaman a onElegirOtro: no hay forma de quedarse en el formulario', () => {
    const onElegirOtro = jest.fn();
    render(<AvisoUnidadTomadaV2 mensaje="Ya no está disponible." onElegirOtro={onElegirOtro} />);
    fireEvent.click(screen.getByRole('button', { name: 'Elegir otro equipo' }));
    expect(onElegirOtro).toHaveBeenCalledTimes(1);

    onElegirOtro.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onElegirOtro).toHaveBeenCalledTimes(1);
  });
});
