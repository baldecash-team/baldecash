import { render, screen } from '@testing-library/react';
import { GamerProductCard } from '../GamerProductCard';
import { gamerTheme } from '../gamerTheme';
import type { CatalogProduct } from '../../../types/catalog';

/**
 * La card de Zona Gamer mostraba `maxTermMonths` junto a la cuota del hook —
 * dos plazos distintos en la misma linea — y la inicial en PORCENTAJE, cuando
 * la card estandar muestra el monto (ProductCard.tsx:824).
 *
 * Los 23 productos que hoy tiene `zona-gamer` tienen hook == maximo y son
 * mensuales, asi que el numero coincide por casualidad. Estos tests usan los
 * casos que hoy no existen en esa landing (BAL-3001).
 */

const BASE = {
  id: '1',
  slug: 'laptop-gamer',
  name: 'Laptop Gamer',
  displayName: 'Laptop Gamer X',
  brand: 'ASUS',
  price: 4000,
  quotaMonthly: 200,
  maxTermMonths: 36,
  images: [],
  specs: {},
  tags: [],
  labels: [],
  colors: [],
} as unknown as CatalogProduct;

function renderCard(overrides: Partial<CatalogProduct>) {
  return render(
    <GamerProductCard
      product={{ ...BASE, ...overrides } as CatalogProduct}
      isDark
      T={gamerTheme(true)}
      isWishlisted={false}
      onWishlistToggle={() => {}}
      isCompared={false}
      onCompare={() => {}}
      onDetail={() => {}}
      onSolicitar={() => {}}
    />,
  );
}

describe('GamerProductCard — plazo', () => {
  it('muestra el plazo del hook, no el maximo', () => {
    renderCard({ hookTermMonths: 24 });
    expect(screen.getByText(/en 24 meses/)).toBeInTheDocument();
    expect(screen.queryByText(/en 36 meses/)).not.toBeInTheDocument();
  });

  it('cae al maximo cuando no hay hook', () => {
    renderCard({});
    expect(screen.getByText(/en 36 meses/)).toBeInTheDocument();
  });

  // Zona Gamer hoy es 100% mensual, pero la conversion debe estar aplicada
  // para que un producto semanal futuro no muestre los meses crudos.
  it('convierte el plazo en productos semanales', () => {
    renderCard({ hookTermMonths: 24, paymentFrequency: 'semanal' });
    expect(screen.getByText(/en 6 meses/)).toBeInTheDocument();
  });
});

describe('GamerProductCard — inicial', () => {
  it('muestra el MONTO, no el porcentaje', () => {
    renderCard({ hookTermMonths: 24, hookInitialPercent: 25, hookInitialAmount: 1000 });
    expect(screen.getByText(/inicial S\/1,?000/)).toBeInTheDocument();
    expect(screen.queryByText(/inicial 25%/)).not.toBeInTheDocument();
  });

  it('dice "sin inicial" cuando no hay', () => {
    renderCard({ hookTermMonths: 24 });
    expect(screen.getByText(/sin inicial/)).toBeInTheDocument();
  });
});
