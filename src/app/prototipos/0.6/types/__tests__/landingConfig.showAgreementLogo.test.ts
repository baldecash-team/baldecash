import { DEFAULT_LANDING_CONFIG } from '../landingConfig';
import type { LandingConfigResponse } from '../landingConfig';
import { mergeLandingConfig } from '../../services/landingConfigApi';

/**
 * `layout.show_agreement_logo` apaga el logo de la institución en las landings
 * de convenio. El default es `true` a propósito: una landing sin el ingrediente
 * `agreement-logo-off` debe renderizar igual que antes de que el flag existiera
 * — es la condición de no-rotura para los convenios ya en producción (BAL-2970).
 */

// El endpoint devuelve el árbol parcial: solo los ingredientes que la landing
// tiene asignados. Por eso el parcial se arma como el JSON crudo del API.
function apiConfig(
  partial: Record<string, Record<string, unknown>>,
): LandingConfigResponse['config'] {
  return partial as LandingConfigResponse['config'];
}

describe('layout.show_agreement_logo', () => {
  it('por defecto es true (comportamiento actual: el logo se muestra)', () => {
    expect(DEFAULT_LANDING_CONFIG.layout.show_agreement_logo).toBe(true);
  });

  it('una landing sin el ingrediente conserva el default true', () => {
    const merged = mergeLandingConfig(apiConfig({ features: {} }));
    expect(merged.layout.show_agreement_logo).toBe(true);
  });

  it('una landing sin config alguna conserva el default true', () => {
    expect(mergeLandingConfig(null).layout.show_agreement_logo).toBe(true);
  });

  it('el ingrediente en false apaga el flag', () => {
    const merged = mergeLandingConfig(apiConfig({ layout: { show_agreement_logo: false } }));
    expect(merged.layout.show_agreement_logo).toBe(false);
  });

  it('no pisa has_catalog al mergear', () => {
    const merged = mergeLandingConfig(apiConfig({ layout: { show_agreement_logo: false } }));
    expect(merged.layout.has_catalog).toBe(true);
  });

  // `catalog-off` y `agreement-logo-off` son ingredientes independientes: una
  // landing puede tener los dos, y apagar uno no debe tocar al otro.
  it('convive con catalog-off sin interferir', () => {
    const merged = mergeLandingConfig(
      apiConfig({ layout: { has_catalog: false, show_agreement_logo: false } }),
    );
    expect(merged.layout.has_catalog).toBe(false);
    expect(merged.layout.show_agreement_logo).toBe(false);
  });
});
