/**
 * La franja fuera de la landing: catálogo, detalle y wizard.
 *
 * Este archivo protege la parte que no se ve en el markup. La landing resuelve
 * la franja server-side con el `?promotor=` / `?ref=` de la URL, pero de ahí en
 * adelante el querystring se pierde —`routes.catalogo()` arma una URL limpia—
 * así que el resto del recorrido no tiene con qué resolverla solo.
 *
 * Lo que se prueba es el orden de los dos caminos y que ninguno pueda dejar la
 * página sin franja por un motivo evitable: primero lo guardado (sin red, sirve
 * para los dos parámetros), y sólo si no hay nada, el `ref` de localStorage
 * contra el hub.
 */
import { render, screen, waitFor } from '@testing-library/react';

import { ReferralBannerGate } from '../ReferralBannerGate';
import { fetchReferralBannerByRef } from '../../../services/referralBannerApi';

jest.mock('../../../[landing]/solicitar/context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: jest.fn(), flush: jest.fn() }),
}));

let pathname = '/upn/catalogo';
let landing = 'upn';
jest.mock('next/navigation', () => ({
  useParams: () => ({ landing }),
  usePathname: () => pathname,
}));

jest.mock('../../../services/referralBannerApi', () => ({
  fetchReferralBannerByRef: jest.fn(),
}));

const fetchPorRef = fetchReferralBannerByRef as jest.MockedFunction<
  typeof fetchReferralBannerByRef
>;

const RESUELTA = {
  firstName: 'Aned',
  whatsappUrl: 'https://wa.me/51999888777?text=Hola',
  promoterCode: 'ekscah',
  reason: 'ref',
};

function guardar(landingSlug: string, data: unknown) {
  window.sessionStorage.setItem(
    `baldecash-referral-banner-${landingSlug}`,
    JSON.stringify(data),
  );
}

beforeEach(() => {
  landing = 'upn';
  pathname = '/upn/catalogo';
  window.sessionStorage.clear();
  window.localStorage.clear();
  fetchPorRef.mockReset();
  fetchPorRef.mockResolvedValue(null);
});

describe('ReferralBannerGate · sin nada que mostrar', () => {
  it('el tráfico orgánico no pinta nada ni pega contra el hub', async () => {
    // Es la enorme mayoría de las visitas: ni un fetch ni un nodo de más.
    const { container } = render(<ReferralBannerGate />);
    expect(container).toBeEmptyDOMElement();
    expect(fetchPorRef).not.toHaveBeenCalled();
  });
});

describe('ReferralBannerGate · lo guardado', () => {
  it('pinta la franja que la landing dejó guardada, sin red', async () => {
    guardar('upn', RESUELTA);

    render(<ReferralBannerGate />);

    expect(await screen.findByTestId('referral-banner')).toHaveTextContent('Te refirió Aned');
    expect(fetchPorRef).not.toHaveBeenCalled();
  });

  it('lo guardado para OTRA landing no se usa', async () => {
    // Dos landings distintas son dos recorridos distintos; la promotora de una
    // no tiene por qué aparecer en la otra.
    guardar('wiener', RESUELTA);

    const { container } = render(<ReferralBannerGate />);

    await waitFor(() => expect(fetchPorRef).not.toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it('lo guardado sin nombre no pinta una franja a medias', async () => {
    // Nunca "Te refirió —". Si lo guardado no sirve, se ignora entero.
    guardar('upn', { whatsappUrl: 'https://wa.me/51999888777' });

    const { container } = render(<ReferralBannerGate />);

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});

describe('ReferralBannerGate · respaldo por `ref`', () => {
  it('sin nada guardado resuelve con el `ref` de localStorage', async () => {
    // Cubre la pestaña recuperada, el link compartido a mitad de camino y el
    // sessionStorage que no estaba disponible cuando se pintó la landing.
    window.localStorage.setItem('baldecash-upn-promotor-ref', 'ekscah');
    fetchPorRef.mockResolvedValue(RESUELTA);

    render(<ReferralBannerGate />);

    expect(await screen.findByTestId('referral-banner')).toHaveTextContent('Te refirió Aned');
    expect(fetchPorRef).toHaveBeenCalledWith('ekscah');
  });

  it('lo guardado gana: no se gasta un fetch teniéndolo', async () => {
    window.localStorage.setItem('baldecash-upn-promotor-ref', 'ekscah');
    guardar('upn', RESUELTA);

    render(<ReferralBannerGate />);

    await screen.findByTestId('referral-banner');
    expect(fetchPorRef).not.toHaveBeenCalled();
  });

  it('si el hub no resuelve, la página sigue sin franja', async () => {
    // `fetchReferralBannerByRef` nunca lanza: devuelve null y acá no se pinta.
    // El catálogo no puede romperse por un banner.
    window.localStorage.setItem('baldecash-upn-promotor-ref', 'ekscah');
    fetchPorRef.mockResolvedValue(null);

    const { container } = render(<ReferralBannerGate />);

    await waitFor(() => expect(fetchPorRef).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it('una respuesta que llega tarde no pinta la franja de la landing anterior', async () => {
    // Navegar entre landings sin recargar cambia el slug con el fetch en vuelo.
    window.localStorage.setItem('baldecash-upn-promotor-ref', 'ekscah');
    let resolver: (v: typeof RESUELTA) => void = () => {};
    fetchPorRef.mockReturnValue(new Promise((r) => { resolver = r; }));

    const { container, unmount } = render(<ReferralBannerGate />);
    unmount();
    resolver(RESUELTA);

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});

describe('ReferralBannerGate · lo que resuelve queda guardado', () => {
  it('resolver por `ref` una vez alcanza para las páginas siguientes', async () => {
    // Si no quedara guardado, cada paso del wizard pagaría su propio fetch
    // contra otro dominio.
    window.localStorage.setItem('baldecash-upn-promotor-ref', 'ekscah');
    fetchPorRef.mockResolvedValue(RESUELTA);

    render(<ReferralBannerGate />);
    await screen.findByTestId('referral-banner');

    expect(window.sessionStorage.getItem('baldecash-referral-banner-upn')).toContain('Aned');
  });
});
