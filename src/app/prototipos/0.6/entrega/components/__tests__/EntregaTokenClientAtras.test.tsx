/// <reference types="jest" />
/**
 * "← Volver al contrato" — gate G1 de las gates de navegación del envío
 * anticipado.
 *
 * `atras` es a dónde vuelve el control si la persona se arrepiente ANTES de
 * terminar de coordinar la entrega: el contrato que acaba de firmar. Lo pone
 * `ContratoEnWizard`/`kycClient.tsx` al armar esta URL; el enlace de WhatsApp
 * no lo trae, y ahí el control no puede aparecer (cero regresión).
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

const push = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

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

const ATRAS = '/prototipos/0.6/renueva-tu-equipo-1-a/solicitar/resumen';

const datos = {
  application_code: 'APP-1',
  fecha_entrega: '2026-09-20',
  equipo: { nombre: 'ExpertBook P1', cuota: '168.00', cuotas: 24, inicial: null },
  direccion: {
    direccion: 'Av. Benavides 1238', calle: 'Dpto 301', referencia: 'Frente al parque',
    departamento: 'Lima', provincia: 'Lima', distrito: 'Miraflores', distrito_id: '1508',
  },
  titular: { nombre: 'Ana Quispe', documento: '45678912' },
};

beforeEach(() => {
  push.mockReset();
  mockGet.mockReset().mockResolvedValue(datos);
});

it('con atras: muestra "Volver al contrato" y navega ahí al hacer clic', async () => {
  render(<EntregaTokenClient token="tok" atras={ATRAS} />);

  const boton = await screen.findByRole('button', { name: /Volver al contrato/i });
  await userEvent.click(boton);

  expect(push).toHaveBeenCalledWith(ATRAS);
});

it('sin atras: no muestra el control (enlace de WhatsApp, cero regresión)', async () => {
  render(<EntregaTokenClient token="tok" />);

  await screen.findByText(/ExpertBook P1/);
  expect(screen.queryByRole('button', { name: /Volver al contrato/i })).not.toBeInTheDocument();
});
