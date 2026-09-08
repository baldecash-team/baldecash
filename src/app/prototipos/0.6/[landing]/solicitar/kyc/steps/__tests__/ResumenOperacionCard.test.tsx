/// <reference types="jest" />
/**
 * La tarjeta con los números de la operación (§5 de la propuesta).
 *
 * Lo que se protege: que no invente. Una fila cuyo dato la solicitud no tiene
 * no se pinta — «S/ 0.00» donde en realidad no hay dato se lee como una
 * condición pactada, y esta tarjeta está justo antes de aceptar el contrato.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { ResumenOperacionCard } from '../ResumenOperacionCard';

const COMPLETO = {
  equipo: 'iPhone 15 128GB',
  sku: 'IP15-128',
  precio: '3899.00',
  cuota_inicial: '500.00',
  cuotas: 12,
  monto_cuota: '312.45',
  frecuencia: 'mensual',
  tea: '39.900',
  tcea: '45.120',
  seguro: '28.00',
  total: '4249.40',
};

it('muestra el equipo y los importes en soles', () => {
  render(<ResumenOperacionCard resumen={COMPLETO} />);

  expect(screen.getByText('iPhone 15 128GB')).toBeInTheDocument();
  expect(screen.getByText('S/ 3,899.00')).toBeInTheDocument();
  expect(screen.getByText('S/ 500.00')).toBeInTheDocument();
  expect(screen.getByText('S/ 4,249.40')).toBeInTheDocument();
});

it('junta el número de cuotas con su monto', () => {
  render(<ResumenOperacionCard resumen={COMPLETO} />);

  expect(screen.getByText('12 × S/ 312.45')).toBeInTheDocument();
});

it('las tasas se muestran con dos decimales aunque lleguen con tres', () => {
  render(<ResumenOperacionCard resumen={COMPLETO} />);

  expect(screen.getByText('39.90 %')).toBeInTheDocument();
  expect(screen.getByText('45.12 %')).toBeInTheDocument();
});

it('lo que no vino no se pinta', () => {
  render(
    <ResumenOperacionCard
      resumen={{ ...COMPLETO, cuota_inicial: null, tcea: null, seguro: null }}
    />,
  );

  expect(screen.queryByText('Cuota inicial')).not.toBeInTheDocument();
  expect(screen.queryByText('TCEA')).not.toBeInTheDocument();
  expect(screen.queryByText('Seguro')).not.toBeInTheDocument();
  // Y no aparece un cero de relleno en ningún lado.
  expect(screen.queryByText('S/ 0.00')).not.toBeInTheDocument();
});

it('un cero contratado SÍ se muestra: es una condición, no una ausencia', () => {
  render(<ResumenOperacionCard resumen={{ ...COMPLETO, seguro: '0.00' }} />);

  expect(screen.getByText('Seguro')).toBeInTheDocument();
  expect(screen.getByText('S/ 0.00')).toBeInTheDocument();
});

it('sin resumen no ocupa lugar arriba del documento', () => {
  const { container } = render(<ResumenOperacionCard resumen={null} />);

  expect(container).toBeEmptyDOMElement();
});

it('un resumen vacío tampoco se pinta', () => {
  const { container } = render(<ResumenOperacionCard resumen={{}} />);

  expect(container).toBeEmptyDOMElement();
});

it('muestra la fecha de entrega sin correrla un día', () => {
  // Un ISO de solo fecha parseado con `Date` se interpreta en UTC, y en Lima
  // (-5) eso lo tira al día anterior. Se formatea a mano.
  render(<ResumenOperacionCard resumen={{ ...COMPLETO, fecha_entrega: '2026-09-15' }} />);

  expect(screen.getByText('15/09/2026')).toBeInTheDocument();
});

it('sin fecha de entrega no muestra la fila', () => {
  render(<ResumenOperacionCard resumen={{ ...COMPLETO, fecha_entrega: null }} />);

  expect(screen.queryByText('Entrega estimada')).not.toBeInTheDocument();
});
