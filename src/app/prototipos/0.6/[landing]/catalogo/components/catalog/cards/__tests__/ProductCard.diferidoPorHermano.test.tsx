/**
 * El diferido se reevalúa por HERMANO, no una sola vez con el producto de la card.
 *
 * Caso real (`copia-home`, familia del Advance Notebook CN4058): el grado B
 * (1566) tiene `landing_product.is_deferred_delivery = 1` y el Semi Nuevo (558)
 * y el grado C (1567) no —los tres con el flag global del producto en 0—. Antes
 * la card resolvía el aviso con `product.deferredDelivery` y no lo tocaba al
 * cambiar de grado: quien elegía el C veía el modal de espera igual, y creía
 * que el diferido aplicaba a todos.
 *
 * Los chips de grado sólo se pintan en `compact`, así que los tests de grado
 * montan la card en ese modo.
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
jest.mock('@/app/prototipos/0.6/components/NvidiaBadge', () => ({ NvidiaBadge: () => null }));
jest.mock('@/app/prototipos/0.6/analytics/useAnalytics', () => ({ useAnalytics: () => ({ trackPromoCardClick: jest.fn() }) }));
jest.mock('@/app/prototipos/0.6/[landing]/catalogo/components/catalog/ConditionBadge', () => ({ ConditionBadge: () => null }));
jest.mock('@/app/prototipos/0.6/[landing]/catalogo/components/catalog/ProductTags', () => ({ ProductTags: () => null }));

// El selector de color real necesita interacción; lo reemplazamos por botones
// planos que llaman al mismo `onColorSelect` que usa la card.
jest.mock('@/app/prototipos/0.6/[landing]/catalogo/components/catalog/color-selector', () => ({
  ColorSelector: ({ colors, onColorSelect }: any) => (
    <div>
      {colors?.map((c: any) => (
        <button key={c.id} onClick={() => onColorSelect?.(c.id)}>{`color-${c.name}`}</button>
      ))}
    </div>
  ),
}));

// El modal se espía en vez de renderizarse: lo que se afirma es si la card lo
// abre y con qué ventana de fechas, no su markup.
const modalSpy = jest.fn();
jest.mock('@/app/prototipos/0.6/components/DeferredDeliveryModal', () => ({
  DeferredDeliveryModal: (props: any) => {
    modalSpy(props);
    return null;
  },
}));

beforeAll(() => {
  window.matchMedia = window.matchMedia || ((q: string) => ({
    matches: false, media: q, onchange: null,
    addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
  } as unknown as MediaQueryList));
});

beforeEach(() => modalSpy.mockClear());

/** Última prop `deferredDelivery` con la que se renderizó el modal. */
const ultimaVentana = () => modalSpy.mock.calls.at(-1)?.[0]?.deferredDelivery;
/** ¿El modal está abierto en el último render? */
const modalAbierto = () => modalSpy.mock.calls.at(-1)?.[0]?.isOpen === true;

const VENTANA = {
  isDeferred: true,
  estimatedFrom: '2026-10-15',
  limaDaysMin: 2, limaDaysMax: 4,
  provinciaDaysMin: 5, provinciaDaysMax: 8,
};

const base = () => ({
  id: '1566', slug: 'advance-cn4058-grado-b',
  name: 'Advance Notebook CN4058', displayName: 'Advance Notebook CN4058 2 en 1',
  brand: 'Advance', thumbnail: 't.webp', images: ['t.webp'], colors: [],
  price: 899, quotaMonthly: 70, quotaBiweekly: 0, quotaWeekly: 0,
  maxTermMonths: 24, gama: 'entrada', condition: 'reacondicionado',
  conditionCode: 'reacondicionada', stock: 'available', stockQuantity: 1,
  usage: ['estudios'], isFeatured: false, isNew: false, tags: [],
  specs: { processor: { model: 'Intel Celeron' } },
  createdAt: '2026-01-01T00:00:00Z',
} as unknown as CatalogProduct);

