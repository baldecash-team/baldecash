/// <reference types="jest" />
/**
 * `initialData` — evita el segundo `getEntrega` que `EntregaConChrome` ya
 * hizo para decidir el chrome (IMPORTANT 3 de la ronda de revisión 1).
 *
 * `undefined` (el caso de siempre, montado suelto o con `volver` conocido)
 * → este componente sigue haciendo su propio canje, sin cambios.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));

jest.mock('@/app/prototipos/0.6/components/lead/GeoCascadeField', () => ({
  GeoCascadeField: () => null,
}));

jest.mock('@/app/prototipos/0.6/services/entregaApi', () => {
  const real = jest.requireActual('@/app/prototipos/0.6/services/entregaApi');
  return { ...real, getEntrega: jest.fn(), registrarEntrega: jest.fn() };
});

import { getEntrega } from '@/app/prototipos/0.6/services/entregaApi';
import { EntregaTokenClient } from '../EntregaTokenClient';

const mockGet = getEntrega as jest.Mock;

const datos = {
  application_code: 'APP-1',
  fecha_entrega: '2026-09-20',
  equipo: { nombre: 'ExpertBook P1', sku: 'EXP-P1', cuota: '168.00', cuotas: 24, inicial: null },
  direccion: {
    direccion: 'Av. Benavides 1238', calle: 'Dpto 301', referencia: 'Frente al parque',
    departamento: 'Lima', provincia: 'Lima', distrito: 'Miraflores', distrito_id: '1508',
  },
  titular: { nombre: 'Ana Quispe', documento: '45678912' },
};

beforeEach(() => mockGet.mockReset());

it('con initialData: no llama a getEntrega y pinta directo lo que trajo', async () => {
  render(<EntregaTokenClient token="tok" initialData={datos} />);

  expect(await screen.findByText(/ExpertBook P1/)).toBeInTheDocument();
  expect(mockGet).not.toHaveBeenCalled();
});

it('con initialData de error: traduce el estado sin llamar a getEntrega', async () => {
  render(<EntregaTokenClient token="tok" initialData={{ reason: 'expired', error: 'x' }} />);

  expect(await screen.findByText(/Este enlace ya venció/)).toBeInTheDocument();
  expect(mockGet).not.toHaveBeenCalled();
});

it('"Reintentar" tras un initialData de red SÍ vuelve a canjear (no es el duplicado que se evita)', async () => {
  mockGet.mockResolvedValue(datos);
  render(<EntregaTokenClient token="tok" initialData={{ reason: 'network', error: 'x' }} />);

  const boton = await screen.findByRole('button', { name: /Reintentar/i });
  await userEvent.click(boton);

  await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1));
  expect(await screen.findByText(/ExpertBook P1/)).toBeInTheDocument();
});

it('sin initialData: se comporta como siempre, canjeando el token', async () => {
  mockGet.mockResolvedValue(datos);
  render(<EntregaTokenClient token="tok" />);

  expect(await screen.findByText(/ExpertBook P1/)).toBeInTheDocument();
  expect(mockGet).toHaveBeenCalledTimes(1);
});
