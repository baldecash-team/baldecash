import { PARTES_VACIAS, partesDesdeGuardada } from '../direccionEntrega';

const via = (tipoVia: string, nombreVia: string, numero: string, interior = '') =>
  ({ ...PARTES_VACIAS, forma: 'via', tipoVia, nombreVia, numero, interior });
const lote = (tipoZona: string, nombreZona: string, mz: string, lt: string, interior = '') =>
  ({ ...PARTES_VACIAS, forma: 'lote', tipoZona, nombreZona, mz, lote: lt, interior });

describe('partesDesdeGuardada', () => {
  it.each([
    // Los casos que el courier devolvió (preview/casosCourier.ts).
    ['Mz B2 Lote 18, Urb. Sol de Piura 1ra etapa', lote('Urbanización', 'Sol de Piura 1ra etapa', 'B2', '18')],
    ['Mz Y Lt 11 Los Cedros 2da Etapa', lote('', 'Los Cedros 2da Etapa', 'Y', '11')],
    ['Mz K Lote 14 AA.HH. Armando Villanueva del Campo, Barrio 5 D',
      lote('AA.HH.', 'Armando Villanueva del Campo, Barrio 5 D', 'K', '14')],
    ['Asociación Felix Raucana Mz N Lt 27', lote('Asociación', 'Felix Raucana', 'N', '27')],
    ['Av. San Cristóbal 418', via('Av.', 'San Cristóbal', '418')],
    ['Avenida San Juan Mz H1 Lt 17 C41, Túpac Amaru', lote('', 'Avenida San Juan C41, Túpac Amaru', 'H1', '17')],
    ['Las Casuarinas 127', via('', 'Las Casuarinas', '127')],
    ['Garcilazo de la Vega 152 - Vista Alegre', via('', 'Garcilazo de la Vega', '152')],
    // Otras formas comunes.
    ['Jr. Ica 123 Dpto 301', via('Jr.', 'Ica', '123', 'Dpto 301')],
    ['Calle Las Flores N° 456 Int. B', via('Calle', 'Las Flores', '456', 'Int B')],
    ['Carretera Central Km 12.5', via('Carretera', 'Central', '12.5')],
    ['Prolongación Iquitos', via('Prolongación', 'Iquitos', '')],
    ['Urb. Santa Rosa Mz. F Lt. 9 Piso 2', lote('Urbanización', 'Santa Rosa', 'F', '9', 'Piso 2')],
  ])('%s', (texto, esperado) => {
    expect(partesDesdeGuardada(texto)).toEqual(esperado);
  });

  it.each([
    'Paradero Corporación Roma',
    'CA Arquitectos, Los Z-20, A.H. Asoc. Vivienda Autog. San Benito 2da Etapa',
    'R22G+RRF 12.1978510, -76.9729758',
    '',
  ])('lo que no se reconoce queda vacío para llenarlo a mano: %s', (texto) => {
    expect(partesDesdeGuardada(texto)).toEqual(PARTES_VACIAS);
  });

  it('la calle guardada aparte va al interior', () => {
    expect(partesDesdeGuardada('Av. Benavides 1238', 'Dpto 301')).toEqual(via('Av.', 'Benavides', '1238', 'Dpto 301'));
  });

  it('no confunde nombres con palabras clave', () => {
    expect(partesDesdeGuardada('Avalos 230')).toEqual(via('', 'Avalos', '230'));
    expect(partesDesdeGuardada('Intihuatana 450')).toEqual(via('', 'Intihuatana', '450'));
  });
});
