/// <reference types="jest" />
/**
 * La tarjeta de confirmación de datos (§5 pantalla 1).
 *
 * Lo que se protege: que el nombre y el DNI no se puedan editar —la identidad
 * viene validada de antes y el §2 manda derivar al proceso reforzado si se
 * quiere cambiar— y que un guardado fallido lo diga, porque la persona está por
 * aceptar un contrato con estos datos.
 */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@/app/prototipos/0.6/services/kycApi', () => {
  const actual = jest.requireActual('@/app/prototipos/0.6/services/kycApi');
  return { ...actual, getContacto: jest.fn(), actualizarContacto: jest.fn() };
});

import { ConfirmarDatosCard } from '../ConfirmarDatosCard';
import { getContacto, actualizarContacto } from '@/app/prototipos/0.6/services/kycApi';

const mockGet = getContacto as jest.MockedFunction<typeof getContacto>;
const mockPatch = actualizarContacto as jest.MockedFunction<typeof actualizarContacto>;

const AVISO =
  'Tu nombre y DNI corresponden a la identidad que validamos previamente y no pueden modificarse en este proceso.';

const DATOS = {
  nombre: 'YANNIS NICOL FLORES CALDERÓN',
  documento: '76826846',
  email: 'viejo@correo.com',
  telefono: '987654321',
  aviso_identidad: AVISO,
};

beforeEach(() => jest.clearAllMocks());

const montar = (props = {}) =>
  render(<ConfirmarDatosCard applicationCode="SOL-1" documentNumber="76826846" {...props} />);

it('muestra la identidad y explica por qué no se toca', async () => {
  mockGet.mockResolvedValue(DATOS);
  montar();

  expect(await screen.findByText('YANNIS NICOL FLORES CALDERÓN')).toBeInTheDocument();
  expect(screen.getByText('76826846')).toBeInTheDocument();
  expect(screen.getByText(AVISO)).toBeInTheDocument();
});

it('el nombre y el DNI no son campos editables', async () => {
  mockGet.mockResolvedValue(DATOS);
  montar();
  await screen.findByText('YANNIS NICOL FLORES CALDERÓN');

  fireEvent.click(screen.getByRole('button', { name: /Actualizar celular o correo/i }));

  // Los dos únicos inputs de la tarjeta son celular y correo.
  const inputs = screen.getAllByRole('textbox');
  expect(inputs).toHaveLength(2);
  expect(screen.queryByDisplayValue('YANNIS NICOL FLORES CALDERÓN')).not.toBeInTheDocument();
  expect(screen.queryByDisplayValue('76826846')).not.toBeInTheDocument();
});

it('guarda el correo nuevo y avisa qué cambió', async () => {
  mockGet.mockResolvedValue(DATOS);
  mockPatch.mockResolvedValue({ ...DATOS, email: 'nuevo@correo.com' });
  const onCambio = jest.fn();
  montar({ onCambio });
  await screen.findByText('viejo@correo.com');

  fireEvent.click(screen.getByRole('button', { name: /Actualizar celular o correo/i }));
  fireEvent.change(screen.getByDisplayValue('viejo@correo.com'), {
    target: { value: 'nuevo@correo.com' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

  await waitFor(() => expect(onCambio).toHaveBeenCalledWith(['email']));
  expect(await screen.findByText('nuevo@correo.com')).toBeInTheDocument();
});

it('si no se pudo guardar lo dice en vez de dejar creer que quedó', async () => {
  mockGet.mockResolvedValue(DATOS);
  mockPatch.mockResolvedValue(null);
  const onCambio = jest.fn();
  montar({ onCambio });
  await screen.findByText('viejo@correo.com');

  fireEvent.click(screen.getByRole('button', { name: /Actualizar celular o correo/i }));
  fireEvent.change(screen.getByDisplayValue('viejo@correo.com'), {
    target: { value: 'roto' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

  expect(await screen.findByText(/No pudimos guardar los cambios/)).toBeInTheDocument();
  expect(onCambio).not.toHaveBeenCalled();
});

it('cancelar devuelve los valores que estaban', async () => {
  mockGet.mockResolvedValue(DATOS);
  montar();
  await screen.findByText('viejo@correo.com');

  fireEvent.click(screen.getByRole('button', { name: /Actualizar celular o correo/i }));
  fireEvent.change(screen.getByDisplayValue('viejo@correo.com'), {
    target: { value: 'otro@correo.com' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

  expect(screen.getByText('viejo@correo.com')).toBeInTheDocument();
  expect(mockPatch).not.toHaveBeenCalled();
});

it('sin datos no ocupa lugar', async () => {
  mockGet.mockResolvedValue(null);
  const { container } = montar();

  await waitFor(() => expect(mockGet).toHaveBeenCalled());
  expect(container).toBeEmptyDOMElement();
});
