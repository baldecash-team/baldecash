/**
 * BAL-4969 (casuísticas): reglas de las guardas del paso en Diseño 2 y el
 * aviso de tope junto a la protección que no se dejó agregar en el Paso 4.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  guardaActivaV2,
  textoDeGuardaV2,
  proteccionPasaElTope,
  textoDeTopeDelPlan,
  type EstadoDeGuardasV2,
} from '../guardasV2';

jest.mock('@/app/prototipos/0.6/analytics/useAnalytics', () => ({
  useAnalytics: () => ({ trackInsuranceViewTerms: jest.fn() }),
}));
jest.mock('../paso4/HojaSeguroV2', () => ({ HojaSeguroV2: () => null }));

import { ProteccionesV2 } from '../paso4/ProteccionesV2';

const base: EstadoDeGuardasV2 = {
  productoHidratado: true,
  hayProducto: true,
  enviado: false,
  hayNoDisponibles: false,
  flujoCargado: true,
  cuponObligatorio: false,
  hayCupon: false,
  plazosDistintos: false,
  sobreElTope: false,
  maximo: 600,
  conProtecciones: false,
};

describe('guardaActivaV2', () => {
  it('sin nada que bloquear: null', () => {
    expect(guardaActivaV2(base)).toBeNull();
  });
  it('el orden: sin producto > sin stock > cupón > plazos > tope', () => {
    const todo = { ...base, hayProducto: false, hayNoDisponibles: true, cuponObligatorio: true, plazosDistintos: true, sobreElTope: true };
    expect(guardaActivaV2(todo)?.tipo).toBe('sin-producto');
    expect(guardaActivaV2({ ...todo, hayProducto: true })?.tipo).toBe('sin-stock');
    expect(guardaActivaV2({ ...todo, hayProducto: true, hayNoDisponibles: false })?.tipo).toBe('cupon');
    expect(guardaActivaV2({ ...todo, hayProducto: true, hayNoDisponibles: false, hayCupon: true })?.tipo).toBe('plazos');
    expect(guardaActivaV2({ ...base, sobreElTope: true })).toEqual({ tipo: 'tope', maximo: 600, conProtecciones: false });
  });
  it('después de enviar o antes de hidratar no hay guarda de producto', () => {
    expect(guardaActivaV2({ ...base, hayProducto: false, enviado: true })).toBeNull();
    expect(guardaActivaV2({ ...base, hayProducto: false, productoHidratado: false })).toBeNull();
  });
  it('el cupón espera a que cargue el flujo', () => {
    expect(guardaActivaV2({ ...base, cuponObligatorio: true, flujoCargado: false })).toBeNull();
  });
});

describe('textoDeGuardaV2', () => {
  it('tope con protecciones ofrece quitarlas; sin ellas, cambiar plazo', () => {
    expect(textoDeGuardaV2({ tipo: 'tope', maximo: 600, conProtecciones: true }).accion.tipo).toBe('quitar-protecciones');
    expect(textoDeGuardaV2({ tipo: 'tope', maximo: 600, conProtecciones: false }).accion.tipo).toBe('cambiar-plazo');
  });
  it('ninguna guarda manda a la intro de Diseño 1', () => {
    for (const g of [{ tipo: 'sin-producto' }, { tipo: 'sin-stock' }, { tipo: 'cupon' }, { tipo: 'plazos' }] as const) {
      expect(['catalogo', 'origen']).toContain(textoDeGuardaV2(g).accion.tipo);
    }
  });
});

describe('proteccionPasaElTope', () => {
  it('suma la protección a la cuota actual', () => {
    expect(proteccionPasaElTope(580, 25, 600)).toBe(true);
    expect(proteccionPasaElTope(570, 25, 600)).toBe(false);
  });
  it('sin tope configurado no bloquea', () => {
    expect(proteccionPasaElTope(5000, 25, 0)).toBe(false);
  });
});

describe('ProteccionesV2 · aviso de tope junto a la protección', () => {
  const plan = (id: string, name: string) => ({
    id,
    code: id,
    name,
    description: '',
    monthlyPrice: 25,
    totalPrice: 600,
    paymentMonths: 24,
    insuranceType: 'seguro_robo',
    tier: 'basic',
    isRecommended: false,
    coverage: [],
    exclusions: [],
    durationMonths: 24,
    provider: null,
  });

  it('pinta el aviso solo en la protección que lo causó', () => {
    render(
      <ProteccionesV2
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        planes={[plan('a', 'Robo'), plan('b', 'Daño')] as any}
        cargando={false}
        elegidos={[]}
        alternar={jest.fn()}
        tipoDeEquipo="Laptop"
        landing="pago-diferido"
        avisoDelPlan={{ planId: 'b', texto: textoDeTopeDelPlan(600) }}
      />,
    );
    const avisos = screen.getAllByRole('alert');
    expect(avisos).toHaveLength(1);
    expect(avisos[0].closest('[data-plan-v2]')).toHaveAttribute('data-plan-v2', 'b');
    expect(avisos[0]).toHaveTextContent('S/600');
  });
});
