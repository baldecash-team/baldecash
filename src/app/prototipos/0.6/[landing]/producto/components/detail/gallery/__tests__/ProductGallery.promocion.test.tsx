/// <reference types="jest" />
/**
 * BAL-3922: la página de producto pinta el sello de la promoción.
 *
 * El backend YA manda `product.promotion` en el detalle público (verificado
 * contra prod el 16-sep-2026 sobre `renueva-tu-equipo-2 /
 * tablet-legion-tbleal0001254-combo-181`), pero el front lo descartaba: el
 * campo no existía en `ProductDetail`, el mapper no lo leía y la página no lo
 * dibujaba. El catálogo sí lo pinta (ProductCard), así que el mismo producto
 * llevaba sello en la grilla y ninguno en su detalle.
 *
 * Este test MONTA el componente que dibuja el sello. Probar solo el mapper
 * dejaría pasar un cambio que llega al tipo y nunca al render — ese es
 * exactamente el agujero por el que se coló el bug.
 */
import { render, screen } from '@testing-library/react';
import { ProductGallery } from '../ProductGallery';
import type { ProductImage, ProductPromotion } from '../../../../types/detail';

const imagenes: ProductImage[] = [
  { id: '1', url: 'https://s3/x/tablet.webp', alt: 'Tablet', type: 'main' },
];

/**
 * La promoción tal como la deja el mapper a partir de la respuesta real de
 * prod (snake_case en el wire → camelCase en el dominio).
 */
function promocionDePrueba(overrides: Partial<ProductPromotion> = {}): ProductPromotion {
  return {
    id: 24,
    name: 'PRECIO EXCLUSIVO',
    code: 'PRECIO-EXCLUSIVO',
    discountType: 'percentage',
    discountValue: 30,
    validUntil: null,
    template: {
      code: 'PRECIO-EXCLUSIVO',
      bannerText: '¡PRECIO EXCLUSIVO!',
      bannerStyle: 'top_bar',
      borderColor: '#4654CD',
      bannerBgColor: '#4654CD',
      bannerTextColor: '#FFFFFF',
      bannerIcon: 'star',
      ctaText: '¡Lo quiero!',
      ctaStyle: 'golden',
      showSpecs: false,
      showLinks: true,
    },
    ...overrides,
  };
}

describe('ProductGallery — sello de promoción (BAL-3922)', () => {
  it('con promoción pinta el texto de la plantilla, tal cual lo manda el backend', () => {
    render(
      <ProductGallery
        images={imagenes}
        productName="Tablet Legion"
        displayName="Tablet Legion Y700"
        brand="Lenovo"
        promotion={promocionDePrueba()}
      />,
    );

    // El texto del sello es el `banner_text` de la plantilla, el MISMO que
    // muestra la card del catálogo. No un texto inventado por el front.
    expect(screen.getByText('¡PRECIO EXCLUSIVO!')).toBeInTheDocument();
  });

  it('usa los colores de la plantilla, no unos fijos del componente', () => {
    render(
      <ProductGallery
        images={imagenes}
        productName="Tablet Legion"
        displayName="Tablet Legion Y700"
        promotion={promocionDePrueba()}
      />,
    );

    const sello = screen.getByTestId('detail-promo-banner');
    // jsdom normaliza los hex a rgb()
    expect(sello).toHaveStyle({ backgroundColor: 'rgb(70, 84, 205)' });
    expect(sello).toHaveStyle({ color: 'rgb(255, 255, 255)' });
  });

  it('sin promoción no aparece ningún sello (la página se ve igual que hoy)', () => {
    render(
      <ProductGallery
        images={imagenes}
        productName="Tablet Legion"
        displayName="Tablet Legion Y700"
      />,
    );

    expect(screen.queryByTestId('detail-promo-banner')).not.toBeInTheDocument();
    expect(screen.queryByText('¡PRECIO EXCLUSIVO!')).not.toBeInTheDocument();
  });

  it('con `template` en null no revienta y tampoco pinta sello', () => {
    render(
      <ProductGallery
        images={imagenes}
        productName="Tablet Legion"
        displayName="Tablet Legion Y700"
        promotion={promocionDePrueba({ template: null })}
      />,
    );

    // Sin plantilla no hay texto, color ni ícono que pintar: el sello se calla
    // en vez de dibujar una barra vacía.
    expect(screen.queryByTestId('detail-promo-banner')).not.toBeInTheDocument();
    // Y el resto de la ficha sigue en pie.
    expect(screen.getByText('Tablet Legion Y700')).toBeInTheDocument();
  });
});
