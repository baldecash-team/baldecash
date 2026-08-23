import { render, screen } from '@testing-library/react';
import { SeminuevosWhatsapp } from '../SeminuevosWhatsapp';
import { SeminuevosAbout } from '../SeminuevosAbout';

/**
 * Regresión: la landing seminuevos tiene DOS links cuyo aria-label contiene
 * la palabra "WhatsApp" — el botón flotante (SeminuevosWhatsapp, aria-label
 * "Escríbenos por WhatsApp") y el ícono de redes de "Sobre nosotros"
 * (SeminuevosAbout, aria-label "WhatsApp: <número>", siempre apunta al
 * número fijo de data/seminuevosData.ts, no a la URL de BD).
 *
 * Un selector por substring (`[aria-label*="WhatsApp"]` / queries no
 * exactas) matchea el del "Sobre nosotros" primero porque aparece antes en
 * el DOM, y hace parecer que el botón flotante no recibió la URL de BD
 * cuando en realidad sí la recibió. `data-testid="floating-whatsapp"` es el
 * selector no ambiguo para apuntar siempre al botón flotante.
 */
describe('SeminuevosWhatsapp - selector no ambiguo con el ícono de Sobre nosotros', () => {
  it('el botón flotante usa la URL de BD y es distinguible del ícono de redes por data-testid', () => {
    render(
      <>
        <SeminuevosAbout />
        <SeminuevosWhatsapp href="https://wa.link/qqmbg0" />
      </>
    );

    // Ambos existen y ambos matchean un selector por substring de aria-label.
    const porSubstring = screen.getAllByRole('link', { name: /WhatsApp/i });
    expect(porSubstring.length).toBeGreaterThan(1);

    // El testid apunta sin ambigüedad al botón flotante con la URL de BD.
    const floating = screen.getByTestId('floating-whatsapp');
    expect(floating).toHaveAttribute('href', 'https://wa.link/qqmbg0');
    expect(floating).toHaveAttribute('aria-label', 'Escríbenos por WhatsApp');

    // El ícono de "Sobre nosotros" sigue siendo el número fijo, no la URL de BD.
    // about-social se repite (instagram/facebook/tiktok/whatsapp); filtramos el de WhatsApp.
    const aboutWhatsapp = screen
      .getAllByTestId('about-social')
      .find((el) => el.getAttribute('aria-label')?.startsWith('WhatsApp:'));
    expect(aboutWhatsapp).toBeDefined();
    expect(aboutWhatsapp).toHaveAttribute('href', 'https://wa.me/51958823053');
    expect(aboutWhatsapp).not.toHaveAttribute('href', 'https://wa.link/qqmbg0');
  });

  it('sin href de BD, el botón flotante cae a su propio fallback (no al del ícono de redes)', () => {
    render(<SeminuevosWhatsapp />);
    const floating = screen.getByTestId('floating-whatsapp');
    expect(floating).toHaveAttribute('href', 'https://wa.me/51958823053');
  });
});
