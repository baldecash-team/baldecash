/// <reference types="jest" />
/**
 * Config que no se pudo leer ≠ config por defecto.
 *
 * Cuando `getSolicitarConfig` falla con 403 (landing con gate y token perdido),
 * el hook sustituía la config por `DEFAULT_SOLICITAR_FLOW`. Ese default afirma
 * `accessories` e `insurance` y omite `kyc`, o sea le inventa a la landing
 * justo lo contrario de lo que tiene configurado Family Farms: el wizard se iba
 * a /complementos, esa página no encontraba secciones y rebotaba a la
 * confirmación sin `code` — la pantalla de demostración — sin haber creado la
 * solicitud.
 *
 * Ahora la config queda VACÍA y `configLoadFailed` lo dice, que es la única
 * forma de que quien decide (submit, complementos, gate de KYC) sepa que "no
 * hay sección X" significa "no sé", no "no la tiene".
 */
import { renderHook, waitFor } from '@testing-library/react';

jest.mock('../../context/PreviewContext', () => ({
  usePreview: () => ({ isHydrated: true, isPreviewMode: false, previewKey: null }),
}));

import { useSolicitarFlow } from '../useSolicitarFlow';
import { SolicitarConfigUnavailableError, DEFAULT_SOLICITAR_FLOW } from '../../services/landingApi';

jest.mock('../../services/landingApi', () => {
  const real = jest.requireActual('../../services/landingApi');
  return { ...real, getSolicitarConfig: jest.fn() };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getSolicitarConfig } = require('../../services/landingApi') as {
  getSolicitarConfig: jest.Mock;
};

const FF_CONFIG = {
  sections: [
    { type: 'accessories', enabled: false, order: 1 },
    { type: 'wizard_steps', enabled: true, order: 2 },
    { type: 'insurance', enabled: false, order: 3 },
    { type: 'kyc', enabled: true, order: 5, steps: [{ type: 'dni_selfie', enabled: true, order: 1 }] },
  ],
  is_coupon_required: false,
};

describe('useSolicitarFlow — la config no se pudo leer', () => {
  beforeEach(() => jest.clearAllMocks());

  it('no la reemplaza por el default y lo marca en configLoadFailed', async () => {
    getSolicitarConfig.mockRejectedValue(new SolicitarConfigUnavailableError('family-farms-baldecash-b'));

    const { result } = renderHook(() => useSolicitarFlow({ slug: 'family-farms-baldecash-b' }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.configLoadFailed).toBe(true);
    expect(result.current.config).not.toEqual(DEFAULT_SOLICITAR_FLOW);
    expect(result.current.config.sections).toHaveLength(0);
    // Lo que el default afirmaba y esta landing no tiene:
    expect(result.current.shouldShowComplementos).toBe(false);
  });

  it('con la config cargada, configLoadFailed queda en false', async () => {
    getSolicitarConfig.mockResolvedValue(FF_CONFIG);

    const { result } = renderHook(() => useSolicitarFlow({ slug: 'family-farms-baldecash-b' }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.configLoadFailed).toBe(false);
    expect(result.current.kycEnabled).toBe(true);
    expect(result.current.shouldShowComplementos).toBe(false);
  });
});
