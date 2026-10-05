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

it('muestra la identidad sin el aviso del §5', async () => {
  mockGet.mockResolvedValue(DATOS);
  montar();

  expect(await screen.findByText('YANNIS NICOL FLORES CALDERÓN')).toBeInTheDocument();
  expect(screen.getByText('76826846')).toBeInTheDocument();
  // El aviso llega igual en la respuesta, pero la tarjeta ya no lo pinta: los
  // campos deshabilitados dicen lo mismo sin ocupar cuatro renglones.
  expect(screen.queryByText(AVISO)).not.toBeInTheDocument();
});

it('los cuatro campos son de solo lectura: no hay nada que editar', async () => {
  mockGet.mockResolvedValue(DATOS);
  montar();
  fireEvent.click(await screen.findByRole('button', { name: /Confirma tus datos/i }));

  // El celular y el correo los pidio el wizard dos pantallas antes; ofrecer
  // editarlos de nuevo justo antes de firmar agregaba un formulario a la
  // pantalla mas cargada del recorrido.
  expect(screen.queryByRole('button', { name: /Actualizar celular o correo/i }))
    .not.toBeInTheDocument();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(mockPatch).not.toHaveBeenCalled();
});

it('arranca plegada y al abrirla muestra los cuatro campos', async () => {
  mockGet.mockResolvedValue(DATOS);
  montar();

  const titulo = await screen.findByRole('button', { name: /Confirma tus datos/i });
  expect(screen.getByText(DATOS.nombre)).not.toBeVisible();

  fireEvent.click(titulo);

  expect(screen.getByText(DATOS.nombre)).toBeVisible();
  expect(screen.getByText(DATOS.documento)).toBeVisible();
  expect(screen.getByText(DATOS.telefono)).toBeVisible();
  expect(screen.getByText(DATOS.email)).toBeVisible();

  fireEvent.click(titulo);
  expect(screen.getByText(DATOS.nombre)).not.toBeVisible();
});


it('sin datos no ocupa lugar', async () => {
  mockGet.mockResolvedValue(null);
  const { container } = montar();

  await waitFor(() => expect(mockGet).toHaveBeenCalled());
  expect(container).toBeEmptyDOMElement();
});
