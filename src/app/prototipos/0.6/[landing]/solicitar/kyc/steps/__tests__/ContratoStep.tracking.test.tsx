/// <reference types="jest" />
/**
 * Regresión: los eventos `kyc_*` que emiten los sub-pasos deben llevar
 * `application_code` en `properties` — sin eso el panel de admin2 los
 * pierde (filtra por ese campo en SQL), igual que pasaba con los del
 * orquestador (`kycClient.tsx`) antes del fix. Diferenciante: si alguien
 * saca `application_code` de las `properties`, este test falla.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

const mockTrack = jest.fn();

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: mockTrack, flush: jest.fn() }),
}));

import { ContratoStep } from '../ContratoStep';

describe('ContratoStep — application_code en el tracking', () => {
  beforeEach(() => jest.clearAllMocks());

  it('kyc_contract_view lleva application_code al montar', () => {
    render(<ContratoStep onDone={jest.fn()} applicationCode="APP-77" />);

    expect(mockTrack).toHaveBeenCalledWith(
      'kyc_contract_view',
      expect.objectContaining({ application_code: 'APP-77' }),
    );
  });

  it('kyc_contract_accepted lleva application_code al aceptar', async () => {
    const user = userEvent.setup();
    render(<ContratoStep onDone={jest.fn()} applicationCode="APP-77" />);

    await user.click(screen.getByText('He leído y acepto el contrato'));

    expect(mockTrack).toHaveBeenCalledWith(
      'kyc_contract_accepted',
      expect.objectContaining({ application_code: 'APP-77' }),
    );
  });
});
