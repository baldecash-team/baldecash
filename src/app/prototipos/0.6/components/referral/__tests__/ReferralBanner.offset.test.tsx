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
  phoneDisplay: null,
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
  it('al descartarla suelta el offset', () => {
    // Si quedara puesto, cerrar la franja dejaría una banda transparente
    // permanente arriba de la página.
    simularBorde(ALTO);
    render(<ReferralBanner data={DATOS} landingSlug="wiener" />);
    expect(offset()).toBe(`${ALTO}px`);

    fireEvent.click(screen.getByTestId('referral-banner-dismiss'));

    expect(screen.queryByTestId('referral-banner')).toBeNull();
    expect(offset()).toBe('');
  });

  it('al desmontarse suelta el offset', () => {
    simularBorde(ALTO);
    const { unmount } = render(<ReferralBanner data={DATOS} landingSlug="wiener" />);

    unmount();

    expect(offset()).toBe('');
  });

  it('si ya venía descartada nunca lo pone', () => {
    window.sessionStorage.setItem('baldecash-referral-banner-dismissed-ekscah', '1');
    simularBorde(ALTO);

    render(<ReferralBanner data={DATOS} landingSlug="wiener" />);

    expect(offset()).toBe('');
  });
});

/**
 * El texto va centrado en la franja, no pegado a la izquierda.
 *
 * El detalle que no se ve en el markup: centrar el `<p>` no alcanza, porque su
 * caja es el espacio que sobra a la izquierda del botón de cerrar. Sin un hueco
 * del mismo ancho enfrente, la frase queda corrida media anchura de botón.
 */
describe('centrado del texto', () => {
  it('el parrafo va centrado', () => {
    simularBorde(ALTO);
    render(<ReferralBanner data={DATOS} landingSlug="wiener" />);

    const parrafo = screen.getByTestId('referral-banner').querySelector('p');
    expect(parrafo?.className).toContain('text-center');
  });

  it('sin chip de WhatsApp hay contrapeso del boton de cerrar', () => {
    simularBorde(ALTO);
    render(<ReferralBanner data={DATOS} landingSlug="wiener" />);

    const franja = screen.getByTestId('referral-banner');
    const fila = franja.querySelector(':scope > div');
    const hueco = fila?.firstElementChild;

    // Mismo padding que el botón y un bloque del mismo tamaño que su icono:
    // así los dos lados miden igual y el centro del texto es el de la franja.
    expect(hueco?.getAttribute('aria-hidden')).toBe('true');
    expect(hueco?.className).toContain('shrink-0');
    expect(hueco?.className).toContain('p-1');
    expect(hueco?.firstElementChild?.className).toContain('h-4');
    expect(hueco?.firstElementChild?.className).toContain('w-4');
  });

  it('con chip de WhatsApp no se agrega contrapeso', () => {
    // Ahí el lado derecho tiene ancho variable y un hueco fijo desbalancearía
    // igual; además le robaría espacio a un texto que ya viene apretado.
    simularBorde(ALTO);
    render(
      <ReferralBanner
        data={{ ...DATOS, phoneDisplay: '999 888 777', whatsappUrl: 'https://wa.me/51999888777' }}
        landingSlug="wiener"
      />,
    );

    const fila = screen.getByTestId('referral-banner').querySelector(':scope > div');
    expect(fila?.firstElementChild?.tagName).toBe('P');
  });
});
