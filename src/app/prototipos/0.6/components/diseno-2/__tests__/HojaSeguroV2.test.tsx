/**
 * Hoja "¿Qué cubre?" propia de Diseño 2 (prototipo de Brenda), con lo que
 * arregló el QA en celular (BAL-4969, bug 1): portal a <body>, diálogo modal,
 * Escape, foco adentro y de vuelta al cerrar.
 */
import React, { useState } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HojaSeguroV2, coberturasDelPlan } from '../paso4/HojaSeguroV2';
import type { InsurancePlan } from '@/app/prototipos/0.6/[landing]/solicitar/types/upsell';

const PLAN = {
  id: '14', code: 'INS-GE', name: 'Garantía Extendida Laptop 24M', description: 'Garantía', monthlyPrice: 20, totalPrice: 480,
  paymentMonths: 24, insuranceType: 'garantia_extendida', tier: 'basic', isRecommended: false, coverage: [], exclusions: [],
  durationMonths: 24, provider: { name: 'Insurama', code: 'INSURAMA' }, imageUrl: null,
} as unknown as InsurancePlan;

function Pantalla({ plan = PLAN, onAlternar = jest.fn() }: { plan?: InsurancePlan; onAlternar?: () => void }) {
  const [abierto, setAbierto] = useState<InsurancePlan | null>(null);
  return (
    <div data-testid="paso" style={{ position: 'relative', zIndex: 10 }}>
      <button type="button" onClick={() => setAbierto(plan)}>¿Qué cubre?</button>
      <HojaSeguroV2 plan={abierto} elegido={false} onAlternar={onAlternar} onCerrar={() => setAbierto(null)} landing="pago-diferido" frecuencia="mensual" />
    </div>
  );
}

beforeEach(() => {
  // Sin animación de salida: cierra al instante.
  window.matchMedia = jest.fn().mockImplementation((q: string) => ({
    matches: q.includes('reduce'), media: q, addEventListener: jest.fn(), removeEventListener: jest.fn(), addListener: jest.fn(), removeListener: jest.fn(),
  })) as unknown as typeof window.matchMedia;
});

describe('HojaSeguroV2', () => {
  it('va en un portal a <body> como diálogo modal con el contenido del prototipo', () => {
    render(<Pantalla />);
    fireEvent.click(screen.getByRole('button', { name: '¿Qué cubre?' }));
    const hoja = screen.getByRole('dialog', { name: PLAN.name });
    expect(hoja).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByTestId('paso')).not.toContainElement(hoja);
    expect(hoja).toHaveTextContent('+S/20');
    expect(hoja).toHaveTextContent('S/480 en 24 cuotas');
    expect(hoja).toHaveTextContent('Insurama');
    expect(screen.getByRole('link', { name: 'Ver términos y condiciones' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Agregar a mi solicitud' })).toBeInTheDocument();
    for (const c of coberturasDelPlan('garantia_extendida')) expect(hoja).toHaveTextContent(c);
  });

  it('el foco entra a la hoja, Escape la cierra y el foco vuelve a «¿Qué cubre?»', () => {
    render(<Pantalla />);
    const abrir = screen.getByRole('button', { name: '¿Qué cubre?' });
    abrir.focus();
    fireEvent.click(abrir);
    expect(screen.getByRole('dialog')).toHaveFocus();
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(abrir).toHaveFocus();
  });

  it('«Agregar a mi solicitud» elige el plan y cierra', () => {
    const onAlternar = jest.fn();
    render(<Pantalla onAlternar={onAlternar} />);
    fireEvent.click(screen.getByRole('button', { name: '¿Qué cubre?' }));
    fireEvent.click(screen.getByRole('button', { name: 'Agregar a mi solicitud' }));
    expect(onAlternar).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('la multiasistencia (solo informativa) no ofrece agregar desde la hoja', () => {
    render(<Pantalla plan={{ ...PLAN, id: '9', name: 'Multiasistencia BaldeCash', insuranceType: 'multiasistencia' } as InsurancePlan} />);
    fireEvent.click(screen.getByRole('button', { name: '¿Qué cubre?' }));
    expect(screen.queryByRole('button', { name: 'Agregar a mi solicitud' })).toBeNull();
    expect(screen.getAllByRole('button', { name: 'Cerrar' })).toHaveLength(2);
  });
});
