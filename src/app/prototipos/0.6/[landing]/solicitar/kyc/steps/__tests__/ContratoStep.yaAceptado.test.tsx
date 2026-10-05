/// <reference types="jest" />
/**
 * Volver al paso del contrato con el contrato ya firmado.
 *
 * Pasa cuando la persona retrocede desde un sub-paso posterior (documentos,
 * pago). Antes la pantalla se comportaba como si nadie hubiera aceptado nada:
 * casilla en blanco, botón "ACEPTAR Y CONTRATAR" y una firma nueva por cada
 * Continuar. La regla que fija este archivo: con el contrato ya aceptado el
 * paso queda de lectura —el documento sigue a la vista— y el botón continúa
 * sin volver a pedir la aceptación; si el contrato quedó viejo, sí se vuelve a
 * pedir, porque lo que se aceptó dejó de existir.
 */
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: jest.fn(), flush: jest.fn() }),
}));

jest.mock('@/app/prototipos/0.6/services/kycApi', () => {
  const actual = jest.requireActual('@/app/prototipos/0.6/services/kycApi');
  return { ...actual, getContrato: jest.fn() };
});

import { ContratoStep, type ContratoStepHandle } from '../ContratoStep';
import { getContrato } from '@/app/prototipos/0.6/services/kycApi';

const mockGet = getContrato as jest.MockedFunction<typeof getContrato>;

const LISTO = {
  modo: 'aceptacion' as const, estado: 'listo' as const, disponible: true,
  url: 'https://s3/contrato.pdf', hash: 'b'.repeat(64), external_id: 'kyc-9',
};

beforeEach(() => jest.clearAllMocks());

it('con el contrato ya aceptado no vuelve a pedir la casilla y deja continuar', async () => {
  mockGet.mockResolvedValue(LISTO);
  const onDone = jest.fn();

  render(
    <ContratoStep
      onDone={onDone}
      applicationCode="APP-77"
      documentNumber="70020010"
      yaAceptado
    />,
  );

  await waitFor(() => expect(screen.getByTestId('contrato-documento')).toBeInTheDocument());

  expect(screen.getByTestId('contrato-ya-aceptado')).toBeInTheDocument();
  expect(screen.queryByTestId('contrato-casillas')).not.toBeInTheDocument();

  const boton = screen.getByRole('button', { name: 'Continuar' });
  expect(boton).toBeEnabled();

  await userEvent.click(boton);

  // El hash viaja igual: sellar la firma en el backend es idempotente y así un
  // contrato que cambió mientras tanto sigue devolviendo 409.
  expect(onDone).toHaveBeenCalledWith({
    contractHash: LISTO.hash,
    externalId: LISTO.external_id,
  });
});

it('si el contrato quedó viejo vuelve a pedir la aceptación', async () => {
  mockGet.mockResolvedValue(LISTO);
  const ref = React.createRef<ContratoStepHandle>();

  render(
    <ContratoStep
      ref={ref}
      onDone={jest.fn()}
      applicationCode="APP-77"
      documentNumber="70020010"
      yaAceptado
    />,
  );

  await waitFor(() => expect(screen.getByTestId('contrato-ya-aceptado')).toBeInTheDocument());

  act(() => ref.current?.marcarVencido());

  await waitFor(() => expect(screen.getByTestId('contrato-casillas')).toBeInTheDocument());
  expect(screen.queryByTestId('contrato-ya-aceptado')).not.toBeInTheDocument();
});

it('sin la marca se comporta como siempre: hay que aceptar', async () => {
  mockGet.mockResolvedValue(LISTO);

  render(
    <ContratoStep
      onDone={jest.fn()}
      applicationCode="APP-77"
      documentNumber="70020010"
    />,
  );

  await waitFor(() => expect(screen.getByTestId('contrato-casillas')).toBeInTheDocument());
  expect(screen.queryByTestId('contrato-ya-aceptado')).not.toBeInTheDocument();
});

// Gate G2: firmó → no vuelve. Ni el botón de este paso ni el indicador de
// pasos (bloqueado aparte, en StepClient) pueden llevar a un paso anterior.
describe('boton Atras con el contrato ya aceptado (gate G2)', () => {
  it('sin yaAceptado: el boton Atras se muestra si hay onBack', async () => {
    mockGet.mockResolvedValue(LISTO);

    render(
      <ContratoStep
        onDone={jest.fn()}
        onBack={jest.fn()}
        applicationCode="APP-77"
        documentNumber="70020010"
      />,
    );

    await waitFor(() => expect(screen.getByTestId('contrato-casillas')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Atrás' })).toBeInTheDocument();
  });

  it('con yaAceptado: no hay boton Atras, aunque venga onBack', async () => {
    mockGet.mockResolvedValue(LISTO);

    render(
      <ContratoStep
        onDone={jest.fn()}
        onBack={jest.fn()}
        applicationCode="APP-77"
        documentNumber="70020010"
        yaAceptado
      />,
    );

    await waitFor(() => expect(screen.getByTestId('contrato-ya-aceptado')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Atrás' })).not.toBeInTheDocument();
  });

  it('vencidoTrasAceptar reabre el paso: el boton Atras vuelve a aparecer', async () => {
    mockGet.mockResolvedValue(LISTO);
    const ref = React.createRef<ContratoStepHandle>();

    render(
      <ContratoStep
        ref={ref}
        onDone={jest.fn()}
        onBack={jest.fn()}
        applicationCode="APP-77"
        documentNumber="70020010"
        yaAceptado
      />,
    );

    await waitFor(() => expect(screen.getByTestId('contrato-ya-aceptado')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Atrás' })).not.toBeInTheDocument();

    act(() => ref.current?.marcarVencido());

    await waitFor(() => expect(screen.getByTestId('contrato-casillas')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Atrás' })).toBeInTheDocument();
  });
});
