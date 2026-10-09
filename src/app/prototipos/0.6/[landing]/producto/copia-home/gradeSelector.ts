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

/**
 * Los grados que pinta el selector del detalle estándar.
 *
 * Agrupado: los hermanos tal como llegan. Sin hermanos pero CON grado: una
 * sola opción, el propio producto, para que el grado se vea también en el
 * detalle («Grado B · Buen estado») aunque no haya nada que comparar. Sin
 * grado: vacío, y el selector no se dibuja.
 *
 * La opción única lleva el id y el slug del producto, así `currentGrade` la
 * marca como elegida y `irAlGrado` no navega (el slug es el de esta página).
 */
export function gradosDelDetalle(
  product: {
    id: string | number;
    slug: string;
    price: number;
    lowestQuota?: number;
    grade?: string;
    gradeSiblings?: GradeSibling[];
  },
  isAvailable = true,
): GradeSibling[] {
  const hermanos = product.gradeSiblings ?? [];
  if (hermanos.length > 0) return hermanos;
  if (!product.grade) return [];
  return [{
    grade: product.grade,
    productId: Number(product.id),
    slug: product.slug,
    price: product.price,
    // El detalle no trae el stock del propio producto fuera de los hermanos:
    // 1/0 solo refleja si la página está disponible.
    stockAvailable: isAvailable ? 1 : 0,
    isAvailable,
    lowestQuota: product.lowestQuota,
  }];
}
