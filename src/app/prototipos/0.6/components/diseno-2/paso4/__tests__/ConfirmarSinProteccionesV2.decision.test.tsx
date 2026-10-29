/**
 * BAL-5276 (punto 5): el aviso «¿Enviar sin tus protecciones?» registra la
 * decisión de la persona en `insurance_skip_confirm`.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

const mockTrack = jest.fn();
jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: mockTrack }),
}));

import { ConfirmarSinProteccionesV2 } from '../ConfirmarSinProteccionesV2';

function pintar() {
  const props = { onClose: jest.fn(), onReintentar: jest.fn(), onEnviarSinProtecciones: jest.fn() };
  render(<ConfirmarSinProteccionesV2 isOpen elegidas={2} {...props} />);
  return props;
}

beforeEach(() => mockTrack.mockClear());

it('«Enviar sin protecciones» registra enviar_sin y envía', () => {
  const props = pintar();
  fireEvent.click(screen.getByRole('button', { name: 'Enviar sin protecciones' }));
  expect(mockTrack).toHaveBeenCalledWith('insurance_skip_confirm', { decision: 'enviar_sin', elegidas: 2, diseno: 2 });
  expect(props.onEnviarSinProtecciones).toHaveBeenCalled();
});

it('«Reintentar» registra reintentar', () => {
  const props = pintar();
  fireEvent.click(screen.getByRole('button', { name: /Reintentar/ }));
  expect(mockTrack).toHaveBeenCalledWith('insurance_skip_confirm', { decision: 'reintentar', elegidas: 2, diseno: 2 });
  expect(props.onReintentar).toHaveBeenCalled();
});

it('Escape registra cerrar con el motivo', () => {
  const props = pintar();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(mockTrack).toHaveBeenCalledWith('insurance_skip_confirm', {
    decision: 'cerrar', motivo_cierre: 'escape', elegidas: 2, diseno: 2,
  });
  expect(props.onClose).toHaveBeenCalled();
});
