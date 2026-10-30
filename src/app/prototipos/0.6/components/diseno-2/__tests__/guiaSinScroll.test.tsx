/// <reference types="jest" />
/**
 * BAL-5360 (Brenda y Haru): al llenar un campo la página NO baja sola.
 * La guía sigue resaltando el siguiente pendiente (o "Continuar"), pero sin
 * `scrollBy` / `scrollTo` / `scrollIntoView`. Tampoco al llegar al paso.
 */
import React, { useRef } from 'react';
import { render, act } from '@testing-library/react';

let mockFormData: Record<string, { value: string }> = {};
// Estable entre renders, como en el WizardContext real (si no, la guía
// "vuelve a llegar" en cada render).
const mockOpciones = () => ({});

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/WizardContext', () => ({
  FILE_PENDING_REUPLOAD: '__pending__',
  useWizard: () => ({ formData: mockFormData, getAllDynamicOptions: mockOpciones }),
}));

// El validador real no hace falta: DNI de 8 dígitos y nombre no vacío.
jest.mock('@/app/prototipos/0.6/services/wizardApi', () => ({
  validateField: (f: { type: string }, v: unknown) => ({
    isValid: f.type === 'document_number' ? typeof v === 'string' && /^\d{8}$/.test(v) : !!v,
  }),
}));

import { useGuiaDeCampos } from '../useGuiaDeCampos';
import type { WizardStep } from '@/app/prototipos/0.6/services/wizardApi';

const step = {
  code: 'datos_personales',
  fields: [
    { code: 'dni', type: 'document_number', required: true },
    { code: 'nombre', type: 'text', required: true },
  ],
} as unknown as WizardStep;

function Formulario() {
  const ref = useRef<HTMLDivElement>(null);
  useGuiaDeCampos({ contenedorRef: ref, step });
  return (
    <div ref={ref}>
      <div data-campo="dni">
        <input id="dni" />
      </div>
      <div data-campo="nombre">
        <input id="nombre" />
      </div>
      <button data-continuar-v2>Continuar</button>
    </div>
  );
}

/** Todo queda "fuera de la vista": si la guía quisiera mover, movería. */
function todoFueraDeLaVista() {
  Element.prototype.getBoundingClientRect = () =>
    ({ top: 2000, bottom: 2060, height: 60, left: 0, right: 100, width: 100, x: 0, y: 2000, toJSON: () => ({}) }) as DOMRect;
  // jsdom no pinta: sin esto el botón "Continuar" cuenta como oculto.
  Element.prototype.getClientRects = () => [{}] as unknown as DOMRectList;
}

beforeEach(() => {
  jest.useFakeTimers();
  mockFormData = {};
  Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
  window.scrollBy = jest.fn() as unknown as typeof window.scrollBy;
  window.scrollTo = jest.fn() as unknown as typeof window.scrollTo;
  Element.prototype.scrollIntoView = jest.fn();
  todoFueraDeLaVista();
});

afterEach(() => {
  jest.useRealTimers();
});

function noSeMovio() {
  expect(window.scrollBy).not.toHaveBeenCalled();
  expect(window.scrollTo).not.toHaveBeenCalled();
  expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
}

it('al llegar al paso resalta el primer pendiente sin mover la página', () => {
  const { container } = render(<Formulario />);
  act(() => {
    jest.advanceTimersByTime(500);
  });
  expect(container.querySelector('[data-campo="dni"]')?.getAttribute('data-guia')).toBe('brillo');
  noSeMovio();
});

it('completar el DNI resalta el siguiente campo pero no baja la página', () => {
  const { container, rerender } = render(<Formulario />);
  act(() => {
    jest.advanceTimersByTime(500); // llegó
  });
  (container.querySelector('#dni') as HTMLInputElement).focus();
  container.querySelector('[data-campo="nombre"]')?.removeAttribute('data-guia');

  mockFormData = { dni: { value: '70020010' } };
  rerender(<Formulario />);
  act(() => {
    jest.advanceTimersByTime(300);
  });

  expect(container.querySelector('[data-campo="nombre"]')?.getAttribute('data-guia')).toBe('brillo');
  // El foco se queda donde la persona lo dejó: la guía no lo roba.
  expect(document.activeElement?.id).toBe('dni');
  noSeMovio();
});

it('con todo lleno resalta "Continuar" sin bajar hasta él', () => {
  const { container, rerender } = render(<Formulario />);
  act(() => {
    jest.advanceTimersByTime(500);
  });
  (container.querySelector('#dni') as HTMLInputElement).focus();
  mockFormData = { nombre: { value: 'Ana' }, dni: { value: '70020010' } };
  rerender(<Formulario />);
  act(() => {
    jest.advanceTimersByTime(300);
  });
  expect(container.querySelector('[data-continuar-v2]')?.getAttribute('data-guia')).toBe('brillo');
  noSeMovio();
});
