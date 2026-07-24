import { simulateCalculadora } from '../calculadoraApi';

global.fetch = jest.fn(async () => ({
  ok: true,
  json: async () => ({
    monto: 3000, plazo: 12, inicial_percent: 10, inicial_amount: 300,
    financiado: 2700, cuota: 320, tea: 89.9, tcea: 95.1,
  }),
})) as unknown as typeof fetch;

test('maps snake_case response to camelCase', async () => {
  const out = await simulateCalculadora('home', { monto: 3000, plazo: 12, inicialPercent: 10 });
  expect(out.inicialAmount).toBe(300);
  expect(out.financiado).toBe(2700);
  expect(out.cuota).toBe(320);
});
