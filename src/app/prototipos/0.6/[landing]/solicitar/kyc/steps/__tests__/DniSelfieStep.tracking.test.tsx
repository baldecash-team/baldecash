/// <reference types="jest" />
/**
 * Regresión: `DniSelfieStep` tiene 10 call sites de `tracker.track('kyc_*',
 * ...)` — es el archivo más expuesto a que un refactor futuro vuelva a
 * perder `application_code` de alguno de ellos. Este test cubre al menos uno
 * (el que dispara solo, sin interacción: jsdom no tiene `getUserMedia`, así
 * que la apertura de cámara al montar falla y dispara `kyc_camera_denied`).
 */
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockTrack = jest.fn();

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: mockTrack, flush: jest.fn() }),
}));

import { DniSelfieStep } from '../DniSelfieStep';

describe('DniSelfieStep — application_code en el tracking', () => {
  beforeEach(() => jest.clearAllMocks());

  it('kyc_camera_denied lleva application_code', async () => {
    render(<DniSelfieStep onDone={jest.fn()} applicationCode="APP-99" />);

    await waitFor(() => expect(mockTrack).toHaveBeenCalledWith(
      'kyc_camera_denied',
      expect.objectContaining({ application_code: 'APP-99' }),
    ));
  });
});
