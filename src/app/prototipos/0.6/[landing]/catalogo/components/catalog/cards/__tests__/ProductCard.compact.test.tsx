import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCard } from '../ProductCard';
import type { CatalogProduct } from '../../../../types/catalog';

// ── Mocks ────────────────────────────────────────────────────────────────
// Mismos stubs que ProductCard.stateBadges.test.tsx (ese archivo no exporta
// nada, así que se replican en vez de importarse).

jest.mock('@nextui-org/react', () => ({
  Card: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardBody: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  // El Button de NextUI expone `onPress`, no `onClick`. El stub tiene que
  // reenviarlo o los tests del CTA miden un boton muerto y pasan sin ejercer
  // nada.
  Button: ({ children, onPress, onClick, isDisabled, ...rest }: React.PropsWithChildren<{
    onPress?: () => void;
    onClick?: () => void;
    isDisabled?: boolean;
  }>) => (
    <button
      disabled={isDisabled}
      onClick={() => { onPress?.(); onClick?.(); }}
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  ),
}));

jest.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: () => {
        const MotionStub = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
          ({ children, ...props }, ref) => <div ref={ref} {...props}>{children}</div>,
        );
        MotionStub.displayName = 'MotionStub';
        return MotionStub;
      },
    },
  ),
}));

jest.mock('lucide-react', () =>
  new Proxy({}, { get: () => (props: Record<string, unknown>) => <svg {...props} /> }),
);

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children }: React.PropsWithChildren) => <a>{children}</a>,
}));

jest.mock('../../ImageGallery', () => ({ ImageGallery: () => null }));
jest.mock('../../RibbonLabel', () => ({ RibbonLabel: () => null }));
jest.mock('../../color-selector', () => ({
  ColorSelector: () => <div data-testid="color-selector" />,
}));
jest.mock('@/app/prototipos/0.6/components/NvidiaBadge', () => ({ NvidiaBadge: () => null }));
jest.mock('@/app/prototipos/0.6/components/DeferredDeliveryModal', () => ({
  DeferredDeliveryModal: () => null,
}));
jest.mock('@/app/prototipos/0.6/analytics/useAnalytics', () => ({
  useAnalytics: () => ({ trackPromoCardClick: jest.fn() }),
}));
jest.mock('../../ConditionBadge', () => ({
  ConditionBadge: () => <span>Reacondicionado</span>,
}));
jest.mock('../../ProductTags', () => ({
  ProductTags: ({ tags }: { tags: string[] }) => <span>{tags.join(',')}</span>,
}));

beforeAll(() => {
  window.matchMedia = window.matchMedia || ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  } as unknown as MediaQueryList));
});

// ── Helpers ──────────────────────────────────────────────────────────────

function buildProduct(overrides: Partial<CatalogProduct> = {}): CatalogProduct {
  return {
    id: '1566',
    slug: 'advance-notebook-cn4058',
    name: 'Advance Notebook CN4058',
    displayName: 'Laptop Advance Notebook CN4058 2 en 1',
    brand: 'Advance',
    thumbnail: 'https://cdn.example.com/thumb.webp',
    images: ['https://cdn.example.com/thumb.webp'],
    colors: [],
    price: 402,
    quotaMonthly: 90,
    quotaBiweekly: 45,
    quotaWeekly: 22,
    maxTermMonths: 24,
    gama: 'economica',
    condition: 'reacondicionado',
    conditionCode: 'reacondicionada',
    conditionLabelText: 'Reacondicionado',
    conditionLabelColor: '#0099FF',
    stock: 'available',
    stockQuantity: 5,
    usage: ['estudios'],
    isFeatured: false,
    isNew: false,
    tags: [],
    specs: {
      processor: { model: 'Intel Celeron N4020' },
    },
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  } as unknown as CatalogProduct;
}

const color = (id: string) => ({ id, name: id, hex: '#000' });

