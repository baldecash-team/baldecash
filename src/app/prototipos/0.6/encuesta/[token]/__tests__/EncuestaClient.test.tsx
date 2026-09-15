/// <reference types="jest" />
/**
 * EncuestaClient — ruta `/encuesta/[token]`.
 *
 * Cubre: carga con analista (bloque visible, 5 grupos), sin analista (bloque
 * ausente, 4 grupos, `sat_analyst` no viaja), token inválido, ya respondida,
 * envío OK, envío con error de red, y el progreso parcial (PATCH por cada
 * respuesta marcada, textos al salir del campo, nada después del POST, un
 * PATCH fallido no toca la UI).
 *
 * jest.spyOn sobre imports de módulo NO funciona en este repo (Next 16/SWC):
 * se mockea el módulo completo, parcial sobre el real vía requireActual.
 */
import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

jest.mock('@/app/prototipos/0.6/services/encuestaApi', () => {
  const actual = jest.requireActual('@/app/prototipos/0.6/services/encuestaApi');
  return {
    ...actual,
    getEncuesta: jest.fn(),
    responderEncuesta: jest.fn(),
    guardarProgresoEncuesta: jest.fn(),
  };
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
}));

import { EncuestaClient } from '../EncuestaClient';
import {
  getEncuesta,
  guardarProgresoEncuesta,
  responderEncuesta,
} from '@/app/prototipos/0.6/services/encuestaApi';
import { formatearFechaSolicitud } from '../fecha';

const mockGet = getEncuesta as jest.MockedFunction<typeof getEncuesta>;
const mockPost = responderEncuesta as jest.MockedFunction<typeof responderEncuesta>;
const mockPatch = guardarProgresoEncuesta as jest.MockedFunction<typeof guardarProgresoEncuesta>;

beforeAll(() => {
  window.scrollTo = jest.fn();
});
beforeEach(() => mockPatch.mockResolvedValue(true));
afterEach(() => jest.clearAllMocks());

const conAnalista = {
  application_date: '2026-09-14',
  analyst_name: 'Consuelo',
  answered: false,
  first_name: 'Vania',
};

/** Elige `valor` dentro del radiogroup `grupo`. */
async function elegir(user: ReturnType<typeof userEvent.setup>, grupo: string, valor: number) {
  const group = document.querySelector(`[data-group="${grupo}"]`) as HTMLElement;
  const max = grupo === 'nps' ? 10 : 5;
  await user.click(within(group).getByRole('radio', { name: `${valor} de ${max}` }));
}

it('con analista: muestra el bloque y exige los 5 grupos', async () => {
  mockGet.mockResolvedValue(conAnalista);
  const user = userEvent.setup();

  render(<EncuestaClient token="TOK" />);

  await screen.findByText(/Gracias por confiar en BaldeCash/);
  expect(screen.getByText('lunes 14/09')).toBeInTheDocument();
  expect(screen.getByTestId('bloque-analista')).toHaveTextContent('Ser evaluado por tu analista Consuelo');

  const enviar = screen.getByRole('button', { name: 'Enviar respuesta' });
  expect(enviar).toBeDisabled();
  expect(screen.getByTestId('pct')).toHaveTextContent('0%');

  await elegir(user, 'nps', 9);
  await elegir(user, 'ces', 4);
  await elegir(user, 'm_solicitud', 5);
  await elegir(user, 'm_envio', 5);
  // 4 de 5: todavía falta la analista.
  expect(screen.getByTestId('pct')).toHaveTextContent('80%');
  expect(enviar).toBeDisabled();

  await elegir(user, 'm_evaluacion', 3);
  expect(screen.getByTestId('pct')).toHaveTextContent('100%');
  expect(enviar).toBeEnabled();
});

it('sin analista (aprobación automática): no hay bloque, 4 grupos y sat_analyst no viaja', async () => {
  mockGet.mockResolvedValue({ ...conAnalista, analyst_name: null });
  mockPost.mockResolvedValue({ ok: true });
  const user = userEvent.setup();

  render(<EncuestaClient token="TOK" />);

  await screen.findByText(/Gracias por confiar en BaldeCash/);
  expect(screen.queryByTestId('bloque-analista')).not.toBeInTheDocument();
  expect(screen.queryByText(/Ser evaluado/)).not.toBeInTheDocument();

  await elegir(user, 'nps', 10);
  await elegir(user, 'ces', 5);
  expect(screen.getByTestId('pct')).toHaveTextContent('50%');
  await elegir(user, 'm_solicitud', 4);
  await elegir(user, 'm_envio', 2);
  expect(screen.getByTestId('pct')).toHaveTextContent('100%');

  await user.type(screen.getByLabelText('Motivo de tu calificación'), 'Todo rápido');
  await user.click(screen.getByRole('button', { name: 'Enviar respuesta' }));

  await waitFor(() => expect(mockPost).toHaveBeenCalledTimes(1));
  const [token, body] = mockPost.mock.calls[0];
  expect(token).toBe('TOK');
  expect(body).toEqual({ nps: 10, ces: 5, sat_web: 4, sat_delivery: 2, nps_reason: 'Todo rápido' });
  expect(body).not.toHaveProperty('sat_analyst');
  expect(body).not.toHaveProperty('comment');
});

