/**
 * Calculadora de efectivo API service.
 *
 * POSTs a simulation request to the public ws2 endpoint and maps the
 * snake_case response into a camelCase CalculadoraSimulation.
 */

// Same base/prefix construction as landingConfigApi.ts's fetchLandingConfig
// (API_BASE_URL there is a local, non-exported const, so it's replicated here).
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

export interface CalculadoraSimulation {
  monto: number;
  plazo: number;
  inicialPercent: number;
  inicialAmount: number;
  financiado: number;
  cuota: number;
  tea: number;
  tcea: number;
}

export async function simulateCalculadora(
  slug: string,
  input: { monto: number; plazo: number; inicialPercent: number },
): Promise<CalculadoraSimulation> {
  const res = await fetch(
    `${API_BASE_URL}/public/landing/${encodeURIComponent(slug)}/calculadora/simulate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        monto: input.monto,
        plazo: input.plazo,
        inicial_percent: input.inicialPercent,
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`simulate failed: ${res.status}`);
  }

  const d = await res.json();
  return {
    monto: d.monto,
    plazo: d.plazo,
    inicialPercent: d.inicial_percent,
    inicialAmount: d.inicial_amount,
    financiado: d.financiado,
    cuota: d.cuota,
    tea: d.tea,
    tcea: d.tcea,
  };
}
