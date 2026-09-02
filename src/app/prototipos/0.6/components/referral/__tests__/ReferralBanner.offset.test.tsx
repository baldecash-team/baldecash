/**
 * La franja tiene que ser VISIBLE, no sólo estar en el HTML.
 *
 * Este archivo existe por un bug que estuvo en producción sin que nadie lo
 * notara: la franja se renderizaba con el nombre correcto, pero el banner
 * promocional y el navbar son `fixed` desde `top: 0` y la tapaban entera. Como
 * el `?promotor=` es una fracción mínima del tráfico, nadie lo vio hasta que
 * empezaron a llegar los flyers por `?ref=`.
 *
 * Ahora la franja es ella misma `fixed`, pegada debajo de ese header. O sea que
 * el mismo bug sigue a un descuido de distancia, y son dos los contratos a
 * proteger:
 *
 *   1. la franja se pinta `fixed` arrancando en `--header-total-height`, o sea
 *      donde termina el header y no debajo de él;
 *   2. publica su alto en `--referral-banner-offset` —permanente, ya no baja con
 *      el scroll— y reserva ese mismo alto en el flujo con un hueco. Lo primero
 *      lo consumen la barra secundaria del catálogo y las columnas sticky; lo
 *      segundo evita que la franja le tape los primeros 44 px al contenido, que
 *      reserva el alto del header sin saber nada de ella.
 *
 * Si cualquiera de los dos se rompe la franja no desaparece: vuelve a quedar
 * tapada, que es peor —se ve igual de bien en el HTML y no se ve nunca en
 * pantalla— o se come el principio del contenido.
 */
import { act, fireEvent, render, screen } from '@testing-library/react';

import { ReferralBanner, TOP_DE_LA_FRANJA } from '../ReferralBanner';
import type { ReferralBanner as ReferralBannerData } from '../../../services/referralBannerApi';

jest.mock('../../../[landing]/solicitar/context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: jest.fn(), flush: jest.fn() }),
}));

const DATOS: ReferralBannerData = {
  firstName: 'Aned',
  whatsappUrl: null,
  promoterCode: 'ekscah',
  reason: 'ref',
};

const ALTO = 44;

/** jsdom no hace layout: `offsetHeight` siempre da 0, así que se simula. */
function simularAlto(alto: number) {
  return jest
    .spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
    .mockReturnValue(alto);
}

function offset(): string {
  return document.documentElement.style.getPropertyValue('--referral-banner-offset');
}

function franja(): HTMLElement {
  return screen.getByTestId('referral-banner');
}

/** El hueco es el padre: lo único que hace es ocupar el alto de la franja. */
function hueco(): HTMLElement {
  return franja().parentElement as HTMLElement;
}

beforeEach(() => {
  window.sessionStorage.clear();
  document.documentElement.style.removeProperty('--referral-banner-offset');
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('se queda pegada debajo del header', () => {
  it('se pinta fija, arrancando donde termina el header', () => {
    simularAlto(ALTO);
    render(<ReferralBanner data={DATOS} landingSlug="wiener" />);

    expect(franja().style.position).toBe('fixed');
    // jsdom descarta `var()` en `style.top`, así que el valor se prueba en la
    // constante que lo produce (mismo motivo que `topDeLaBarra`).
    expect(TOP_DE_LA_FRANJA).toBe('var(--header-total-height, 6.5rem)');
  });

  it('no se va con el scroll: el offset se queda en su alto', () => {
    // Este es el pedido que trajo el cambio. Antes el valor bajaba con el scroll
    // hasta 0 y la franja se metía detrás del header.
    simularAlto(ALTO);
    render(<ReferralBanner data={DATOS} landingSlug="wiener" />);
    expect(offset()).toBe(`${ALTO}px`);

    act(() => { fireEvent.scroll(window); });

    expect(offset()).toBe(`${ALTO}px`);
  });
});

describe('reserva su lugar en el flujo', () => {
  it('el hueco mide lo mismo que la franja', () => {
    // Sin el hueco la franja le tapa los primeros 44 px al contenido: el
    // contenido reserva el alto del header con su padding y no sabe de ella.
    simularAlto(ALTO);
    render(<ReferralBanner data={DATOS} landingSlug="wiener" />);

    expect(hueco().style.height).toBe(`${ALTO}px`);
  });

  it('con el texto en dos líneas, el hueco y el offset crecen igual', () => {
    // En móvil el texto pasa a dos líneas y la franja mide más sola.
    simularAlto(68);
    render(<ReferralBanner data={DATOS} landingSlug="wiener" />);

    expect(offset()).toBe('68px');
    expect(hueco().style.height).toBe('68px');
  });

  it('se recalcula en resize', () => {
    const alto = simularAlto(ALTO);
    render(<ReferralBanner data={DATOS} landingSlug="wiener" />);

    alto.mockReturnValue(68);
    act(() => { fireEvent(window, new Event('resize')); });

    expect(offset()).toBe('68px');
    expect(hueco().style.height).toBe('68px');
  });
});

describe('devuelve el espacio cuando ya no está', () => {
  it('al desmontarse suelta el offset', () => {
    // Si quedara puesto, navegar a una página sin franja dejaría a la barra
    // secundaria arrancando 44 px más abajo, con una banda vacía arriba.
    simularAlto(ALTO);
    const { unmount } = render(<ReferralBanner data={DATOS} landingSlug="wiener" />);
    expect(offset()).toBe(`${ALTO}px`);

    unmount();

    expect(offset()).toBe('');
  });
});

/**
 * El texto va centrado en la franja.
 *
 * Antes hacía falta un hueco fantasma a la izquierda para contrapesar el botón
 * de cerrar: la caja del `<p>` era lo que sobraba a su lado, así que centrar el
 * párrafo dejaba la frase corrida media anchura de botón. Sin la X, el contenido
 * es texto + ícono y alcanza con centrar la fila entera.
 */
describe('centrado del texto', () => {
  it('la fila va centrada y el párrafo también', () => {
    simularAlto(ALTO);
    render(<ReferralBanner data={DATOS} landingSlug="wiener" />);

    expect(franja().querySelector(':scope > div')?.className).toContain('justify-center');
    expect(franja().querySelector('p')?.className).toContain('text-center');
  });

  it('no queda ningún hueco de contrapeso del botón que ya no existe', () => {
    simularAlto(ALTO);
    render(<ReferralBanner data={DATOS} landingSlug="wiener" />);

    const fila = franja().querySelector(':scope > div');
    expect(fila?.firstElementChild?.tagName).toBe('P');
  });

  it('con link, el ícono va después del texto y no antes', () => {
    // "Te refirió Aned, si tienes dudas escríbele aquí" ➜ ícono. Al revés, el
    // ícono se lee como el sujeto de la frase.
    simularAlto(ALTO);
    render(
      <ReferralBanner
        data={{ ...DATOS, whatsappUrl: 'https://wa.me/51999888777' }}
        landingSlug="wiener"
      />,
    );

    const fila = franja().querySelector(':scope > div');
    expect(fila?.firstElementChild?.tagName).toBe('P');
    expect(fila?.lastElementChild?.querySelector('svg')).not.toBeNull();
  });
});
