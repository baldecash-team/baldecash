import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProductCard } from '../ProductCard';
import type { CatalogProduct } from '../../../../types/catalog';

// ── Mocks ────────────────────────────────────────────────────────────────
// Mismos stubs que ProductCard.stateBadges.test.tsx (ese archivo no exporta
// nada, así que se replican en vez de importarse).

jest.mock('@nextui-org/react', () => ({
  Card: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardBody: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Button: ({ children }: React.PropsWithChildren) => <button>{children}</button>,
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
const GRADOS_ADVANCE = [
  { grade: 'A', productId: 1, slug: 'a', price: 574, minTermQuota: 124, isAvailable: false },
  { grade: 'B', productId: 2, slug: 'b', price: 402, minTermQuota: 90, isAvailable: true },
  { grade: 'C', productId: 3, slug: 'c', price: 287, minTermQuota: 68, isAvailable: true },
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

  // El aislamiento: sin `compact` la card no gana ninguno de los elementos
  // nuevos, aunque el producto traiga grados.
  describe('modo normal (resto de landings)', () => {
    it('no dibuja la zona ni las pills aunque haya grados', () => {
      render(<ProductCard product={buildProduct({ gradeSiblings: GRADOS_ADVANCE })} />);
      expect(screen.queryByTestId('card-selector-slot')).toBeNull();
      expect(screen.queryByTestId('card-grades')).toBeNull();
      expect(screen.queryByRole('button', { name: 'Grado A' })).toBeNull();
    });
  });
});
