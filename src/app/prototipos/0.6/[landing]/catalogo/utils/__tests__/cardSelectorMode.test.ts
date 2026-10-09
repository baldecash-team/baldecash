import { cardSelectorMode, tieneGradosAgrupados, gradosDeLaCard } from '../cardSelectorMode';

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

  // Un grado solo SÍ se informa: no es una opción a elegir, es lo que el equipo
  // ES, y el cliente necesita verlo en el catálogo antes de entrar. Antes esta
  // card caía a colores y el grado se perdía (quedaba un hueco de 44px).
  it('con un solo grado manda grados, aunque haya colores', () => {
    expect(cardSelectorMode({
      gradeSiblings: [grado('B')],
      colors: [{}, {}],
    })).toBe('grades');
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

// Fuera de la landing de reacondicionados la card normal muestra colores. Solo
// cambia a grados cuando el producto está AGRUPADO por grado: dos o más grados
// hermanos. Un grado solo no es elegible, y quitar el color por él sería perder
// información sin ganar ninguna.
describe('tieneGradosAgrupados', () => {
  it('con 2 o más grados, sí', () => {
    expect(tieneGradosAgrupados({ gradeSiblings: [grado('A'), grado('B', false)] })).toBe(true);
  });

  it('con un solo grado, no', () => {
    expect(tieneGradosAgrupados({ gradeSiblings: [grado('A')] })).toBe(false);
  });

  it('sin grados (o sin el campo), no', () => {
    expect(tieneGradosAgrupados({ gradeSiblings: [] })).toBe(false);
    expect(tieneGradosAgrupados({})).toBe(false);
    expect(tieneGradosAgrupados({ gradeSiblings: null })).toBe(false);
  });
});

// Los grados que pinta la card: los hermanos, o el propio producto cuando tiene
// grado y no está agrupado.
describe('gradosDeLaCard', () => {
  const hermano = (grade: string, productId: number, isAvailable = true) => ({
    grade, productId, slug: `s-${productId}`, price: 100, minTermQuota: null, isAvailable,
  });
  const card = { id: '1917', slug: 'macbook-air-grado-b', price: 2500 };

  it('agrupado: devuelve los hermanos tal cual, con sus agotados', () => {
    const sibs = [hermano('A', 1, false), hermano('B', 1917)];
    expect(gradosDeLaCard({ ...card, grade: 'B', gradeSiblings: sibs })).toBe(sibs);
  });

  it('con grado y sin hermanos: una sola opcion, el propio producto', () => {
    expect(gradosDeLaCard({ ...card, grade: 'B', gradeSiblings: [] })).toEqual([
      { grade: 'B', productId: 1917, slug: 'macbook-air-grado-b', price: 2500, minTermQuota: null, isAvailable: true },
    ]);
  });

  it('sin grado y sin hermanos: vacio', () => {
    expect(gradosDeLaCard({ ...card, gradeSiblings: [] })).toEqual([]);
    expect(gradosDeLaCard({ ...card, grade: null, gradeSiblings: null })).toEqual([]);
    expect(gradosDeLaCard({ ...card, grade: undefined })).toEqual([]);
  });

  it('un hermano unico se respeta (no se fabrica otro)', () => {
    const sibs = [hermano('C', 1917, false)];
    expect(gradosDeLaCard({ ...card, grade: 'C', gradeSiblings: sibs })).toBe(sibs);
  });
});
