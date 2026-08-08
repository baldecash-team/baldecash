/**
 * El paso de firma muestra el contrato de la solicitud.
 *
 * `disponible: false` no es un error: el contrato nace con la aprobación, así
 * que antes de eso su ausencia es el estado normal del flujo. Lo que NO puede
 * pasar es mostrar un documento genérico como si fuera el propio.
 */

interface RespuestaContrato {
  disponible: boolean;
  html?: string;
}

type Vista = 'documento' | 'esperando';

function vistaDelPaso(r: RespuestaContrato): Vista {
  return r.disponible && r.html ? 'documento' : 'esperando';
}

describe('qué se muestra en el paso de firma', () => {
  it('el contrato cuando está emitido', () => {
    expect(vistaDelPaso({ disponible: true, html: '<p>Contrato</p>' })).toBe('documento');
  });

  it('espera cuando todavía no se aprobó', () => {
    expect(vistaDelPaso({ disponible: false })).toBe('esperando');
  });

  it('un disponible sin html no pinta nada', () => {
    expect(vistaDelPaso({ disponible: true })).toBe('esperando');
  });
});

/**
 * Y lo mismo sobre el componente real: lo que importa es que nunca se muestre
 * un documento que no sea el de esta solicitud.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: jest.fn(), flush: jest.fn() }),
}));

jest.mock('@/app/prototipos/0.6/services/kycApi', () => {
  const actual = jest.requireActual('@/app/prototipos/0.6/services/kycApi');
  return { ...actual, getContrato: jest.fn() };
});

import { ContratoStep } from '../ContratoStep';
import { getContrato } from '@/app/prototipos/0.6/services/kycApi';

const mockGetContrato = getContrato as jest.MockedFunction<typeof getContrato>;

describe('el paso de firma sobre el componente', () => {
  beforeEach(() => jest.clearAllMocks());

  it('pinta el contrato emitido de la solicitud', async () => {
    mockGetContrato.mockResolvedValue({
      disponible: true, html: '<p>Contrato de Juana Pérez</p>',
    });

    render(<ContratoStep onDone={jest.fn()} applicationCode="APP-77" documentNumber="70020010" />);

    await waitFor(() => expect(screen.getByTestId('contrato-documento')).toBeInTheDocument());
    expect(screen.getByText(/Juana Pérez/)).toBeInTheDocument();
    expect(screen.getByText('He leído y acepto el contrato')).toBeInTheDocument();
  });

  it('sin contrato emitido espera, y no ofrece aceptar nada', async () => {
    mockGetContrato.mockResolvedValue({ disponible: false });

    render(<ContratoStep onDone={jest.fn()} applicationCode="APP-77" documentNumber="70020010" />);

    await waitFor(() => expect(screen.getByTestId('contrato-esperando')).toBeInTheDocument());
    expect(screen.queryByTestId('contrato-documento')).not.toBeInTheDocument();
    expect(screen.queryByText('He leído y acepto el contrato')).not.toBeInTheDocument();
  });

  it('un error de red tampoco cae a un documento ajeno', async () => {
    mockGetContrato.mockResolvedValue(null);

    render(<ContratoStep onDone={jest.fn()} applicationCode="APP-77" documentNumber="70020010" />);

    await waitFor(() => expect(screen.getByTestId('contrato-esperando')).toBeInTheDocument());
  });

  it('manda la prueba de titularidad que corresponde al flujo por link', async () => {
    mockGetContrato.mockResolvedValue({ disponible: false });

    render(<ContratoStep onDone={jest.fn()} applicationCode="APP-77" resumeToken="TOK" />);

    await waitFor(() => expect(mockGetContrato).toHaveBeenCalledWith(
      expect.objectContaining({ applicationCode: 'APP-77', resumeToken: 'TOK' }),
    ));
  });
});
