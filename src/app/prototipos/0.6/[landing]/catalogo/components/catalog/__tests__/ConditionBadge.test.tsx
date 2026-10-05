/**
 * El texto y el color del badge de condición los manda el backend resuelto
 * (BAL-3261, `catalog_rules.condition_badges`), la misma función que usan los
 * tres modales de pricing del admin.
 *
 * Antes `ConditionBadge` buscaba el texto en el facet `conditions[]` y tenía
 * su propia lista de qué condición cuenta como "nueva" (`NEW_CONDITION_CODES`).
 * Esa regla vivía duplicada: el admin, que no lee el facet, mostraba las
 * cards sin badge. Ahora el componente solo pinta `conditionLabelText` /
 * `conditionLabelColor`; si el texto llega `null`, la card no lleva badge.
 *
 * Si alguien vuelve a derivar el texto en el código, estos tests se ponen
 * rojos. Ya pasó una vez: hasta BAL-3204 la función forzaba «Semi nuevo» y
 * descartaba lo que mandaba el backend, así que cambiar el texto en BD no
 * tenía efecto.
 */
import { render, screen } from '@testing-library/react';
import { ConditionBadge } from '../ConditionBadge';

describe('ConditionBadge — pinta lo que manda el backend', () => {
  it('pinta el texto y el color que llegan', () => {
    render(
      <ConditionBadge conditionLabelText="Reacondicionado" conditionLabelColor="#0099FF" />,
    );

    expect(screen.getByText('Reacondicionado')).toBeInTheDocument();
  });

  it('un texto distinto llega tal cual a la card', () => {
    // El caso real: Haru cambia el texto en Pricing → Etiquetas y el catálogo
    // lo refleja sin desplegar. El componente no tiene ninguna constante que
    // lo pise.
    render(
      <ConditionBadge conditionLabelText="SEMINUEVO PREMIUM" conditionLabelColor="#123456" />,
    );

    expect(screen.getByText('SEMINUEVO PREMIUM')).toBeInTheDocument();
  });

  it('open_box también pinta badge, con su propio texto', () => {
    // El componente ya no distingue condiciones por código: pinta lo que
    // llega, sea cual sea la condición que el backend haya resuelto.
    render(<ConditionBadge conditionLabelText="Open Box" conditionLabelColor="#6366F1" />);

    expect(screen.getByText('Open Box')).toBeInTheDocument();
  });

  it('sin texto no pinta nada', () => {
    // La regla de qué condición merece badge vive en el backend
    // (`condition_badges` excluye `nueva`). El front ya no la duplica: si el
    // backend no manda texto, no hay nada que derivar ni que mostrar.
    const { container } = render(
      <ConditionBadge conditionLabelText={null} conditionLabelColor={null} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('sin color usa un gris de respaldo, no deja el badge sin fondo', () => {
    render(<ConditionBadge conditionLabelText="Open Box" conditionLabelColor={null} />);

    expect(screen.getByText('Open Box')).toBeInTheDocument();
  });
});
