/**
 * Franja de referido — casuística visible y su instrumentación.
 *
 * Los casos negativos (sin promotor, código inexistente, promotora inactiva,
 * token que no coincide) no llegan hasta acá: se resuelven antes y el componente
 * ni se monta. Lo que se prueba en este archivo son las DOS formas en que la
 * franja sí se muestra —toda ella clickeable, o como aviso sin link— y que cada
 * una emita el evento con las propiedades que las distinguen.
 */
import { fireEvent, render, screen } from '@testing-library/react';

import { ReferralBanner } from '../ReferralBanner';
import type { ReferralBanner as ReferralBannerData } from '../../../services/referralBannerApi';

const track = jest.fn();

jest.mock('../../../[landing]/solicitar/context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track, flush: jest.fn() }),
}));

jest.mock('next/navigation', () => ({
  usePathname: () => '/upn/catalogo',
}));

const COMPLETO: ReferralBannerData = {
  firstName: 'Marco',
  whatsappUrl:
    'https://wa.me/51999888777?text=Hola%20Marco%2C%20tengo%20dudas%20sobre%20el%20financiamiento%20de%20equipos%20de%20BaldeCash',
  promoterCode: 'jperez',
  reason: 'ok',
};

const SIN_TELEFONO: ReferralBannerData = {
  ...COMPLETO,
  whatsappUrl: null,
  reason: 'sin_telefono',
};

/**
 * `IntersectionObserver` no existe en jsdom. El doble de acá dispara la entrada
 * en viewport apenas se observa el elemento, que es el caso que corre en una
 * página normal: la franja es lo primero del documento.
 */
