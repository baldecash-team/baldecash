/**
 * Dónde va el bloque «¡Cupón aplicado!» del catálogo.
 *
 *  - Cupón de campaña: DEBAJO del banner principal, esté el banner arriba o
 *    abajo del encabezado.
 *  - Cupón de referido: arriba de todo, donde estuvo siempre.
 *  - Catálogo sin banner: arriba de todo (no hay «debajo de» posible).
 */
import { render, screen } from '@testing-library/react';
import { CatalogLayoutV4 } from '../CatalogLayoutV4';
import { CatalogLayoutProps, defaultFilterState, defaultCatalogConfig } from '../../../../types/catalog';
import type { AppliedCoupon } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';

jest.mock('@nextui-org/ripple', () => ({
  Ripple: () => null,
  useRipple: () => ({ ripples: [], onClear: jest.fn(), onPress: jest.fn() }),
}));

jest.mock('@/app/prototipos/0.6/analytics/useAnalytics', () => ({
  useAnalytics: () => ({
    trackBannerClick: jest.fn(),
    trackBannerHover: jest.fn(),
    flush: jest.fn(),
    trackEvent: jest.fn(),
    trackProductClick: jest.fn(),
    trackFilterChange: jest.fn(),
  }),
}));

const TITULO_USO = 'Encuentra tu equipo ideal';

const TIRA = {
  banner_type: 'tira_remate',
  strip_title: 'Gran remate',
  strip_price_text: 'Desde S/60 al mes',
  strip_cta_text: 'Ver ofertas',
  strip_cta_url: '/reacondicionados/catalogo',
};

const DE_CAMPANIA: AppliedCoupon = {
  code: 'CAMPAFIJO',
  discount: 10,
  label: 'Descuento de S/10',
  couponType: 'fixed',
  lockedFromUrl: true,
};

const DE_REFERIDO: AppliedCoupon = {
  code: 'REFCARLA',
  discount: 10,
  label: '10% de descuento en 1 cuotas',
  couponType: 'percent_quotas',
  quotasAffected: 1,
  referrerName: 'Carla Prueba',
  lockedFromUrl: true,
};

function renderLayout(catalogBanner: Record<string, unknown> | null, campaignCoupon: AppliedCoupon | null) {
  const props: CatalogLayoutProps = {
    products: [],
    filters: defaultFilterState,
    onFiltersChange: jest.fn(),
    sort: 'recommended',
    onSortChange: jest.fn(),
    config: defaultCatalogConfig,
    totalProducts: 0,
    catalogBanner: catalogBanner ?? undefined,
    catalogBannerId: catalogBanner ? 1755 : undefined,
    filtroPorUso: true,
    barraDeOrden: true,
    vipCountdownDate: '',
    campaignCoupon,
  };
  return render(<CatalogLayoutV4 {...props} />);
}

/** true si `a` está antes que `b` en el DOM, que es lo que ve el usuario. */
const vaAntes = (a: Element, b: Element) =>
  Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

const bloqueCupon = () => screen.getByRole('status');
const banner = () => screen.getByTestId('catalog-banner-link');
const titulo = () => screen.getByText(TITULO_USO);

describe('bloque de cupón de CAMPAÑA: debajo del banner principal', () => {
  it('banner arriba: banner → cupón → encabezado', () => {
    renderLayout(TIRA, DE_CAMPANIA);

    expect(vaAntes(banner(), bloqueCupon())).toBe(true);
    expect(vaAntes(bloqueCupon(), titulo())).toBe(true);
  });

  it('banner abajo: encabezado → banner → cupón', () => {
    renderLayout({ ...TIRA, strip_position: 'abajo' }, DE_CAMPANIA);

    expect(vaAntes(titulo(), banner())).toBe(true);
    expect(vaAntes(banner(), bloqueCupon())).toBe(true);
  });

  it('dice «¡Cupón aplicado!», el código y el alcance real', () => {
    renderLayout(TIRA, DE_CAMPANIA);

    expect(bloqueCupon()).toHaveTextContent('¡Cupón aplicado!');
    expect(bloqueCupon()).toHaveTextContent('CAMPAFIJO');
    expect(bloqueCupon()).toHaveTextContent('El descuento aplica en todas tus cuotas.');
  });

  it('se pinta una sola vez', () => {
    renderLayout({ ...TIRA, strip_position: 'abajo' }, DE_CAMPANIA);

    expect(screen.getAllByRole('status')).toHaveLength(1);
  });

  it('catálogo sin banner: va arriba de todo, antes del encabezado', () => {
    renderLayout(null, DE_CAMPANIA);

    expect(vaAntes(bloqueCupon(), titulo())).toBe(true);
  });
});

describe('banner de REFERIDO: igual que siempre', () => {
  it('va arriba de todo, ANTES del banner principal', () => {
    renderLayout(TIRA, DE_REFERIDO);

    expect(vaAntes(bloqueCupon(), banner())).toBe(true);
  });

  it('conserva su texto: «Eres referido de», el nombre y la frase de primera cuota', () => {
    renderLayout(TIRA, DE_REFERIDO);

    expect(bloqueCupon()).toHaveTextContent('Eres referido de');
    expect(bloqueCupon()).toHaveTextContent('Carla');
    expect(bloqueCupon()).toHaveTextContent('El descuento aplica solo en tu primera cuota.');
  });
});

describe('sin cupón', () => {
  it('no se pinta ningún bloque de cupón', () => {
    renderLayout(TIRA, null);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
