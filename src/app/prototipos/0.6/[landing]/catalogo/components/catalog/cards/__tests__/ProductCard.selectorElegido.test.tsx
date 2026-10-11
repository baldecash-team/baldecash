/**
 * BAL-4561 — la franja de la card obedece lo que se eligió en el Universo.
 *
 * El caso principal es el del ticket: Dell Latitude 7420 Grado A, color
 * Negro, sin grupo. Hoy la card pinta la pastilla «A» y ningún color. Con
 * «color» tiene que pintar el color; el grado sigue en la etiqueta de la foto.
 * Sin elección, o con una que no se puede pintar, todo sigue como hoy.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/app/prototipos/0.6/[landing]/catalogo/components/catalog/cards/ProductCard';
import type { CatalogProduct } from '@/app/prototipos/0.6/[landing]/catalogo/types/catalog';

jest.mock('@nextui-org/react', () => ({
  Card: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardBody: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Button: ({ children, onPress }: React.PropsWithChildren<{ onPress?: () => void }>) => <button onClick={onPress}>{children}</button>,
}));
jest.mock('framer-motion', () => ({
  motion: new Proxy({}, { get: () => {
    const S = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ children, ...p }, ref) => <div ref={ref} {...p}>{children}</div>);
    S.displayName = 'M'; return S;
  }}),
}));
jest.mock('lucide-react', () => new Proxy({}, { get: () => (p: React.SVGProps<SVGSVGElement>) => <svg {...p} /> }));
jest.mock('next/link', () => ({ __esModule: true, default: ({ children }: React.PropsWithChildren) => <a>{children}</a> }));
jest.mock('@/app/prototipos/0.6/[landing]/catalogo/components/catalog/ImageGallery', () => ({ ImageGallery: () => null }));
jest.mock('@/app/prototipos/0.6/[landing]/catalogo/components/catalog/RibbonLabel', () => ({ RibbonLabel: () => null }));
// El selector de colores dice qué colores recibió: es lo que el test mira.
jest.mock('@/app/prototipos/0.6/[landing]/catalogo/components/catalog/color-selector', () => ({
  ColorSelector: ({ colors }: { colors: { name: string }[] }) => (
    <div data-testid="card-colors">{colors.map((c) => c.name).join(',')}</div>
  ),
}));
jest.mock('@/app/prototipos/0.6/components/NvidiaBadge', () => ({ NvidiaBadge: () => null }));
jest.mock('@/app/prototipos/0.6/components/DeferredDeliveryModal', () => ({ DeferredDeliveryModal: () => null }));
jest.mock('@/app/prototipos/0.6/analytics/useAnalytics', () => ({ useAnalytics: () => ({ trackPromoCardClick: jest.fn() }) }));
jest.mock('@/app/prototipos/0.6/[landing]/catalogo/components/catalog/ConditionBadge', () => ({ ConditionBadge: () => null }));
jest.mock('@/app/prototipos/0.6/[landing]/catalogo/components/catalog/ProductTags', () => ({ ProductTags: () => null }));

beforeAll(() => {
  window.matchMedia = window.matchMedia || ((q: string) => ({
    matches: false, media: q, onchange: null,
    addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
  } as unknown as MediaQueryList));
});

const color = (id: string, name: string) => ({
  id, name, hex: '#000000', images: [],
  productId: id, slug: `dell-${name.toLowerCase()}`,
});

// La forma del producto 1706 tal como lo deja el mapeo del listado: un solo
// color (el de su variante), grado A y sin hermanos de ningún tipo. El nombre
// de venta va sin «Grado A» para que el único «Grado A» en pantalla sea la
// etiqueta de la foto.
const dell = (extra: Record<string, unknown> = {}) => ({
  id: '1706', slug: 'dell-latitude-7420-1245-combo-186',
  name: 'Dell Latitude 7420', displayName: 'Dell Latitude 7420 i7 16GB 512GB',
  brand: 'Dell', thumbnail: 't.webp', images: ['t.webp'],
  colors: [color('1706', 'Negro')],
  price: 2000, quotaMonthly: 150, quotaBiweekly: 0, quotaWeekly: 0,
  maxTermMonths: 24, gama: 'media', condition: 'reacondicionado',
  conditionCode: 'reacondicionada', stock: 'available', stockQuantity: 1,
  usage: ['estudios'], isFeatured: false, isNew: false, tags: [],
  specs: { processor: { model: 'Intel Core i7' } },
  createdAt: '2026-01-01T00:00:00Z',
  grade: 'A',
  gradeSiblings: [],
  ...extra,
} as unknown as CatalogProduct);

const pastillaA = () => screen.queryByRole('button', { name: 'Grado A' });
const colores = () => screen.queryByTestId('card-colors');

describe('BAL-4561 — la card normal (Home y el resto)', () => {
  it('sin elección sigue como hoy: pinta el grado y no el color', () => {
    render(<ProductCard product={dell()} hideColors={false} />);
    expect(pastillaA()).toBeInTheDocument();
    expect(colores()).toBeNull();
  });

  it('con «color» pinta el color aunque el equipo tenga grado', () => {
    render(<ProductCard product={dell({ selectorPreference: 'color' })} hideColors={false} />);
    expect(colores()).toHaveTextContent('Negro');
    expect(pastillaA()).toBeNull();
  });

  it('con «color» el grado se sigue viendo en la etiqueta de la foto', () => {
    render(<ProductCard product={dell({ selectorPreference: 'color' })} hideColors={false} />);
    expect(screen.getByText(/Grado A/)).toBeInTheDocument();
  });

  it('«color» sin ningún color cargado cae a la regla de hoy', () => {
    render(<ProductCard product={dell({ selectorPreference: 'color', colors: [] })} />);
    expect(pastillaA()).toBeInTheDocument();
    expect(colores()).toBeNull();
  });

  // Si el dato llegara mal (no pasó por el mapeo), la card no lo obedece.
  it('un valor que no es «color» se ignora: sigue pintando el grado', () => {
    render(<ProductCard product={dell({ selectorPreference: 'grado' })} hideColors={false} />);
    expect(pastillaA()).toBeInTheDocument();
    expect(colores()).toBeNull();
  });

  it('un grupo de un grado y dos colores, con «color», ofrece los dos colores', () => {
    const grupo = dell({
      selectorPreference: 'color',
      colors: [color('1706', 'Negro'), color('1707', 'Plata')],
    });
    render(<ProductCard product={grupo} hideColors={false} />);
    expect(colores()).toHaveTextContent('Negro,Plata');
    expect(pastillaA()).toBeNull();
  });

  // La pestaña de catálogo de la oferta apaga los colores a propósito.
  it('donde los colores están apagados, «color» no los prende', () => {
    render(<ProductCard product={dell({ selectorPreference: 'color' })} hideColors />);
    expect(colores()).toBeNull();
    expect(pastillaA()).toBeInTheDocument();
  });

  it('un equipo sin grado sigue mostrando su color, con o sin elección', () => {
    const { unmount } = render(<ProductCard product={dell({ grade: undefined })} hideColors={false} />);
    expect(colores()).toHaveTextContent('Negro');
    unmount();
    render(<ProductCard product={dell({ grade: undefined, selectorPreference: 'color' })} hideColors={false} />);
    expect(colores()).toHaveTextContent('Negro');
    expect(screen.queryByTestId('card-grades')).toBeNull();
  });
});

describe('BAL-4561 — la card compacta (landing de reacondicionados)', () => {
  it('sin elección sigue como hoy: el grado gana', () => {
    render(<ProductCard product={dell()} compact />);
    expect(pastillaA()).toBeInTheDocument();
    expect(colores()).toBeNull();
  });

  // Sin elección la compacta pide 2 colores. Con «color» elegido, desde uno.
  it('con «color» pinta el color aunque sea uno solo, dentro de la franja', () => {
    render(<ProductCard product={dell({ selectorPreference: 'color' })} compact />);
    const franja = screen.getByTestId('card-selector-slot');
    expect(franja).toContainElement(screen.getByTestId('card-colors'));
    expect(pastillaA()).toBeNull();
  });

  it('la franja se dibuja siempre, aunque quede vacía', () => {
    render(<ProductCard product={dell({ grade: undefined, colors: [] })} compact />);
    expect(screen.getByTestId('card-selector-slot')).toBeEmptyDOMElement();
  });
});
