import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProductCard } from '../ProductCard';
import type { CatalogProduct } from '../../../../types/catalog';

// ── Mocks ────────────────────────────────────────────────────────────────

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
jest.mock('../../color-selector', () => ({ ColorSelector: () => null }));
jest.mock('@/app/prototipos/0.6/components/NvidiaBadge', () => ({ NvidiaBadge: () => null }));
jest.mock('@/app/prototipos/0.6/components/DeferredDeliveryModal', () => ({
  DeferredDeliveryModal: () => null,
}));
jest.mock('@/app/prototipos/0.6/analytics/useAnalytics', () => ({
  useAnalytics: () => ({ trackPromoCardClick: jest.fn() }),
}));

// Los tres badges se distinguen por su texto renderizado, así que ConditionBadge
// y ProductTags se stubean con su etiqueta, no con null.
jest.mock('../../ConditionBadge', () => ({
  ConditionBadge: () => <span>Semi nuevo</span>,
}));
jest.mock('../../ProductTags', () => ({
  ProductTags: ({ tags }: { tags: string[] }) => <span>{tags.join(',')}</span>,
}));

// El producto de prueba es reacondicionado: es la única condición que pinta badge.
jest.mock('@/app/prototipos/0.6/components/RefurbishedWarningModal', () => ({
  isRefurbishedCondition: () => true,
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

function buildRefurbishedProduct(overrides: Partial<CatalogProduct> = {}): CatalogProduct {
  return {
    id: '491',
    slug: 'laptop-advance-cn4058',
    name: 'Laptop Advance CN4058',
    displayName: 'Laptop Advance Notebook CN4058 2 en 1 Semi Nuevo',
    brand: 'advance',
    thumbnail: 'https://cdn.example.com/thumb.webp',
    images: ['https://cdn.example.com/thumb.webp'],
    colors: [],
    price: 1099,
    quotaMonthly: 42,
    quotaBiweekly: 21,
    quotaWeekly: 10,
    maxTermMonths: 24,
    gama: 'economica',
    condition: 'reacondicionado',
    conditionCode: 'reacondicionada',
    grade: 'A',
    stock: 'available',
    stockQuantity: 5,
    usage: ['estudios'],
    isFeatured: false,
    isNew: false,
    // El badge de Oferta viaja por otro canal (labels del API / descuento > 0) y
    // no debe verse afectado por el corte de los badges de estado.
    tags: ['oferta'],
    specs: {},
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  } as CatalogProduct;
}

// ── Tests ────────────────────────────────────────────────────────────────

describe('ProductCard equipment-state badges', () => {
  it('shows condition and grade by default', () => {
    render(<ProductCard product={buildRefurbishedProduct()} />);

    expect(screen.getByText('Semi nuevo')).toBeInTheDocument();
    expect(screen.getByText('Grado A')).toBeInTheDocument();
  });

  it('hides condition and grade when hideStateBadges is set', () => {
    render(<ProductCard product={buildRefurbishedProduct()} hideStateBadges />);

    expect(screen.queryByText('Semi nuevo')).toBeNull();
    expect(screen.queryByText('Grado A')).toBeNull();
  });

  it('keeps the offer tag when the state badges are hidden', () => {
    render(<ProductCard product={buildRefurbishedProduct()} hideStateBadges />);

    expect(screen.getByText('oferta')).toBeInTheDocument();
  });
});
