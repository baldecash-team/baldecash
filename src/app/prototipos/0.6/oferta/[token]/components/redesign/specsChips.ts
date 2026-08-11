import type { ProductSpecs } from '../../../../[landing]/catalogo/types/catalog';

/**
 * Chips de specs clave (procesador / RAM / almacenamiento / GPU / display).
 *
 * Mismo conjunto y formato que la card del catálogo (ProductCard), para que el
 * equipo se vea idéntico en el catálogo y en cualquier card de oferta. Estaba
 * como función local de MiOfertaClient; se extrajo cuando la oferta ESTÁNDAR
 * pasó a usar la misma card rica del Caso 5.
 */
export function specsToChips(specs?: ProductSpecs | null): string[] {
  if (!specs) return [];
  const chips: string[] = [];
  if (specs.processor?.model) chips.push(specs.processor.model);
  if (specs.ram?.size) {
    chips.push(`${specs.ram.size}GB ${String(specs.ram.type ?? '')}`.trim());
  }
  if (specs.storage?.size) {
    chips.push(`${specs.storage.size}GB ${String(specs.storage.type ?? '').toUpperCase()}`.trim());
  }
  const gpuModel = specs.gpu?.model && String(specs.gpu.model) !== 'null' ? String(specs.gpu.model) : '';
  if (gpuModel) chips.push(specs.gpu?.vram ? `${gpuModel} ${specs.gpu.vram}GB` : gpuModel);
  if (specs.display?.size) {
    chips.push(`${specs.display.size}" ${String(specs.display.resolution ?? '').toUpperCase()}`.trim());
  }
  return chips;
}
