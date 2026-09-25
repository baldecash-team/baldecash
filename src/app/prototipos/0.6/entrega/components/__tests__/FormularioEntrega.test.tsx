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

  expect(screen.getByText('Elige cómo es tu dirección')).toBeInTheDocument();
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

it('si recibe otra persona, el celular y el parentesco son obligatorios', async () => {
  const onEnviar = jest.fn();
  pintar({ direccionInicial: CON_DIRECCION, onEnviar });

  await userEvent.click(screen.getByRole('radio', { name: 'Otra persona' }));
  await userEvent.type(screen.getByLabelText(/Nombre completo/), 'María Torres');
  await userEvent.type(screen.getByLabelText(/DNI/), '12345678');
  await userEvent.type(screen.getByLabelText(/Celular/), '12345');
  await userEvent.click(screen.getByRole('button', { name: 'Finalizar solicitud' }));

  expect(screen.getByText('El celular tiene 9 números y empieza con 9')).toBeInTheDocument();
  expect(screen.getByText('Escribe qué es tuyo (ej: madre)')).toBeInTheDocument();
  expect(onEnviar).not.toHaveBeenCalled();
});

it('con una sola opción el envío se muestra como dato, sin elegir nada', () => {
  pintar({ direccionInicial: CON_DIRECCION });

  const envio = screen.getByTestId('entrega-envio-unico');
  expect(envio).toHaveTextContent('Envío gratis');
  expect(envio).toHaveTextContent('Gratis');
  // Nada que elegir: el selector no se pinta.
  expect(screen.queryByRole('radio', { name: /Envío/ })).not.toBeInTheDocument();
});

it('si hubiera dos opciones elegibles vuelve el selector', () => {
  pintar({
    direccionInicial: CON_DIRECCION,
    opcionesEnvio: [
      ...OPCIONES,
      { id: 'express', nombre: 'Envío Express', costo: 25 },
    ],
  });

  expect(screen.getByRole('radio', { name: /Envío Express/ })).toBeEnabled();
  expect(screen.queryByTestId('entrega-envio-unico')).not.toBeInTheDocument();
});

it('declarar la dirección por vía y número y finalizar devuelve lo completado', async () => {
  const onEnviar = jest.fn();
  pintar({ onEnviar });

  await userEvent.click(screen.getByRole('radio', { name: 'Calle, avenida o jirón' }));
  await userEvent.type(screen.getByLabelText(/Nombre de la vía/), 'Los Álamos');
  await userEvent.type(screen.getByLabelText(/Número/), '456');
  expect(screen.getByTestId('entrega-renglon')).toHaveTextContent('Av. Los Álamos 456');
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

it('por manzana y lote arma el renglón con Mz y Lt', async () => {
  pintar();

  await userEvent.click(screen.getByRole('radio', { name: 'Manzana y lote' }));
  await userEvent.selectOptions(screen.getByLabelText(/^Tipo/), 'AA.HH.');
  await userEvent.type(screen.getByLabelText(/^Nombre/), 'Los Cedros');
  await userEvent.type(screen.getByRole('textbox', { name: /^Manzana/ }), 'z');
  await userEvent.type(screen.getByRole('textbox', { name: /^Lote/ }), '15');

  expect(screen.getByTestId('entrega-renglon')).toHaveTextContent('AA.HH. Los Cedros Mz Z Lt 15');
});

it('una vía sin número no deja confirmar', async () => {
  pintar();

  await userEvent.click(screen.getByRole('radio', { name: 'Calle, avenida o jirón' }));
  await userEvent.type(screen.getByLabelText(/Nombre de la vía/), 'Los Álamos');
  await userEvent.click(screen.getByRole('button', { name: 'Confirmar dirección' }));

  expect(screen.getByText(/Escribe el número de tu casa/)).toBeInTheDocument();
  expect(screen.getByText('Corrige los campos marcados para continuar.')).toBeInTheDocument();
});

it('un plus code en el nombre de la vía no se acepta', async () => {
  pintar();

  await userEvent.click(screen.getByRole('radio', { name: 'Calle, avenida o jirón' }));
  await userEvent.type(screen.getByLabelText(/Nombre de la vía/), '3WFV+FF8');
  await userEvent.type(screen.getByLabelText(/Número/), '12');
  await userEvent.click(screen.getByRole('button', { name: 'Confirmar dirección' }));

  expect(screen.getByText(/Ese es un código de Google/)).toBeInTheDocument();
});

it('registrado muestra el cierre con el resumen', () => {
  pintar({ direccionInicial: CON_DIRECCION, listo: true });

  expect(screen.getByRole('heading', { name: 'Tu envío quedó registrado' })).toBeInTheDocument();
  expect(screen.getByText('Av. Benavides 1238, Dpto 301')).toBeInTheDocument();
  expect(screen.getByText('Tú')).toBeInTheDocument();
});

it('la referencia se muestra para confirmar aunque venga precargada', () => {
  pintar({ direccionInicial: CON_DIRECCION });

  expect(screen.getByLabelText(/Referencia de la dirección/)).toHaveValue('Frente al parque');
});

it('una referencia heredada de relleno ("-") no deja finalizar', async () => {
  const onEnviar = jest.fn();
  pintar({ direccionInicial: { ...CON_DIRECCION, referencia: '-' }, onEnviar });

  await userEvent.click(screen.getByRole('button', { name: 'Finalizar solicitud' }));

  expect(screen.getByText('Escribe una referencia para el repartidor')).toBeInTheDocument();
  expect(onEnviar).not.toHaveBeenCalled();
});

it('una referencia muy corta pide más detalle', async () => {
  const onEnviar = jest.fn();
  pintar({ direccionInicial: { ...CON_DIRECCION, referencia: '4ta cruz' }, onEnviar });

  await userEvent.click(screen.getByRole('button', { name: 'Finalizar solicitud' }));

  expect(screen.getByText('Agrega más detalle: qué hay cerca o cómo es tu casa')).toBeInTheDocument();
  expect(onEnviar).not.toHaveBeenCalled();
});

it('una dirección guardada con plus code abre en la dirección con la alerta', () => {
  pintar({ direccionInicial: { ...CON_DIRECCION, direccion: '3WFV+FF8, Manuel González Prada, Comas 15312, Perú', calle: '' } });

  expect(screen.getByRole('heading', { name: '¿A dónde enviamos tu equipo?' })).toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent('No podemos registrar tu envío con esta dirección');
  expect(screen.getByRole('alert')).toHaveTextContent('es un código de Google');
});

it('una dirección guardada sin número abre en la dirección con la alerta', () => {
  pintar({ direccionInicial: { ...CON_DIRECCION, direccion: 'Paradero Corporación Roma', calle: '' } });

  expect(screen.getByRole('alert')).toHaveTextContent('le falta el número de tu casa o tu manzana y lote');
});
