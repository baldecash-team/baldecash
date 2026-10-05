/**
 * Lógica del selector de grado real (A/B/C/D) para reacondicionados.
 *
 * Cada grado es un Product separado (grade_siblings del API), con su propio
 * product_id/slug/stock. Al elegir un grado se navega a su slug (patrón color
 * siblings), para que el product_id que llega al submit sea el del grado elegido.
 */
import type { GradeSibling } from '../types/detail';

export interface GradeOption {
  grade: string;
  slug: string;
  productId: number;
  isAvailable: boolean;
  isCurrent: boolean;
}

/** Opciones de grado (ordenadas A→D) marcando cuál es el producto actual. */
export function buildGradeOptions(
  siblings: GradeSibling[],
  currentProductId: number,
): GradeOption[] {
  return [...siblings]
    .sort((a, b) => a.grade.localeCompare(b.grade))
    .map((s) => ({
      grade: s.grade,
      slug: s.slug,
      productId: s.productId,
      isAvailable: s.isAvailable,
      isCurrent: s.productId === currentProductId,
    }));
}

/** Slug del producto correspondiente a un grado (o null si no existe). */
export function targetSlugForGrade(
  siblings: GradeSibling[],
  grade: string,
): string | null {
  const s = siblings.find((x) => x.grade === grade);
  return s ? s.slug : null;
}

/** Grado del producto actual dentro de los hermanos (o null). */
export function currentGrade(
  siblings: GradeSibling[],
  currentProductId: number,
): string | null {
  const s = siblings.find((x) => x.productId === currentProductId);
  return s ? s.grade : null;
}
