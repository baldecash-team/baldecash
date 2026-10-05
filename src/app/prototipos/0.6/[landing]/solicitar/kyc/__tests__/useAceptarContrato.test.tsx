/// <reference types="jest" />
/**
 * Aceptar el contrato: la regla del 409, en un solo lugar.
 *
 * Lo que se protege: que una aceptación que el backend rechazó por vieja NO
 * avance. Si avanzara, quedaría registrada una firma sobre un documento que ya
 * no es el vigente — y eso es exactamente lo que el hash viene a impedir.
 */
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';

jest.mock('@/app/prototipos/0.6/services/kycApi', () => ({
  completeKycStep: jest.fn(),
}));

import { completeKycStep } from '@/app/prototipos/0.6/services/kycApi';
import { useAceptarContrato } from '../useAceptarContrato';
import type { ContratoStepHandle } from '../steps/ContratoStep';

const mockCompletar = completeKycStep as jest.Mock;

beforeEach(() => jest.clearAllMocks());

function montar(onAceptado = jest.fn(), extra: Record<string, unknown> = {}) {
  const { result } = renderHook(() =>
    useAceptarContrato({
      applicationCode: 'APP-1',
      documentNumber: '76826846',
      onAceptado,
      ...extra,
    }),
  );
  return { result, onAceptado };
}

it('registra la aceptación con el hash de lo que se mostró', async () => {
  mockCompletar.mockResolvedValue({ state: { link_pago: null }, outdated: false });
  const { result, onAceptado } = montar();

  act(() => result.current.aceptar({ contractHash: 'abc' }));

  await waitFor(() => expect(onAceptado).toHaveBeenCalled());
  expect(mockCompletar).toHaveBeenCalledWith(
    expect.objectContaining({
      applicationCode: 'APP-1',
      stepType: 'contract',
      contractHash: 'abc',
      documentNumber: '76826846',
    }),
  );
});

it('un 409 NO avanza: reabre el paso con el documento nuevo', async () => {
  mockCompletar.mockResolvedValue({ state: null, outdated: true });
  const marcarVencido = jest.fn();
  const ref = { current: { marcarVencido } as ContratoStepHandle };
  const onAceptado = jest.fn();
  const { result } = renderHook(() =>
    useAceptarContrato({
      applicationCode: 'APP-1', documentNumber: '7', onAceptado, ref,
    }),
  );

  act(() => result.current.aceptar({ contractHash: 'viejo' }));

  await waitFor(() => expect(marcarVencido).toHaveBeenCalled());
  expect(onAceptado).not.toHaveBeenCalled();
});

it('con token no manda el DNI: el token ya prueba titularidad', async () => {
  mockCompletar.mockResolvedValue({ state: null, outdated: false });
  const { result } = montar(jest.fn(), { resumeToken: 'tok' });

  act(() => result.current.aceptar({ contractHash: 'abc' }));

  await waitFor(() => expect(mockCompletar).toHaveBeenCalled());
  expect(mockCompletar.mock.calls[0][0]).toMatchObject({
    resumeToken: 'tok',
    documentNumber: undefined,
  });
});

it('sin hash no hay nada que sellar y el flujo sigue', () => {
  const { result, onAceptado } = montar();

  act(() => result.current.aceptar({}));

  expect(mockCompletar).not.toHaveBeenCalled();
  expect(onAceptado).toHaveBeenCalledWith(null);
});
