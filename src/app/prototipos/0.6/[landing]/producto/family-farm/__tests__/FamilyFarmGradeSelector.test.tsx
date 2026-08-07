import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FamilyFarmGradeSelector } from '../FamilyFarmGradeSelector';
import { GRADE_COPY, GRADE_HEADING, GRADE_NOTE, GRADE_SAVINGS_LABEL, GRADE_SUBHEADING } from '../familyFarmGrades';

const grades = [
  { grade: 'A' as const, price: 574, isAvailable: true },
  { grade: 'B' as const, price: 402, isAvailable: true },
  { grade: 'C' as const, price: 287, isAvailable: true },
];

function renderSelector(overrides: Partial<React.ComponentProps<typeof FamilyFarmGradeSelector>> = {}) {
  const onSelect = jest.fn();
  const utils = render(
    <FamilyFarmGradeSelector grades={grades} selected="A" onSelect={onSelect} {...overrides} />,
  );
  return { ...utils, onSelect };
}

describe('FamilyFarmGradeSelector', () => {
  it('renders one card per grade received', () => {
    renderSelector();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  // El set de grados lo decide el catálogo, no el frontend: el iPhone 13 Midnight
  // en producción solo tiene B y C. Inventar un Grado A sería ofrecer algo que no
  // se puede comprar.
  it('renders only the grades that exist, without filling in the missing ones', () => {
    renderSelector({ grades: grades.slice(1), selected: 'B' });
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
    expect(screen.queryByRole('radio', { name: /Grado A/ })).not.toBeInTheDocument();
  });

  it('shows each grade title and price on its card', () => {
    renderSelector();
    const cardA = screen.getByRole('radio', { name: /Grado A/ });
    expect(cardA).toHaveTextContent(GRADE_COPY.A.titulo);
    expect(cardA).toHaveTextContent('S/574');
  });

  it('omits the price when the grade does not bring one', () => {
    renderSelector({ grades: [{ grade: 'A', isAvailable: true }], selected: 'A' });
    expect(screen.getByRole('radio', { name: /Grado A/ })).not.toHaveTextContent('S/');
  });

  describe('selection', () => {
    it('marks the selected grade', () => {
      renderSelector({ selected: 'B' });
      expect(screen.getByRole('radio', { name: /Grado B/ })).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('radio', { name: /Grado A/ })).toHaveAttribute('aria-checked', 'false');
    });

    it('reports the picked grade', async () => {
      const { onSelect } = renderSelector();
      await userEvent.click(screen.getByRole('radio', { name: /Grado C/ }));
      expect(onSelect).toHaveBeenCalledWith('C');
    });

    it('stays quiet when picking the one already selected', async () => {
      const { onSelect } = renderSelector({ selected: 'A' });
      await userEvent.click(screen.getByRole('radio', { name: /Grado A/ }));
      expect(onSelect).not.toHaveBeenCalled();
    });

    it('does not offer an unavailable grade', async () => {
      const { onSelect } = renderSelector({
        grades: [grades[0], { grade: 'B', price: 402, isAvailable: false }],
      });
      const cardB = screen.getByRole('radio', { name: /Grado B/ });
      expect(cardB).toBeDisabled();
      await userEvent.click(cardB);
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe('explanatory box', () => {
    it('describes the selected grade', () => {
      renderSelector({ selected: 'C' });
      const box = screen.getByTestId('grade-box');
      expect(box).toHaveTextContent(`Grado C · ${GRADE_COPY.C.titulo}`);
      expect(box).toHaveTextContent(GRADE_COPY.C.resumen);
    });

    it('lists what to expect from the selected grade', () => {
      renderSelector({ selected: 'B' });
      const box = screen.getByTestId('grade-box');
      expect(box).toHaveTextContent('¿Qué puedes esperar?');
      GRADE_COPY.B.espera.forEach((item) => expect(box).toHaveTextContent(item));
    });

    // El color es la señal de identidad del grado: sin él las tres tarjetas se
    // leen iguales y el cuadro no dice nada distinto al cambiar.
    it.each([
      ['A', 'gradeA'],
      ['B', 'gradeB'],
      ['C', 'gradeC'],
    ] as const)('paints the box with the %s palette', (grade, expectedClass) => {
      renderSelector({ selected: grade });
      expect(screen.getByTestId('grade-box').className).toContain(expectedClass);
    });

    it('follows the selection when it changes', () => {
      const { rerender } = renderSelector({ selected: 'A' });
      expect(within(screen.getByTestId('grade-box')).getByText(/Grado A/)).toBeInTheDocument();

      rerender(<FamilyFarmGradeSelector grades={grades} selected="C" onSelect={jest.fn()} />);
      expect(within(screen.getByTestId('grade-box')).getByText(/Grado C/)).toBeInTheDocument();
    });
  });

  // El diseño remata el cuadro con cuánto ahorra el grado elegido. Se compara
  // contra el mejor grado que el equipo tiene de verdad, no contra un "nuevo"
  // que no existe en el catálogo (ver gradeSavings).
  describe('savings', () => {
    it('shows how much the picked grade saves against the best one', () => {
      renderSelector({ selected: 'C' });
      const box = screen.getByTestId('grade-box');
      expect(box).toHaveTextContent(GRADE_SAVINGS_LABEL);
      expect(box).toHaveTextContent('S/287');
      expect(box).toHaveTextContent('50% menos');
    });

    it('hides it on the best grade, which is the reference itself', () => {
      renderSelector({ selected: 'A' });
      expect(screen.getByTestId('grade-box')).not.toHaveTextContent(GRADE_SAVINGS_LABEL);
    });

    it('falls back to the best grade the product actually has', () => {
      // Solo B y C, como el Lenovo Tab P11: C se compara contra B.
      const twoGrades = [
        { grade: 'B' as const, price: 940, isAvailable: true },
        { grade: 'C' as const, price: 672, isAvailable: true },
      ];
      renderSelector({ grades: twoGrades, selected: 'C' });
      expect(screen.getByTestId('grade-box')).toHaveTextContent('S/268');
    });

    it('stays out when there is no price to compare', () => {
      renderSelector({ grades: [{ grade: 'A', isAvailable: true }, { grade: 'C', isAvailable: true }], selected: 'C' });
      expect(screen.getByTestId('grade-box')).not.toHaveTextContent(GRADE_SAVINGS_LABEL);
    });
  });

  it('keeps the reassurance note visible', () => {
    renderSelector();
    expect(screen.getByText(GRADE_NOTE)).toBeInTheDocument();
  });

  it('renders nothing when there are no grades to choose from', () => {
    const { container } = renderSelector({ grades: [] });
    expect(container).toBeEmptyDOMElement();
  });

  // En mobile el bloque vive dentro de un acordeón que ya trae su propio título;
  // repetirlo dejaría el encabezado dos veces, uno encima del otro.
  describe('showHeading', () => {
    it('shows the heading by default', () => {
      renderSelector();
      expect(screen.getByRole('heading', { name: GRADE_HEADING })).toBeInTheDocument();
    });

    it('hides the heading when the host already provides one', () => {
      renderSelector({ showHeading: false });
      expect(screen.queryByRole('heading', { name: GRADE_HEADING })).not.toBeInTheDocument();
      expect(screen.queryByText(GRADE_SUBHEADING)).not.toBeInTheDocument();
      // Lo que sí se mantiene: las tarjetas y el cuadro.
      expect(screen.getAllByRole('radio')).toHaveLength(3);
      expect(screen.getByTestId('grade-box')).toBeInTheDocument();
    });
  });
});
