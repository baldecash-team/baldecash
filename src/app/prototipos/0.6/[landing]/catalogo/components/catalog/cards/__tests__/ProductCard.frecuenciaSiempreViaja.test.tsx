import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProductCard } from '../ProductCard';
import type { CatalogProduct } from '../../../../types/catalog';

/**
 * BAL-3994 — la frecuencia de pago tiene que VIAJAR en el item del carrito,
 * tambien cuando es 'mensual'.
 *
 * Hasta este fix la card hacia:
 *
 *     paymentFrequency: isSubMonthlyFreq ? selectedFrequency : undefined
 *
 * o sea, 'mensual' se representaba como AUSENCIA del campo. `JSON.stringify`
 * borra las claves `undefined`, asi que el submit salia sin
 * `payment_frequency` y el backend la rellenaba con
 * `payment_frequency or "mensual"` (ws2/app/services/form_service.py:1117).
 *
 * Mientras el producto tenga celda mensual eso es inofensivo --127 de las 136
 * variantes de Home la tienen--, pero en los 9 celulares que solo se venden en
 * semanal/quincenal la solicitud nacia con una frecuencia que el catalogo NO
 * ofrece, y el pricing se armaba con el gancho de vitrina.
 *
 * Asi nacio L-130507: financiado 4411 y total 2040 --un prestamo donde el
 * cliente devuelve MENOS de lo que recibe-- con la cuota SEMANAL de S/85
 * guardada como si fuera mensual.
 *
 * El test mide el sintoma, no la implementacion: que la clave sobreviva a
 * `JSON.stringify`, que es exactamente lo que se rompia.
 */

// ── Mocks ────────────────────────────────────────────────────────────────
// Mismos stubs que ProductCard.compact.test.tsx (ese archivo no los exporta).

jest.mock('@nextui-org/react', () => ({
  Card: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardBody: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  // El Button de NextUI expone `onPress`, no `onClick`: el stub reenvia los dos
  // o el test mide un boton muerto y pasa sin ejercer nada.
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

function agregarAlCarrito(product: CatalogProduct) {
  const onAddToCart = jest.fn();
  render(<ProductCard product={product} onAddToCart={onAddToCart} />);
  screen.getByRole('button', { name: /lo quiero/i }).click();
  expect(onAddToCart).toHaveBeenCalledTimes(1);
  return onAddToCart.mock.calls[0][0];
}

// ── Tests ────────────────────────────────────────────────────────────────

describe('ProductCard: la frecuencia siempre viaja al carrito (BAL-3994)', () => {
  it('manda paymentFrequency cuando el producto es MENSUAL', () => {
    const item = agregarAlCarrito(buildProduct({ paymentFrequency: 'mensual' } as Partial<CatalogProduct>));

    expect(item.paymentFrequency).toBe('mensual');
  });

  it('la clave sobrevive a JSON.stringify, que es lo que se rompia', () => {
    const item = agregarAlCarrito(buildProduct({ paymentFrequency: 'mensual' } as Partial<CatalogProduct>));

    // El sintoma exacto: con `undefined` la clave DESAPARECE del body y el
    // backend la inventa. Comparar contra 'mensual' no alcanza --el valor
    // final coincide igual--; hay que probar que el campo llega.
    const serializado = JSON.parse(JSON.stringify(item)) as Record<string, unknown>;
    expect('paymentFrequency' in serializado).toBe(true);
    expect(serializado.paymentFrequency).toBe('mensual');
  });

  // Control: la frecuencia sub-mensual ya funcionaba antes del fix. Si este se
  // pusiera rojo, el fix habria roto lo que ya andaba.
  it('CONTROL: la frecuencia sub-mensual sigue viajando como antes', () => {
    const item = agregarAlCarrito(buildProduct({
      paymentFrequency: 'semanal',
      paymentFrequencies: ['semanal'],
    } as Partial<CatalogProduct>));

    expect(item.paymentFrequency).toBe('semanal');
  });
});
