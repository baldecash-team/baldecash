/**
 * BAL-4969 (casuísticas): ningún error del envío rompe la pantalla de Diseño 2.
 * El `detail` de ws2 puede ser lista (422) u objeto (titular menor); el 500
 * puede venir en HTML; la red se puede caer o colgar. Todo termina en un texto.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { submitApplication, TIEMPO_MAXIMO_ENVIO_MS } from '../applicationApi';
import * as Sentry from '@sentry/nextjs';
import {
  mensajeDelError,
  MENSAJE_ERROR_SERVIDOR,
  MENSAJE_ENVIO_SIN_CONFIRMAR,
  MENSAJE_ERROR_INESPERADO,
} from '../mensajeDelError';
import { AvisoV2 } from '../../components/diseno-2/AvisoV2';

jest.mock('@sentry/nextjs', () => ({ captureMessage: jest.fn(), captureException: jest.fn() }));

const respuesta = (status: number, body: unknown) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});
const html = (status: number) => ({
  ok: false,
  status,
  json: async () => {
    throw new SyntaxError('Unexpected token <');
  },
});
const request = { session_uuid: 's-1', form_data: {}, product_data: {} } as unknown as Parameters<typeof submitApplication>[0];

describe('mensajeDelError', () => {
  it('422 con lista: el primer mensaje, legible', () => {
    expect(mensajeDelError(422, [{ campo: 'body -> form_data', mensaje: 'Campo requerido' }])).toBe('Revisa tus datos: Campo requerido');
  });
  it('422 con objeto (titular menor): su message', () => {
    expect(mensajeDelError(422, { code: 'TITULAR_MENOR', message: 'El titular es menor de edad' })).toBe('El titular es menor de edad');
  });
  it('500: nunca el texto técnico del servidor', () => {
    expect(mensajeDelError(500, 'Internal Server Error')).toBe(MENSAJE_ERROR_SERVIDOR);
  });
  it('409 y 400 con texto: el texto', () => {
    expect(mensajeDelError(409, 'Ya existe una solicitud en curso')).toBe('Ya existe una solicitud en curso');
  });
  it('sin nada usable: genérico', () => {
    expect(typeof mensajeDelError(400, {})).toBe('string');
  });
});

describe('submitApplication: errores que antes rompían la pantalla', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it.each([
    ['422 lista', respuesta(422, { detail: [{ campo: 'x', mensaje: 'Campo requerido' }], message: 'Error de validación' }), 'Revisa tus datos: Campo requerido'],
    ['422 objeto', respuesta(422, { detail: { code: 'TITULAR_MENOR', message: 'Titular menor' } }), 'Titular menor'],
    ['409', respuesta(409, { detail: 'Solicitud duplicada' }), 'Solicitud duplicada'],
    ['500 JSON', respuesta(500, { detail: 'Internal Server Error' }), MENSAJE_ERROR_SERVIDOR],
    ['502 HTML (balanceador)', html(502), MENSAJE_ENVIO_SIN_CONFIRMAR],
    ['504 HTML (balanceador)', html(504), MENSAJE_ENVIO_SIN_CONFIRMAR],
  ])('%s → error en texto', async (_n, r, esperado) => {
    (global.fetch as jest.Mock).mockResolvedValue(r);
    const res = await submitApplication(request);
    expect(res.success).toBe(false);
    expect(typeof res.error).toBe('string');
    expect(res.error).toBe(esperado);
  });

  // BAL-4969, prod 23-10-2026: ws2 tardó ~4 min, el balanceador cortó sin
  // CORS y el navegador vio `TypeError: Failed to fetch`. La solicitud sí se
  // creó. "Error de conexión, intenta nuevamente" llevó a un duplicado.
  it('sin respuesta (Failed to fetch) → envío sin confirmar, no "intenta nuevamente", y a Sentry', async () => {
    const corte = new TypeError('Failed to fetch');
    (global.fetch as jest.Mock).mockRejectedValue(corte);
    const res = await submitApplication(request);
    expect(res.success).toBe(false);
    expect(res.error_code).toBe('ENVIO_SIN_CONFIRMAR');
    expect(res.error).toBe(MENSAJE_ENVIO_SIN_CONFIRMAR);
    expect(res.error).not.toContain('Error de conexión');
    expect(Sentry.captureException).toHaveBeenCalledWith(corte, expect.anything());
  });

  it('una excepción del código al armar el envío → mensaje genérico, no "conexión"', async () => {
    const rota = { ...request, files: [{ fieldCode: 'dni', file: null }] } as unknown as Parameters<typeof submitApplication>[0];
    const res = await submitApplication(rota);
    expect(res.success).toBe(false);
    expect(res.error).toBe(MENSAJE_ERROR_INESPERADO);
    expect(Sentry.captureException).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('conexión colgada → se corta al tiempo máximo con un texto', async () => {
    jest.useFakeTimers();
    try {
      (global.fetch as jest.Mock).mockImplementation(
        (_u: string, init: { signal: AbortSignal }) =>
          new Promise((_r, rechazar) => {
            init.signal.addEventListener('abort', () => rechazar(Object.assign(new Error('abort'), { name: 'AbortError' })));
          }),
      );
      const promesa = submitApplication(request);
      jest.advanceTimersByTime(TIEMPO_MAXIMO_ENVIO_MS + 1);
      const res = await promesa;
      expect(res.error).toBe(MENSAJE_ENVIO_SIN_CONFIRMAR);
      expect(res.error_code).toBe('ENVIO_SIN_CONFIRMAR');
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('AvisoV2 no se cae con algo que no es texto', () => {
  it('un objeto como mensaje se pinta como texto genérico', () => {
    const objeto = [{ campo: 'x', mensaje: 'y' }] as unknown as string;
    render(<AvisoV2 message={objeto} isVisible onClose={() => {}} duration={0} />);
    expect(screen.getByRole('status')).toHaveTextContent('No pudimos completar la acción');
  });
});
