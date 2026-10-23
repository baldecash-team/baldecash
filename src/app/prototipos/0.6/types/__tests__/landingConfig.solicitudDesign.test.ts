import { DEFAULT_LANDING_CONFIG } from '../landingConfig';
import type { LandingConfigResponse } from '../landingConfig';
import { mergeLandingConfig } from '../../services/landingConfigApi';

/**
 * `features.solicitud_design` (BAL-4958) reemplaza al ingrediente
 * `lo-quiero-modal-on`. El default es `1` -el diseño actual- a propósito: una
 * landing sin el preset `solicitud-design-v2` debe renderizar igual que
 * siempre.
 */

// El endpoint devuelve el árbol parcial: solo los ingredientes que la landing
// tiene asignados. Por eso el parcial se arma como el JSON crudo del API.
function apiConfig(
  partial: Record<string, Record<string, unknown>>,
): LandingConfigResponse['config'] {
  return partial as LandingConfigResponse['config'];
}

describe('features.solicitud_design', () => {
  it('por defecto es 1 (diseño actual)', () => {
    expect(DEFAULT_LANDING_CONFIG.features.solicitud_design).toBe(1);
  });

  it('una landing sin el preset conserva el default 1', () => {
    const merged = mergeLandingConfig(apiConfig({ layout: {} }));
    expect(merged.features.solicitud_design).toBe(1);
  });

  it('una landing sin config alguna conserva el default 1', () => {
    expect(mergeLandingConfig(null).features.solicitud_design).toBe(1);
  });

  it('el preset en 2 prende el diseño nuevo', () => {
    const merged = mergeLandingConfig(apiConfig({ features: { solicitud_design: 2 } }));
    expect(merged.features.solicitud_design).toBe(2);
  });
});
