/**
 * BAL-3952 — posición del banner: arriba o abajo de "Encuentra tu equipo ideal".
 *
 * Dos cosas que es fácil romper:
 *  - el default: las landings ya publicadas tienen el banner ARRIBA y no
 *    deben moverse solas porque se despliegue este cambio;
 *  - la regla de móvil: con el banner arriba el encabezado se oculta, pero
 *    con el banner ABAJO tiene que verse -sin el texto delante, "abajo de"
 *    no tendría referencia-.
 */
import { render, screen } from '@testing-library/react';
import { CatalogLayoutV4 } from '../CatalogLayoutV4';
import { CatalogLayoutProps, defaultFilterState, defaultCatalogConfig } from '../../../../types/catalog';

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

function renderLayout(catalogBanner: Record<string, unknown>) {
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
    filtroPorUso: true,
    barraDeOrden: true,
    // Cadena vacía: la config del countdown ya cargó y no hay countdown.
    vipCountdownDate: '',
  };
  return render(<CatalogLayoutV4 {...props} />);
}

/** Posición real en el DOM, que es lo que ve el usuario. */
function bannerVaAntesDelTitulo() {
  const banner = screen.getByTestId('catalog-banner-link');
  const titulo = screen.getByText(TITULO_USO);
  // DOCUMENT_POSITION_FOLLOWING: el título viene DESPUÉS del banner.
  return Boolean(
    banner.compareDocumentPosition(titulo) & Node.DOCUMENT_POSITION_FOLLOWING
  );
}

/**
 * El encabezado se oculta en móvil con `hidden sm:flex`. Esa clase va en el
 * contenedor del bloque -icono + textos-, que está unos niveles por encima
 * del título: se busca hacia arriba en vez de asumir cuál es.
 */
function encabezadoOcultoEnMovil() {
  return Boolean(screen.getByText(TITULO_USO).closest('.hidden'));
}

describe('BAL-3952 — posición del banner', () => {
  it('sin el campo: va ARRIBA, como han estado siempre las landings publicadas', () => {
    renderLayout(TIRA);

    expect(bannerVaAntesDelTitulo()).toBe(true);
  });

  it('strip_position=arriba: va arriba', () => {
    renderLayout({ ...TIRA, strip_position: 'arriba' });

    expect(bannerVaAntesDelTitulo()).toBe(true);
  });

  it('strip_position=abajo: va DESPUÉS del título', () => {
    renderLayout({ ...TIRA, strip_position: 'abajo' });

    expect(bannerVaAntesDelTitulo()).toBe(false);
  });

  it('arriba: el encabezado se oculta en móvil, como hasta ahora', () => {
    renderLayout(TIRA);

    expect(encabezadoOcultoEnMovil()).toBe(true);
  });

  it('abajo: el encabezado SE VE en móvil -si no, el banner no tendría referencia-', () => {
    renderLayout({ ...TIRA, strip_position: 'abajo' });

    expect(encabezadoOcultoEnMovil()).toBe(false);
  });

  it('un valor desconocido cae a arriba, no deja el banner sin pintar', () => {
    renderLayout({ ...TIRA, strip_position: 'cualquier-cosa' });

    expect(screen.getByTestId('catalog-banner-link')).toBeInTheDocument();
    expect(bannerVaAntesDelTitulo()).toBe(true);
  });

  it('el banner se pinta UNA sola vez, no en las dos posiciones', () => {
    renderLayout({ ...TIRA, strip_position: 'abajo' });

    expect(screen.getAllByTestId('catalog-banner-link')).toHaveLength(1);
  });
});

/**
 * Abajo, la tira terminaba PEGADA a la primera card de producto: el bloque
 * que la seguía cuando iba arriba traía su propio margen superior, y en esta
 * posición no había nada que los separase. Medido en pantalla: 0px.
 */
describe('BAL-3952 — separación del banner cuando va abajo', () => {
  const contenedorDelBanner = () =>
    screen.getByTestId('catalog-banner-link').parentElement!;

  it('abajo: lleva margen inferior, no queda pegado a la grilla', () => {
    renderLayout({ ...TIRA, strip_position: 'abajo' });

    expect(contenedorDelBanner().className).toMatch(/\bmb-4\b/);
  });

  it('arriba: sin margen extra -ahí el espaciado ya lo pone el bloque siguiente-', () => {
    renderLayout(TIRA);

    expect(contenedorDelBanner().className).not.toMatch(/\bmb-4\b/);
  });
});
