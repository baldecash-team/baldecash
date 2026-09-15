/// <reference types="jest" />
/**
 * El formulario de entrega, sin backend.
 *
 * Las reglas que fija este archivo:
 *  - sin ubigeo se abre en la pantalla de dirección, porque es lo único que
 *    traba el envío;
 *  - Finalizar marca TODOS los campos que faltan de una vez, no el primero;
 *  - lo que sale por `onEnviar` es lo que la persona completó.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

jest.mock('@/app/prototipos/0.6/components/lead/GeoCascadeField', () => ({
  // La cascada pide sus opciones al API; acá solo importa que el padre reciba
  // el distrito elegido.
  GeoCascadeField: ({ onChange }: { onChange: (id: string, label?: string) => void }) => (
    <button type="button" onClick={() => onChange('1508', 'Miraflores')}>
      Elegir distrito
    </button>
  ),
}));

import { FormularioEntrega, type OpcionEnvio } from '../FormularioEntrega';

const OPCIONES: OpcionEnvio[] = [
  { id: 'gratis', nombre: 'Envío gratis', condicion: 'Envío hasta 5 días hábiles.', costo: 0 },
  { id: 'express', nombre: 'Envío Express', costo: 25, disponible: false },
];

const CON_DIRECCION = {
  direccion: 'Av. Benavides 1238',
  calle: 'Dpto 301',
  referencia: 'Frente al parque',
  ubicacion: 'Miraflores, Lima, Lima',
  distrito: 'Miraflores',
  distritoId: '1508',
};

const pintar = (props: Record<string, unknown> = {}) =>
  render(
    <FormularioEntrega
      equipo={{ nombre: 'ExpertBook P1', cuotaMensual: '168.00', cuotas: 24 }}
      opcionesEnvio={OPCIONES}
      onEnviar={jest.fn()}
      {...props}
    />,
  );

it('sin ubigeo abre en la pantalla de dirección', () => {
  pintar();

  expect(screen.getByRole('heading', { name: '¿A dónde enviamos tu equipo?' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Confirmar dirección' })).toBeInTheDocument();
});

it('con dirección ya cargada abre en la confirmación del envío', () => {
  pintar({ direccionInicial: CON_DIRECCION });

  expect(screen.getByRole('heading', { name: 'Confirma tu envío' })).toBeInTheDocument();
  expect(screen.getByText('Av. Benavides 1238, Dpto 301')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Finalizar solicitud' })).toBeInTheDocument();
});

it('confirmar dirección marca todos los campos que faltan a la vez', async () => {
  pintar();

  await userEvent.click(screen.getByRole('button', { name: 'Confirmar dirección' }));

  expect(screen.getByText('Escribe tu dirección')).toBeInTheDocument();
  expect(screen.getByText('Elige tu distrito')).toBeInTheDocument();
  expect(screen.getByText('Escribe una referencia para el repartidor')).toBeInTheDocument();
});

it('finalizar exige el nombre y el DNI de quien recibe, los dos juntos', async () => {
  pintar({ direccionInicial: CON_DIRECCION });

  await userEvent.click(screen.getByRole('radio', { name: 'Otra persona' }));
  await userEvent.type(screen.getByLabelText(/DNI/), '123');
  await userEvent.click(screen.getByRole('button', { name: 'Finalizar solicitud' }));

  expect(screen.getByText('Escribe el nombre de quien recibe')).toBeInTheDocument();
  expect(screen.getByText('El DNI tiene 8 números')).toBeInTheDocument();
  expect(screen.getByText('Completa los datos de quien recibe el pedido.')).toBeInTheDocument();
});

it('el envío express no se puede elegir', () => {
  pintar({ direccionInicial: CON_DIRECCION });

  expect(screen.getByRole('radio', { name: /Envío Express/ })).toBeDisabled();
  expect(screen.getByText('No disponible')).toBeInTheDocument();
  // El gratis viene marcado: es el único elegible.
  expect(screen.getByRole('radio', { name: /Envío gratis/ })).toBeChecked();
});

it('declarar la dirección y finalizar devuelve lo completado', async () => {
  const onEnviar = jest.fn();
  pintar({ onEnviar });

  await userEvent.type(screen.getByLabelText(/Dirección/), 'Av. Los Álamos 456');
  await userEvent.click(screen.getByRole('button', { name: 'Elegir distrito' }));
  await userEvent.type(screen.getByLabelText(/Referencia/), 'Casa de rejas negras');
  await userEvent.click(screen.getByRole('button', { name: 'Confirmar dirección' }));

  await waitFor(() =>
    expect(screen.getByRole('heading', { name: 'Confirma tu envío' })).toBeInTheDocument());

  await userEvent.click(screen.getByRole('button', { name: 'Finalizar solicitud' }));

  expect(onEnviar).toHaveBeenCalledWith(expect.objectContaining({
    direccion: 'Av. Los Álamos 456',
    referencia: 'Casa de rejas negras',
    distritoId: '1508',
    distrito: 'Miraflores',
    esTitular: true,
    tipoEnvioId: 'gratis',
  }));
});

it('registrado muestra el cierre con el resumen', () => {
  pintar({ direccionInicial: CON_DIRECCION, listo: true });

  expect(screen.getByRole('heading', { name: 'Tu envío quedó registrado' })).toBeInTheDocument();
  expect(screen.getByText('Av. Benavides 1238, Dpto 301')).toBeInTheDocument();
  expect(screen.getByText('Tú')).toBeInTheDocument();
});
