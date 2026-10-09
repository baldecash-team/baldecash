import { buildGradeOptions, targetSlugForGrade, currentGrade, gradosDelDetalle } from '../gradeSelector';
import type { GradeSibling } from '../../types/detail';

const SIBS: GradeSibling[] = [
  { grade: 'B', productId: 2, slug: 'modelo-r-b', price: 900, stockAvailable: 0, isAvailable: false },
  { grade: 'A', productId: 1, slug: 'modelo-r-a', price: 1000, stockAvailable: 3, isAvailable: true },
  { grade: 'C', productId: 3, slug: 'modelo-r-c', price: 800, stockAvailable: 5, isAvailable: true },
];

describe('gradeSelector', () => {
  it('ordena A→C y marca el producto actual', () => {
    const opts = buildGradeOptions(SIBS, 3);
    expect(opts.map((o) => o.grade)).toEqual(['A', 'B', 'C']);
    expect(opts.find((o) => o.grade === 'C')!.isCurrent).toBe(true);
    expect(opts.find((o) => o.grade === 'A')!.isCurrent).toBe(false);
  });

  it('refleja disponibilidad real por grado', () => {
    const opts = buildGradeOptions(SIBS, 1);
    expect(opts.find((o) => o.grade === 'A')!.isAvailable).toBe(true);
    expect(opts.find((o) => o.grade === 'B')!.isAvailable).toBe(false);
    expect(opts.find((o) => o.grade === 'C')!.isAvailable).toBe(true);
  });

  it('da el slug destino del grado elegido (para navegar al product_id correcto)', () => {
    expect(targetSlugForGrade(SIBS, 'B')).toBe('modelo-r-b');
    expect(targetSlugForGrade(SIBS, 'Z')).toBeNull();
  });

  it('resuelve el grado del producto actual', () => {
    expect(currentGrade(SIBS, 2)).toBe('B');
    expect(currentGrade(SIBS, 999)).toBeNull();
  });
});

// Detalle estándar: un reacondicionado con grado pero sin hermanos muestra el
// selector con una sola opción, la suya.
describe('gradosDelDetalle', () => {
  const producto = { id: '1917', slug: 'macbook-air-grado-b', price: 2500, lowestQuota: 139 };
  const hermano = (grade: string, productId: number, isAvailable = true) => ({
    grade, productId, slug: `s-${productId}`, price: 100, stockAvailable: isAvailable ? 2 : 0, isAvailable,
  });

  it('con grado y sin hermanos: una opcion, la del propio producto', () => {
    const grados = gradosDelDetalle({ ...producto, grade: 'B', gradeSiblings: [] });
    expect(grados).toEqual([
      { grade: 'B', productId: 1917, slug: 'macbook-air-grado-b', price: 2500, stockAvailable: 1, isAvailable: true, lowestQuota: 139 },
    ]);
    // Queda marcada como la actual y su slug es el de esta pagina: no navega.
    expect(currentGrade(grados, 1917)).toBe('B');
    expect(targetSlugForGrade(grados, 'B')).toBe('macbook-air-grado-b');
  });

  it('si la pagina no esta disponible, la opcion sale no disponible', () => {
    const [unico] = gradosDelDetalle({ ...producto, grade: 'C', gradeSiblings: [] }, false);
    expect(unico.isAvailable).toBe(false);
  });

  it('sin grado: vacio, el selector no se dibuja', () => {
    expect(gradosDelDetalle({ ...producto, gradeSiblings: [] })).toEqual([]);
    expect(gradosDelDetalle({ ...producto })).toEqual([]);
  });

  it('agrupado: los hermanos tal cual, con su agotado', () => {
    const sibs = [hermano('A', 1917), hermano('B', 2, false)];
    expect(gradosDelDetalle({ ...producto, grade: 'A', gradeSiblings: sibs })).toBe(sibs);
  });
});
