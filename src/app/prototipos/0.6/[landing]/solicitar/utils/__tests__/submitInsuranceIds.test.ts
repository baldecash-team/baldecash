import { buildSubmitInsuranceIds } from '../submitInsuranceIds';

const robo = { id: '10' };      // Insurama (equipo)
const garantia = { id: '11' };  // Insurama (equipo)
const ma = { id: '24' };        // A365 Multiasistencia

test('el seguro A365 se manda igual que los de equipo cuando está seleccionado', () => {
  expect(buildSubmitInsuranceIds([robo, ma])).toEqual(['10', '24']);
});

test('trata equipo y A365 igual: solo ids, sin distinción de tipo', () => {
  expect(buildSubmitInsuranceIds([garantia, robo, ma])).toEqual(['11', '10', '24']);
});

test('MA aceptada en el upsell (extraIds) también se manda, deduplicada', () => {
  // MA no está aún en selectedInsurances (toggle async) → se pasa como extra.
  expect(buildSubmitInsuranceIds([robo], ['24'])).toEqual(['10', '24']);
  // Si ya estaba seleccionada, no se duplica.
  expect(buildSubmitInsuranceIds([robo, ma], ['24'])).toEqual(['10', '24']);
});

test('sin seguros seleccionados → lista vacía', () => {
  expect(buildSubmitInsuranceIds([])).toEqual([]);
});
