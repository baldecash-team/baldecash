import { render, screen, fireEvent } from '@testing-library/react';
import { MultiasistenciaCard } from '../MultiasistenciaCard';

const plan: any = {
  id: '1', code: 'MA-24', name: 'Multiasistencia BaldeCash',
  insuranceType: 'multiasistencia', monthlyPrice: 5, totalPrice: 120, paymentMonths: 24,
  durationMonths: 24, provider: { name: 'A365', code: 'A365' }, coverage: [], exclusions: [],
};

test('muestra copy del mockup y precio', () => {
  render(<MultiasistenciaCard plan={plan} isSelected={false} onToggle={() => {}} onSeeMore={() => {}} />);
  expect(screen.getByText('Multiasistencia BaldeCash')).toBeInTheDocument();
  expect(screen.getByText(/Asistencia integral/)).toBeInTheDocument();
  expect(screen.getByText(/hasta 4 personas/)).toBeInTheDocument();
  expect(screen.getByText(/S\/\s*5/)).toBeInTheDocument();
  // "Médico" aparece dos veces (título de columna + "Médico a domicilio" en la lista).
  expect(screen.getAllByText(/Médico/).length).toBeGreaterThan(0);
  expect(screen.getByText(/Legal/)).toBeInTheDocument();
  expect(screen.getByText(/Tecnológico/)).toBeInTheDocument();
});

test('gatea agregar hasta aceptar el condicionado, luego dispara onToggle', () => {
  const onToggle = jest.fn();
  render(<MultiasistenciaCard plan={plan} isSelected={false} onToggle={onToggle} onSeeMore={() => {}} />);
  // Sin aceptar el condicionado, el boton esta deshabilitado.
  fireEvent.click(screen.getByText(/Agregar asistencia/));
  expect(onToggle).not.toHaveBeenCalled();
  // Al aceptar, se habilita y dispara onToggle.
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByText(/Agregar asistencia/));
  expect(onToggle).toHaveBeenCalled();
});