it('token inválido: pantalla de enlace no válido', async () => {
  mockGet.mockResolvedValue({ reason: 'invalid', error: 'Este enlace no es válido.' });

  render(<EncuestaClient token="MALO" />);

  await screen.findByText('Este enlace no es válido');
  expect(screen.getByText(/Revisa el mensaje que te enviamos por WhatsApp/)).toBeInTheDocument();
  expect(screen.queryByText(/Gracias por confiar/)).not.toBeInTheDocument();
});

it('ya respondida: pantalla de gracias directa, sin formulario', async () => {
  mockGet.mockResolvedValue({ ...conAnalista, answered: true });

  render(<EncuestaClient token="TOK" />);

  await screen.findByText('¡Gracias por tu tiempo!');
  expect(screen.getByTestId('thanks')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Enviar respuesta' })).not.toBeInTheDocument();
});

it('envío OK: pasa a la pantalla de gracias con la analista en el body', async () => {
  mockGet.mockResolvedValue(conAnalista);
  mockPost.mockResolvedValue({ ok: true });
  const user = userEvent.setup();

  render(<EncuestaClient token="TOK" />);
  await screen.findByText(/Gracias por confiar en BaldeCash/);

  await elegir(user, 'nps', 7);
  await elegir(user, 'ces', 3);
  await elegir(user, 'm_solicitud', 3);
  await elegir(user, 'm_evaluacion', 5);
  await elegir(user, 'm_envio', 4);
  await user.type(screen.getByLabelText('Algo más sobre estas interacciones'), 'Gracias');
  await user.click(screen.getByRole('button', { name: 'Enviar respuesta' }));

  await screen.findByText('¡Gracias por tu tiempo!');
  expect(mockPost.mock.calls[0][1]).toEqual({
    nps: 7, ces: 3, sat_web: 3, sat_analyst: 5, sat_delivery: 4, comment: 'Gracias',
  });
});

it('envío con error de red: muestra el mensaje y el botón sigue habilitado', async () => {
  mockGet.mockResolvedValue({ ...conAnalista, analyst_name: null });
  mockPost.mockResolvedValue({ reason: 'network', error: 'Error de conexión. Intenta nuevamente.' });
  const user = userEvent.setup();

  render(<EncuestaClient token="TOK" />);
  await screen.findByText(/Gracias por confiar en BaldeCash/);

  await elegir(user, 'nps', 7);
  await elegir(user, 'ces', 3);
  await elegir(user, 'm_solicitud', 3);
  await elegir(user, 'm_envio', 4);
  await user.click(screen.getByRole('button', { name: 'Enviar respuesta' }));

  await screen.findByRole('alert');
  expect(screen.getByRole('alert')).toHaveTextContent('Error de conexión');
  expect(screen.getByRole('button', { name: 'Enviar respuesta' })).toBeEnabled();
  expect(screen.queryByText('¡Gracias por tu tiempo!')).not.toBeInTheDocument();
});

it('ya respondida al enviar (409): igual muestra gracias', async () => {
  mockGet.mockResolvedValue({ ...conAnalista, analyst_name: null });
  mockPost.mockResolvedValue({ reason: 'answered', error: 'Ya respondida.' });
  const user = userEvent.setup();

  render(<EncuestaClient token="TOK" />);
  await screen.findByText(/Gracias por confiar en BaldeCash/);
  await elegir(user, 'nps', 7);
  await elegir(user, 'ces', 3);
  await elegir(user, 'm_solicitud', 3);
  await elegir(user, 'm_envio', 4);
  await user.click(screen.getByRole('button', { name: 'Enviar respuesta' }));

  await screen.findByText('¡Gracias por tu tiempo!');
});

describe('progreso parcial (sesiones incompletas)', () => {
  it('cada respuesta marcada viaja por PATCH con el campo del API', async () => {
    mockGet.mockResolvedValue(conAnalista);
    const user = userEvent.setup();

    render(<EncuestaClient token="TOK" />);
    await screen.findByText(/Gracias por confiar en BaldeCash/);

    await elegir(user, 'nps', 9);
    expect(mockPatch).toHaveBeenCalledWith('TOK', { nps: 9 });
    await elegir(user, 'm_solicitud', 5);
    expect(mockPatch).toHaveBeenCalledWith('TOK', { sat_web: 5 });
    await elegir(user, 'm_evaluacion', 4);
    expect(mockPatch).toHaveBeenCalledWith('TOK', { sat_analyst: 4 });
    await elegir(user, 'm_envio', 2);
    expect(mockPatch).toHaveBeenCalledWith('TOK', { sat_delivery: 2 });
    // Cambiar de opinión manda el valor nuevo.
    await elegir(user, 'nps', 3);
    expect(mockPatch).toHaveBeenLastCalledWith('TOK', { nps: 3 });
  });

  it('el motivo se guarda al salir del campo, con el texto completo', async () => {
    mockGet.mockResolvedValue(conAnalista);
    const user = userEvent.setup();

    render(<EncuestaClient token="TOK" />);
    await screen.findByText(/Gracias por confiar en BaldeCash/);

    await user.type(screen.getByLabelText('Motivo de tu calificación'), 'Todo rápido');
    await user.tab();
    expect(mockPatch).toHaveBeenLastCalledWith('TOK', { nps_reason: 'Todo rápido' });

    // Volver a salir del campo sin cambios no repite el envío.
    const llamadas = mockPatch.mock.calls.length;
    await user.click(screen.getByLabelText('Motivo de tu calificación'));
    await user.tab();
    expect(mockPatch.mock.calls.length).toBe(llamadas);
  });

  it('el comentario se guarda solo tras dejar de escribir (debounce)', async () => {
    jest.useFakeTimers();
    try {
      mockGet.mockResolvedValue({ ...conAnalista, analyst_name: null });
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<EncuestaClient token="TOK" />);
      await screen.findByText(/Gracias por confiar en BaldeCash/);

      await user.type(screen.getByLabelText('Algo más sobre estas interacciones'), 'Gracias');
      expect(mockPatch).not.toHaveBeenCalledWith('TOK', expect.objectContaining({ comment: expect.anything() }));

      jest.advanceTimersByTime(850);
      expect(mockPatch).toHaveBeenLastCalledWith('TOK', { comment: 'Gracias' });
    } finally {
      jest.useRealTimers();
    }
  });

  it('después del POST exitoso no sale ningún PATCH más', async () => {
    jest.useFakeTimers();
    try {
      mockGet.mockResolvedValue({ ...conAnalista, analyst_name: null });
      mockPost.mockResolvedValue({ ok: true });
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<EncuestaClient token="TOK" />);
      await screen.findByText(/Gracias por confiar en BaldeCash/);

      await elegir(user, 'nps', 7);
      await elegir(user, 'ces', 3);
      await elegir(user, 'm_solicitud', 3);
      await elegir(user, 'm_envio', 4);
      // Comentario a medio guardar (debounce pendiente) cuando se envía.
      await user.type(screen.getByLabelText('Algo más sobre estas interacciones'), 'Gracias');
      await user.click(screen.getByRole('button', { name: 'Enviar respuesta' }));
      await screen.findByText('¡Gracias por tu tiempo!');

      // Al hacer clic en Enviar el textarea pierde el foco: ese blur guarda el
      // comentario ANTES del POST (correcto). Lo que no puede pasar es un PATCH
      // después del POST, ni por el debounce que quedó programado.
      const llamadas = mockPatch.mock.calls.length;
      const ordenPost = mockPost.mock.invocationCallOrder[0];
      expect(mockPatch.mock.invocationCallOrder.every((o) => o < ordenPost)).toBe(true);
      jest.advanceTimersByTime(2000);
      expect(mockPatch.mock.calls.length).toBe(llamadas);
      // El POST sí llevó el comentario.
      expect(mockPost.mock.calls[0][1]).toEqual({ nps: 7, ces: 3, sat_web: 3, sat_delivery: 4, comment: 'Gracias' });
    } finally {
      jest.useRealTimers();
    }
  });

  it('ya respondida al abrir: no manda PATCH', async () => {
    mockGet.mockResolvedValue({ ...conAnalista, answered: true });

    render(<EncuestaClient token="TOK" />);
    await screen.findByText('¡Gracias por tu tiempo!');

    expect(mockPatch).not.toHaveBeenCalled();
  });

  it('un PATCH que falla no cambia la UI: el progreso y el botón siguen igual', async () => {
    mockGet.mockResolvedValue({ ...conAnalista, analyst_name: null });
    mockPatch.mockResolvedValue(false);
    const user = userEvent.setup();

    render(<EncuestaClient token="TOK" />);
    await screen.findByText(/Gracias por confiar en BaldeCash/);

    await elegir(user, 'nps', 8);
    await elegir(user, 'ces', 4);
    expect(mockPatch).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('pct')).toHaveTextContent('50%');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar respuesta' })).toBeDisabled();
  });
});

describe('formatearFechaSolicitud', () => {
  it('no depende de la zona horaria: 2026-09-14 es lunes', () => {
    expect(formatearFechaSolicitud('2026-09-14')).toBe('lunes 14/09');
    expect(formatearFechaSolicitud('2026-09-13T10:00:00')).toBe('domingo 13/09');
  });
  it('sin fecha devuelve null; formato raro lo devuelve tal cual', () => {
    expect(formatearFechaSolicitud(null)).toBeNull();
    expect(formatearFechaSolicitud('ayer')).toBe('ayer');
  });
});
