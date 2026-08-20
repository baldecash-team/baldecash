/**
 * El color del chip lo manda la base (BAL-3212).
 *
 * `tagColors` traía colores fijos para 'oferta', 'destacado', etc. y ganaba
 * sobre el color del facet, así que cambiar `product_label.background_color`
 * movía la tarjeta (BAL-3204) pero dejaba el chip del filtro con el color viejo.
 * Ahora el color de la base manda y la tabla fija queda solo de respaldo.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { TagsFilter } from '../TagsFilter';
import { ProductTagType } from '../../../../types/catalog';

const mockParams: { landing: string } = { landing: 'home' };
jest.mock('next/navigation', () => ({
  useParams: () => mockParams,
}));

function renderFilter(overrides: Partial<React.ComponentProps<typeof TagsFilter>> = {}) {
  const onTagsChange = jest.fn();
  const utils = render(
    <TagsFilter
      tagOptions={[{ value: 'oferta', label: 'Oferta', count: 9, color: '#00BFB3' }]}
      selectedTags={[]}
      onTagsChange={onTagsChange}
      {...overrides}
    />,
  );
  return { ...utils, onTagsChange };
}

/** Devuelve el nodo del chip (el que lleva el estilo), a partir de su texto. */
function chipDe(texto: string): HTMLElement {
  const hoja = screen.getByText((_, node) => node?.textContent?.trim() === texto && !node.children.length);
  return hoja.parentElement as HTMLElement;
}

beforeEach(() => {
  mockParams.landing = 'home';
});

describe('TagsFilter — el color de la base manda sobre la tabla fija', () => {
  it('pinta "oferta" con el color del facet, no con el rojo hardcodeado', () => {
    renderFilter();
    const chip = chipDe('Oferta (9)');
    expect(chip).toHaveStyle({ color: '#00BFB3' });
  });

  it('también para una etiqueta hardcodeada como "destacado"', () => {
    renderFilter({
      tagOptions: [{ value: 'destacado', label: 'Destacado', count: 3, color: '#008F5D' }],
    });
    expect(chipDe('Destacado (3)')).toHaveStyle({ color: '#008F5D' });
  });

  it('el estado seleccionado usa el color de la base como fondo sólido con texto blanco', () => {
    renderFilter({ selectedTags: ['oferta' as ProductTagType] });
    const chip = chipDe('Oferta (9)');
    expect(chip).toHaveStyle({ backgroundColor: '#00BFB3', color: '#fff' });
  });

  it('sin color en la base cae al respaldo de la tabla fija', () => {
    renderFilter({
      tagOptions: [{ value: 'oferta', label: 'Oferta', count: 9 }],
    });
    // Sin color del facet no hay estilo inline: lo resuelven las clases de respaldo.
    expect(chipDe('Oferta (9)').getAttribute('style')).toBeNull();
  });

  it('en nvidia se conserva el gris forzado y se ignora el color de la base', () => {
    mockParams.landing = 'nvidia';
    renderFilter();
    // El gris de nvidia se aplica por clases, no por estilo inline.
    expect(chipDe('Oferta (9)').getAttribute('style')).toBeNull();
  });
});
