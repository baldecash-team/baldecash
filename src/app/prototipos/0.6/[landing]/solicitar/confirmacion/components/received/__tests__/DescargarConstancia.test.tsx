/// <reference types="jest" />
/**
 * La copia del contrato en la pantalla de cierre (§4 paso 12).
 *
 * Lo que se protege: que se ofrezca cuando existe, que no se pinte cuando no
 * —se llega acá también desde el submit de siempre— y que abrirla quede
 * registrada, porque la evidencia de la puesta a disposición es parte de lo
 * que hay que conservar.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { DescargarConstancia } from '../DescargarConstancia';
import { guardarConstancia, olvidarConstancia } from '../../../../kyc/constanciaStorage';

const URL_PDF = 'https://ws.baldecash.com/storage/constancia-aceptacion-abc.pdf';

beforeEach(() => {
  window.localStorage.clear();
});

it('ofrece la copia cuando el cierre del KYC la dejó', () => {
  guardarConstancia('generica', 'SOL-1', URL_PDF);
  const onDisponible = jest.fn();

  render(
    <DescargarConstancia landing="generica" applicationCode="SOL-1" onDisponible={onDisponible} />,
  );

  const link = screen.getByRole('link', { name: /Descargar/i });
  expect(link).toHaveAttribute('href', URL_PDF);
  expect(onDisponible).toHaveBeenCalledTimes(1);
});

it('dice que la copia incluye la constancia, no solo el contrato', () => {
  // Bajarse el contrato pelado seria bajarse un PDF que no acredita nada.
  guardarConstancia('generica', 'SOL-1', URL_PDF);

  render(<DescargarConstancia landing="generica" applicationCode="SOL-1" />);

  expect(screen.getByText(/constancia de tu aceptación electrónica/i)).toBeInTheDocument();
});

it('no se pinta si no hay copia', () => {
  // Se llega a esta pantalla tambien desde el submit de siempre, y desde otro
  // dispositivo, donde no hubo cierre de KYC que dejara nada.
  const { container } = render(
    <DescargarConstancia landing="generica" applicationCode="SOL-1" />,
  );

  expect(container).toBeEmptyDOMElement();
});

it('no se pinta sin código de solicitud', () => {
  guardarConstancia('generica', 'SOL-1', URL_PDF);

  const { container } = render(<DescargarConstancia landing="generica" applicationCode={null} />);

  expect(container).toBeEmptyDOMElement();
});

it('la copia de una solicitud no aparece en otra', () => {
  guardarConstancia('generica', 'SOL-1', URL_PDF);

  const { container } = render(
    <DescargarConstancia landing="generica" applicationCode="SOL-2" />,
  );

  expect(container).toBeEmptyDOMElement();
});

it('abrirla queda registrada', () => {
  guardarConstancia('generica', 'SOL-1', URL_PDF);
  const onDescargar = jest.fn();

  render(
    <DescargarConstancia landing="generica" applicationCode="SOL-1" onDescargar={onDescargar} />,
  );
  fireEvent.click(screen.getByRole('link', { name: /Descargar/i }));

  expect(onDescargar).toHaveBeenCalledTimes(1);
});

it('se abre en otra pestaña sin exponer la referencia', () => {
  // La URL de una constancia lleva el nombre y el DNI de alguien adentro: no
  // puede viajar como Referer al abrirla.
  guardarConstancia('generica', 'SOL-1', URL_PDF);

  render(<DescargarConstancia landing="generica" applicationCode="SOL-1" />);

  const link = screen.getByRole('link', { name: /Descargar/i });
  expect(link).toHaveAttribute('target', '_blank');
  expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'));
});

it('olvidarla la saca de la pantalla', () => {
  guardarConstancia('generica', 'SOL-1', URL_PDF);
  olvidarConstancia('generica', 'SOL-1');

  const { container } = render(
    <DescargarConstancia landing="generica" applicationCode="SOL-1" />,
  );

  expect(container).toBeEmptyDOMElement();
});
