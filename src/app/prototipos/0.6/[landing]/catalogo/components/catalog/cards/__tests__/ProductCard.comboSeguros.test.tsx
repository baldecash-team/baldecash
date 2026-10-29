import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProductCard } from '../ProductCard';
import type { CatalogProduct } from '../../../../types/catalog';

jest.mock('@nextui-org/react', () => ({
  Card: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardBody: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Button: ({ children }: React.PropsWithChildren) => <button>{children}</button>,
}));
jest.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: () => React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
      ({ children, ...props }, ref) => <div ref={ref} {...props}>{children}</div>,
    ),
  }),
}));
jest.mock('lucide-react', () => new Proxy({}, { get: () => (props: Record<string, unknown>) => <svg {...props} /> }));
jest.mock('next/link', () => ({ __esModule: true, default: ({ children }: React.PropsWithChildren) => <a>{children}</a> }));
jest.mock('../../ImageGallery', () => ({ ImageGallery: () => null }));
jest.mock('../../ProductTags', () => ({ ProductTags: () => null }));
jest.mock('../../RibbonLabel', () => ({ RibbonLabel: () => null }));
jest.mock('../../ConditionBadge', () => ({ ConditionBadge: () => null }));
jest.mock('../../color-selector', () => ({ ColorSelector: () => null }));
jest.mock('@/app/prototipos/0.6/components/RefurbishedWarningModal', () => ({ isRefurbishedCondition: () => false }));
jest.mock('@/app/prototipos/0.6/components/NvidiaBadge', () => ({ NvidiaBadge: () => null }));
jest.mock('@/app/prototipos/0.6/components/DeferredDeliveryModal', () => ({ DeferredDeliveryModal: () => null }));
jest.mock('@/app/prototipos/0.6/analytics/useAnalytics', () => ({ useAnalytics: () => ({ trackPromoCardClick: jest.fn() }) }));

beforeAll(() => {
  window.matchMedia = window.matchMedia || ((query: string) => ({
    matches: false, media: query, onchange: null,
    addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
  } as unknown as MediaQueryList));
});

function combo(overrides: Partial<CatalogProduct> = {}): CatalogProduct {
  return {
    id: '491', slug: 'lenovo-v15-combo-52', name: 'Lenovo V15', displayName: 'Lenovo V15 combo',
    brand: 'lenovo', thumbnail: 'x.webp', images: ['x.webp'], colors: [], price: 2202,
    quotaMonthly: 170, quotaBiweekly: 85, quotaWeekly: 42, maxTermMonths: 24, gama: 'economica',
    condition: 'nuevo', stock: 'available', stockQuantity: 10, usage: ['estudios'],
    isFeatured: false, isNew: false, tags: [], specs: {}, createdAt: '2026-01-01T00:00:00Z',
    comboId: 52,
    ...overrides,
  } as CatalogProduct;
}

describe('ProductCard · seguros del combo', () => {
  it('lista accesorios y un rótulo por tipo de seguro', () => {
    render(<ProductCard product={combo({
      comboAccessories: [{ productId: 1456, name: 'Mochila Nova', price: 0 }],
      comboInsurances: [
        { planId: '15', name: 'Robo 12M', durationMonths: 12, insuranceType: 'seguro_robo' },
        { planId: '16', name: 'Robo 24M', durationMonths: 24, insuranceType: 'seguro_robo' },
        { planId: '14', name: 'Garantía 24M', durationMonths: 24, insuranceType: 'garantia_extendida' },
      ],
    })} />);
    expect(screen.getByTestId('card-combo-incluye'))
      .toHaveTextContent('Incluye Mochila Nova · Seguro contra robo · Garantía extendida');
  });

  it('combo solo con accesorios: la card no cambia (R8)', () => {
    render(<ProductCard product={combo({ comboAccessories: [{ productId: 1456, name: 'Mochila Nova', price: 0 }] })} />);
    expect(screen.queryByTestId('card-combo-incluye')).toBeNull();
  });
});