// Datos reales de producción (copia-home, 25/08/2026): el Grado A existe a
// S/574 pero está agotado.
//
// El `productId` del grado B es el mismo que el de `buildProduct` a propósito:
// la card que trae el listado ES uno de los grados (acá el B), como en
// producción. Si no coincidieran, la card se comportaría como si siempre
// hubiera un grado ajeno elegido y los tests medirían un escenario que no
// existe.
// Dos cuotas por grado: `lowestQuota` es la del plazo mas largo —la que muestra
// la card, "Desde S/40/mes"— y `minTermQuota` la del mas corto, que usa el
// detalle. Leer la que no era hacia saltar el precio al elegir grado.
const GRADOS_ADVANCE = [
  { grade: 'A', productId: 1, slug: 'a', price: 574, lowestQuota: 52, minTermQuota: 124, isAvailable: false },
  { grade: 'B', productId: 1566, slug: 'advance-notebook-cn4058', price: 402, lowestQuota: 40, minTermQuota: 90, isAvailable: true },
  { grade: 'C', productId: 3, slug: 'c', price: 287, lowestQuota: 32, minTermQuota: 68, isAvailable: true },
];

// ── Tests ────────────────────────────────────────────────────────────────

describe('ProductCard — variante compacta (reacondicionados)', () => {
  it('por defecto muestra los specs y dice "Detalle"', () => {
    render(<ProductCard product={buildProduct()} />);
    expect(screen.getByText('Intel Celeron N4020')).toBeInTheDocument();
    expect(screen.getAllByText('Detalle').length).toBeGreaterThan(0);
  });

  // Los specs se ocultaron un rato y negocio los quiso de vuelta: la card de
  // reacondicionados los muestra igual que las demás.
  it('en compact SIGUE mostrando los specs tecnicos', () => {
    render(<ProductCard product={buildProduct()} compact />);
    expect(screen.getByText('Intel Celeron N4020')).toBeInTheDocument();
  });

  it('en compact el CTA dice "Ver detalle"', () => {
    render(<ProductCard product={buildProduct()} compact />);
    expect(screen.getAllByText('Ver detalle').length).toBeGreaterThan(0);
    // getByText hace match exacto: "Ver detalle" no satisface "Detalle".
    expect(screen.queryByText('Detalle')).toBeNull();
  });

  describe('zona de grados / colores', () => {
    it('con 2+ grados muestra una pill por grado', () => {
      render(<ProductCard product={buildProduct({ gradeSiblings: GRADOS_ADVANCE })} compact />);
      expect(screen.getByTestId('card-grades')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Grado A' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Grado B' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Grado C' })).toBeInTheDocument();
    });

    it('el grado agotado se muestra deshabilitado', () => {
      render(<ProductCard product={buildProduct({ gradeSiblings: GRADOS_ADVANCE })} compact />);
      expect(screen.getByRole('button', { name: 'Grado A' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Grado B' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Grado C' })).toBeEnabled();
    });

    // Arranca marcado el primer grado DISPONIBLE, no el primero a secas:
    // marcar de entrada un grado agotado sería mentir.
    it('preselecciona el primer grado disponible', () => {
      render(<ProductCard product={buildProduct({ gradeSiblings: GRADOS_ADVANCE })} compact />);
      expect(screen.getByRole('button', { name: 'Grado A' })).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByRole('button', { name: 'Grado B' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('con grados NO muestra el selector de colores', () => {
      render(
        <ProductCard
          product={buildProduct({
            gradeSiblings: GRADOS_ADVANCE,
            colors: [color('1'), color('2')],
          } as Partial<CatalogProduct>)}
          compact
        />,
      );
      expect(screen.queryByTestId('color-selector')).toBeNull();
    });

    it('sin grados y con 2+ colores muestra el selector de colores', () => {
      render(
        <ProductCard
          product={buildProduct({
            gradeSiblings: [],
            colors: [color('1'), color('2')],
          } as Partial<CatalogProduct>)}
          compact
        />,
      );
      expect(screen.getByTestId('color-selector')).toBeInTheDocument();
      expect(screen.queryByTestId('card-grades')).toBeNull();
    });

    // El caso que mantiene la grilla pareja: el hueco se dibuja igual.
    it('sin grados ni colores deja el contenedor vacio pero presente', () => {
      render(<ProductCard product={buildProduct({ gradeSiblings: [], colors: [] })} compact />);
      const zona = screen.getByTestId('card-selector-slot');
      expect(zona).toBeInTheDocument();
      expect(zona).toBeEmptyDOMElement();
    });

    // Un solo color no es elegible: cae a 'none', no pinta el selector.
    it('con un solo color no pinta el selector', () => {
      render(
        <ProductCard
          product={buildProduct({ gradeSiblings: [], colors: [color('1')] } as Partial<CatalogProduct>)}
          compact
        />,
      );
      expect(screen.queryByTestId('color-selector')).toBeNull();
      expect(screen.getByTestId('card-selector-slot')).toBeEmptyDOMElement();
    });
  });

  /**
   * BAL-3340 — el chip pintaba la pill y nada mas: el link "Ver detalle", el
   * precio y "Lo quiero" seguian apuntando al grado que trajo el listado. Quien
   * elegia el C terminaba solicitando el B.
   */
  describe('el grado elegido manda en toda la card', () => {
    // El producto de la card es el grado B (id 1566, como en produccion).
    const conGrados = () => buildProduct({ gradeSiblings: GRADOS_ADVANCE });

    it('el link de detalle apunta al grado elegido', async () => {
      const user = userEvent.setup();
      const getDetailHref = jest.fn((slug?: string) => `/producto/${slug}`);
      render(<ProductCard product={conGrados()} compact getDetailHref={getDetailHref} />);

      await user.click(screen.getByRole('button', { name: 'Grado C' }));

      // El ultimo render pidio el href del grado C, no el de la card.
      const pedidos = getDetailHref.mock.calls.map(([slug]) => slug);
      expect(pedidos[pedidos.length - 1]).toBe('c');
    });

    it('el CTA emite el productId y el slug del grado elegido', async () => {
      const user = userEvent.setup();
      const onAddToCart = jest.fn();
      render(<ProductCard product={conGrados()} compact onAddToCart={onAddToCart} />);

      await user.click(screen.getByRole('button', { name: 'Grado C' }));
      await user.click(screen.getByRole('button', { name: /lo quiero/i }));

      expect(onAddToCart).toHaveBeenCalledTimes(1);
      const item = onAddToCart.mock.calls[0][0];
      expect(item.productId).toBe('3');
      expect(item.slug).toBe('c');
      expect(item.price).toBe(287);
    });

    it('sin tocar nada emite el grado que trajo el listado', () => {
      const onAddToCart = jest.fn();
      render(<ProductCard product={conGrados()} compact onAddToCart={onAddToCart} />);

      screen.getByRole('button', { name: /lo quiero/i }).click();

      const item = onAddToCart.mock.calls[0][0];
      expect(item.productId).toBe('1566');
      expect(item.slug).toBe('advance-notebook-cn4058');
    });

    // El grado con pricing sin cargar manda `null` (asi llega hoy de la landing
    // 241). Ahi la card conserva lo suyo en vez de mostrar un hueco.
    it('con precio null del grado conserva el de la card', async () => {
      const user = userEvent.setup();
      const onAddToCart = jest.fn();
      const sinPricing = buildProduct({
        gradeSiblings: [
          { grade: 'B', productId: 1566, slug: 'advance-notebook-cn4058', price: null, minTermQuota: null, isAvailable: true },
          { grade: 'C', productId: 3, slug: 'c', price: null, minTermQuota: null, isAvailable: true },
        ],
      });
      render(<ProductCard product={sinPricing} compact onAddToCart={onAddToCart} />);

      await user.click(screen.getByRole('button', { name: 'Grado C' }));
      await user.click(screen.getByRole('button', { name: /lo quiero/i }));

      const item = onAddToCart.mock.calls[0][0];
      expect(item.slug).toBe('c');       // la identidad SI cambia
      expect(item.price).toBe(402);      // el precio cae al de la card
    });
  });

  // El aislamiento: sin `compact` la card no gana ninguno de los elementos
  // nuevos, aunque el producto traiga grados.
  describe('modo normal (resto de landings)', () => {
    it('no dibuja la zona ni las pills aunque haya grados', () => {
      render(<ProductCard product={buildProduct({ gradeSiblings: GRADOS_ADVANCE })} />);
      expect(screen.queryByTestId('card-selector-slot')).toBeNull();
      expect(screen.queryByTestId('card-grades')).toBeNull();
      expect(screen.queryByRole('button', { name: 'Grado A' })).toBeNull();
    });

    // Sin pills no hay grado que elegir, asi que la card emite lo suyo: ninguna
    // otra landing cambia de comportamiento por este arreglo.
    it('emite el producto de la card aunque traiga grados', () => {
      const onAddToCart = jest.fn();
      render(
        <ProductCard
          product={buildProduct({ gradeSiblings: GRADOS_ADVANCE })}
          onAddToCart={onAddToCart}
        />,
      );

      screen.getByRole('button', { name: /lo quiero/i }).click();

      const item = onAddToCart.mock.calls[0][0];
      expect(item.productId).toBe('1566');
      expect(item.price).toBe(402);
    });
  });
});
