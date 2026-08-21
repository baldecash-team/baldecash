/**
 * El texto y el color del badge de condición los manda la BD (BAL-3226).
 *
 * Llegan por el facet `conditions[]` de `/{slug}/filters`, que desde BAL-3226
 * los resuelve contra `product_label` — la misma fila que Haru edita en
 * Pricing → Etiquetas. Las constantes de `ConditionBadge` son solo el respaldo
 * para cuando el facet todavía no cargó.
 *
 * Si alguien vuelve a forzar el texto en el código, estos tests se ponen rojos.
 * Ya pasó una vez: hasta BAL-3204 la función forzaba «Semi nuevo» y descartaba
 * lo que mandaba el backend, así que cambiar el texto en BD no tenía efecto.
 */
import { render, screen } from '@testing-library/react';
import { ConditionBadge } from '../ConditionBadge';

describe('ConditionBadge — el texto lo manda el facet', () => {
  it('usa el label del facet, no la constante del código', () => {
    render(
      <ConditionBadge
        conditionCode="reacondicionada"
        conditions={[
          { value: 'reacondicionada', label: 'Reacondicionado', color: '#0099FF' },
        ] as never}
      />,
    );

    expect(screen.getByText('Reacondicionado')).toBeInTheDocument();
    expect(screen.queryByText('Semi nuevo')).toBeNull();
  });

  it('un texto editado en el admin llega tal cual a la card', () => {
    // El caso real: Haru cambia el texto en Pricing → Etiquetas y el catálogo
    // lo refleja sin desplegar.
    render(
      <ConditionBadge
        conditionCode="reacondicionada"
        conditions={[
          { value: 'reacondicionada', label: 'SEMINUEVO PREMIUM', color: '#123456' },
        ] as never}
      />,
    );

    expect(screen.getByText('SEMINUEVO PREMIUM')).toBeInTheDocument();
  });

  it('open_box también pinta badge, con su propio texto', () => {
    // La regla es una sola --se pinta si la condición no es «nueva»--, así que
    // open_box entra por descarte, sin código propio.
    render(
      <ConditionBadge
        conditionCode="open_box"
        conditions={[{ value: 'open_box', label: 'Open Box', color: '#6366F1' }] as never}
      />,
    );

    expect(screen.getByText('Open Box')).toBeInTheDocument();
  });

  it('no pinta nada para un equipo nuevo', () => {
    const { container } = render(
      <ConditionBadge
        conditionCode="nueva"
        conditions={[{ value: 'nueva', label: 'Nuevo', color: '#10B981' }] as never}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('sin facet cae al respaldo, no se queda sin texto', () => {
    // La card puede pintarse antes de que carguen los filtros. Ahí manda la
    // constante del código, y por eso sigue existiendo.
    render(<ConditionBadge conditionCode="reacondicionada" conditions={null} />);

    expect(screen.getByText('Semi nuevo')).toBeInTheDocument();
  });
});
