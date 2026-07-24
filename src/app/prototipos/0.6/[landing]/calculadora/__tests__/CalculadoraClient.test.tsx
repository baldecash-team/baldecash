import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CalculadoraClient } from '../CalculadoraClient';
import * as api from '@/app/prototipos/0.6/services/calculadoraApi';

jest.mock('@/app/prototipos/0.6/services/calculadoraApi');

const config = {
  enabled: true as const,
  efectivoProductId: 123,
  monto: { min: 500, max: 8000, step: 100 },
  plazos: [6, 12],
  inicial: { percents: [0, 10] },
  tea: 89.9,
};

test('renders monto range and plazo options from config', () => {
  render(<CalculadoraClient landing="home" config={config} />);
  expect(screen.getByText(/6 meses/i)).toBeInTheDocument();
  expect(screen.getByText(/12 meses/i)).toBeInTheDocument();
});

test('shows cuota after simulate', async () => {
  (api.simulateCalculadora as jest.Mock).mockResolvedValue({
    monto: 3000, plazo: 12, inicialPercent: 0, inicialAmount: 0,
    financiado: 3000, cuota: 350, tea: 89.9, tcea: 95,
  });
  render(<CalculadoraClient landing="home" config={config} />);
  fireEvent.click(screen.getByText(/12 meses/i));
  await waitFor(() => expect(screen.getByText(/350/)).toBeInTheDocument());
});
