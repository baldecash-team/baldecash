import { render, screen } from '@testing-library/react';
import { SeminuevosWhatsapp } from '../SeminuevosWhatsapp';
import { SeminuevosAbout } from '../SeminuevosAbout';

/**
 * "Sobre nosotros" YA NO tiene chip de WhatsApp: se quitó de `about.redes` en
 * data/seminuevosData.ts, así que el único link con "WhatsApp" en el
 * aria-label es el botón flotante (aria-label "Escríbenos por WhatsApp").
 *
 * Se sigue usando `data-testid="floating-whatsapp"` para apuntarlo: es el
 * selector no ambiguo si mañana vuelve a haber otro link de WhatsApp en la
 * página. El número de "Sobre nosotros" ya no se testea porque ya no existe;
 * lo que sí se cuida es que no reaparezca por accidente.
 */
describe('SeminuevosWhatsapp - único link de WhatsApp de la página', () => {
  it('el botón flotante usa la URL de BD y es el único WhatsApp en el DOM', () => {
    render(
      <>
        <SeminuevosAbout />
        <SeminuevosWhatsapp href="https://wa.link/qqmbg0" />
      </>
    );

    // "Sobre nosotros" ya no aporta un link de WhatsApp: queda solo el flotante.
    const porSubstring = screen.getAllByRole('link', { name: /WhatsApp/i });
    expect(porSubstring).toHaveLength(1);

    // El testid apunta sin ambigüedad al botón flotante con la URL de BD.
    const floating = screen.getByTestId('floating-whatsapp');
    expect(floating).toHaveAttribute('href', 'https://wa.link/qqmbg0');
    expect(floating).toHaveAttribute('aria-label', 'Escríbenos por WhatsApp');

    // Ningún chip de redes vuelve a exponer el número fijo.
    const aboutWhatsapp = screen
      .getAllByTestId('about-social')
      .find((el) => el.getAttribute('aria-label')?.startsWith('WhatsApp:'));
    expect(aboutWhatsapp).toBeUndefined();
  });

  it('sin href de BD, el botón flotante cae a su propio fallback (no al del ícono de redes)', () => {
    render(<SeminuevosWhatsapp />);
    const floating = screen.getByTestId('floating-whatsapp');
    expect(floating).toHaveAttribute('href', 'https://wa.me/51958823053');
  });
});
