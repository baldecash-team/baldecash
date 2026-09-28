/**
 * AvisoSeleccion — BAL-4196: si aceptar una opción desde la portada falla, se
 * muestra el mensaje del backend sin tirar la página; solo un link muerto la
 * reemplaza por la pantalla de error.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { AvisoSeleccion, errorDeSeleccionTumbaLaPagina } from '../AvisoSeleccion';

describe('errorDeSeleccionTumbaLaPagina', () => {
  it.each(['expired', 'consumed', 'revoked', 'invalid'])('link muerto (%s) tumba la página', (r) => {
    expect(errorDeSeleccionTumbaLaPagina(r)).toBe(true);
  });

  it.each(['variant_not_eligible', 'exceeds_quota', 'combo_not_eligible', 'price_changed', 'unknown'])(
    'rechazo de la opción (%s) no tumba la página',
    (r) => {
      expect(errorDeSeleccionTumbaLaPagina(r)).toBe(false);
    },
  );
});

describe('AvisoSeleccion', () => {
  it('muestra el mensaje del backend y deja elegir otra opción', () => {
    render(<AvisoSeleccion message="El equipo seleccionado no está disponible para tu oferta." onCerrar={jest.fn()} />);
    expect(screen.getByRole('alert')).toHaveTextContent('El equipo seleccionado no está disponible para tu oferta.');
    expect(screen.getByText('Tu oferta sigue disponible: elige otra opción.')).toBeInTheDocument();
  });

  it('se puede cerrar', () => {
    const onCerrar = jest.fn();
    render(<AvisoSeleccion message="x" onCerrar={onCerrar} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar aviso' }));
    expect(onCerrar).toHaveBeenCalled();
  });
});
