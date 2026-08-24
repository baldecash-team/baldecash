/**
 * @jest-environment node
 *
 * La ruta gemela no puede ser una landing "de segunda". Renderiza el MISMO
 * `LandingPageClient` que la ruta normal, y eso no es un detalle estético: ese
 * componente es el que monta `SessionProvider` (POST /public/tracking/session,
 * con `promotor` y las UTM adentro) y `EventTrackerProvider`.
 *
 * Si alguien "simplificara" esta página renderizando el hero suelto, las visitas
 * que llegan por un link de activación —justo las que hay que atribuir— dejarían
 * de crear sesión, y la falla sería invisible: la landing se vería idéntica y el
 * reporte de promotoras iría a cero sin que nada rompa.
 */
import LandingConReferidoPage from '../[slug]/page';
import { LandingPageClient } from '../../[[...slug]]/LandingPageClient';

jest.mock('../../[[...slug]]/LandingPageClient', () => ({
  LandingPageClient: function LandingPageClientMock() { return null; },
}));

const fetchHeroData = jest.fn(async () => ({ landingId: 1 }));
const fetchLandingConfig = jest.fn(async () => ({ layout: {}, features: {} }));
/**
 * El mock respeta la guarda de la función real (`if (!promotor) return null`).
 * Si devolviera la franja siempre, la ruta parecería resolver por `promotor`
 * incluso en las URLs que no lo traen —que son la mayoría de los flyers— y el
 * respaldo por `ref` quedaría sin probar de verdad.
 */
const fetchReferralBanner = jest.fn(async (promotor?: unknown) =>
  promotor
    ? {
        firstName: 'Marco',
        phoneDisplay: '999 888 777',
        whatsappUrl: 'https://wa.me/51999888777',
        promoterCode: 'jperez',
        reason: 'ok',
      }
    : null,
);

jest.mock('../../services/landingApi', () => ({
  fetchHeroData: (...args: unknown[]) => fetchHeroData(...(args as [])),
  getLandingMeta: jest.fn(async () => null),
}));
jest.mock('../../services/landingConfigApi', () => ({
  fetchLandingConfig: (...args: unknown[]) => fetchLandingConfig(...(args as [])),
}));
const fetchReferralBannerByRef = jest.fn(async (ref?: unknown) =>
  ref
    ? {
        firstName: 'Aned',
        phoneDisplay: null,
        whatsappUrl: null,
        promoterCode: 'ekscah',
        reason: 'ref',
      }
    : null,
);

jest.mock('../../services/referralBannerApi', () => ({
  fetchReferralBanner: (...args: unknown[]) => fetchReferralBanner(...(args as [])),
  fetchReferralBannerByRef: (...args: unknown[]) => fetchReferralBannerByRef(...(args as [])),
}));

function props(slug: string, query: Record<string, string | string[]>) {
  return { params: Promise.resolve({ slug }), searchParams: Promise.resolve(query) };
}

describe('ruta gemela de referido', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renderiza el mismo LandingPageClient que la ruta normal', async () => {
    const el = await LandingConReferidoPage(props('upn', { promotor: 'jperez' }));
    // El tracking de sesión vive dentro de este componente: cambiarlo por otro
    // apagaría la atribución de las visitas referidas sin romper nada visible.
    expect(el.type).toBe(LandingPageClient);
    expect(el.props.slug).toBe('upn');
  });

  it('le pasa la franja ya resuelta server-side', async () => {
    const el = await LandingConReferidoPage(
      props('upn', { promotor: 'jperez', utm_term: 'punto_x__promo_4a2eji' }),
    );
    expect(el.props.referralBanner?.firstName).toBe('Marco');
    expect(fetchReferralBanner).toHaveBeenCalledWith('jperez', 'punto_x__promo_4a2eji');
  });

  it('toma el primer valor cuando un parametro llega repetido', async () => {
    await LandingConReferidoPage(
      props('upn', { promotor: ['jperez', 'otro'], utm_term: 'punto_x__promo_4a2eji' }),
    );
    expect(fetchReferralBanner).toHaveBeenCalledWith('jperez', 'punto_x__promo_4a2eji');
  });

  it('sigue renderizando la landing aunque no haya franja', async () => {
    fetchReferralBanner.mockResolvedValueOnce(null as never);
    const el = await LandingConReferidoPage(props('upn', { promotor: 'inventado' }));
    expect(el.type).toBe(LandingPageClient);
    expect(el.props.referralBanner).toBeNull();
  });

  it('pide los mismos datos de landing que la ruta normal', async () => {
    await LandingConReferidoPage(props('senati', { promotor: 'jperez' }));
    expect(fetchHeroData).toHaveBeenCalledWith('senati');
    expect(fetchLandingConfig).toHaveBeenCalledWith('senati');
  });
});

/**
 * `ref` es el respaldo, pero en la práctica es el camino principal: `promotor`
 * sólo viaja cuando esa promotora tiene correspondencia en ws2, y `ref` lo
 * estampa siempre `/r/{codigo}` del hub. Un flyer sin `promotor` es el caso
 * normal, no el raro.
 */
describe('resolución por ref', () => {
  beforeEach(() => jest.clearAllMocks());

  it('resuelve por ref cuando no viene promotor', async () => {
    const el = await LandingConReferidoPage(props('wiener', { ref: 'ekscah' }));

    expect(el.props.referralBanner?.firstName).toBe('Aned');
    expect(fetchReferralBannerByRef).toHaveBeenCalledWith('ekscah');
  });

  it('promotor gana cuando vienen los dos', async () => {
    // El de ws2 trae teléfono, o sea la franja con el chip de WhatsApp.
    const el = await LandingConReferidoPage(
      props('upn', { promotor: 'jperez', utm_term: 'punto_x__promo_4a2eji', ref: 'ekscah' }),
    );

    expect(el.props.referralBanner?.firstName).toBe('Marco');
    expect(fetchReferralBannerByRef).not.toHaveBeenCalled();
  });

  it('cae al ref cuando el de ws2 no resuelve', async () => {
    // Pasa siempre que la promotora no está mapeada en ws2: el endpoint responde
    // que no y, sin este respaldo, el flyer no pintaba nada.
    fetchReferralBanner.mockResolvedValueOnce(null as never);

    const el = await LandingConReferidoPage(
      props('wiener', { promotor: 'nomapeado', utm_term: 'punto_x__promo_1vlqax8', ref: 'ekscah' }),
    );

    expect(el.props.referralBanner?.firstName).toBe('Aned');
  });

  it('toma el primer valor cuando ref llega repetido', async () => {
    await LandingConReferidoPage(props('wiener', { ref: ['ekscah', 'otro'] }));
    expect(fetchReferralBannerByRef).toHaveBeenCalledWith('ekscah');
  });

  it('sin ninguno de los dos la landing carga sin franja', async () => {
    const el = await LandingConReferidoPage(props('upn', {}));
    expect(el.type).toBe(LandingPageClient);
    expect(el.props.referralBanner).toBeNull();
  });
});
