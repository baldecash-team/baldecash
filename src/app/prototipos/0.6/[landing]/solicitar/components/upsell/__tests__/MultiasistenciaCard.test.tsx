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

test('el boton Agregar dispara onToggle directo (sin gate de checkbox)', () => {
  const onToggle = jest.fn();
  render(<MultiasistenciaCard plan={plan} isSelected={false} onToggle={onToggle} onSeeMore={() => {}} />);
  // Ya no hay checkbox de consentimiento; se comporta como el resto de seguros.
  expect(screen.queryByRole('checkbox')).toBeNull();
  // Mismo formato que Insurama: "Agregar protección" + "Ver términos y condiciones".
  fireEvent.click(screen.getByText(/Agregar protección/));
  expect(onToggle).toHaveBeenCalled();
});

test('usa el mismo formato de acciones que Insurama', () => {
  const onSeeMore = jest.fn();
  render(<MultiasistenciaCard plan={plan} isSelected={false} onToggle={() => {}} onSeeMore={onSeeMore} />);
  expect(screen.getByText(/Agregar protección/)).toBeInTheDocument();
  fireEvent.click(screen.getByText(/Ver términos y condiciones/));
  expect(onSeeMore).toHaveBeenCalled();
});
