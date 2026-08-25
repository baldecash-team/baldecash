import { cardSelectorMode } from '../cardSelectorMode';

const grado = (grade: string, isAvailable = true) => ({ grade, isAvailable });

describe('cardSelectorMode', () => {
  it('con 2 o más grados manda grados', () => {
    expect(cardSelectorMode({
      gradeSiblings: [grado('B'), grado('C')],
      colors: [{}, {}, {}],
    })).toBe('grades');
  });

  // Los grados ganan aunque también haya colores: es lo que distingue a un
  // reacondicionado y lo que cambia el precio.
  it('los grados le ganan a los colores', () => {
    expect(cardSelectorMode({
      gradeSiblings: [grado('A'), grado('B'), grado('C')],
      colors: [{}, {}],
    })).toBe('grades');
  });

  // Un grado solo no es elegible: no es un selector.
  it('con un solo grado cae a colores', () => {
    expect(cardSelectorMode({
      gradeSiblings: [grado('B')],
      colors: [{}, {}],
    })).toBe('colors');
  });

  it('sin grados y con 2+ colores manda colores', () => {
    expect(cardSelectorMode({ gradeSiblings: [], colors: [{}, {}] })).toBe('colors');
  });

  // Un color solo tampoco es elegible.
  it('con un solo color devuelve none', () => {
    expect(cardSelectorMode({ gradeSiblings: [], colors: [{}] })).toBe('none');
  });

  it('sin nada devuelve none', () => {
    expect(cardSelectorMode({ gradeSiblings: [], colors: [] })).toBe('none');
  });

  // El API puede omitir los campos: `undefined` y `null` no deben romper.
  it('tolera campos ausentes o nulos', () => {
    expect(cardSelectorMode({})).toBe('none');
    expect(cardSelectorMode({ gradeSiblings: null, colors: null })).toBe('none');
  });

  // Un grado agotado SIGUE contando para el modo: se muestra en gris.
  // Datos reales de producción (Advance CN4058): el Grado A existe a S/574
  // pero está agotado.
  it('cuenta los grados no disponibles', () => {
    expect(cardSelectorMode({
      gradeSiblings: [grado('A', false), grado('B', true)],
      colors: [],
    })).toBe('grades');
  });

  // Caso límite real: si TODOS los grados están agotados el modo sigue siendo
  // 'grades'. La card muestra las tres pills en gris, que es información útil
  // ("existe pero no hay"), no un selector roto.
  it('con todos los grados agotados sigue siendo grades', () => {
    expect(cardSelectorMode({
      gradeSiblings: [grado('A', false), grado('B', false), grado('C', false)],
      colors: [{}, {}],
    })).toBe('grades');
  });
});
