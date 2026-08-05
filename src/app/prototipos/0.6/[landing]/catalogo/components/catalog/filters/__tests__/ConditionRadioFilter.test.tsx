import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConditionRadioFilter } from '../ConditionRadioFilter';
import { ProductCondition } from '../../../../types/catalog';

// Valores tal como los manda el facet del API ('nueva'/'reacondicionada'), que NO
// coinciden con el enum del front ('nuevo'/'reacondicionado'). El desajuste está
// documentado en utils/condition.ts y el catálogo lo resuelve casteando; los tests
// usan los valores reales para que prueben lo que de verdad llega.
const NUEVA = 'nueva' as ProductCondition;
const REACONDICIONADA = 'reacondicionada' as ProductCondition;

const conditionOptions = [
  { value: NUEVA, label: 'Nuevo', count: 8 },
  { value: REACONDICIONADA, label: 'Semi nuevo', count: 8 },
];

function renderFilter(overrides: Partial<React.ComponentProps<typeof ConditionRadioFilter>> = {}) {
  const onConditionChange = jest.fn();
  const utils = render(
    <ConditionRadioFilter
      conditionOptions={conditionOptions}
      selectedCondition={[]}
      onConditionChange={onConditionChange}
      totalProducts={16}
      {...overrides}
    />,
  );
  return { ...utils, onConditionChange };
}

describe('ConditionRadioFilter', () => {
  it('renders the section titled "Estado del equipo"', () => {
    renderFilter();
    expect(screen.getByText('Estado del equipo')).toBeInTheDocument();
  });

  it('renders one radio per condition plus the "all" option', () => {
    renderFilter();
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    expect(screen.getByRole('radio', { name: /Todos los equipos/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Nuevo/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Semi nuevo/ })).toBeInTheDocument();
  });

  // Los contadores son la razón de ser de la sección: la activadora necesita ver
  // cuántos equipos quedan antes de elegir, con el cliente delante.
  it('shows the total on "all" and each condition count', () => {
    renderFilter();
    expect(screen.getByRole('radio', { name: /Todos los equipos/ })).toHaveTextContent('16');
    expect(screen.getByRole('radio', { name: /^Nuevo/ })).toHaveTextContent('8');
  });

  describe('selection', () => {
    it('marks "all" as checked when no condition is selected', () => {
      renderFilter({ selectedCondition: [] });
      expect(screen.getByRole('radio', { name: /Todos los equipos/ })).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('radio', { name: /^Nuevo/ })).toHaveAttribute('aria-checked', 'false');
    });

    it('marks the selected condition as checked', () => {
      renderFilter({ selectedCondition: [NUEVA] });
      expect(screen.getByRole('radio', { name: /^Nuevo/ })).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('radio', { name: /Todos los equipos/ })).toHaveAttribute('aria-checked', 'false');
    });

    it('replaces the selection instead of adding to it', async () => {
      const { onConditionChange } = renderFilter({ selectedCondition: [NUEVA] });
      await userEvent.click(screen.getByRole('radio', { name: /Semi nuevo/ }));
      expect(onConditionChange).toHaveBeenCalledWith(['reacondicionada']);
    });

    it('clears the condition when picking "all"', async () => {
      const { onConditionChange } = renderFilter({ selectedCondition: [NUEVA] });
      await userEvent.click(screen.getByRole('radio', { name: /Todos los equipos/ }));
      expect(onConditionChange).toHaveBeenCalledWith([]);
    });

    it('keeps the selection when clicking the already selected option', async () => {
      const { onConditionChange } = renderFilter({ selectedCondition: [NUEVA] });
      await userEvent.click(screen.getByRole('radio', { name: /^Nuevo/ }));
      expect(onConditionChange).not.toHaveBeenCalled();
    });
  });

  describe('when there is nothing to choose', () => {
    it('renders nothing with a single condition', () => {
      const { container } = renderFilter({ conditionOptions: [conditionOptions[0]] });
      expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing with no conditions', () => {
      const { container } = renderFilter({ conditionOptions: [] });
      expect(container).toBeEmptyDOMElement();
    });

    it('renders a skeleton while the API has not answered', () => {
      const { container } = renderFilter({ conditionOptions: null });
      expect(screen.queryAllByRole('radio')).toHaveLength(0);
      expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    });
  });
});
