import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { SegurosIncluidosEnCombo, FilasIncluidasEnCombo } from '../SegurosIncluidosEnCombo';
import type { InsurancePlan } from '../../../types/upsell';

const robo = { id: '16', name: 'Seguro contra Robo 24M', insuranceType: 'seguro_robo', durationMonths: 24, includedInCombo: true } as InsurancePlan;

describe('SegurosIncluidosEnCombo', () => {
  it('pinta el seguro fijo: marcado, S/0, «Incluido en tu combo» y sin botones', () => {
    render(<SegurosIncluidosEnCombo seguros={[robo]} />);
    const fila = screen.getByTestId('seguro-incluido-16');
    expect(within(fila).getByText('Seguro contra Robo 24M')).toBeInTheDocument();
    expect(within(fila).getByText('S/0')).toBeInTheDocument();
    expect(within(fila).getByText('Incluido en tu combo')).toBeInTheDocument();
    expect(within(fila).getByRole('checkbox', { checked: true })).toBeDisabled();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('sin seguros no pinta nada', () => {
    const { container } = render(<SegurosIncluidosEnCombo seguros={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('FilasIncluidasEnCombo', () => {
  it('una fila por seguro con «Incluido en tu combo»', () => {
    render(<FilasIncluidasEnCombo seguros={[
      { planId: '16', name: 'Robo 24M', durationMonths: 24, insuranceType: 'seguro_robo' },
      { planId: '14', name: 'Garantía 24M', durationMonths: 24, insuranceType: 'garantia_extendida' },
    ]} />);
    expect(screen.getAllByText('Incluido en tu combo')).toHaveLength(2);
    expect(screen.getByText('Garantía 24M')).toBeInTheDocument();
  });
});
