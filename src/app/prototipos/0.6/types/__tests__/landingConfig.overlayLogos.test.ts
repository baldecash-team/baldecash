import { OVERLAY_VARIANT_LOGOS } from '../landingConfig';

// El mapa ES el interruptor del logo: `LayoutContext` resuelve `logoUrl` con él y,
// cuando la variante no tiene entrada, cae al logo de la empresa. Por eso importa
// tanto lo que está como lo que no.
describe('OVERLAY_VARIANT_LOGOS', () => {
  it('sirve el logo de Family Farms para la variante familyfarm', () => {
    expect(OVERLAY_VARIANT_LOGOS.familyfarm).toBe(
      'https://baldecash.s3.amazonaws.com/company/logo-family-farms.webp',
    );
  });

  it('mantiene el logo de CADE', () => {
    expect(OVERLAY_VARIANT_LOGOS.cade).toBe(
      'https://baldecash.s3.amazonaws.com/company/logo-cade-2026.webp',
    );
  });

  // Sin entrada no hay override: la landing se queda con el logo de su empresa.
  it.each(['', 'zona-gamer', 'nvidia'])('no define logo para "%s"', (variant) => {
    expect(OVERLAY_VARIANT_LOGOS[variant]).toBeUndefined();
  });

  it('sirve los logos desde S3, nunca desde public/', () => {
    // Los assets de estas campañas viven en S3: servirlos desde `public/` ya rompió
    // el overlay de Family Farms en producción una vez (BAL-2598).
    Object.values(OVERLAY_VARIANT_LOGOS).forEach((url) => {
      expect(url).toMatch(/^https:\/\/baldecash\.s3\.amazonaws\.com\//);
    });
  });
});
