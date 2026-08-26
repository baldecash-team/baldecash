/**
 * BAL-3340 end-to-end del mapeo: datos REALES del API local (landing
 * reacondicionados, IdeaPad Slim 3) atravesando el parser y la card.
 *
 * No mockea el shape a mano: usa la respuesta literal del backend ya arreglado,
 * que es lo que distingue este test de los unitarios.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCard } from '@/app/prototipos/0.6/[landing]/catalogo/components/catalog/cards/ProductCard';
import type { CatalogProduct } from '@/app/prototipos/0.6/[landing]/catalogo/types/catalog';

jest.mock('@nextui-org/react', () => ({
  Card: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardBody: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Button: ({ children, onPress }: any) => <button onClick={onPress}>{children}</button>,
}));
jest.mock('framer-motion', () => ({
  motion: new Proxy({}, { get: () => {
    const S = React.forwardRef<HTMLDivElement, any>(({ children, ...p }, ref) => <div ref={ref} {...p}>{children}</div>);
    S.displayName = 'M'; return S;
  }}),
}));
jest.mock('lucide-react', () => new Proxy({}, { get: () => (p: any) => <svg {...p} /> }));
jest.mock('next/link', () => ({ __esModule: true, default: ({ children }: React.PropsWithChildren) => <a>{children}</a> }));
jest.mock('@/app/prototipos/0.6/[landing]/catalogo/components/catalog/ImageGallery', () => ({ ImageGallery: () => null }));
jest.mock('@/app/prototipos/0.6/[landing]/catalogo/components/catalog/RibbonLabel', () => ({ RibbonLabel: () => null }));
jest.mock('@/app/prototipos/0.6/[landing]/catalogo/components/catalog/color-selector', () => ({ ColorSelector: () => null }));
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

// Copiado literal de la respuesta del backend local (puerto 8420).
const DEL_API = [
  { grade: 'A', productId: 515,  slug: 'ideapad-slim-3-15irh8-i7-lple0000817', name: 'IdeaPad Slim 3 15IRH8 i7', price: 2296, lowestQuota: 174, minTermQuota: 461, isAvailable: true },
  { grade: 'B', productId: 1569, slug: 'ideapad-slim-3-15irh8-i7-reacondicionada-grado-b-1171', name: 'IdeaPad Slim 3 15IRH8 i7 (Reacondicionada Grado B)', price: 1607, lowestQuota: 125, minTermQuota: 326, isAvailable: false },
  { grade: 'C', productId: 1570, slug: 'ideapad-slim-3-15irh8-i7-reacondicionada-grado-c-1172', name: 'IdeaPad Slim 3 15IRH8 i7 (Reacondicionada Grado C)', price: 1148, lowestQuota: 93,  minTermQuota: 236, isAvailable: true },
];

const producto = () => ({
  id: '515', slug: 'ideapad-slim-3-15irh8-i7-lple0000817',
  name: 'IdeaPad Slim 3', displayName: 'Lenovo IdeaPad Slim 3 15IRH8 i7',
  brand: 'Lenovo', thumbnail: 't.webp', images: ['t.webp'], colors: [],
  price: 2296, quotaMonthly: 174, quotaBiweekly: 0, quotaWeekly: 0,
  maxTermMonths: 24, gama: 'media', condition: 'reacondicionado',
  conditionCode: 'reacondicionada', stock: 'available', stockQuantity: 1,
  usage: ['estudios'], isFeatured: false, isNew: false, tags: [],
  specs: { processor: { model: 'Intel Core i7' } },
  createdAt: '2026-01-01T00:00:00Z',
  grade: 'A',
  gradeSiblings: DEL_API,
} as unknown as CatalogProduct);

describe('BAL-3340 — datos reales del API atraviesan la card', () => {
  it('la cuota mostrada cambia al elegir otro grado', async () => {
    const user = userEvent.setup();
    render(<ProductCard product={producto()} compact />);

    // Arranca en el grado del producto de la card (A, id 515): S/174.
    expect(screen.getByText(/174/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Grado C' }));

    // La cuota del grado C es 93, NO 174 ni 236 (esa es la del plazo corto).
    expect(screen.getByText(/93/)).toBeInTheDocument();
    expect(screen.queryByText(/174/)).toBeNull();
    expect(screen.queryByText(/236/)).toBeNull();
  });

  it('el CTA emite el producto y precio del grado elegido', async () => {
    const user = userEvent.setup();
    const onAddToCart = jest.fn();
    render(<ProductCard product={producto()} compact onAddToCart={onAddToCart} />);

    await user.click(screen.getByRole('button', { name: 'Grado C' }));
    await user.click(screen.getByRole('button', { name: /lo quiero/i }));

    const item = onAddToCart.mock.calls[0][0];
    expect(item.productId).toBe('1570');
    expect(item.slug).toBe('ideapad-slim-3-15irh8-i7-reacondicionada-grado-c-1172');
    expect(item.price).toBe(1148);
  });

  it('el grado agotado del API llega deshabilitado', () => {
    render(<ProductCard product={producto()} compact />);
    expect(screen.getByRole('button', { name: 'Grado B' })).toBeDisabled();
  });

  // Lo que se veia en pantalla: la pill en C, la cuota en S/93 y el titulo y el
  // badge todavia nombrando el grado A. La misma card afirmando dos grados.
  it('el titulo y el badge nombran el grado elegido', async () => {
    const user = userEvent.setup();
    render(<ProductCard product={producto()} compact />);

    expect(screen.getByText(/Grado A/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Grado C' }));

    // El nombre sale de BD, con su "(Reacondicionada Grado C)".
    expect(screen.getByText(/\(Reacondicionada Grado C\)/)).toBeInTheDocument();
    // Y el badge deja de decir "Grado A".
    expect(screen.queryByText(/Grado A/)).toBeNull();
  });

  // Sin `name` del backend (backend viejo) el titulo cae al del padre en vez de
  // quedar vacio: el campo es nuevo y puede no venir.
  it('sin name del hermano conserva el titulo de la card', async () => {
    const user = userEvent.setup();
    const sinNombre = { ...producto(), gradeSiblings: DEL_API.map(({ name, ...g }) => g) } as any;
    render(<ProductCard product={sinNombre} compact />);

    await user.click(screen.getByRole('button', { name: 'Grado C' }));

    expect(screen.getByText(/Lenovo IdeaPad Slim 3 15IRH8 i7/)).toBeInTheDocument();
  });
});
