import { topDeLaBarra } from '../CatalogSecondaryNavbar';

/**
 * La barra secundaria es `fixed` y se cuelga del header principal. Mientras la
 * franja de referido está a la vista, el header arranca `--referral-banner-offset`
 * píxeles más abajo; si la barra no suma lo mismo queda debajo del navbar y éste
 * la tapa (ver `components/referral/ReferralBanner`).
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
