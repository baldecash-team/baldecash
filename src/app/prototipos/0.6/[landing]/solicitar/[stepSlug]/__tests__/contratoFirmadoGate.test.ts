/**
 * Gate G2: firmado, `handleStepClickContrato`/`handleSummaryBack` no navegan
 * a un paso anterior. `StepClient` llama exactamente a esta función en las
 * dos superficies en vez de repetir el `if` — se prueba acá, sin levantar
 * ese componente (depende de ~10 contexts/hooks ajenos a esta regla).
 */
import { irAPasoSiNoFirmado } from '../contratoFirmadoGate';

it('con el contrato firmado: no navega', () => {
  const navegar = jest.fn();

  irAPasoSiNoFirmado(true, navegar);

  expect(navegar).not.toHaveBeenCalled();
});

it('sin firmar: navega, exactamente una vez', () => {
  const navegar = jest.fn();

  irAPasoSiNoFirmado(false, navegar);

  expect(navegar).toHaveBeenCalledTimes(1);
});
