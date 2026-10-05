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
      get: () =>
        React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
          ({ children, ...props }, ref) => <div ref={ref} {...props}>{children}</div>,
        ),
    },
  ),
}));

// Cualquier icono usado por el card → stub svg.
jest.mock('lucide-react', () =>
  new Proxy({}, { get: () => (props: Record<string, unknown>) => <svg {...props} /> }),
);

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children }: React.PropsWithChildren) => <a>{children}</a>,
}));

// ImageGallery: expone la primera imagen recibida para poder aseverar la portada.
jest.mock('../../ImageGallery', () => ({
  ImageGallery: ({ images, alt }: { images: string[]; alt: string }) => (
    <img data-testid="gallery-lead" src={images[0]} alt={alt} />
  ),
}));

jest.mock('../../ProductTags', () => ({ ProductTags: () => null }));
jest.mock('../../RibbonLabel', () => ({ RibbonLabel: () => null }));
jest.mock('../../ConditionBadge', () => ({ ConditionBadge: () => null }));
jest.mock('../../color-selector', () => ({ ColorSelector: () => null }));
jest.mock('@/app/prototipos/0.6/components/RefurbishedWarningModal', () => ({
  isRefurbishedCondition: () => false,
}));
jest.mock('@/app/prototipos/0.6/components/NvidiaBadge', () => ({ NvidiaBadge: () => null }));
jest.mock('@/app/prototipos/0.6/components/DeferredDeliveryModal', () => ({
  DeferredDeliveryModal: () => null,
}));
jest.mock('@/app/prototipos/0.6/analytics/useAnalytics', () => ({
  useAnalytics: () => ({ trackPromoCardClick: jest.fn() }),
}));

// jsdom no implementa matchMedia; el card lo usa para detectar hover.
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

const COMBO_COVER = 'https://cdn.example.com/combo-cover.webp';
const BASE_MAIN = 'https://cdn.example.com/base-main.webp';
const BASE_ANGLE = 'https://cdn.example.com/base-angle.webp';

function buildComboProduct(overrides: Partial<CatalogProduct> = {}): CatalogProduct {
  return {
    id: '491',
    slug: 'lenovo-v15-combo-52',
    name: 'Lenovo V15',
    displayName: 'Lenovo V15 + Seguro',
    brand: 'lenovo',
    thumbnail: COMBO_COVER,
    comboImage: COMBO_COVER,
    // El API antepone la portada del combo en images[0]; la galería base va después.
    images: [COMBO_COVER, BASE_MAIN, BASE_ANGLE],
    // Color del MISMO producto (rama sin color_siblings): SIN productId, imágenes base.
    colors: [{ id: 'color-491', name: 'Gris', hex: '#A8A8A8', imageUrl: BASE_MAIN, images: [BASE_MAIN, BASE_ANGLE] }],
    price: 2099,
    quotaMonthly: 170,
    quotaBiweekly: 85,
    quotaWeekly: 42,
    maxTermMonths: 24,
    gama: 'economica',
    condition: 'nuevo',
    stock: 'available',
    stockQuantity: 10,
    usage: ['estudios'],
    isFeatured: false,
    isNew: false,
    tags: [],
    specs: {},
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  } as CatalogProduct;
}

// ── Tests ────────────────────────────────────────────────────────────────

describe('ProductCard combo cover image', () => {
  it('lidera la galería con la portada del combo aunque el color primario esté preseleccionado', () => {
    render(<ProductCard product={buildComboProduct()} />);
    // Antes del fix: mostraba BASE_MAIN (imágenes del color primario), tapando el combo.
    expect(screen.getByTestId('gallery-lead')).toHaveAttribute('src', COMBO_COVER);
  });

  it('un sibling real de otro producto sí reemplaza la portada del combo', () => {
    const SIBLING_IMG = 'https://cdn.example.com/sibling.webp';
    const product = buildComboProduct({
      colors: [
        { id: '491', name: 'Gris', hex: '#A8A8A8', productId: '491', imageUrl: BASE_MAIN, images: [BASE_MAIN] },
        { id: '999', name: 'Azul', hex: '#123456', productId: '999', imageUrl: SIBLING_IMG, images: [SIBLING_IMG] },
      ],
    });
    // Primario (productId === product.id) preseleccionado → el combo lidera.
    render(<ProductCard product={product} />);
    expect(screen.getByTestId('gallery-lead')).toHaveAttribute('src', COMBO_COVER);
  });
});
