/// <reference types="jest" />
/**
 * La navegación del wizard: atrás, continuar, enviar.
 *
 * Lo que se protege es que el botón principal NUNCA quede sin handler. Pasó de
 * verdad: los pasos regulares pasan `onNext` pero no `onSubmit`, así que al
 * prender el envío anticipado —que hace que un paso intermedio muestre "Enviar
 * Solicitud"— el botón quedó con `onClick={undefined}`. Clic sin consola, sin
 * red y sin pista: la peor forma de fallar.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { WizardNavigation } from '../WizardNavigation';

it('el paso intermedio continúa con onNext', () => {
  const onNext = jest.fn();
  render(<WizardNavigation onNext={onNext} isLastStep={false} />);

  fireEvent.click(screen.getByText('Continuar'));

  expect(onNext).toHaveBeenCalled();
});

it('el paso que envía usa onSubmit', () => {
  const onSubmit = jest.fn();
  const onNext = jest.fn();
  render(<WizardNavigation onNext={onNext} onSubmit={onSubmit} isLastStep />);

  fireEvent.click(screen.getByText('Enviar Solicitud'));

  expect(onSubmit).toHaveBeenCalled();
  expect(onNext).not.toHaveBeenCalled();
});

it('sin onSubmit cae en onNext en vez de no hacer nada', () => {
  const onNext = jest.fn();
  render(<WizardNavigation onNext={onNext} isLastStep />);

  fireEvent.click(screen.getByText('Enviar Solicitud'));

  expect(onNext).toHaveBeenCalled();
});

it('mientras envía no se puede volver a apretar', () => {
  const onSubmit = jest.fn();
  render(
    <WizardNavigation onSubmit={onSubmit} isLastStep isSubmitting submitMessage="Creando solicitud..." />,
  );

  expect(screen.getByText('Creando solicitud...')).toBeInTheDocument();
  expect(screen.getByRole('button')).toBeDisabled();
});
