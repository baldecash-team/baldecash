/**
 * Gate G2: las tres decisiones de navegación de la pantalla del contrato
 * (bloquear el indicador de pasos, bloquear "Atrás", y a qué paso redirigir
 * por URL directa) salen de `gatesDelContrato`. `StepClient` llama a esta
 * misma función en las tres superficies en vez de repetir la regla — se
 * prueba acá, sin levantar ese componente (depende de ~10 contexts/hooks
 * ajenos a esta decisión).
 */
import { gatesDelContrato } from '../contratoFirmadoGate';

const PASO_CONTRATO = { url_slug: 'resumen', code: 'resumen' };

it('no firmado: nada bloqueado, sin redirect', () => {
  expect(gatesDelContrato({
    contratoFirmado: false, condicionesFijas: true, isSummaryStep: false,
    summarySteps: [PASO_CONTRATO],
  })).toEqual({ bloquearNavegacion: false, redirigirA: null });
});

it('fuera del envío anticipado (condicionesFijas apagado): nada bloqueado aunque firmado', () => {
  expect(gatesDelContrato({
    contratoFirmado: true, condicionesFijas: false, isSummaryStep: false,
    summarySteps: [PASO_CONTRATO],
  })).toEqual({ bloquearNavegacion: false, redirigirA: null });
});

it('firmado, ya en el paso del contrato (summary step): bloquea, sin redirect', () => {
  expect(gatesDelContrato({
    contratoFirmado: true, condicionesFijas: true, isSummaryStep: true,
    summarySteps: [PASO_CONTRATO],
  })).toEqual({ bloquearNavegacion: true, redirigirA: null });
});

it('firmado, en un paso ANTERIOR (URL directa): bloquea y redirige al paso del contrato', () => {
  expect(gatesDelContrato({
    contratoFirmado: true, condicionesFijas: true, isSummaryStep: false,
    summarySteps: [PASO_CONTRATO],
  })).toEqual({ bloquearNavegacion: true, redirigirA: 'resumen' });
});

it('firmado, en un paso anterior, pero sin url_slug: redirige por code', () => {
  expect(gatesDelContrato({
    contratoFirmado: true, condicionesFijas: true, isSummaryStep: false,
    summarySteps: [{ code: 'contrato-step' }],
  })).toEqual({ bloquearNavegacion: true, redirigirA: 'contrato-step' });
});

it('firmado, en un paso anterior, sin summarySteps: bloquea pero no emite destino', () => {
  expect(gatesDelContrato({
    contratoFirmado: true, condicionesFijas: true, isSummaryStep: false,
    summarySteps: [],
  })).toEqual({ bloquearNavegacion: true, redirigirA: null });
});
