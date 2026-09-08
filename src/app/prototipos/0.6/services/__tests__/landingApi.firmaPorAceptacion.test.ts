/**
 * Qué landings firman aceptando el contrato en pantalla.
 *
 * Lo que se protege: que tener el sub-paso `contract` prendido NO alcance.
 * `copia-home` y las tres de Family Farms lo tienen desde antes, con el
 * contrato que sale al aprobar y la firma por Keynua. Si el flujo nuevo se
 * activara con esa sola señal, esas cuatro landings perderían el selector de
 * plazo y verían una pantalla de aceptación que no les corresponde.
 */

import { isFirmaPorAceptacion, type SolicitarFlowConfig } from '../landingApi';

const cfg = (kyc?: unknown): SolicitarFlowConfig => ({
  sections: [
    { type: 'wizard_steps', enabled: true, order: 1 },
    ...(kyc ? [kyc as never] : []),
  ],
});

const CONTRACT_ON = [{ type: 'contract', enabled: true, order: 1 }];

it('con el sub-paso contract pero SIN firma, no es el flujo nuevo', () => {
  // Family Farms y copia-home, tal como están hoy en producción.
  expect(isFirmaPorAceptacion(cfg({
    type: 'kyc', enabled: true, steps: CONTRACT_ON,
  }))).toBe(false);
});

it('con firma prendida, sí', () => {
  expect(isFirmaPorAceptacion(cfg({
    type: 'kyc', enabled: true, steps: CONTRACT_ON, firma: { enabled: true },
  }))).toBe(true);
});

it('la seccion apagada manda sobre la firma', () => {
  expect(isFirmaPorAceptacion(cfg({
    type: 'kyc', enabled: false, steps: CONTRACT_ON, firma: { enabled: true },
  }))).toBe(false);
});

it('sin seccion kyc, no', () => {
  expect(isFirmaPorAceptacion(cfg())).toBe(false);
});

it('solo un true explicito', () => {
  for (const valor of ['si', 1, 'true', null]) {
    expect(isFirmaPorAceptacion(cfg({
      type: 'kyc', enabled: true, firma: { enabled: valor },
    } as never))).toBe(false);
  }
});
