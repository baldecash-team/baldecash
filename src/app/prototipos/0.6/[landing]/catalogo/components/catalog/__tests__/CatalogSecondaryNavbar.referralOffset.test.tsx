import { topDeLaBarra } from '../CatalogSecondaryNavbar';

/**
 * La barra secundaria es `fixed` y se cuelga del header principal. Entre los dos
 * puede aparecer la franja de referido, que se pega debajo del header y publica
 * su alto en `--referral-banner-offset`; si la barra no suma lo mismo le pasa
 * por encima (ver `components/referral/ReferralBanner`).
 *
 * Se prueba el helper y no el DOM: jsdom descarta `var()`/`calc()` en `style.top`.
 */
describe('CatalogSecondaryNavbar — topDeLaBarra', () => {
  it('suma la franja de referido al alto del header', () => {
    expect(topDeLaBarra(false)).toBe(
      'calc(var(--header-total-height, 6.5rem) + var(--referral-banner-offset, 0px))',
    );
  });

  it('con hidePromoBanner descuenta el promo y sigue sumando la franja', () => {
    expect(topDeLaBarra(true)).toBe(
      'calc(var(--header-total-height, 6.5rem) - var(--promo-banner-height, 0px) + var(--referral-banner-offset, 0px))',
    );
  });
});
