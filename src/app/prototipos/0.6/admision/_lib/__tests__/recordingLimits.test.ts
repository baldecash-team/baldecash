import {
  MIN_RECORDING_SECONDS,
  MAX_RECORDING_SECONDS,
  isTooShort,
  reachedMax,
  tooShortMessage,
  remainingSeconds,
  formatMMSS,
} from '../recordingLimits';

test('límites: 10s mínimo, 300s (5 min) máximo', () => {
  expect(MIN_RECORDING_SECONDS).toBe(10);
  expect(MAX_RECORDING_SECONDS).toBe(300);
});

test('isTooShort: menos de 10s es demasiado corto', () => {
  expect(isTooShort(0)).toBe(true);
  expect(isTooShort(9)).toBe(true);
  expect(isTooShort(10)).toBe(false);
  expect(isTooShort(42)).toBe(false);
});

test('reachedMax: alcanza el tope a los 300s', () => {
  expect(reachedMax(299)).toBe(false);
  expect(reachedMax(300)).toBe(true);
  expect(reachedMax(301)).toBe(true);
});

test('tooShortMessage: mensaje si <10s, null si OK', () => {
  expect(tooShortMessage(9)).toMatch(/al menos 10 segundos/i);
  expect(tooShortMessage(10)).toBeNull();
});

test('remainingSeconds: countdown desde 5 min, sin negativos', () => {
  expect(remainingSeconds(0)).toBe(300);
  expect(remainingSeconds(1)).toBe(299);
  expect(remainingSeconds(300)).toBe(0);
  expect(remainingSeconds(350)).toBe(0);
});

test('formatMMSS: formatea mm:ss', () => {
  expect(formatMMSS(300)).toBe('05:00');
  expect(formatMMSS(299)).toBe('04:59');
  expect(formatMMSS(9)).toBe('00:09');
  expect(formatMMSS(0)).toBe('00:00');
});
