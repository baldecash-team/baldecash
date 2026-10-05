import { buildGradeOptions, targetSlugForGrade, currentGrade } from '../gradeSelector';
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