class IOFalso {
  static instancias: IOFalso[] = [];
  constructor(private cb: IntersectionObserverCallback) {
    IOFalso.instancias.push(this);
  }
  observe(el: Element) {
    this.cb(
      [{ isIntersecting: true, target: el } as unknown as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
  disconnect() {}
  unobserve() {}
}

/** Doble que NUNCA reporta intersección: la franja montada pero fuera de pantalla. */
class IOFueraDePantalla {
  observe() {}
  disconnect() {}
  unobserve() {}
}

function instalarIO(clase: unknown) {
  (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = clase;
  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = clase;
}

beforeEach(() => {
  track.mockClear();
  window.sessionStorage.clear();
  IOFalso.instancias = [];
  instalarIO(IOFalso);
});

describe('ReferralBanner · qué se muestra', () => {
  it('dice quién refirió e invita a escribirle', () => {
    render(<ReferralBanner data={COMPLETO} landingSlug="upn" />);
    expect(screen.getByTestId('referral-banner')).toHaveTextContent(
      'Te refirió Marco, si tienes dudas escríbele aquí',
    );
  });

  it('TODA la franja es el link a WhatsApp, no un botón al costado', () => {
    // En móvil, que el blanco sea la franja entera y no un chip de 90 px es la
    // diferencia entre un canal que se usa y uno que se mira.
    render(<ReferralBanner data={COMPLETO} landingSlug="upn" />);
    const franja = screen.getByTestId('referral-banner');
    expect(franja.tagName).toBe('A');
    expect(franja).toHaveAttribute('href', COMPLETO.whatsappUrl);
  });

  it('el link abre en pestaña nueva y sin filtrar el referrer', () => {
    render(<ReferralBanner data={COMPLETO} landingSlug="upn" />);
    const franja = screen.getByTestId('referral-banner');
    expect(franja).toHaveAttribute('target', '_blank');
    expect(franja).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('sin número usable se pinta como aviso, sin link ni ícono', () => {
    // Un `wa.me` sin destinatario válido abre WhatsApp en blanco: es peor que no
    // llevar a ningún lado. Y un <a> sin href no es enfocable ni se anuncia como
    // link, así que sería un botón falso.
    render(<ReferralBanner data={SIN_TELEFONO} landingSlug="upn" />);
    const franja = screen.getByTestId('referral-banner');
    expect(franja.tagName).toBe('DIV');
    expect(franja).not.toHaveAttribute('href');
    expect(franja).toHaveTextContent('Te refirió Marco');
    expect(franja).not.toHaveTextContent('escríbele aquí');
  });

  it('nunca pinta el número: el texto invita, no lo dicta', () => {
    render(<ReferralBanner data={COMPLETO} landingSlug="upn" />);
    expect(screen.getByTestId('referral-banner').textContent).not.toMatch(/\d{3}/);
  });

  it('no se puede cerrar', () => {
    // La X se quitó cuando la franja pasó a acompañar todo el recorrido: un
    // descarte en la landing la apagaba también en el catálogo y en el
    // formulario, que es donde aparecen las dudas que este canal resuelve.
    render(<ReferralBanner data={COMPLETO} landingSlug="upn" />);
    expect(screen.queryByTestId('referral-banner-dismiss')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('ReferralBanner · guardado para el resto del recorrido', () => {
  it('guarda lo que pintó, para que el catálogo y el wizard no vuelvan a preguntar', () => {
    render(<ReferralBanner data={COMPLETO} landingSlug="upn" />);
    const guardado = window.sessionStorage.getItem('baldecash-referral-banner-upn');
    expect(guardado && JSON.parse(guardado)).toMatchObject({
      firstName: 'Marco',
      promoterCode: 'jperez',
    });
  });

  it('guarda por landing: dos landings no se pisan', () => {
    render(<ReferralBanner data={COMPLETO} landingSlug="upn" />);
    expect(window.sessionStorage.getItem('baldecash-referral-banner-wiener')).toBeNull();
  });

  it('sobrevive a un sessionStorage que tira', () => {
    // Pasa en el WebView de algunas apps y en modo privado de WebKit. Sin
    // guardado la franja vive sólo en la página donde se resolvió; lo que no
    // puede es tumbarla.
    const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage disabled');
    });
    expect(() => render(<ReferralBanner data={COMPLETO} landingSlug="upn" />)).not.toThrow();
    expect(screen.getByTestId('referral-banner')).toBeInTheDocument();
    spy.mockRestore();
  });
});

describe('ReferralBanner · eventos', () => {
  it('emite la impresión cuando la franja entra en pantalla', () => {
    render(<ReferralBanner data={COMPLETO} landingSlug="upn" />);
    expect(track).toHaveBeenCalledWith('referral_banner_shown', {
      promoter_code: 'jperez',
      landing_slug: 'upn',
      reason: 'ok',
      has_whatsapp: true,
      variant: 'link',
      page: '/upn/catalogo',
    });
  });

  it('montada pero fuera de pantalla NO cuenta como impresión', () => {
    // La franja no es sticky: al navegar entre pasos con la página scrolleada
    // puede montar entera fuera del viewport. Contar eso como visto infla el
    // denominador del click-through con impresiones que nadie tuvo.
    instalarIO(IOFueraDePantalla);
    render(<ReferralBanner data={COMPLETO} landingSlug="upn" />);
    expect(track).not.toHaveBeenCalledWith('referral_banner_shown', expect.anything());
  });

  it('sin IntersectionObserver se emite igual', () => {
    // WebView viejo: perder la impresión es peor que contarla sin la
    // confirmación de visibilidad.
    instalarIO(undefined);
    render(<ReferralBanner data={COMPLETO} landingSlug="upn" />);
    expect(track).toHaveBeenCalledWith(
      'referral_banner_shown',
      expect.objectContaining({ promoter_code: 'jperez' }),
    );
  });

  it('la impresión sin link se distingue por variant y has_whatsapp', () => {
    // Sin esta distinción, un click-through bajo se lee como "el copy no
    // funciona" cuando la mitad de las impresiones no tenían a dónde llevar.
    render(<ReferralBanner data={SIN_TELEFONO} landingSlug="upn" />);
    expect(track).toHaveBeenCalledWith(
      'referral_banner_shown',
      expect.objectContaining({ variant: 'aviso', has_whatsapp: false, reason: 'sin_telefono' }),
    );
  });

  it('dice en qué paso del recorrido se vio', () => {
    // La franja acompaña landing, catálogo, detalle y wizard: sin `page` las
    // cuatro se suman en un número que no dice nada.
    render(<ReferralBanner data={COMPLETO} landingSlug="upn" />);
    expect(track).toHaveBeenCalledWith(
      'referral_banner_shown',
      expect.objectContaining({ page: '/upn/catalogo' }),
    );
  });

  it('emite una sola impresión aunque el componente se re-renderice', () => {
    const { rerender } = render(<ReferralBanner data={COMPLETO} landingSlug="upn" />);
    rerender(<ReferralBanner data={COMPLETO} landingSlug="upn" />);
    const impresiones = track.mock.calls.filter((c) => c[0] === 'referral_banner_shown');
    expect(impresiones).toHaveLength(1);
  });

  it('el clic viaja con las mismas propiedades que la impresión', () => {
    // Así el click-through sale restando, sin joins y segmentado por cualquiera
    // de ellas.
    render(<ReferralBanner data={COMPLETO} landingSlug="upn" />);
    fireEvent.click(screen.getByTestId('referral-banner'));

    const impresion = track.mock.calls.find((c) => c[0] === 'referral_banner_shown');
    const clic = track.mock.calls.find((c) => c[0] === 'referral_banner_whatsapp_click');
    expect(clic?.[1]).toEqual(impresion?.[1]);
  });

  it('el tipo de evento está en la allowlist de ws2', () => {
    // `REFERRAL_BANNER_EVENT_TYPES` de ws2 no conoce `referral_banner_visible`:
    // un tipo que no esté ahí lo descarta `is_valid_event` con 200 OK y cero
    // filas. El evento se renombra el día que ws2 lo acepte, no antes.
    render(<ReferralBanner data={COMPLETO} landingSlug="upn" />);
    fireEvent.click(screen.getByTestId('referral-banner'));
    const permitidos = ['referral_banner_shown', 'referral_banner_whatsapp_click'];
    for (const [tipo] of track.mock.calls) {
      expect(permitidos).toContain(tipo);
    }
  });

  it('nunca manda el nombre ni el teléfono como propiedad', () => {
    // `nombre` y `phone_value` están en FORBIDDEN_PROPERTIES del backend: si se
    // colaran, `is_valid_event` descartaría el evento ENTERO y la franja
    // quedaría sin medición, con 200 OK y cero filas. El número tampoco puede
    // viajar escondido dentro de la `whatsapp_url`.
    render(<ReferralBanner data={COMPLETO} landingSlug="upn" />);
    fireEvent.click(screen.getByTestId('referral-banner'));
    for (const [, props] of track.mock.calls) {
      const claves = Object.keys(props ?? {});
      expect(claves).not.toContain('nombre');
      expect(claves).not.toContain('name_value');
      expect(claves).not.toContain('phone_value');
      expect(claves).not.toContain('value');
      const valores = JSON.stringify(props ?? {});
      expect(valores).not.toContain('Marco');
      expect(valores).not.toContain('999888777');
      expect(valores).not.toContain('wa.me');
    }
  });
});
