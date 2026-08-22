/**
 * Franja de referido — casuística visible y su instrumentación.
 *
 * Los casos negativos (sin promotor, código inexistente, promotora inactiva,
 * token que no coincide) no llegan hasta acá: se resuelven server-side y el
 * componente ni se monta. Lo que se prueba en este archivo son las DOS formas en
 * que la franja sí se muestra —completa y con el nombre pero sin botón— y que
 * cada una emita el evento con las propiedades que las distinguen.
 */
import { fireEvent, render, screen } from '@testing-library/react';

import { ReferralBanner } from '../ReferralBanner';
import type { ReferralBanner as ReferralBannerData } from '../../../services/referralBannerApi';

const track = jest.fn();

jest.mock('../../../[landing]/solicitar/context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track, flush: jest.fn() }),
}));

const COMPLETO: ReferralBannerData = {
  firstName: 'Marco',
  phoneDisplay: '999 888 777',
  whatsappUrl: 'https://wa.me/51999888777?text=Hola%20Marco',
  promoterToken: '4a2eji',
  reason: 'ok',
};

const SIN_TELEFONO: ReferralBannerData = {
  ...COMPLETO,
  phoneDisplay: null,
  whatsappUrl: null,
  reason: 'sin_telefono',
};

beforeEach(() => {
  track.mockClear();
  window.sessionStorage.clear();
});

describe('ReferralBanner · qué se muestra', () => {
  it('muestra el primer nombre y el botón de WhatsApp', () => {
    render(<ReferralBanner data={COMPLETO} landingSlug="upn" />);
    expect(screen.getByText(/Has sido referido por/)).toBeInTheDocument();
    expect(screen.getAllByText('Marco').length).toBeGreaterThan(0);
    expect(screen.getByTestId('referral-banner-whatsapp')).toHaveAttribute(
      'href',
      COMPLETO.whatsappUrl,
    );
    expect(screen.getByText('999 888 777')).toBeInTheDocument();
  });

  it('sin teléfono usable muestra el nombre y NO arma el botón', () => {
    // Un `wa.me` sin destinatario válido abre WhatsApp en blanco: es peor que
    // no tener el botón.
    render(<ReferralBanner data={SIN_TELEFONO} landingSlug="upn" />);
    expect(screen.getAllByText('Marco').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('referral-banner-whatsapp')).not.toBeInTheDocument();
  });

  it('el link de WhatsApp abre en pestaña nueva y sin filtrar el referrer', () => {
    render(<ReferralBanner data={COMPLETO} landingSlug="upn" />);
    const link = screen.getByTestId('referral-banner-whatsapp');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });
});

describe('ReferralBanner · descarte', () => {
  it('la × oculta la franja y lo recuerda en sessionStorage', () => {
    render(<ReferralBanner data={COMPLETO} landingSlug="upn" />);
    fireEvent.click(screen.getByTestId('referral-banner-dismiss'));
    expect(screen.queryByTestId('referral-banner')).not.toBeInTheDocument();
    expect(
      window.sessionStorage.getItem('baldecash-referral-banner-dismissed-4a2eji'),
    ).toBe('1');
  });

  it('no se vuelve a mostrar en la misma sesión con la misma promotora', () => {
    window.sessionStorage.setItem('baldecash-referral-banner-dismissed-4a2eji', '1');
    render(<ReferralBanner data={COMPLETO} landingSlug="upn" />);
    expect(screen.queryByTestId('referral-banner')).not.toBeInTheDocument();
  });

  it('SÍ se muestra si el link es de otra promotora', () => {
    // El descarte es por promotora a propósito: dos flyers distintos en la
    // misma sesión son dos avisos distintos.
    window.sessionStorage.setItem('baldecash-referral-banner-dismissed-4a2eji', '1');
    render(
      <ReferralBanner data={{ ...COMPLETO, promoterToken: 'zzz999' }} landingSlug="upn" />,
    );
    expect(screen.getByTestId('referral-banner')).toBeInTheDocument();
  });

  it('sobrevive a un sessionStorage que tira', () => {
    // Pasa en el WebView de algunas apps y en modo privado de WebKit.
    const spy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage disabled');
    });
    expect(() => render(<ReferralBanner data={COMPLETO} landingSlug="upn" />)).not.toThrow();
    expect(screen.getByTestId('referral-banner')).toBeInTheDocument();
    spy.mockRestore();
  });
});

describe('ReferralBanner · eventos', () => {
  it('emite la impresión con las propiedades que separan los dos casos', () => {
    render(<ReferralBanner data={COMPLETO} landingSlug="upn" />);
    expect(track).toHaveBeenCalledWith('referral_banner_shown', {
      promoter_token: '4a2eji',
      landing_slug: 'upn',
      reason: 'ok',
      has_whatsapp: true,
    });
  });

  it('la impresión sin botón se distingue por has_whatsapp', () => {
    // Sin esta distinción, un click-through bajo se lee como "el copy no
    // funciona" cuando la mitad de las impresiones no tenían botón que clickear.
    render(<ReferralBanner data={SIN_TELEFONO} landingSlug="upn" />);
    expect(track).toHaveBeenCalledWith('referral_banner_shown', {
      promoter_token: '4a2eji',
      landing_slug: 'upn',
      reason: 'sin_telefono',
      has_whatsapp: false,
    });
  });

  it('NO emite impresión si la franja venía descartada', () => {
    window.sessionStorage.setItem('baldecash-referral-banner-dismissed-4a2eji', '1');
    render(<ReferralBanner data={COMPLETO} landingSlug="upn" />);
    expect(track).not.toHaveBeenCalledWith(
      'referral_banner_shown',
      expect.anything(),
    );
  });

  it('emite una sola impresión aunque el componente se re-renderice', () => {
    const { rerender } = render(<ReferralBanner data={COMPLETO} landingSlug="upn" />);
    rerender(<ReferralBanner data={COMPLETO} landingSlug="upn" />);
    const impresiones = track.mock.calls.filter((c) => c[0] === 'referral_banner_shown');
    expect(impresiones).toHaveLength(1);
  });

  it('emite el click de WhatsApp y el descarte', () => {
    render(<ReferralBanner data={COMPLETO} landingSlug="upn" />);
    fireEvent.click(screen.getByTestId('referral-banner-whatsapp'));
    expect(track).toHaveBeenCalledWith('referral_banner_whatsapp_click', {
      promoter_token: '4a2eji',
      landing_slug: 'upn',
    });

    fireEvent.click(screen.getByTestId('referral-banner-dismiss'));
    expect(track).toHaveBeenCalledWith('referral_banner_dismiss', {
      promoter_token: '4a2eji',
      landing_slug: 'upn',
      has_whatsapp: true,
    });
  });

  it('nunca manda el nombre ni el teléfono como propiedad', () => {
    // `nombre` y `phone_value` estan en FORBIDDEN_PROPERTIES del backend: si se
    // colaran, `is_valid_event` descartaria el evento ENTERO y el banner
    // quedaria sin medicion, con 200 OK y cero filas.
    render(<ReferralBanner data={COMPLETO} landingSlug="upn" />);
    fireEvent.click(screen.getByTestId('referral-banner-whatsapp'));
    for (const [, props] of track.mock.calls) {
      const claves = Object.keys(props ?? {});
      expect(claves).not.toContain('nombre');
      expect(claves).not.toContain('promoter_code');
      expect(claves).not.toContain('name');
      expect(claves).not.toContain('phone_value');
      const valores = JSON.stringify(props ?? {});
      expect(valores).not.toContain('Marco');
      expect(valores).not.toContain('999 888 777');
    }
  });
});
