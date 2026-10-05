/// <reference types="jest" />
/**
 * Modal bloqueante de condiciones, previo a la selfie.
 *
 * Lo que se prueba es el ORDEN: la cámara no se pide hasta que el postulante
 * aceptó las condiciones. Antes el paso abría el feed al montar, así que la
 * selfie ya estaba tomada cuando aparecía cualquier consejo — y los consejos
 * de la tarjeta de error llegan recién después de que la verificación falló.
 *
 * jsdom no trae cámara ni canvas: se stubean `getUserMedia`, `play()` y el
 * contexto 2D para poder recorrer captura → "Repetir" y comprobar que el modal
 * reaparece en el reintento.
 */
import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockTrack = jest.fn();

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: mockTrack, flush: jest.fn() }),
}));

import { DniSelfieStep } from '../DniSelfieStep';

const getUserMedia = jest.fn();

beforeAll(() => {
  Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value: jest.fn().mockResolvedValue(undefined),
  });
  Object.defineProperty(window.HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value: () => ({ drawImage: jest.fn() }),
  });
  Object.defineProperty(window.HTMLCanvasElement.prototype, 'toDataURL', {
    configurable: true,
    value: () => 'data:image/jpeg;base64,selfie',
  });
});

beforeEach(() => {
  jest.clearAllMocks();
  getUserMedia.mockResolvedValue({ getTracks: () => [{ stop: jest.fn() }] });
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia, enumerateDevices: jest.fn().mockResolvedValue([]) },
  });
});

/** Acepta el modal y espera al obturador (la cámara ya abierta). */
async function aceptarCondiciones() {
  fireEvent.click(screen.getByRole('button', { name: 'Entendido' }));
  return screen.findByLabelText('Tomar foto');
}

describe('DniSelfieStep — condiciones antes de la selfie', () => {
  it('al entrar al paso, el modal bloquea y la cámara todavía no se pide', async () => {
    render(<DniSelfieStep onDone={jest.fn()} applicationCode="APP-99" />);

    // Dentro del diálogo: la guía del paso menciona lo mismo de fondo, así que
    // sin acotar la consulta el test pasaría aunque el modal no existiera.
    const modal = within(await screen.findByRole('dialog'));
    for (const condicion of [/^Sin gorra/i, /^Sin lentes/i, /^Con buena luz/i, /^Rostro descubierto/i]) {
      expect(modal.getByText(condicion)).toBeInTheDocument();
    }
    expect(getUserMedia).not.toHaveBeenCalled();
    expect(mockTrack).toHaveBeenCalledWith(
      'kyc_selfie_tips_shown',
      expect.objectContaining({ application_code: 'APP-99', attempt: 1 }),
    );
  });

  it('"Entendido" cierra el modal y recién ahí abre la cámara', async () => {
    render(<DniSelfieStep onDone={jest.fn()} applicationCode="APP-99" />);
    await screen.findByRole('dialog');

    await aceptarCondiciones();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(getUserMedia).toHaveBeenCalledTimes(1);
    expect(mockTrack).toHaveBeenCalledWith(
      'kyc_selfie_tips_ack',
      expect.objectContaining({ application_code: 'APP-99', attempt: 1 }),
    );
  });

  it('reaparece en cada reintento de la selfie', async () => {
    render(<DniSelfieStep onDone={jest.fn()} applicationCode="APP-99" />);
    await screen.findByRole('dialog');
    const obturador = await aceptarCondiciones();

    fireEvent.click(obturador);
    fireEvent.click(await screen.findByRole('button', { name: 'Repetir' }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(mockTrack).toHaveBeenCalledWith(
      'kyc_selfie_tips_shown',
      expect.objectContaining({ attempt: 2 }),
    );
    // Y la cámara sigue sin reabrirse mientras el modal está arriba.
    expect(getUserMedia).toHaveBeenCalledTimes(1);
  });

  it('no se interpone en la foto del DNI: solo gobierna la selfie', async () => {
    render(<DniSelfieStep onDone={jest.fn()} applicationCode="APP-99" />);
    await screen.findByRole('dialog');
    const obturador = await aceptarCondiciones();

    fireEvent.click(obturador);
    fireEvent.click(await screen.findByRole('button', { name: 'Usar esta foto' }));

    await waitFor(() => expect(screen.getByText('Foto de tu DNI')).toBeInTheDocument());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(getUserMedia).toHaveBeenCalledTimes(2);
  });
});
