import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EquipoPedidoCard } from '../EquipoPedidoCard';

/**
 * BAL-4193: el equipo que el cliente PIDIÓ puede haber salido del catálogo
 * (agotado/despublicado) entre que se armó la oferta y que el cliente la abre.
 * `availableInCatalog === false` debe:
 *  - apagar la card (variante 'disponible' se ve/comporta como 'excede'),
 *  - mostrar el badge "Ya no disponible",
 *  - quitar el CTA "Mantener este equipo" del DOM (no solo ocultarlo).
 *
 * `availableInCatalog` ausente/null (backend viejo) debe comportarse IGUAL que
 * antes de este ticket: sin badge, sin tocar el CTA.
 */

const BASE_PROPS = {
  nombre: 'Laptop Lenovo V15',
  imageUrl: 'https://cdn.baldecash.com/equipos/v15.png',
  monthly: 120,
  termMonths: 24,
  paymentFrequency: 'mensual',
};

describe('EquipoPedidoCard — variant "disponible" (Caso 5 upsell)', () => {
  test('sin availableInCatalog (backend viejo): se comporta como disponible, con CTA', () => {
    const onElegir = jest.fn();
    render(
      <EquipoPedidoCard
        {...BASE_PROPS}
        variant="disponible"
        ctaText="Mantener este equipo"
        onElegir={onElegir}
      />,
    );
    expect(screen.getByRole('button', { name: 'Mantener este equipo' })).toBeInTheDocument();
    expect(screen.queryByText('Ya no disponible')).not.toBeInTheDocument();
  });

  test('availableInCatalog=false: sin CTA (ni en el DOM) y con el badge "Ya no disponible"', async () => {
    const user = userEvent.setup();
    const onElegir = jest.fn();
    render(
      <EquipoPedidoCard
        {...BASE_PROPS}
        variant="disponible"
        ctaText="Mantener este equipo"
        onElegir={onElegir}
        availableInCatalog={false}
      />,
    );

    expect(screen.getByText('Ya no disponible')).toBeInTheDocument();
    expect(
      screen.getByText('Este equipo ya no está en nuestro catálogo. Elige otra opción de tu oferta.'),
    ).toBeInTheDocument();
    // El botón no existe en el DOM: no se puede clickear ni con mouse ni con Tab.
    expect(screen.queryByRole('button', { name: 'Mantener este equipo' })).not.toBeInTheDocument();

    // Tabear todo el documento nunca debería disparar onElegir (no hay foco posible).
    await user.tab();
    await user.tab();
    await user.tab();
    expect(onElegir).not.toHaveBeenCalled();
  });

  test('availableInCatalog=true: igual que sin el campo (disponible, con CTA)', () => {
    render(
      <EquipoPedidoCard
        {...BASE_PROPS}
        variant="disponible"
        ctaText="Mantener este equipo"
        onElegir={jest.fn()}
        availableInCatalog
      />,
    );
    expect(screen.getByRole('button', { name: 'Mantener este equipo' })).toBeInTheDocument();
    expect(screen.queryByText('Ya no disponible')).not.toBeInTheDocument();
  });
});

describe('EquipoPedidoCard — variant "excede" (Caso 4 downgrade, informativa)', () => {
  test('sin availableInCatalog: solo el badge "Excede tu cuota" (comportamiento previo)', () => {
    render(<EquipoPedidoCard {...BASE_PROPS} variant="excede" />);
    expect(screen.getByText('Excede tu cuota')).toBeInTheDocument();
    expect(screen.queryByText('Ya no disponible')).not.toBeInTheDocument();
  });

  test('availableInCatalog=false: agrega "Ya no disponible" junto a "Excede tu cuota", sin CTA', () => {
    render(<EquipoPedidoCard {...BASE_PROPS} variant="excede" availableInCatalog={false} />);
    expect(screen.getByText('Excede tu cuota')).toBeInTheDocument();
    expect(screen.getByText('Ya no disponible')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /mantener/i })).not.toBeInTheDocument();
  });
});
