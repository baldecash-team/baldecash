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
const fetchReferralBanner = jest.fn(async () => ({
  firstName: 'Marcela',
  phoneDisplay: '999 888 777',
  whatsappUrl: 'https://wa.me/51999888777',
  promoterToken: '4a2eji',
  reason: 'ok',
}));

jest.mock('../../services/landingApi', () => ({
  fetchHeroData: (...args: unknown[]) => fetchHeroData(...(args as [])),
  getLandingMeta: jest.fn(async () => null),
}));
jest.mock('../../services/landingConfigApi', () => ({
  fetchLandingConfig: (...args: unknown[]) => fetchLandingConfig(...(args as [])),
}));
jest.mock('../../services/referralBannerApi', () => ({
  fetchReferralBanner: (...args: unknown[]) => fetchReferralBanner(...(args as [])),
}));

function props(slug: string, query: Record<string, string | string[]>) {
  return { params: Promise.resolve({ slug }), searchParams: Promise.resolve(query) };
}

describe('ruta gemela de referido', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renderiza el mismo LandingPageClient que la ruta normal', async () => {
    const el = await LandingConReferidoPage(props('upn', { utm_term: 'punto_x__promo_4a2eji' }));
    // El tracking de sesión vive dentro de este componente: cambiarlo por otro
    // apagaría la atribución de las visitas referidas sin romper nada visible.
    expect(el.type).toBe(LandingPageClient);
    expect(el.props.slug).toBe('upn');
  });

  it('le pasa la franja ya resuelta server-side', async () => {
    const el = await LandingConReferidoPage(
      props('upn', { utm_term: 'punto_x__promo_4a2eji' }),
    );
    expect(el.props.referralBanner?.firstName).toBe('Marcela');
    expect(fetchReferralBanner).toHaveBeenCalledWith('punto_x__promo_4a2eji');
  });

  it('toma el primer valor cuando un parametro llega repetido', async () => {
    await LandingConReferidoPage(
      props('upn', { utm_term: ['punto_x__promo_4a2eji', 'otro'] }),
    );
    expect(fetchReferralBanner).toHaveBeenCalledWith('punto_x__promo_4a2eji');
  });

  it('sigue renderizando la landing aunque no haya franja', async () => {
    fetchReferralBanner.mockResolvedValueOnce(null as never);
    const el = await LandingConReferidoPage(props('upn', { utm_term: 'punto_x__promo_inventado' }));
    expect(el.type).toBe(LandingPageClient);
    expect(el.props.referralBanner).toBeNull();
  });

  it('pide los mismos datos de landing que la ruta normal', async () => {
    await LandingConReferidoPage(props('senati', { utm_term: 'punto_x__promo_4a2eji' }));
    expect(fetchHeroData).toHaveBeenCalledWith('senati');
    expect(fetchLandingConfig).toHaveBeenCalledWith('senati');
  });
});
