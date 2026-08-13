/// <reference types="jest" />
/**
 * EntregaClient — ruta `/entrega/[token]`.
 *
 * Cubre los cinco caminos: datos válidos (formulario), enlace vencido, enlace
 * inválido, red, y el envío. Más las dos validaciones que se hacen del lado
 * del cliente para no gastarle un viaje a alguien con mala señal.
 *
 * `jest.spyOn` sobre imports de módulo NO funciona en este repo (Next 16/SWC
 * compila los exports como propiedades no configurables), así que se mockea el
 * módulo completo — mismo patrón que `ResumeClient.test.tsx`.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

jest.mock('@/app/prototipos/0.6/services/entregaApi', () => {
  const real = jest.requireActual('@/app/prototipos/0.6/services/entregaApi');
  return {
    ...real,
    getEntrega: jest.fn(),
    registrarEntrega: jest.fn(),
  };
});

import {
  getEntrega,
  registrarEntrega,
} from '@/app/prototipos/0.6/services/entregaApi';
import { EntregaClient, formatearFecha } from '../EntregaClient';

const mockGet = getEntrega as jest.Mock;
const mockPost = registrarEntrega as jest.Mock;

const datos = {
  application_code: 'SOL-1',
  fecha_entrega: '2026-08-20',
  equipo: { nombre: 'iPhone 15 128GB', sku: 'IP15-128' },
  direccion: {
    direccion: 'Av. Siempre Viva', calle: null, referencia: null,
    departamento: 'Lima', provincia: 'Lima', distrito: 'Miraflores',
  },
  titular: { nombre: 'Ana Quispe', documento: '45678912' },
};

beforeEach(() => {
  mockGet.mockReset();
  mockPost.mockReset();
});

describe('formatearFecha', () => {
  it('no corre la fecha un día para atrás', () => {
    // `new Date("2026-08-20")` es UTC y en Lima (-5) cae el 19. El bug clásico
    // de este dato, y acá el cliente lo lee como una promesa.
    expect(formatearFecha('2026-08-20')).toBe('20/08/2026');
  });
});

describe('EntregaClient', () => {
  it('muestra el equipo y la fecha de entrega', async () => {
    mockGet.mockResolvedValue(datos);
    render(<EntregaClient token="tok" />);

    expect(await screen.findByText(/iPhone 15 128GB/)).toBeInTheDocument();
    expect(screen.getByText(/20\/08\/2026/)).toBeInTheDocument();
  });

  it('precarga la dirección declarada al postular', async () => {
    // Corregir es mucho más barato que tipear de cero, y la dirección vieja
    // suele ser la buena.
    mockGet.mockResolvedValue(datos);
    render(<EntregaClient token="tok" />);

    await waitFor(() =>
      expect(screen.getByDisplayValue('Av. Siempre Viva')).toBeInTheDocument());
    expect(screen.getByDisplayValue('Miraflores')).toBeInTheDocument();
  });

  it('no envía sin referencia', async () => {
    mockGet.mockResolvedValue(datos);
    render(<EntregaClient token="tok" />);
    await screen.findByText(/iPhone 15 128GB/);

    await userEvent.click(screen.getByRole('button', { name: /Confirmar entrega/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/referencia/i);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('pide los datos de la otra persona si no recibe el titular', async () => {
    mockGet.mockResolvedValue({
      ...datos,
      direccion: { ...datos.direccion, referencia: 'Frente al parque' },
    });
    render(<EntregaClient token="tok" />);
    await screen.findByText(/iPhone 15 128GB/);

    await userEvent.click(screen.getByLabelText(/Otra persona/i));
    await userEvent.click(screen.getByRole('button', { name: /Confirmar entrega/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/quien va a recibir/i);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('envía y confirma', async () => {
    mockGet.mockResolvedValue({
      ...datos,
      direccion: { ...datos.direccion, referencia: 'Frente al parque' },
    });
    mockPost.mockResolvedValue({ ok: true });
    render(<EntregaClient token="tok" />);
    await screen.findByText(/iPhone 15 128GB/);

    await userEvent.click(screen.getByRole('button', { name: /Confirmar entrega/i }));

    expect(await screen.findByText(/¡Listo!/)).toBeInTheDocument();
    expect(mockPost).toHaveBeenCalledWith(
      'tok',
      expect.objectContaining({ referencia: 'Frente al parque', es_titular: true }),
    );
  });

  it('muestra el rechazo del backend sin perder lo tipeado', async () => {
    mockGet.mockResolvedValue({
      ...datos,
      direccion: { ...datos.direccion, referencia: 'Frente al parque' },
    });
    mockPost.mockResolvedValue({
      reason: 'sin_legacy_id',
      error: 'Esta solicitud todavía no existe en el sistema de despacho.',
    });
    render(<EntregaClient token="tok" />);
    await screen.findByText(/iPhone 15 128GB/);

    await userEvent.click(screen.getByRole('button', { name: /Confirmar entrega/i }));

    expect(await screen.findByRole('alert'))
      .toHaveTextContent(/sistema de despacho/i);
    // El formulario sigue ahí: perder la dirección tipeada sería el peor
    // momento para hacerlo.
    expect(screen.getByDisplayValue('Frente al parque')).toBeInTheDocument();
  });

  it.each(['expired', 'revoked', 'consumed', 'inactive'])(
    'con enlace %s ofrece pedir uno nuevo',
    async (reason) => {
      mockGet.mockResolvedValue({ reason, error: 'x' });
      render(<EntregaClient token="tok" />);

      expect(await screen.findByText(/Este enlace venció/i)).toBeInTheDocument();
    },
  );

  it.each(['invalid', 'purpose_mismatch', 'lo_que_sea'])(
    'con reason %s da el mismo copy, sin delatar si la solicitud existe',
    async (reason) => {
      mockGet.mockResolvedValue({ reason, error: 'x' });
      render(<EntregaClient token="tok" />);

      expect(await screen.findByText(/no es válido/i)).toBeInTheDocument();
    },
  );

  it('ofrece reintentar si falla la red', async () => {
    mockGet.mockResolvedValue({ reason: 'network', error: 'x' });
    render(<EntregaClient token="tok" />);

    const boton = await screen.findByRole('button', { name: /Reintentar/i });
    mockGet.mockResolvedValue(datos);
    await userEvent.click(boton);

    expect(await screen.findByText(/iPhone 15 128GB/)).toBeInTheDocument();
  });
});
