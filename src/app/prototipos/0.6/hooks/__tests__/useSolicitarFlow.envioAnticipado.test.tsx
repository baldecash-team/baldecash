/// <reference types="jest" />
/**
 * En qué pantalla del wizard se crea la solicitud.
 *
 * Lo que se protege: que ninguna landing lo tenga prendido sin haberlo pedido.
 * Prendido, el wizard termina en esa pantalla y crea una solicitud de verdad;
 * apagado —el default y el caso de todas las landings de hoy— el submit sigue
 * al final, como siempre.
 */
import { renderHook, waitFor } from '@testing-library/react';

jest.mock('../../context/PreviewContext', () => ({
  usePreview: () => ({ isHydrated: true, isPreviewMode: false, previewKey: null }),
}));

import { useSolicitarFlow } from '../useSolicitarFlow';

jest.mock('../../services/landingApi', () => {
  const real = jest.requireActual('../../services/landingApi');
  return { ...real, getSolicitarConfig: jest.fn() };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getSolicitarConfig } = require('../../services/landingApi') as {
  getSolicitarConfig: jest.Mock;
};

const config = (envio?: unknown) => ({
  sections: [
    { type: 'wizard_steps', enabled: true, order: 1, envio_anticipado: envio },
    { type: 'kyc', enabled: true, order: 2, steps: [{ type: 'contract', enabled: true, order: 1 }] },
  ],
  is_coupon_required: false,
});

async function leer(envio?: unknown) {
  getSolicitarConfig.mockResolvedValue(config(envio));
  const { result } = renderHook(() => useSolicitarFlow({ slug: 'renueva-tu-equipo-1' }));
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  return result;
}

describe('useSolicitarFlow — envío anticipado', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sin el bloque no hay envío anticipado', async () => {
    expect((await leer()).current.envioAnticipadoStep).toBeNull();
  });

  it('apagado tampoco', async () => {
    expect((await leer({ enabled: false, step: 2 })).current.envioAnticipadoStep).toBeNull();
  });

  it('prendido devuelve la pantalla configurada', async () => {
    expect((await leer({ enabled: true, step: 2 })).current.envioAnticipadoStep).toBe(2);
  });

  it('la config que no se pudo leer no lo prende', async () => {
    // Config vacía: no sabemos qué tiene la landing. Crear una solicitud a
    // mitad del wizard por no saber es lo peor que puede pasar acá.
    getSolicitarConfig.mockRejectedValue(new Error('403'));
    const { result } = renderHook(() => useSolicitarFlow({ slug: 'x' }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.envioAnticipadoStep).toBeNull();
  });
});
