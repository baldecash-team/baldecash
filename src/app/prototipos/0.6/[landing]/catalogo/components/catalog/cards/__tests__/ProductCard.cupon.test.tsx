import React from 'react';
import { render, screen } from '@testing-library/react';
import { useParams } from 'next/navigation';
import { ProductCard } from '../ProductCard';
import type { CatalogProduct } from '../../../../types/catalog';
import type { AppliedCoupon } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';

/**
 * Desde el 22-oct-2026 la cuota rebajada por un cupón se cobra en soles
 * enteros, redondeando al más cercano (mitad hacia arriba). La tarjeta cortaba
 * los céntimos con `Math.floor` (125.70 se veía «125» aunque se cobrara 126):
 * esta suite fija que la tarjeta muestre lo mismo que se factura, en todas las
 * landings, incluida Family Farms (que sí muestra céntimos en la cuota SIN
 * cupón).
 */

// ── Mocks (plantilla: ProductCard.promoStrikethrough.test.tsx) ─────────────

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

// Sobrescribe el mock global (jest.setup.js) para poder cambiar el slug de la
// landing por test: Family Farms es la única que muestra céntimos.
jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({ landing: 'test-landing' })),
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

afterEach(() => {
  (useParams as jest.Mock).mockReturnValue({ landing: 'test-landing' });
});

// ── Helpers ──────────────────────────────────────────────────────────────

/** Producto base sin promoción propia: lo único que descuenta es el cupón. */
function buildProducto(overrides: Partial<CatalogProduct> = {}): CatalogProduct {
  return {
    id: '518',
    slug: 'laptop-de-prueba-tbapme0000835',
    name: 'Laptop de prueba',
    displayName: 'Laptop de prueba 8GB 256GB',
    brand: 'asus',
    thumbnail: 'https://cdn.example.com/laptop.webp',
    images: ['https://cdn.example.com/laptop.webp'],
    colors: [{ id: 'color-518', name: 'Gris', hex: '#888888', productId: '518' }],
    price: 2099,
    quotaMonthly: 179,
    quotaBiweekly: 90,
    quotaWeekly: 45,
    originalQuotaMonthly: undefined,
    discount: undefined,
    promotion: undefined,
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

/** Cupón de porcentaje, el alcance de siempre: cubre todas las cuotas. */
function cuponPorcentaje(discount: number, extra: Partial<AppliedCoupon> = {}): AppliedCoupon {
  return {
    code: 'PRUEBA30',
    discount,
    label: `${discount}% de descuento`,
    couponType: 'percent_quotas',
    ...extra,
  };
}

// ── Tests ────────────────────────────────────────────────────────────────

describe('ProductCard — la cuota con cupón redondeada al sol', () => {
  it('179 al 30 % → S/125 (125.30 redondea hacia abajo)', () => {
    render(<ProductCard product={buildProducto({ quotaMonthly: 179 })} campaignCoupon={cuponPorcentaje(30)} />);

    expect(screen.getByText(/S\/125/)).toBeInTheDocument();
  });

  it('181 al 30 % → S/127 (126.70 redondea hacia arriba, no 126)', () => {
    render(<ProductCard product={buildProducto({ quotaMonthly: 181 })} campaignCoupon={cuponPorcentaje(30)} />);

    expect(screen.getByText(/S\/127/)).toBeInTheDocument();
    expect(screen.queryByText(/S\/126(?!\d)/)).not.toBeInTheDocument();
  });

  it('Family Farms: cuota 70.50 con cupón 30 % → S/49, y la cuota sin cupón sigue con céntimos (S/70.50)', () => {
    (useParams as jest.Mock).mockReturnValue({ landing: 'family-farms-baldecash-a' });

    render(
      <ProductCard
        product={buildProducto({ quotaMonthly: 70.5 })}
        campaignCoupon={cuponPorcentaje(30)}
      />,
    );

    // 70.50 * 0.7 = 49.35 → redondea a 49.
    expect(screen.getByText(/S\/49(?!\d)/)).toBeInTheDocument();
    // La cuota normal (sin cupón) de Family Farms sigue mostrando céntimos:
    // esta regla solo redondea la cuota REBAJADA, no la cuota normal.
    expect(screen.getByText(/S\/70[.,]50/)).toBeInTheDocument();
  });
});
