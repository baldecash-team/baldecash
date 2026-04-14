import React from 'react';
import { render, screen } from '@testing-library/react';
import { PromotionalProductCard } from '../PromotionalProductCard';
import type { CatalogProduct } from '../../../../types/catalog';

// ── Mocks ────────────────────────────────────────────────────────────────

jest.mock('@nextui-org/react', () => ({
  Card: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid="card" {...props}>{children}</div>
  ),
  CardBody: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid="card-body" {...props}>{children}</div>
  ),
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
      ({ children, ...props }, ref) => <div ref={ref} {...props}>{children}</div>,
    ),
  },
}));

jest.mock('lucide-react', () => ({
  Flame: (props: Record<string, unknown>) => <svg data-testid="icon-flame" {...props} />,
  Siren: (props: Record<string, unknown>) => <svg data-testid="icon-siren" {...props} />,
  Zap: (props: Record<string, unknown>) => <svg data-testid="icon-zap" {...props} />,
  Star: (props: Record<string, unknown>) => <svg data-testid="icon-star" {...props} />,
  Gift: (props: Record<string, unknown>) => <svg data-testid="icon-gift" {...props} />,
  ChevronRight: (props: Record<string, unknown>) => <svg data-testid="icon-chevron" {...props} />,
}));

// ── Helpers ──────────────────────────────────────────────────────────────

function buildMockProduct(overrides: Partial<CatalogProduct> = {}): CatalogProduct {
  return {
    id: 'prod-001',
    slug: 'laptop-test',
    name: 'Laptop Test',
    displayName: 'Laptop Test 15" 8GB',
    brand: 'TestBrand',
    thumbnail: 'https://cdn.example.com/thumb.webp',
    images: ['https://cdn.example.com/img1.webp'],
    price: 2500,
    quotaMonthly: 150,
    quotaBiweekly: 80,
    quotaWeekly: 40,
    maxTermMonths: 24,
    gama: 'mid',
    condition: 'new',
    stock: 'available',
    stockQuantity: 10,
    usage: ['personal'],
    isFeatured: false,
    isNew: false,
    tags: [],
    specs: {},
    createdAt: '2026-01-01T00:00:00Z',
    promotion: {
      id: 1,
      name: 'Cuota Épica',
      code: 'CUOTA_EPICA',
      discountType: 'percentage',
      discountValue: 20,
      template: {
        code: 'CUOTA_EPICA',
        bannerText: 'CUOTA ÉPICA',
        bannerStyle: 'top_bar',
        borderColor: '#FF5500',
        bannerBgColor: '#FF5500',
        bannerTextColor: '#FFFFFF',
        bannerIcon: 'fire',
        ctaText: '¡La quiero!',
        ctaStyle: 'golden',
        showSpecs: false,
        showLinks: true,
      },
    },
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────────────────

describe('PromotionalProductCard', () => {
  it('renders banner text from template', () => {
    const product = buildMockProduct();
    render(<PromotionalProductCard product={product} />);

    expect(screen.getByText('CUOTA ÉPICA')).toBeInTheDocument();
  });

  it('renders promotional card with top_bar banner style', () => {
    const product = buildMockProduct();
    const { container } = render(<PromotionalProductCard product={product} />);

    // top_bar banner renders a centered div with rounded-t-xl
    const banner = container.querySelector('.rounded-t-xl');
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveStyle({ backgroundColor: '#FF5500' });
  });

  it('renders CTA text from template', () => {
    const product = buildMockProduct();
    render(<PromotionalProductCard product={product} />);

    expect(screen.getByText('¡La quiero!')).toBeInTheDocument();
  });

  it('renders correctly with valid promotion data', () => {
    const product = buildMockProduct();
    render(<PromotionalProductCard product={product} />);

    // Product name is displayed
    expect(screen.getByText(product.displayName)).toBeInTheDocument();
    // Banner text present
    expect(screen.getByText('CUOTA ÉPICA')).toBeInTheDocument();
    // CTA button present
    expect(screen.getByText('¡La quiero!')).toBeInTheDocument();
    // Image rendered
    const img = screen.getByAltText(product.displayName);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', product.thumbnail);
  });

  it('shows "Ver cronograma" and "Ver características" links when showLinks is true', () => {
    const product = buildMockProduct();
    render(<PromotionalProductCard product={product} />);

    expect(screen.getByText(/Ver cronograma/)).toBeInTheDocument();
    expect(screen.getByText(/Ver características/)).toBeInTheDocument();
  });

  it('hides links when showLinks is false', () => {
    const product = buildMockProduct({
      promotion: {
        id: 1,
        name: 'Cuota Épica',
        code: 'CUOTA_EPICA',
        discountType: 'percentage',
        discountValue: 20,
        template: {
          code: 'CUOTA_EPICA',
          bannerText: 'CUOTA ÉPICA',
          bannerStyle: 'top_bar',
          borderColor: '#FF5500',
          bannerBgColor: '#FF5500',
          bannerTextColor: '#FFFFFF',
          bannerIcon: 'fire',
          ctaText: '¡La quiero!',
          ctaStyle: 'golden',
          showSpecs: false,
          showLinks: false,
        },
      },
    });
    render(<PromotionalProductCard product={product} />);

    expect(screen.queryByText(/Ver cronograma/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Ver características/)).not.toBeInTheDocument();
  });
});
