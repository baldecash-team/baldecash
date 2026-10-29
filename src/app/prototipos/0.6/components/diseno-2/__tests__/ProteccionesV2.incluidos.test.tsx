import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { ProteccionesV2 } from '../paso4/ProteccionesV2';
import type { InsurancePlan } from '@/app/prototipos/0.6/[landing]/solicitar/types/upsell';

jest.mock('../paso4/HojaSeguroV2', () => ({ HojaSeguroV2: () => null }));
jest.mock('@/app/prototipos/0.6/analytics/useAnalytics', () => ({ useAnalytics: () => ({ trackInsuranceViewTerms: jest.fn() }) }));
jest.mock('@/app/prototipos/0.6/[landing]/solicitar/components/upsell/InsuranceCards', () => ({ getDescription: () => '' }));

const robo = { id: '16', name: 'Seguro contra Robo 24M', insuranceType: 'seguro_robo', monthlyPrice: 0, includedInCombo: true } as InsurancePlan;
const ma = { id: '23', name: 'Multiasistencia', insuranceType: 'multiasistencia', monthlyPrice: 10 } as InsurancePlan;

const base = { cargando: false, elegidos: [], alternar: jest.fn(), tipoDeEquipo: 'laptop', landing: 'home', frecuencia: 'mensual' };

it('el incluido sale fijo, a S/0, sin «Agregar»; el otro tipo se ofrece con su precio', () => {
  render(<ProteccionesV2 {...base} planes={[ma]} incluidos={[robo]} />);
  const incluido = document.querySelector('[data-incluido-v2="16"]') as HTMLElement;
  expect(incluido).not.toBeNull();
  expect(within(incluido).getByText('S/0')).toBeInTheDocument();
  expect(within(incluido).getByText('Incluido en tu combo')).toBeInTheDocument();
  expect(within(incluido).queryByRole('button')).toBeNull();
  expect(screen.getByRole('button', { name: 'Agregar Multiasistencia' })).toBeInTheDocument();
});

it('solo incluidos: la sección existe igual', () => {
  render(<ProteccionesV2 {...base} planes={[]} incluidos={[robo]} />);
  expect(document.querySelector('[data-incluido-v2="16"]')).not.toBeNull();
});

it('D7: en quincenal el incluido igual sale «Incluido en tu combo» a S/0', () => {
  render(<ProteccionesV2 {...base} frecuencia="quincenal" planes={[]} incluidos={[robo]} />);
  const incluido = document.querySelector('[data-incluido-v2="16"]') as HTMLElement;
  expect(within(incluido).getByText('S/0')).toBeInTheDocument();
  expect(within(incluido).getByText('Incluido en tu combo')).toBeInTheDocument();
});
