import { render, screen, act } from '@testing-library/react';
import { AccessoriesLoadingScreen } from '../AccessoriesLoadingScreen';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

test('muestra el mensaje generico por defecto cuando no se pasa productName', () => {
  render(<AccessoriesLoadingScreen />);
  expect(screen.getByText('Estás preparando algo genial para ti...')).toBeInTheDocument();
});

test('usa el nombre del producto en el primer mensaje cuando se pasa productName', () => {
  render(<AccessoriesLoadingScreen productName="MacBook Air M2" />);
  expect(screen.getByText('Revisando tu MacBook Air M2...')).toBeInTheDocument();
});

test('rota al siguiente mensaje despues de MESSAGE_INTERVAL_MS', () => {
  render(<AccessoriesLoadingScreen />);
  expect(screen.getByText('Estás preparando algo genial para ti...')).toBeInTheDocument();

  act(() => {
    // El setInterval (2500ms) dispara el fade-out y agenda un setTimeout
    // anidado de FADE_DURATION_MS (300ms) que cambia el mensaje. Con fake
    // timers de Jest, advanceTimersByTime no re-evalua timers agendados
    // durante el propio avance, asi que hay que cubrir ambos: 2500 + 300.
    jest.advanceTimersByTime(2500 + 300);
  });

  expect(screen.getByText('Analizando tu perfil...')).toBeInTheDocument();
});

test('aplica opacity-0 justo antes de cambiar el mensaje y opacity-100 despues', () => {
  render(<AccessoriesLoadingScreen />);
  const paragraph = screen.getByText('Estás preparando algo genial para ti...');
  expect(paragraph).toHaveClass('opacity-100');

  act(() => {
    // A los 2500ms el parrafo (con el texto viejo) debe quedar en opacity-0.
    jest.advanceTimersByTime(2500);
  });
  expect(screen.getByText('Estás preparando algo genial para ti...')).toHaveClass('opacity-0');

  act(() => {
    // 300ms despues (FADE_DURATION_MS) cambia el mensaje y vuelve a opacity-100.
    jest.advanceTimersByTime(300);
  });
  expect(screen.getByText('Analizando tu perfil...')).toHaveClass('opacity-100');
});
