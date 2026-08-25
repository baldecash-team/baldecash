/**
 * La franja tiene que ser VISIBLE, no sólo estar en el HTML.
 *
 * Este archivo existe por un bug que estuvo en producción sin que nadie lo
 * notara: la franja se renderizaba con el nombre correcto, pero el banner
 * promocional y el navbar son `fixed` desde `top: 0` y la tapaban entera. Como
 * el `?promotor=` es una fracción mínima del tráfico, nadie lo vio hasta que
 * empezaron a llegar los flyers por `?ref=`.
 *
 * Lo que se protege acá es el contrato entre las dos piezas: la franja publica
 * `--referral-banner-offset` y el header lo consume. Si se rompe, la franja no
 * desaparece —vuelve a quedar tapada, que es peor: se ve igual de bien en los
 * tests y en el HTML, y no se ve nunca en pantalla.
 */
import { act, fireEvent, render, screen } from '@testing-library/react';

import { ReferralBanner } from '../ReferralBanner';
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

/** jsdom no hace layout: el rect se simula, y `bottom` es lo único que importa. */
function simularBorde(bottom: number) {
  return jest
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockReturnValue({ bottom, height: ALTO } as DOMRect);
}

function offset(): string {
  return document.documentElement.style.getPropertyValue('--referral-banner-offset');
}

beforeEach(() => {
  window.sessionStorage.clear();
  document.documentElement.style.removeProperty('--referral-banner-offset');
  // El hook coalesce por frame; sin esto las mediciones quedarían pendientes.
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    cb(0);
    return 0;
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('empuja al header fijo', () => {
  it('publica su alto al montarse', () => {
    simularBorde(ALTO);
    render(<ReferralBanner data={DATOS} landingSlug="wiener" />);

    // Sin esto el header arranca en top:0 y la franja queda debajo, invisible.
    expect(offset()).toBe(`${ALTO}px`);
  });

  it('el valor baja a medida que la franja se va con el scroll', () => {
    const rect = simularBorde(ALTO);
    render(<ReferralBanner data={DATOS} landingSlug="wiener" />);

    rect.mockReturnValue({ bottom: 12, height: ALTO } as DOMRect);
    act(() => { fireEvent.scroll(window); });

    expect(offset()).toBe('12px');
  });

  it('llega a 0 cuando terminó de salir, no a un número negativo', () => {
    // Con la franja ya fuera de pantalla el rect da negativo. Pasarlo tal cual
    // subiría el header por encima del borde y le comería la primera línea.
    const rect = simularBorde(ALTO);
    render(<ReferralBanner data={DATOS} landingSlug="wiener" />);

    rect.mockReturnValue({ bottom: -80, height: ALTO } as DOMRect);
    act(() => { fireEvent.scroll(window); });

    expect(offset()).toBe('0px');
  });

  it('se recalcula en resize', () => {
    // En móvil el texto pasa a dos líneas y la franja cambia de alto sola.
    const rect = simularBorde(ALTO);
    render(<ReferralBanner data={DATOS} landingSlug="wiener" />);

    rect.mockReturnValue({ bottom: 68, height: 68 } as DOMRect);
    act(() => { fireEvent(window, new Event('resize')); });

    expect(offset()).toBe('68px');
  });
});

describe('devuelve el espacio cuando ya no está', () => {
  it('al desmontarse suelta el offset', () => {
    // Si quedara puesto, navegar a una página sin franja dejaría al header
    // arrancando 44 px más abajo, con una banda transparente permanente arriba.
    simularBorde(ALTO);
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
    simularBorde(ALTO);
    render(<ReferralBanner data={DATOS} landingSlug="wiener" />);

    const franja = screen.getByTestId('referral-banner');
    expect(franja.querySelector(':scope > div')?.className).toContain('justify-center');
    expect(franja.querySelector('p')?.className).toContain('text-center');
  });

  it('no queda ningún hueco de contrapeso del botón que ya no existe', () => {
    simularBorde(ALTO);
    render(<ReferralBanner data={DATOS} landingSlug="wiener" />);

    const fila = screen.getByTestId('referral-banner').querySelector(':scope > div');
    expect(fila?.firstElementChild?.tagName).toBe('P');
  });

  it('con link, el ícono va después del texto y no antes', () => {
    // "Te refirió Aned, si tienes dudas escríbele aquí" ➜ ícono. Al revés, el
    // ícono se lee como el sujeto de la frase.
    simularBorde(ALTO);
    render(
      <ReferralBanner
        data={{ ...DATOS, whatsappUrl: 'https://wa.me/51999888777' }}
        landingSlug="wiener"
      />,
    );

    const fila = screen.getByTestId('referral-banner').querySelector(':scope > div');
    expect(fila?.firstElementChild?.tagName).toBe('P');
    expect(fila?.lastElementChild?.querySelector('svg')).not.toBeNull();
  });
});
