/// <reference types="jest" />
/**
 * Regresión: los eventos `kyc_*` que emiten los sub-pasos deben llevar
 * `application_code` en `properties` — sin eso el panel de admin2 los
 * pierde (filtra por ese campo en SQL), igual que pasaba con los del
 * orquestador (`kycClient.tsx`) antes del fix. Diferenciante: si alguien
 * saca `application_code` de las `properties`, este test falla.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

const mockTrack = jest.fn();

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: mockTrack, flush: jest.fn() }),
}));

// El paso ahora pide el contrato de la solicitud al montar: sin documento no
// hay checkbox que aceptar, así que el caso de aceptación necesita uno emitido.
jest.mock('@/app/prototipos/0.6/services/kycApi', () => {
  const actual = jest.requireActual('@/app/prototipos/0.6/services/kycApi');
  return { ...actual, getContrato: jest.fn() };
});

import { ContratoStep } from '../ContratoStep';
import { getContrato } from '@/app/prototipos/0.6/services/kycApi';

const mockGetContrato = getContrato as jest.MockedFunction<typeof getContrato>;

describe('ContratoStep — application_code en el tracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetContrato.mockResolvedValue({ disponible: true, html: '<p>Contrato</p>' });
  });

  it('kyc_contract_view lleva application_code al montar', async () => {
    render(<ContratoStep onDone={jest.fn()} applicationCode="APP-77" />);

    expect(mockTrack).toHaveBeenCalledWith(
      'kyc_contract_view',
      expect.objectContaining({ application_code: 'APP-77' }),
    );
    // El fetch del contrato resuelve después del assert; esperarlo evita el
    // warning de act() por el setState fuera del render.
    await waitFor(() => expect(screen.getByTestId('contrato-documento')).toBeInTheDocument());
  });

  it('kyc_contract_accepted lleva application_code al aceptar', async () => {
    const user = userEvent.setup();
    render(<ContratoStep onDone={jest.fn()} applicationCode="APP-77" />);

    await waitFor(() => expect(screen.getByTestId('contrato-documento')).toBeInTheDocument());
    await user.click(screen.getByText('He leído y acepto el contrato'));

    expect(mockTrack).toHaveBeenCalledWith(
      'kyc_contract_accepted',
      expect.objectContaining({ application_code: 'APP-77' }),
    );
  });
});
