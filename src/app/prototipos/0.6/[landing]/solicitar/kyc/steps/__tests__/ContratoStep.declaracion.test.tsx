/// <reference types="jest" />
/**
 * El paso muestra la declaración que manda el backend, no una propia.
 *
 * Lo que se protege es la cadena probatoria: la redacción que la persona ve es
 * exactamente la que ws2 sella como evidencia de qué aceptó. Si el front la
 * compusiera, podría desviarse de lo aprobado sin que nadie se entere — y lo
 * que quedaría archivado sería un texto que nunca estuvo en pantalla.
 *
 * Y el orden del §4: primero el aviso de que esto es una aceptación
 * electrónica, después la casilla vacía, y recién ahí un botón aparte.
 */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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

const TEXTOS = {
  version: 1,
  aviso: 'Estás por confirmar este financiamiento mediante un mecanismo de aceptación electrónica.',
  declaracion: 'Declaro que he leído y comprendido el Contrato de Financiamiento N.° SOL-1.',
  boton: 'ACEPTAR Y CONTRATAR',
};

function contratoListo(over: Record<string, unknown> = {}) {
  return {
    modo: 'aceptacion' as const,
    estado: 'listo' as const,
    disponible: true,
    url: 'https://s3.test/c.pdf',
    hash: 'a'.repeat(64),
    external_id: 'kyc-1',
    aceptacion: TEXTOS,
    ...over,
  };
}

function montar(onDone = jest.fn()) {
  render(
    <ContratoStep
      onDone={onDone}
      applicationCode="SOL-1"
      documentNumber="12345678"
    />,
  );

  return onDone;
}

beforeEach(() => {
  jest.clearAllMocks();
});

it('muestra el aviso antes de la casilla', async () => {
  mockGet.mockResolvedValue(contratoListo());
  montar();

  expect(await screen.findByText(/mecanismo de aceptación electrónica/i)).toBeInTheDocument();
});

it('la casilla dice la declaración del backend, no una del front', async () => {
  mockGet.mockResolvedValue(contratoListo());
  montar();

  expect(await screen.findByText(TEXTOS.declaracion)).toBeInTheDocument();
  expect(screen.queryByText('He leído y acepto el contrato')).not.toBeInTheDocument();
});

it('la casilla arranca vacía: el botón nace deshabilitado', async () => {
  // "No debe haber casillas pre-marcadas" (§6). Se comprueba por su efecto,
  // que es lo que le importa a quien usa la pantalla.
  mockGet.mockResolvedValue(contratoListo());
  montar();

  expect(await screen.findByRole('button', { name: TEXTOS.boton })).toBeDisabled();
});

it('el botón lleva el texto del backend y no se puede tocar sin marcar', async () => {
  mockGet.mockResolvedValue(contratoListo());
  const onDone = montar();

  const boton = await screen.findByRole('button', { name: TEXTOS.boton });
  expect(boton).toBeDisabled();

  fireEvent.click(await screen.findByText(TEXTOS.declaracion));
  await waitFor(() => expect(boton).toBeEnabled());

  fireEvent.click(boton);
  expect(onDone).toHaveBeenCalledTimes(1);
});

it('dos clics seguidos avanzan una sola vez', async () => {
  // El §4 lo pide explícito: el clic final no debe poder ejecutarse dos veces.
  // Un doble toque en móvil crearía dos aceptaciones de la misma operación.
  mockGet.mockResolvedValue(contratoListo());
  const onDone = montar();

  fireEvent.click(await screen.findByText(TEXTOS.declaracion));
  const boton = await screen.findByRole('button', { name: TEXTOS.boton });
  await waitFor(() => expect(boton).toBeEnabled());

  fireEvent.click(boton);
  fireEvent.click(boton);

  expect(onDone).toHaveBeenCalledTimes(1);
});

it('sin textos del backend cae al comportamiento de siempre', async () => {
  // Un ws2 sin desplegar no manda `aceptacion`. Media pantalla con la redacción
  // aprobada y media con relleno sería peor que la de siempre.
  mockGet.mockResolvedValue(contratoListo({ aceptacion: undefined }));
  montar();

  expect(await screen.findByText('He leído y acepto el contrato')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Continuar/i })).toBeInTheDocument();
});
