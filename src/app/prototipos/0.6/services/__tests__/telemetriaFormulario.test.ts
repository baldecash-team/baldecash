/**
 * Telemetría del formulario posterior. Lo que se prueba es lo que hace que las
 * métricas existan: que la sesión NO sea el token, que el cierre viaje por
 * `sendBeacon` con la duración y el paso máximo, y que sin sesión no se mande
 * nada (un formulario viejo que no devuelve `telemetria_session`).
 */
import {
  _reiniciarTelemetria, cerrarTelemetria, cronometrar, evento, iniciarTelemetria, medir, verSeccion,
} from '../telemetria';

// Tipado como el `sendBeacon` real: sin los argumentos, `mock.calls[0][1]`
// es un acceso fuera de rango para TypeScript.
const beacon = jest.fn((_url: string, _datos?: BodyInit | null) => true);

beforeEach(() => {
  _reiniciarTelemetria();
  beacon.mockClear();
  Object.defineProperty(navigator, 'sendBeacon', { value: beacon, configurable: true });
  global.fetch = jest.fn(() => Promise.resolve(new Response('{}'))) as unknown as typeof fetch;
});

/** jsdom no siempre trae `Blob.text()`; con FileReader anda en las dos. */
function leer(blob: Blob): Promise<string> {
  if (typeof blob.text === 'function') return blob.text();
  return new Promise((resolver) => {
    const fr = new FileReader();
    fr.onload = () => resolver(String(fr.result));
    fr.readAsText(blob);
  });
}

async function cuerpoDelBeacon() {
  const blob = beacon.mock.calls[0][1] as Blob;
  return JSON.parse(await leer(blob));
}

test('el cierre manda la duración y hasta qué sección llegó', async () => {
  jest.spyOn(Date, 'now')
    .mockReturnValueOnce(1_000_000)   // inicio
    .mockReturnValue(1_154_000);      // cierre: 154 s después
  iniciarTelemetria('sesion-derivada', 'SOL-123', 'fee_receipts');
  verSeccion('documentos');
  verSeccion('resumen');              // volver atrás no borra lo alcanzado
  cerrarTelemetria('cierre');

  expect(beacon).toHaveBeenCalledTimes(1);
  const cuerpo = await cuerpoDelBeacon();
  expect(cuerpo.session_id).toBe('sesion-derivada');
  const salida = cuerpo.events.find((e: { event_type: string }) => e.event_type === 'followup_form_exit');
  expect(salida.properties.duracion_ms).toBe(154_000);
  expect(salida.properties.paso_maximo).toBe('documentos');
  expect(salida.properties.application_code).toBe('SOL-123');
  // Todo evento dice qué tipo de formulario le tocó: los tiempos de una
  // casuística de cuatro papeles no se leen igual que los de una sin ninguno.
  expect(salida.properties.situacion).toBe('fee_receipts');
});

test('el cierre se manda una sola vez: en móvil `visibilitychange` dispara varias', () => {
  iniciarTelemetria('sesion', 'SOL-1');
  cerrarTelemetria('oculto');
  cerrarTelemetria('cierre');
  expect(beacon).toHaveBeenCalledTimes(1);
});

test('sin sesión no se manda nada: el token no se inventa', () => {
  iniciarTelemetria(null, 'SOL-1');
  evento('followup_form_scroll', { profundidad: 50 });
  cerrarTelemetria('cierre');
  expect(beacon).not.toHaveBeenCalled();
  expect(global.fetch).not.toHaveBeenCalled();
});

test('los eventos pendientes viajan en el mismo beacon del cierre', async () => {
  iniciarTelemetria('sesion', 'SOL-9', 'payslip');
  evento('followup_form_scroll', { profundidad: 75 });
  cerrarTelemetria('cierre');
  const cuerpo = await cuerpoDelBeacon();
  expect(cuerpo.events.map((e: { event_type: string }) => e.event_type)).toEqual([
    'followup_form_scroll', 'followup_form_exit',
  ]);
  expect(cuerpo.events.every((e: { properties: { situacion?: string } }) =>
    e.properties.situacion === 'payslip')).toBe(true);
});

test('el cronómetro mide una subida y no se puede leer dos veces', () => {
  jest.spyOn(Date, 'now').mockReturnValueOnce(5_000).mockReturnValueOnce(5_900);
  cronometrar('subida:utility_bill');
  expect(medir('subida:utility_bill')).toBe(900);
  expect(medir('subida:utility_bill')).toBeUndefined();
});
