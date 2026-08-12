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
jest.mock('../../ConditionBadge', () => ({ ConditionBadge: () => null }));
jest.mock('../../ProductTags', () => ({ ProductTags: () => null }));
jest.mock('@/app/prototipos/0.6/components/NvidiaBadge', () => ({ NvidiaBadge: () => null }));
jest.mock('@/app/prototipos/0.6/components/DeferredDeliveryModal', () => ({
  DeferredDeliveryModal: () => null,
}));
jest.mock('@/app/prototipos/0.6/components/RefurbishedWarningModal', () => ({
  RefurbishedWarningModal: () => null,
  isRefurbishedCondition: () => false,
}));
jest.mock('@/app/prototipos/0.6/analytics/useAnalytics', () => ({
  useAnalytics: () => ({ trackPromoCardClick: jest.fn() }),
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

/**
 * El iPad 11 de home: una sola bolita de color, promocion al 30%.
 *
 * `colors[0].productId` es el suyo propio — el API lo manda asi para todo
 * producto con color, tenga hermanos o no. Es justo el dato que confundia al
 * card (BAL-2967).
 */
function buildIpad(overrides: Partial<CatalogProduct> = {}): CatalogProduct {
  return {
    id: '518',
    slug: 'ipad-11-pulgadas-wi-fi-tbapme0000835',
    name: 'iPad 11 pulgadas Wi-Fi',
    displayName: 'iPad 11 pulgadas Wi-Fi A16 Bionic 128GB',
    brand: 'apple',
    thumbnail: 'https://cdn.example.com/ipad.webp',
    images: ['https://cdn.example.com/ipad.webp'],
    colors: [{ id: 'color-518', name: 'Plata', hex: '#C0C0C0', productId: '518' }],
    price: 2099,
    quotaMonthly: 119,
    quotaBiweekly: 60,
    quotaWeekly: 30,
    originalQuotaMonthly: 170,
    discount: 30,
    promotion: { discountValue: 30, discountType: 'percentage' },
    maxTermMonths: 24,
    hookTermMonths: 24,
    gama: 'premium',
    stock: 'available',
    stockQuantity: 5,
    usage: ['estudios'],
    isFeatured: false,
    isNew: false,
    tags: [],
    specs: {},
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  } as unknown as CatalogProduct;
}

// ── Tests ────────────────────────────────────────────────────────────────

describe('ProductCard — el tachado de la promocion', () => {
  it('pinta el precio antes y el porcentaje cuando el producto tiene un solo color', () => {
    // La regresion de BAL-2967: `isSiblingColor` daba true porque la bolita
    // trae su propio productId, el card leia el pricing del "hermano" —que no
    // existe— y tiraba el originalQuotaMonthly bueno.
    render(<ProductCard product={buildIpad()} />);

    expect(screen.getByText(/S\/170/)).toBeInTheDocument();
    expect(screen.getByText(/-30%/)).toBeInTheDocument();
  });

  it('no inventa tachado cuando el producto no tiene descuento', () => {
    render(
      <ProductCard
        product={buildIpad({
          originalQuotaMonthly: undefined,
          discount: undefined,
          promotion: undefined,
        })}
      />,
    );

    expect(screen.queryByText(/S\/170/)).not.toBeInTheDocument();
    expect(screen.queryByText(/-30%/)).not.toBeInTheDocument();
  });

  it('un hermano de color de VERDAD sigue mandando su propio pricing', () => {
    // El MacBook Neo Citrus no tiene descuento y no debe heredar el -30% del
    // Silver (BAL-2859). El color apunta a OTRO producto: ahi si es hermano y
    // su pricing —sin tachado— es el que vale.
    render(
      <ProductCard
        product={buildIpad({
          id: '1309',
          name: 'Laptop MacBook Neo Silver',
          colors: [
            { id: 'color-1320', name: 'Citrus', hex: '#D4E157', productId: '1320' },
          ],
        } as Partial<CatalogProduct>)}
      />,
    );

    expect(screen.queryByText(/S\/170/)).not.toBeInTheDocument();
  });
});
