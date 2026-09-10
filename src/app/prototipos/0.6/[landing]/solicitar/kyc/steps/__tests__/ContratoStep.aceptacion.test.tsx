/// <reference types="jest" />
/**
 * El paso de firma con la firma por aceptación prendida.
 *
 * La regla que fija este archivo: con `modo: aceptacion` NO se puede continuar
 * sin haber visto y aceptado el documento. Antes se podía —el contrato no
 * existía hasta después de aprobar—, y así se terminaba el KYC sin haber leído
 * el contrato.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

const mockGet = getContrato as jest.MockedFunction<typeof getContrato>;

const LISTO = {
  modo: 'aceptacion' as const, estado: 'listo' as const, disponible: true,
  url: 'https://s3/contrato.pdf', hash: 'a'.repeat(64), external_id: 'kyc-1',
};

const pintar = (props: Record<string, unknown> = {}) =>
  render(
    <ContratoStep
      onDone={jest.fn()}
      applicationCode="APP-77"
      documentNumber="70020010"
      {...props}
    />,
  );

beforeEach(() => jest.clearAllMocks());

it('mientras se genera no ofrece aceptar ni deja continuar', async () => {
  mockGet.mockResolvedValue({ modo: 'aceptacion', estado: 'generando', disponible: false });

  pintar();

  await waitFor(() => expect(screen.getByTestId('contrato-esperando')).toBeInTheDocument());
  expect(screen.queryByText('He leído y acepto el contrato')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
});

it('con el documento listo pide aceptarlo antes de continuar', async () => {
  mockGet.mockResolvedValue(LISTO);
  const onDone = jest.fn();

  pintar({ onDone });

  await waitFor(() => expect(screen.getByTestId('contrato-documento')).toBeInTheDocument());
  const continuar = screen.getByRole('button', { name: 'Continuar' });

  // El botón se puede tocar sin marcar nada: el click es el que señala qué
  // falta. Deshabilitado, la casilla sin marcar no se distingue de una pantalla
  // que todavía está cargando.
  expect(continuar).toBeEnabled();
  await userEvent.click(continuar);
  expect(onDone).not.toHaveBeenCalled();
  expect(
    screen.getByText('Necesitamos que aceptes el contrato para continuar'),
  ).toBeInTheDocument();

  await userEvent.click(screen.getByText('He leído y acepto el contrato'));

  // El aviso se va solo al marcar: sale del estado, no de un flag aparte.
  expect(
    screen.queryByText('Necesitamos que aceptes el contrato para continuar'),
  ).not.toBeInTheDocument();
  await userEvent.click(continuar);
  expect(onDone).toHaveBeenCalledWith({ contractHash: 'a'.repeat(64), externalId: 'kyc-1' });
});

it('el error ofrece reintentar', async () => {
  mockGet.mockResolvedValue({ modo: 'aceptacion', estado: 'error', disponible: false });

  pintar();

  await waitFor(() => expect(screen.getByTestId('contrato-error')).toBeInTheDocument());
  mockGet.mockResolvedValue(LISTO);
  await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

  await waitFor(() => expect(screen.getByTestId('contrato-documento')).toBeInTheDocument());
});

it('si la solicitud no quedó registrada lo dice, y no ofrece reintentar', async () => {
  // Llegar acá implica que el submit resolvió OK (el wizard hace `await` y solo
  // navega con `result.success`), así que esto es el alta en legacy fallando
  // sola dentro de ese submit. Reintentar no lo arregla.
  mockGet.mockResolvedValue({
    modo: 'aceptacion', estado: 'error', motivo: 'sin_registro', disponible: false,
  });

  pintar();

  await waitFor(() => expect(screen.getByTestId('contrato-sin-registro')).toBeInTheDocument());
  expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
});

it('el link a pestaña nueva emite su evento', async () => {
  mockGet.mockResolvedValue(LISTO);
  const onTrack = jest.fn();

  pintar({ onTrack });

  await waitFor(() => expect(screen.getByTestId('contrato-documento')).toBeInTheDocument());
  await userEvent.click(screen.getByText('Abrir en pestaña nueva'));

  expect(onTrack).toHaveBeenCalledWith('kyc_contract_opened_external', expect.anything());
});

it('la firma emitida lleva el hash de lo aceptado', async () => {
  mockGet.mockResolvedValue(LISTO);
  const onTrack = jest.fn();

  pintar({ onTrack });

  await waitFor(() => expect(screen.getByTestId('contrato-documento')).toBeInTheDocument());
  await userEvent.click(screen.getByText('He leído y acepto el contrato'));
  await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));

  expect(onTrack).toHaveBeenCalledWith(
    'kyc_contract_signed',
    expect.objectContaining({ contract_hash: 'a'.repeat(64), external_id: 'kyc-1' }),
  );
});