// La card llega parada en el grado B (1566), el diferido de la familia.
const conGrados = (overrides: Partial<Record<string, unknown>> = {}) => ({
  ...base(),
  grade: 'B',
  deferredDelivery: VENTANA,
  gradeSiblings: [
    { grade: 'B', productId: 1566, slug: 'advance-cn4058-grado-b', name: 'Advance CN4058 (Grado B)', price: 899, lowestQuota: 70, minTermQuota: 180, isAvailable: true, isDeferredDelivery: true },
    { grade: 'C', productId: 1567, slug: 'advance-cn4058-grado-c', name: 'Advance CN4058 (Grado C)', price: 749, lowestQuota: 58, minTermQuota: 150, isAvailable: true, isDeferredDelivery: false },
  ],
  ...overrides,
} as unknown as CatalogProduct);

describe('entrega diferida por hermano de GRADO', () => {
  it('el grado diferido abre el aviso y el NO diferido va directo al carrito', async () => {
    const user = userEvent.setup();
    const onAddToCart = jest.fn();
    render(<ProductCard product={conGrados()} compact onAddToCart={onAddToCart} />);

    // Grado B (el de la card): diferido -> modal, sin agregar todavía.
    await user.click(screen.getByRole('button', { name: /lo quiero/i }));
    expect(modalAbierto()).toBe(true);
    expect(onAddToCart).not.toHaveBeenCalled();

    // Grado C: NO diferido -> al carrito directo, sin aviso.
    await user.click(screen.getByRole('button', { name: 'Grado C' }));
    await user.click(screen.getByRole('button', { name: /lo quiero/i }));
    expect(onAddToCart).toHaveBeenCalledTimes(1);
    expect(onAddToCart.mock.calls[0][0].productId).toBe('1567');
  });

  it('al volver al grado diferido el aviso reaparece', async () => {
    const user = userEvent.setup();
    const onAddToCart = jest.fn();
    render(<ProductCard product={conGrados()} compact onAddToCart={onAddToCart} />);

    await user.click(screen.getByRole('button', { name: 'Grado C' }));
    await user.click(screen.getByRole('button', { name: 'Grado B' }));
    await user.click(screen.getByRole('button', { name: /lo quiero/i }));

    expect(modalAbierto()).toBe(true);
    expect(onAddToCart).not.toHaveBeenCalled();
  });

  it('el hermano NO diferido no recibe la ventana de fechas de la card', async () => {
    const user = userEvent.setup();
    render(<ProductCard product={conGrados()} compact onAddToCart={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Grado C' }));

    // Sin esto el modal seguiría cargado con la fecha del grado B.
    expect(ultimaVentana()).toBeUndefined();
  });

  it('el hermano diferido reusa la ventana de fechas de la card', async () => {
    render(<ProductCard product={conGrados()} compact onAddToCart={jest.fn()} />);

    // Decisión tomada: el hermano trae sólo el booleano; las fechas salen de la card.
    expect(ultimaVentana()).toEqual(VENTANA);
  });

  it('no-rotura: si TODOS los grados son diferidos el aviso se mantiene', async () => {
    const user = userEvent.setup();
    const onAddToCart = jest.fn();
    const todos = conGrados({
      gradeSiblings: [
        { grade: 'B', productId: 1566, slug: 'b', name: 'B', price: 899, lowestQuota: 70, minTermQuota: 180, isAvailable: true, isDeferredDelivery: true },
        { grade: 'C', productId: 1567, slug: 'c', name: 'C', price: 749, lowestQuota: 58, minTermQuota: 150, isAvailable: true, isDeferredDelivery: true },
      ],
    });
    render(<ProductCard product={todos} compact onAddToCart={onAddToCart} />);

    await user.click(screen.getByRole('button', { name: 'Grado C' }));
    await user.click(screen.getByRole('button', { name: /lo quiero/i }));

    expect(modalAbierto()).toBe(true);
    expect(onAddToCart).not.toHaveBeenCalled();
  });

  it('backend viejo (sin el campo) cae al flag de la card, no a "no diferido"', async () => {
    const user = userEvent.setup();
    const onAddToCart = jest.fn();
    const viejo = conGrados({
      gradeSiblings: [
        { grade: 'B', productId: 1566, slug: 'b', name: 'B', price: 899, lowestQuota: 70, minTermQuota: 180, isAvailable: true },
        { grade: 'C', productId: 1567, slug: 'c', name: 'C', price: 749, lowestQuota: 58, minTermQuota: 150, isAvailable: true },
      ],
    });
    render(<ProductCard product={viejo} compact onAddToCart={onAddToCart} />);

    await user.click(screen.getByRole('button', { name: 'Grado C' }));
    await user.click(screen.getByRole('button', { name: /lo quiero/i }));

    // `undefined` no es `false`: sin el dato la única lectura segura es la card.
    expect(modalAbierto()).toBe(true);
    expect(onAddToCart).not.toHaveBeenCalled();
  });
});

describe('entrega diferida por hermano de COLOR', () => {
  const conColores = () => ({
    ...base(),
    id: '900',
    deferredDelivery: VENTANA,
    colors: [
      { id: '900', name: 'Negro', hex: '#000', productId: '900', slug: 'negro', displayName: 'Negro', price: 899, quotaMonthly: 70, isDeferredDelivery: true },
      { id: '901', name: 'Plata', hex: '#ccc', productId: '901', slug: 'plata', displayName: 'Plata', price: 899, quotaMonthly: 70, isDeferredDelivery: false },
    ],
  } as unknown as CatalogProduct);

  it('el color NO diferido va directo al carrito', async () => {
    const user = userEvent.setup();
    const onAddToCart = jest.fn();
    // `hideColors` viene en `true` por defecto: sin apagarlo el selector no se
    // pinta y no hay swatch que clickear.
    render(<ProductCard product={conColores()} hideColors={false} onAddToCart={onAddToCart} />);

    await user.click(screen.getByRole('button', { name: 'color-Plata' }));
    await user.click(screen.getByRole('button', { name: /lo quiero/i }));

    expect(onAddToCart).toHaveBeenCalledTimes(1);
    expect(onAddToCart.mock.calls[0][0].productId).toBe('901');
    expect(ultimaVentana()).toBeUndefined();
  });

  it('el color diferido abre el aviso', async () => {
    const user = userEvent.setup();
    const onAddToCart = jest.fn();
    // `hideColors` viene en `true` por defecto: sin apagarlo el selector no se
    // pinta y no hay swatch que clickear.
    render(<ProductCard product={conColores()} hideColors={false} onAddToCart={onAddToCart} />);

    await user.click(screen.getByRole('button', { name: 'color-Negro' }));
    await user.click(screen.getByRole('button', { name: /lo quiero/i }));

    expect(modalAbierto()).toBe(true);
    expect(onAddToCart).not.toHaveBeenCalled();
  });
});

describe('no-rotura: card sin hermanos', () => {
  it('un producto diferido sin hermanos sigue mostrando el aviso', async () => {
    const user = userEvent.setup();
    const onAddToCart = jest.fn();
    render(<ProductCard product={{ ...base(), deferredDelivery: VENTANA } as CatalogProduct} onAddToCart={onAddToCart} />);

    await user.click(screen.getByRole('button', { name: /lo quiero/i }));

    expect(modalAbierto()).toBe(true);
    expect(ultimaVentana()).toEqual(VENTANA);
    expect(onAddToCart).not.toHaveBeenCalled();
  });

  it('un producto NO diferido sin hermanos va directo al carrito', async () => {
    const user = userEvent.setup();
    const onAddToCart = jest.fn();
    render(<ProductCard product={base()} onAddToCart={onAddToCart} />);

    await user.click(screen.getByRole('button', { name: /lo quiero/i }));

    expect(onAddToCart).toHaveBeenCalledTimes(1);
    expect(modalAbierto()).toBe(false);
  });
});
