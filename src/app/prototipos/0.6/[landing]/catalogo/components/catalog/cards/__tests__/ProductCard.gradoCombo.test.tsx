/**
 * Tarjeta de COMBO agrupada por grado: al tocar otro grado la cuota, el
 * nombre, el enlace y «Lo quiero» tienen que ser los del combo de ese grado.
 *
 * Caso medido en prod: HP 250 G10 con kit de limpieza de regalo. Grado A=118;
 * al tocar el B la card seguía diciendo 118 (el API mandaba `lowest_quota:
 * null`), el nombre perdía «(con kIT DE LIMPIEZA 1 de regalo)» y el enlace iba
 * al producto suelto.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCard } from '@/app/prototipos/0.6/[landing]/catalogo/components/catalog/cards/ProductCard';
import type { CatalogProduct, CatalogGradeSibling } from '@/app/prototipos/0.6/[landing]/catalogo/types/catalog';

jest.mock('@nextui-org/react', () => ({
  Card: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardBody: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Button: ({ children, onPress }: React.PropsWithChildren<{ onPress?: () => void }>) => <button onClick={onPress}>{children}</button>,
}));
jest.mock('framer-motion', () => ({
  motion: new Proxy({}, { get: () => {
    const S = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ children, ...p }, ref) => <div ref={ref} {...p}>{children}</div>);
    S.displayName = 'M'; return S;
  }}),
}));
jest.mock('lucide-react', () => new Proxy({}, { get: () => (p: React.SVGProps<SVGSVGElement>) => <svg {...p} /> }));
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: React.PropsWithChildren<{ href: string }>) => <a href={href}>{children}</a>,
}));
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

const REGALO = '(con kIT DE LIMPIEZA 1 de regalo)';

// Contrato nuevo del backend: cada hermano trae su combo, su slug con
// `-combo-N`, el nombre de su card y la cuota con el precio del combo.
const GRADOS_COMBO: CatalogGradeSibling[] = [
  { grade: 'A', productId: 700, comboId: 41, slug: 'hp-250-g10-i5-combo-41', name: 'HP 250 G10 i5', displayName: `Laptop HP 250 G10 i5 ${REGALO}`, price: 1900, lowestQuota: 118, minTermQuota: 300, isAvailable: true },
  { grade: 'B', productId: 701, comboId: 42, slug: 'hp-250-g10-i5-grado-b-combo-42', name: 'HP 250 G10 i5 (Grado B)', displayName: `Laptop HP 250 G10 i5 Grado B ${REGALO}`, price: 1780, lowestQuota: 110, minTermQuota: 280, isAvailable: true },
  { grade: 'C', productId: 702, comboId: null, slug: 'hp-250-g10-i5-grado-c', name: 'HP 250 G10 i5 (Grado C)', displayName: 'Laptop HP 250 G10 i5 Grado C', price: null, lowestQuota: null, minTermQuota: null, isAvailable: false },
];

const comboCard = (over: Partial<CatalogProduct> = {}) => ({
  id: '700', slug: 'hp-250-g10-i5-combo-41', comboId: 41,
  name: 'HP 250 G10 i5', displayName: `Laptop HP 250 G10 i5 ${REGALO}`,
  brand: 'HP', thumbnail: 't.webp', images: ['t.webp'], colors: [],
  price: 1900, quotaMonthly: 118, quotaBiweekly: 0, quotaWeekly: 0,
  maxTermMonths: 24, gama: 'media', condition: 'reacondicionado',
  conditionCode: 'reacondicionada', stock: 'available', stockQuantity: 1,
  usage: ['estudios'], isFeatured: false, isNew: false, tags: [],
  specs: { processor: { model: 'Intel Core i5' } },
  createdAt: '2026-01-01T00:00:00Z',
  grade: 'A',
  gradeSiblings: GRADOS_COMBO,
  ...over,
} as unknown as CatalogProduct);

const detailHref = (slug?: string) => `/home/producto/${slug}`;

describe('card de combo agrupada por grado', () => {
  it('cambiar a un grado con cuota actualiza cuota, nombre y enlace con -combo-N', async () => {
    const user = userEvent.setup();
    render(<ProductCard product={comboCard()} getDetailHref={detailHref} />);

    expect(screen.getAllByText(/118/).length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Grado B' }));

    expect(screen.getAllByText(/110/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/118/)).toBeNull();
    expect(screen.getAllByText(`Laptop HP 250 G10 i5 Grado B ${REGALO}`).length).toBeGreaterThan(0);
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(hrefs.length).toBeGreaterThan(0);
    hrefs.forEach((h) => expect(h).toBe('/home/producto/hp-250-g10-i5-grado-b-combo-42'));
  });

  it('un grado sin cuota sale deshabilitado y la card no toma la cuota de otro grado', async () => {
    const user = userEvent.setup();
    render(<ProductCard product={comboCard()} />);

    const c = screen.getByRole('button', { name: 'Grado C' });
    expect(c).toBeDisabled();
    await user.click(c);
    expect(c).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getAllByText(/118/).length).toBeGreaterThan(0);
  });

  // Backend viejo: sin `combo_id` y con `lowest_quota: null` en los hermanos.
  // Antes la card quedaba con la cuota del A al tocar el B; ahora el B se apaga.
  it('backend viejo con cuota null: el grado sale deshabilitado', () => {
    const viejo = GRADOS_COMBO.map((g) => ({ ...g, comboId: undefined, lowestQuota: null, isAvailable: true }));
    render(<ProductCard product={comboCard({ gradeSiblings: viejo })} />);

    // El grado de la propia card sigue elegible: sus datos son los de la card.
    expect(screen.getByRole('button', { name: 'Grado A' })).not.toBeDisabled();
    const b = screen.getByRole('button', { name: 'Grado B' });
    expect(b).toBeDisabled();
    expect(b).toHaveAttribute('title', 'Grado B — no disponible');
  });

  it('«Lo quiero» con el grado cambiado manda el combo de ese grado', async () => {
    const user = userEvent.setup();
    const onAddToCart = jest.fn();
    render(<ProductCard product={comboCard()} onAddToCart={onAddToCart} />);

    await user.click(screen.getByRole('button', { name: 'Grado B' }));
    await user.click(screen.getByRole('button', { name: /lo quiero/i }));

    const item = onAddToCart.mock.calls[0][0];
    expect(item.productId).toBe('701');
    expect(item.comboId).toBe(42);
    expect(item.slug).toBe('hp-250-g10-i5-grado-b-combo-42');
    expect(item.name).toBe(`Laptop HP 250 G10 i5 Grado B ${REGALO}`);
    expect(Math.floor(item.monthlyPayment)).toBe(110);
  });

  it('las cards sin combo siguen igual', async () => {
    const user = userEvent.setup();
    const onAddToCart = jest.fn();
    const sueltos: CatalogGradeSibling[] = [
      { grade: 'A', productId: 700, slug: 'hp-250-g10-i5', name: 'HP 250 G10 i5', price: 1800, lowestQuota: 112, minTermQuota: 290, isAvailable: true },
      { grade: 'B', productId: 701, slug: 'hp-250-g10-i5-grado-b', name: 'HP 250 G10 i5 (Grado B)', price: 1650, lowestQuota: 102, minTermQuota: 270, isAvailable: true },
    ];
    render(
      <ProductCard
        product={comboCard({ comboId: undefined, slug: 'hp-250-g10-i5', quotaMonthly: 112, gradeSiblings: sueltos })}
        onAddToCart={onAddToCart}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Grado B' }));
    expect(screen.getAllByText(/102/).length).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: /lo quiero/i }));

    const item = onAddToCart.mock.calls[0][0];
    expect(item.productId).toBe('701');
    expect(item.slug).toBe('hp-250-g10-i5-grado-b');
    expect(item.comboId).toBeUndefined();
  });
});
