/// <reference types="jest" />
/**
 * BAL-5205 — «Otro» se escribe en el mismo campo: la caja de texto que
 * reemplaza a la lista, con «Ver opciones» para volver.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OtraEnElCampoV2 } from '../campos/OtraEnElCampoV2';

it('escribe en el mismo campo y «Ver opciones» vuelve a la lista', () => {
  const onCambiar = jest.fn();
  const onVerOpciones = jest.fn();
  render(
    <OtraEnElCampoV2
      id="other_semester"
      etiqueta="¿Cuál ciclo?"
      valor=""
      placeholder="Escribe tu ciclo"
      onCambiar={onCambiar}
      onVerOpciones={onVerOpciones}
    />,
  );
  const caja = screen.getByRole('textbox', { name: '¿Cuál ciclo?' });
  expect(caja).toHaveFocus();
  fireEvent.change(caja, { target: { value: 'Décimo' } });
  expect(onCambiar).toHaveBeenCalledWith('Décimo');
  fireEvent.click(screen.getByRole('button', { name: 'Ver opciones' }));
  expect(onVerOpciones).toHaveBeenCalled();
});

it('muestra el error con role=alert', () => {
  render(
    <OtraEnElCampoV2 id="x" etiqueta="¿Cuál ciclo?" valor="" error="Escribe tu ciclo" onCambiar={() => {}} onVerOpciones={() => {}} />,
  );
  expect(screen.getByRole('alert')).toHaveTextContent('Escribe tu ciclo');
  expect(screen.getByRole('textbox', { name: '¿Cuál ciclo?' })).toHaveAttribute('aria-invalid', 'true');
});

it('al volver a un paso que ya estaba en «Otro» no roba el foco', () => {
  render(
    <OtraEnElCampoV2 id="x" etiqueta="¿Cuál ciclo?" valor="Décimo" enfocarAlMontar={false} onCambiar={() => {}} onVerOpciones={() => {}} />,
  );
  expect(screen.getByRole('textbox', { name: '¿Cuál ciclo?' })).not.toHaveFocus();
});
