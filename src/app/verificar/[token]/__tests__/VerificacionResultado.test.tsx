/// <reference types="jest" />
/**
 * La pantalla que abre el QR de la constancia.
 *
 * Lo que se protege son las tres respuestas que ese papel puede pedir —vigente,
 * superada, inexistente— y la regla de privacidad del §9: acá no puede
 * aparecer nada que el backend no haya enmascarado ya.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { VerificacionResultado } from '../VerificacionResultado';

const HASH = '5dd462d4213aa1dcbca51c36e8e12a560c9d97414499113ff66a9bff7080b349';

const VALIDA = {
  valido: true,
  nombre: 'Yannis N*. F*. C*.',
  operacion: 'SOL-126218',
  aceptado_at: '2026-09-07T15:04:09-05:00',
  algoritmo: 'SHA-256',
  hash: HASH,
  declaracion: 'Declaro que he leído y comprendido el Contrato N.° SOL-126218...',
  declaracion_version: 1,
};

it('una aceptación vigente muestra la huella entera', () => {
  render(<VerificacionResultado datos={VALIDA} noExiste={false} />);

  expect(screen.getByText('Aceptación verificada')).toBeInTheDocument();
  // Entera y sin cortar: es lo único que la persona puede recalcular sobre su
  // archivo para comprobar que es el mismo documento.
  expect(screen.getByText(HASH)).toBeInTheDocument();
  expect(screen.getByText('SOL-126218')).toBeInTheDocument();
  expect(screen.getByText(/Yannis N\*/)).toBeInTheDocument();
});

it('muestra la fecha en hora de Perú', () => {
  render(<VerificacionResultado datos={VALIDA} noExiste={false} />);

  // 15:04:09 -05:00 es 15:04:09 en Lima; si se pintara en la zona del
  // navegador, quien verifica desde otro país leería una hora que no es la que
  // dice el papel.
  expect(screen.getByText(/07\/09\/2026 15:04:09 \(hora de Perú\)/)).toBeInTheDocument();
});

it('muestra la versión del texto aceptado', () => {
  render(<VerificacionResultado datos={VALIDA} noExiste={false} />);

  expect(screen.getByText(/Texto aceptado \(v1\)/)).toBeInTheDocument();
});

it('un contrato reemplazado lo dice, no lo esconde', () => {
  // La constancia sigue existiendo en papel. Decir "no encontramos nada" sería
  // falso y dejaría a la persona sin entender qué pasó.
  render(
    <VerificacionResultado
      datos={{ valido: false, motivo: 'reemplazado' }}
      noExiste={false}
    />,
  );

  expect(screen.getByText('Esta constancia quedó superada')).toBeInTheDocument();
  expect(screen.getByText(/reemplazado por uno posterior/)).toBeInTheDocument();
});

it('una operación sin aceptar se distingue de una superada', () => {
  render(
    <VerificacionResultado datos={{ valido: false, motivo: 'sin_aceptar' }} noExiste={false} />,
  );

  expect(screen.getByText('Esta constancia todavía no está aceptada')).toBeInTheDocument();
});

it('un token inexistente no revela nada', () => {
  render(<VerificacionResultado datos={null} noExiste />);

  expect(screen.getByText('No encontramos esta constancia')).toBeInTheDocument();
});

it('una caída del backend se ve igual que un token inválido', () => {
  // "Error de red" no le sirve a nadie que tenga el papel delante, y distinguir
  // los casos le diría a quien tantea tokens cuáles existen.
  render(<VerificacionResultado datos={null} noExiste={false} />);

  expect(screen.getByText('No encontramos esta constancia')).toBeInTheDocument();
});

it('avisa que lo que muestra es solo una parte', () => {
  render(<VerificacionResultado datos={VALIDA} noExiste={false} />);

  expect(screen.getByText(/reservado al titular y a las autoridades/)).toBeInTheDocument();
});

it('ofrece el contrato aceptado, no solo su huella', () => {
  const URL_DOC = 'https://api.baldecash.com/api/v1/public/kyc/documento/tok123';
  render(
    <VerificacionResultado datos={VALIDA} noExiste={false} documentoUrl={URL_DOC} />,
  );

  // Quien llega por el QR del papel viene a ver el documento. La huella sola
  // no sirve sin el archivo al que corresponde.
  const boton = screen.getByRole('link', { name: /Ver el contrato aceptado/i });
  expect(boton).toHaveAttribute('href', URL_DOC);
  expect(boton).toHaveAttribute('target', '_blank');
});

it('sin documento no inventa el boton', () => {
  render(<VerificacionResultado datos={VALIDA} noExiste={false} />);

  expect(screen.queryByRole('link', { name: /Ver el contrato aceptado/i })).toBeNull();
});
