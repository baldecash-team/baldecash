/**
 * BAL-3941 — un banner sin enlace no debe medirse.
 *
 * `CatalogBanner` no envuelve en `<a>` el banner que no tiene destino: lo
 * pinta como `<div>` decorativo, porque no lleva a ninguna parte. Pero los
 * handlers de analítica viven en el contenedor de AFUERA, así que el clic y
 * el hover se registraban igual y contaban una visita que nunca ocurrió.
 *
 * No es un caso de laboratorio: los 12 banners de tipo imagen visibles en
 * producción tienen imagen y ninguno tiene `link_url` ni `desktop_link_url`.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { CatalogLayoutV4 } from '../CatalogLayoutV4';
import { CatalogLayoutProps, defaultFilterState, defaultCatalogConfig } from '../../../../types/catalog';

jest.mock('@nextui-org/ripple', () => ({
  Ripple: () => null,
  useRipple: () => ({ ripples: [], onClear: jest.fn(), onPress: jest.fn() }),
}));

const mockTrackBannerClick = jest.fn();
const mockTrackBannerHover = jest.fn();
const mockFlush = jest.fn();

jest.mock('@/app/prototipos/0.6/analytics/useAnalytics', () => ({
  useAnalytics: () => ({
    trackBannerClick: mockTrackBannerClick,
    trackBannerHover: mockTrackBannerHover,
    flush: mockFlush,
    trackEvent: jest.fn(),
    trackProductClick: jest.fn(),
    trackFilterChange: jest.fn(),
  }),
}));

const IMAGEN = 'https://baldecash.s3.amazonaws.com/landings/catalog-banners/148/banner-desktop.webp';

function renderConBanner(catalogBanner: Record<string, unknown>) {
  const props: CatalogLayoutProps = {
    products: [],
    filters: defaultFilterState,
    onFiltersChange: jest.fn(),
    sort: 'recommended',
    onSortChange: jest.fn(),
    config: defaultCatalogConfig,
    totalProducts: 0,
    catalogBanner,
    catalogBannerId: 1755,
    // `hayBanner` pide las dos cosas: que la config del countdown ya haya
    // cargado (`!== null`) y que no haya countdown (falsy). La cadena vacía
    // cumple ambas; `null` significaría "todavía cargando" y el banner no se
    // pintaría.
    vipCountdownDate: '',
  };
  return render(<CatalogLayoutV4 {...props} />);
}

/** El contenedor con los handlers es el padre del banner. */
function contenedorDelBanner() {
  const banner =
    screen.queryByTestId('catalog-banner') ?? screen.queryByTestId('catalog-banner-link');
  expect(banner).not.toBeNull();
  return banner!.parentElement!;
}

describe('BAL-3941 — el banner sin enlace no genera eventos', () => {
  beforeEach(() => {
    mockTrackBannerClick.mockClear();
    mockTrackBannerHover.mockClear();
    mockFlush.mockClear();
  });

  it('banner de imagen SIN enlace: el clic no se mide', () => {
    renderConBanner({ desktop_image_url: IMAGEN, alt_text: 'Promo' });

    fireEvent.click(contenedorDelBanner());

    expect(mockTrackBannerClick).not.toHaveBeenCalled();
  });

  it('banner de imagen SIN enlace: el hover no se mide', () => {
    renderConBanner({ desktop_image_url: IMAGEN, alt_text: 'Promo' });

    fireEvent.mouseEnter(contenedorDelBanner());

    expect(mockTrackBannerHover).not.toHaveBeenCalled();
  });

  it('tira de remate SIN enlace: tampoco se mide -el otro tipo tiene el mismo hueco-', () => {
    renderConBanner({ banner_type: 'tira_remate', strip_title: 'Gran remate' });

    const caja = contenedorDelBanner();
    fireEvent.click(caja);
    fireEvent.mouseEnter(caja);

    expect(mockTrackBannerClick).not.toHaveBeenCalled();
    expect(mockTrackBannerHover).not.toHaveBeenCalled();
  });

  // Control: el guard no puede haber apagado la medición cuando SÍ hay enlace.
  it('banner de imagen CON enlace: se mide con tipo, id y destino', () => {
    renderConBanner({
      desktop_image_url: IMAGEN,
      desktop_link_url: '/reacondicionados/catalogo',
    });

    fireEvent.click(contenedorDelBanner());

    expect(mockTrackBannerClick).toHaveBeenCalledWith({
      location: 'catalog_top',
      banner_id: '1755',
      variant: 'imagen',
      href: '/reacondicionados/catalogo',
    });
    // Navega fuera en la misma pestaña: sin flush el evento se pierde.
    expect(mockFlush).toHaveBeenCalled();
  });

  it('tira de remate CON enlace: se mide y distingue el tipo', () => {
    renderConBanner({
      banner_type: 'tira_remate',
      strip_title: 'Gran remate',
      strip_cta_url: '@reacondicionados/catalogo',
    });

    const caja = contenedorDelBanner();
    fireEvent.click(caja);
    fireEvent.mouseEnter(caja);

    expect(mockTrackBannerClick).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'tira_remate', href: '@reacondicionados/catalogo' })
    );
    expect(mockTrackBannerHover).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'tira_remate', banner_id: '1755' })
    );
  });
});
